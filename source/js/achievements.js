/**
 * Achievements System for Cybersecurity Learning Platform
 * Manages achievements and badges, including condition checking and UI updates
 */

/** Achievements Module */
const Achievements = {
    init() {
        console.log('Achievements.init: Starting initialization');
        this.resetAchievementsIfInvalid();
        this.loadAchievements();
        this.bindEvents();
        this.renderAchievements();
        this.renderBadges();
        this.checkAchievements();
        this.checkBadges();
        this.updateNoAchievementsMessage();
        this.updateNoBadgesMessage();
    },

    resetAchievementsIfInvalid() {
        console.log('Achievements.resetAchievementsIfInvalid: Checking validity');
        const savedStats = localStorage.getItem('userStats');
        const savedProgress = localStorage.getItem('userProgress');
        if (savedStats && savedProgress) {
            const stats = JSON.parse(savedStats);
            const progress = JSON.parse(savedProgress);
            const hasProgress = Object.values(progress).some(p => p.completed);

            if ((stats.achievements.length > 0 || stats.badges.length > 0) && !hasProgress) {
                console.warn('Achievements.resetAchievementsIfInvalid: Invalid achievements detected, resetting', stats);
                stats.achievements = [];
                stats.badges = [];
                stats.points = 0;
                stats.streak = 0;
                stats.actions = [];
                localStorage.setItem('userStats', JSON.stringify(stats));
                UI.showToast('Прогресс сброшен: достижения доступны только после прохождения уроков!', '⚠️');
            } else {
                console.log('Achievements.resetAchievementsIfInvalid: Stats valid', { hasProgress, achievements: stats.achievements, badges: stats.badges });
            }
        } else {
            console.log('Achievements.resetAchievementsIfInvalid: No stats or progress found');
        }
    },

    loadAchievements() {
        try {
            const savedStats = localStorage.getItem('userStats');
            if (savedStats) {
                State.achievements = JSON.parse(savedStats).achievements || [];
                State.badges = JSON.parse(savedStats).badges || [];
                State.points = JSON.parse(savedStats).points || 0;
                State.streak = JSON.parse(savedStats).streak || 0;
                console.log('Achievements.loadAchievements: Loaded stats', State);
            } else {
                State.achievements = [];
                State.badges = [];
                State.points = 0;
                State.streak = 0;
                saveProgress();
                console.log('Achievements.loadAchievements: Initialized empty stats');
            }
        } catch (error) {
            console.error('Achievements.loadAchievements: Error loading achievements', error);
            UI.showToast('Ошибка загрузки достижений.', '❌');
        }
    },

    bindEvents() {
        console.log('Achievements.bindEvents: Binding events');
        DOM.elements.submitQuizBtn.addEventListener('click', () => {
            setTimeout(() => {
                console.log('Achievements.bindEvents: Quiz submitted, checking achievements');
                this.checkAchievements();
                this.checkBadges();
                this.updateNoAchievementsMessage();
                this.updateNoBadgesMessage();
            }, 1000);
        });

        DOM.elements.saveProfileBtn.addEventListener('click', () => {
            console.log('Achievements.bindEvents: Profile saved, checking achievements');
            this.checkAchievements();
            this.checkBadges();
            this.updateNoAchievementsMessage();
            this.updateNoBadgesMessage();
        });

        DOM.elements.shareAchievements.addEventListener('click', () => {
            State.actions = State.actions || [];
            if (!State.actions.includes('shared_course')) {
                State.actions.push('shared_course');
                saveProgress();
                console.log('Achievements.bindEvents: Achievements shared, checking badges');
                this.checkBadges();
                this.updateNoBadgesMessage();
            }
        });

        const startLessonsBtn = document.getElementById('start-lessons-btn');
        if (startLessonsBtn) {
            startLessonsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (Data.course.lessons.length > 0) UI.showLessonPreview(Data.course.lessons[0].id);
                console.log('Achievements.bindEvents: Start lessons clicked');
                Analytics.trackEvent('start_lessons_from_achievements_clicked');
            });
        }

        ['homeLink', 'achievementsLink', 'profileLink'].forEach(link => {
            DOM.elements[link].addEventListener('click', () => {
                console.log(`Achievements.bindEvents: ${link} clicked, checking achievements`);
                this.checkAchievements();
                this.checkBadges();
                this.updateNoAchievementsMessage();
                this.updateNoBadgesMessage();
            });
        });
    },

    checkAchievements() {
        Data.achievements.forEach(achievement => {
            if (!State.achievements.includes(achievement.id) && achievement.condition(State.userProgress, State)) {
                State.achievements.push(achievement.id);
                Activity.logActivity(Activity.activityTypes.ACHIEVEMENT_UNLOCKED, { achievementId: achievement.id });
                UI.showToast(`Достижение: ${achievement.title}!`, achievement.icon);
                UI.triggerConfetti();
                saveProgress();
                Analytics.trackEvent('achievement_unlocked', { achievementId: achievement.id });
            }
        });
    },

    checkBadges() {
        console.log('Achievements.checkBadges: Checking badges');
        Data.badges.forEach(badge => {
            const isUnlocked = State.badges.includes(badge.id);
            if (!isUnlocked && badge.condition(State.userProgress, State)) {
                console.log(`Achievements.checkBadges: Unlocking badge ${badge.id}`);
                this.unlockBadge(badge);
            }
        });
        this.updateNoBadgesMessage();
    },

    unlockAchievement(achievement) {
        State.achievements.push(achievement.id);
        UI.showToast(`Достижение разблокировано: ${achievement.title}!`, achievement.icon);
        UI.triggerConfetti();
        if (State.isSoundEnabled) UI.playSuccessSound();
        saveProgress();
        this.renderAchievements();
        this.updateNoAchievementsMessage();
        console.log(`Achievements.unlockAchievement: Unlocked ${achievement.id}`);
        Analytics.trackEvent('achievement_unlocked', { achievementId: achievement.id });
    },

    unlockBadge(badge) {
        State.badges.push(badge.id);
        State.points += badge.points;
        UI.showToast(`Награда получена: ${badge.title}! +${badge.points} очков`, badge.icon);
        UI.triggerConfetti();
        if (State.isSoundEnabled) UI.playSuccessSound();
        saveProgress();
        this.renderBadges();
        this.updateNoBadgesMessage();
        UI.updateStatsDisplay();
        console.log(`Achievements.unlockBadge: Unlocked ${badge.id}, points: ${badge.points}`);
        Analytics.trackEvent('badge_unlocked', { badgeId: badge.id, points: badge.points });
    },

    renderAchievements() {
        console.log('Achievements.renderAchievements: Rendering achievements', State.achievements);
        DOM.elements.achievementsContainer.innerHTML = '';
        Data.achievements.forEach(achievement => {
            const isUnlocked = State.achievements.includes(achievement.id);
            console.log(`Achievements.renderAchievements: Achievement ${achievement.id}, isUnlocked: ${isUnlocked}`);
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.setAttribute('role', 'listitem');
            card.innerHTML = `
                <div class="achievement-icon">${isUnlocked ? achievement.icon : '&#128274;'}</div>
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                <div class="achievement-status">${isUnlocked ? 'Разблокировано' : 'Заблокировано'}</div>
            `;
            DOM.elements.achievementsContainer.appendChild(card);
        });
        this.updateNoAchievementsMessage();
    },

    renderBadges() {
        console.log('Achievements.renderBadges: Rendering badges', State.badges);
        DOM.elements.badgesContainer.innerHTML = '';
        Data.badges.forEach(badge => {
            const isUnlocked = State.badges.includes(badge.id);
            console.log(`Achievements.renderBadges: Badge ${badge.id}, isUnlocked: ${isUnlocked}`);
            const card = document.createElement('div');
            card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.setAttribute('role', 'listitem');
            card.innerHTML = `
                <div class="badge-icon">${isUnlocked ? badge.icon : '&#128274;'}</div>
                <h4>${badge.title}</h4>
                <p>${badge.description}</p>
                <div class="badge-status">${isUnlocked ? 'Разблокировано' : 'Заблокировано'}</div>
            `;
            DOM.elements.badgesContainer.appendChild(card);
        });
        this.updateNoBadgesMessage();
    },

    updateNoAchievementsMessage() {
        const noAchievementsMessage = document.getElementById('no-achievements-message');
        if (noAchievementsMessage) {
            const display = State.achievements.length === 0 ? 'block' : 'none';
            noAchievementsMessage.style.display = display;
            console.log(`Achievements.updateNoAchievementsMessage: Display set to ${display}`);
        }
    },

    updateNoBadgesMessage() {
        const noBadgesMessage = document.getElementById('no-badges-message');
        if (noBadgesMessage) {
            const display = State.badges.length === 0 ? 'block' : 'none';
            noBadgesMessage.style.display = display;
            console.log(`Achievements.updateNoBadgesMessage: Display set to ${display}`);
        }
    }
};

// Ensure dependencies are available
if (!DOM || !State || !Data || !UI || !Analytics) {
    console.error('Achievements: Required modules (DOM, State, Data, UI, Analytics) are not defined.');
    UI.showToast('Ошибка инициализации системы достижений.', '❌');
    throw new Error('Missing required modules');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Achievements: DOMContentLoaded, initializing');
    Achievements.init();
});
