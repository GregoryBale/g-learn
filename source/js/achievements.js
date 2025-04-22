/**
 * Achievements System for Cybersecurity Learning Platform
 * Manages achievements and badges, including condition checking and UI updates
 */

/** Achievements Module */
const Achievements = {
    // Initialize the achievements system
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

    // Reset achievements if they are invalid (e.g., unlocked without progress)
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

    // Load achievements and badges from storage
    loadAchievements() {
        try {
            const savedStats = localStorage.getItem('userStats');
            if (savedStats) {
                State.userStats = JSON.parse(savedStats);
                console.log('Achievements.loadAchievements: Loaded stats', State.userStats);
            } else {
                State.userStats = {
                    points: 0,
                    streak: 0,
                    lastActiveDate: null,
                    achievements: [],
                    badges: [],
                    actions: []
                };
                saveStats();
                console.log('Achievements.loadAchievements: Initialized empty stats');
            }
        } catch (error) {
            console.error('Achievements.loadAchievements: Error loading achievements', error);
            UI.showToast('Ошибка загрузки достижений.', '❌');
        }
    },

    // Bind event listeners for actions that may trigger achievements
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
            State.userStats.actions = State.userStats.actions || [];
            if (!State.userStats.actions.includes('shared_course')) {
                State.userStats.actions.push('shared_course');
                saveStats();
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

    // Check and unlock achievements
    checkAchievements() {
        Data.achievements.forEach(achievement => {
            if (!State.userStats.achievements.includes(achievement.id) && achievement.condition(State.userProgress, State.userStats)) {
                State.userStats.achievements.push(achievement.id);
                // Log achievement unlock activity
                Activity.logActivity(Activity.activityTypes.ACHIEVEMENT_UNLOCKED, { achievementId: achievement.id });
                UI.showToast(`Достижение: ${achievement.title}!`, achievement.icon);
                UI.triggerConfetti();
                saveStats();
            }
        });
    },

    // Check and unlock badges
    checkBadges() {
        console.log('Achievements.checkBadges: Checking badges');
        Data.badges.forEach(badge => {
            const isUnlocked = State.userStats.badges.includes(badge.id);
            if (!isUnlocked && badge.condition(State.userProgress, State.userStats)) {
                console.log(`Achievements.checkBadges: Unlocking badge ${badge.id}`);
                this.unlockBadge(badge);
            }
        });
        this.updateNoBadgesMessage();
    },

    // Unlock an achievement
    unlockAchievement(achievement) {
        State.userStats.achievements.push(achievement.id);
        UI.showToast(`Достижение разблокировано: ${achievement.title}!`, achievement.icon);
        UI.triggerConfetti();
        if (State.isSoundEnabled) UI.playSuccessSound();
        saveStats();
        this.renderAchievements();
        this.updateNoAchievementsMessage();
        console.log(`Achievements.unlockAchievement: Unlocked ${achievement.id}`);
        Analytics.trackEvent('achievement_unlocked', { achievementId: achievement.id });
    },

    // Unlock a badge
    unlockBadge(badge) {
        State.userStats.badges.push(badge.id);
        State.userStats.points += badge.points;
        UI.showToast(`Награда получена: ${badge.title}! +${badge.points} очков`, badge.icon);
        UI.triggerConfetti();
        if (State.isSoundEnabled) UI.playSuccessSound();
        saveStats();
        this.renderBadges();
        this.updateNoBadgesMessage();
        UI.updateStatsDisplay();
        console.log(`Achievements.unlockBadge: Unlocked ${badge.id}, points: ${badge.points}`);
        Analytics.trackEvent('badge_unlocked', { badgeId: badge.id, points: badge.points });
    },

    // Render achievements to the UI
    renderAchievements() {
        console.log('Achievements.renderAchievements: Rendering achievements', State.userStats.achievements);
        DOM.elements.achievementsContainer.innerHTML = '';
        Data.achievements.forEach(achievement => {
            const isUnlocked = State.userStats.achievements.includes(achievement.id);
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

    // Render badges to the UI
    renderBadges() {
        console.log('Achievements.renderBadges: Rendering badges', State.userStats.badges);
        DOM.elements.badgesContainer.innerHTML = '';
        Data.badges.forEach(badge => {
            const isUnlocked = State.userStats.badges.includes(badge.id);
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

    // Show or hide the no-achievements message
    updateNoAchievementsMessage() {
        const noAchievementsMessage = document.getElementById('no-achievements-message');
        if (noAchievementsMessage) {
            const display = State.userStats.achievements.length === 0 ? 'block' : 'none';
            noAchievementsMessage.style.display = display;
            console.log(`Achievements.updateNoAchievementsMessage: Display set to ${display}`);
        }
    },

    // Show or hide the no-badges message
    updateNoBadgesMessage() {
        const noBadgesMessage = document.getElementById('no-badges-message');
        if (noBadgesMessage) {
            const display = State.userStats.badges.length === 0 ? 'block' : 'none';
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

// Save stats to localStorage
function saveStats() {
    try {
        localStorage.setItem('userStats', JSON.stringify(State.userStats));
        UI.updateStatsDisplay();
        console.log('Achievements.saveStats: Stats saved', State.userStats);
    } catch (error) {
        console.error('Achievements.saveStats: Error saving stats', error);
        UI.showToast('Ошибка сохранения статистики.', '❌');
    }
}

// Initialize the achievements system
document.addEventListener('DOMContentLoaded', () => {
    console.log('Achievements: DOMContentLoaded, initializing');
    Achievements.init();
});
