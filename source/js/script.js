/**
 * Cybersecurity Learning Platform
 * Enhanced with modular structure, accessibility, and fixed navigation menu
 */
const Analytics = {
    trackEvent(eventName, data) {
        console.log(`Analytics event: ${eventName}`, data);
    }
};

/** In-Memory Storage as a Fallback */
const MemoryStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    }
};

// Проверка приватного режима
function isPrivateMode() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return false;
    } catch (e) {
        return true;
    }
}

if (isPrivateMode()) {
    UI.showToast('Вы в приватном режиме. Прогресс не сохраняется между сессиями.', '⚠️');
}

async function loadUserData() {
    if (isAuthenticated()) {
        const token = localStorage.getItem('token');
        try {
            console.log('Loading user data with token:', token);
            const response = await fetch('/api/user-data', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                State.login = data.login;
                updateProfileUI();
                console.log('User data loaded:', data);
            } else {
                const errorData = await response.json();
                UI.showToast(errorData.error || 'Ошибка загрузки данных пользователя', '❌');
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('login');
                    window.location.href = 'login.html';
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            UI.showToast('Ошибка подключения к серверу: ' + error.message, '❌');
        }
    } else {
        updateProfileUI(); // Обновляем UI для гостей
    }
}

function updateProfileUI() {
    const profileLink = document.querySelector('#profile-link');
    const profileName = document.querySelector('#profile-name');

    if (isAuthenticated() && State.login) {
        profileLink.textContent = `Профиль (${State.login})`;
        profileLink.href = '#profile';
        if (profileName) {
            profileName.textContent = State.login;
        }
    } else {
        profileLink.textContent = 'Вход/Регистрация';
        profileLink.href = 'login.html';
        if (profileName) {
            profileName.textContent = 'Гость';
        }
    }
}

// Проверка на блокировку JavaScript
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        const testScript = document.createElement('script');
        testScript.textContent = 'window.jsEnabled = true;';
        document.head.appendChild(testScript);

        setTimeout(() => {
            if (!window.jsEnabled) {
                UI.showToast('JavaScript заблокирован. Некоторые функции недоступны. Проверьте настройки браузера.', '⚠️');
            }
        }, 1000);
    });
}

/** Проверка доступности localStorage */
let storageAvailable = true;
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
} catch (e) {
    storageAvailable = false;
    console.warn('localStorage is not available. Using in-memory storage as fallback.');
    UI.showToast('Сохранение данных ограничено. Прогресс сохраняется только в текущей сессии.', '⚠️');
}

/** DOM Module */
const DOM = {
    elements: {
        lessonsContainer: document.getElementById('lessons-container'),
        lessonPage: document.getElementById('lesson-page'),
        homePage: document.getElementById('home-page'),
        achievementsPage: document.getElementById('achievements-page'),
        profilePage: document.getElementById('profile-page'),
        lessonContent: document.getElementById('lesson-content'),
        quizContainer: document.getElementById('quiz-container'),
        quizQuestions: document.getElementById('quiz-questions'),
        backBtn: document.getElementById('back-btn'),
        nextBtn: document.getElementById('next-btn'),
        submitQuizBtn: document.getElementById('submit-quiz'),
        quizResult: document.getElementById('quiz-result'),
        startLearningBtn: document.getElementById('start-learning-btn'),
        continueLearningBtn: document.getElementById('continue-learning-btn'),
        progressCircleFill: document.getElementById('progress-circle-fill'),
        progressText: document.getElementById('progress-text'),
        completedLessons: document.getElementById('completed-lessons'),
        userPoints: document.getElementById('user-points'),
        userStreak: document.getElementById('user-streak'),
        achievementsContainer: document.getElementById('achievements-container'),
        badgesContainer: document.getElementById('badges-container'),
        pointsText: document.getElementById('points-text'),
        dailyGoalText: document.getElementById('daily-goal-text'),
        streakCount: document.getElementById('streak-count'),
        homeLink: document.getElementById('home-link'),
        achievementsLink: document.getElementById('achievements-link'),
        profileLink: document.getElementById('profile-link'),
        shareAchievements: document.getElementById('share-achievements'),
        leaderboardContainer: document.getElementById('leaderboard-container'),
        userAvatar: document.getElementById('user-avatar'),
        changeAvatarBtn: document.getElementById('change-avatar-btn'),
        userNameInput: document.getElementById('user-name-input'),
        userPointsProfile: document.getElementById('user-points-profile'),
        userStreakProfile: document.getElementById('user-streak-profile'),
        saveProfileBtn: document.getElementById('save-profile-btn'),
        themeToggle: document.getElementById('theme-toggle'),
        contrastToggle: document.getElementById('contrast-toggle'),
        hamburger: document.getElementById('hamburger'),
        navMenu: document.getElementById('nav-menu'),
        navOverlay: document.getElementById('nav-overlay'),
        activityStatistics: document.getElementById('activity-statistics'),
        lessonPreviewModal: document.getElementById('lesson-preview-modal'),
        previewTitle: document.getElementById('preview-title'),
        previewDescription: document.getElementById('preview-description'),
        startLessonBtn: document.getElementById('start-lesson-btn'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        toastContainer: document.getElementById('toast-container'),
        lessonLoading: document.getElementById('lesson-loading'),
        mobileNav: document.getElementById('mobile-nav'),
        mobileHomeLink: document.getElementById('mobile-home-link'),
        mobileAchievementsLink: document.getElementById('mobile-achievements-link'),
        mobileProfileLink: document.getElementById('mobile-profile-link'),
        loginButton: document.getElementById('login-button'),
        registerButton: document.getElementById('register-button'),
        logoutButton: document.getElementById('logout-button')
    }
};

/** State Module */
const State = {
    userProgress: {},
    points: 0,
    streak: 0,
    achievements: [],
    badges: [],
    login: null
};

function isAuthenticated() {
    return !!localStorage.getItem('token');
}

/** Utility Module */
const Utils = {
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },
    validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    debounce(fn, ms) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), ms);
        };
    },
    animateProgressCircle(percentage) {
        const circle = DOM.elements.progressCircleFill;
        const circumference = 2 * Math.PI * 45;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference - (percentage / 100) * circumference;
    },
    closeMenu() {
        State.isMenuOpen = false;
        DOM.elements.navMenu.classList.remove('active');
        DOM.elements.hamburger.classList.remove('active');
        DOM.elements.hamburger.setAttribute('aria-expanded', 'false');
        DOM.elements.navMenu.setAttribute('aria-hidden', 'true');
        DOM.elements.navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
};

const Progress = {
    saveProgress() {
        try {
            localStorage.setItem('cybersecurityProgress', JSON.stringify(this.progress));
            const savedData = localStorage.getItem('cybersecurityProgress');
            if (savedData && JSON.parse(savedData)) {
                console.log('Progress saved successfully:', this.progress);
                return true;
            } else {
                throw new Error('Failed to verify saved progress');
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            UI.showToast('Не удалось сохранить прогресс. Проверьте настройки браузера.', '❌');
            return false;
        }
    },

    getProgress() {
        try {
            const saved = localStorage.getItem('cybersecurityProgress');
            return saved ? JSON.parse(saved) : {
                completedLessons: [],
                quizScores: {},
                points: 0,
                streak: 0,
                lastActivity: null,
                achievements: []
            };
        } catch (error) {
            console.error('Error loading progress:', error);
            UI.showToast('Ошибка загрузки прогресса. Используется стандартный профиль.', '❌');
            return {
                completedLessons: [],
                quizScores: {},
                points: 0,
                streak: 0,
                lastActivity: null,
                achievements: []
            };
        }
    }
};

/** Storage Module */
async function loadProgress() {
    if (isAuthenticated()) {
        const token = localStorage.getItem('token');
        try {
            console.log('Loading progress with token:', token);
            const response = await fetch('/api/progress', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                State.userProgress = data.progress || {};
                State.points = data.points || 0;
                State.streak = data.streak || 0;
                State.achievements = data.achievements || [];
                State.badges = data.badges || [];
                console.log('Progress loaded:', data);
                return State.userProgress;
            } else {
                const errorData = await response.json();
                UI.showToast(errorData.error || 'Ошибка загрузки прогресса', '❌');
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('login');
                    window.location.href = 'login.html';
                }
                return {};
            }
        } catch (error) {
            console.error('Error loading progress:', error);
            UI.showToast('Ошибка подключения к серверу: ' + error.message, '❌');
            return {};
        }
    } else {
        const saved = localStorage.getItem('userProgress');
        State.userProgress = saved ? JSON.parse(saved) : {};
        State.points = parseInt(localStorage.getItem('points')) || 0;
        State.streak = parseInt(localStorage.getItem('streak')) || 0;
        State.achievements = JSON.parse(localStorage.getItem('achievements')) || [];
        State.badges = JSON.parse(localStorage.getItem('badges')) || [];
        return State.userProgress;
    }
}

function loadStats() {
    try {
        const saved = localStorage.getItem('userStats');
        if (saved) return JSON.parse(saved);
        return { points: 0, streak: 0, lastActiveDate: null, achievements: [], badges: [] };
    } catch (error) {
        console.error('Error loading stats:', error);
        return { points: 0, streak: 0, lastActiveDate: null, achievements: [], badges: [] };
    }
}

function loadProfile() {
    try {
        const storage = storageAvailable ? localStorage : MemoryStorage;
        const saved = storage.getItem('userProfile');
        if (saved) return JSON.parse(saved);
        return { name: 'Пользователь', avatar: 'https://ui-avatars.com/api/?name=Пользователь' };
    } catch (error) {
        console.error('Error loading profile:', error);
        UI.showToast('Ошибка загрузки профиля. Используется стандартный профиль.', '❌');
        return { name: 'Пользователь', avatar: 'https://ui-avatars.com/api/?name=Пользователь' };
    }
}

async function saveProgress() {
    if (isAuthenticated()) {
        const token = localStorage.getItem('token');
        const data = {
            progress: State.userProgress,
            points: State.points,
            streak: State.streak,
            achievements: State.achievements,
            badges: State.badges
        };
        try {
            console.log('Saving progress:', data);
            const response = await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                UI.showToast('Прогресс сохранён', '✅');
            } else {
                const errorData = await response.json();
                UI.showToast(errorData.error || 'Ошибка сохранения прогресса', '❌');
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('login');
                    window.location.href = 'login.html';
                }
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            UI.showToast('Ошибка подключения к серверу: ' + error.message, '❌');
        }
    } else {
        localStorage.setItem('userProgress', JSON.stringify(State.userProgress));
        localStorage.setItem('points', State.points);
        localStorage.setItem('streak', State.streak);
        localStorage.setItem('achievements', JSON.stringify(State.achievements));
        localStorage.setItem('badges', JSON.stringify(State.badges));
        UI.showToast('Прогресс сохранён локально', '✅');
    }
    UI.updateProgressDisplay();
    UI.checkAchievements();
    UI.checkBadges();
}

function saveProfile() {
    try {
        const storage = storageAvailable ? localStorage : MemoryStorage;
        storage.setItem('userProfile', JSON.stringify(State.userProfile));
        UI.updateProfileDisplay();
    } catch (error) {
        console.error('Error saving profile:', error);
        UI.showToast('Ошибка сохранения профиля.', '❌');
    }
}

/** UI Module */
const UI = {
    Notifications: {
        shownNotifications: new Set(),
        showProgressMovedNotification() {
            if (this.shownNotifications.has('progressMovedNotification')) {
                console.log('Notification already shown');
                return;
            }
            const notification = document.getElementById('progress-moved-notification');
            if (notification) {
                notification.style.display = 'flex';
                this.shownNotifications.add('progressMovedNotification');
                Analytics.trackEvent('notification_shown', { type: 'progress_moved' });
            }
        },
        closeNotification(id) {
            const notification = document.getElementById(id);
            if (notification) {
                notification.style.display = 'none';
            }
        }
    },

    showNotification(message) {
        const modal = document.getElementById('notification-modal');
        const modalMessage = document.getElementById('notification-message');
        modalMessage.textContent = message;
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        const closeBtn = document.getElementById('notification-close-btn');
        closeBtn.focus();
        Analytics.trackEvent('notification_shown', { message });
    },

    hideNotification() {
        const modal = document.getElementById('notification-modal');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    },

    updateProgressDisplay() {
        const totalLessons = Data.course.lessons.length;
        const completedLessons = Data.course.lessons.filter(lesson => State.userProgress[lesson.id]?.completed).length;
        const progressPercentage = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 0;

        Utils.animateProgressCircle(progressPercentage);
        DOM.elements.progressText.textContent = `${progressPercentage}%`;
        DOM.elements.completedLessons.textContent = completedLessons;
        DOM.elements.userPoints.textContent = State.points;
        DOM.elements.userStreak.textContent = `${State.streak} дней`;
    },

    updateStatsDisplay() {
        DOM.elements.pointsText.textContent = `Очки: ${State.points} 🏆`;
        DOM.elements.streakCount.textContent = `Серия: ${State.streak} дней 🔥`;
        const today = new Date().toISOString().split('T')[0];
        DOM.elements.dailyGoalText.textContent = State.lastActiveDate === today
            ? 'Цель выполнена! 🎉'
            : 'Пройдите 1 урок для серии!';
    },

    updateProfileDisplay() {
        DOM.elements.userNameInput.value = State.userProfile.name;
        DOM.elements.userAvatar.src = State.userProfile.avatar;
        DOM.elements.userPointsProfile.textContent = State.points;
        DOM.elements.userStreakProfile.textContent = `${State.streak} дней`;

        // Показываем кнопки в зависимости от статуса авторизации
        if (isAuthenticated()) {
            if (DOM.elements.loginButton) DOM.elements.loginButton.style.display = 'none';
            if (DOM.elements.registerButton) DOM.elements.registerButton.style.display = 'none';
            if (DOM.elements.logoutButton) DOM.elements.logoutButton.style.display = 'block';
        } else {
            if (DOM.elements.loginButton) DOM.elements.loginButton.style.display = 'block';
            if (DOM.elements.registerButton) DOM.elements.registerButton.style.display = 'block';
            if (DOM.elements.logoutButton) DOM.elements.logoutButton.style.display = 'none';
        }
    },

    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

        if (State.lastActiveDate !== today) {
            State.streak = State.lastActiveDate === yesterday
                ? State.streak + 1
                : 1;
            State.lastActiveDate = today;
            saveStats();
            UI.checkAchievements();
        }
    },

    renderLessons() {
        const availableLessonsContainer = document.getElementById('available-lessons');
        const completedLessonsContainer = document.getElementById('completed-lessons-list');

        this.showLoading(availableLessonsContainer);
        this.showLoading(completedLessonsContainer);

        availableLessonsContainer.innerHTML = '';
        completedLessonsContainer.innerHTML = '';

        const availableLessons = Data.course.lessons.filter(lesson => !State.userProgress[lesson.id]?.completed);
        const completedLessons = Data.course.lessons.filter(lesson => State.userProgress[lesson.id]?.completed);

        console.log('Available lessons:', availableLessons.length);
        console.log('Completed lessons:', completedLessons.length);

        function renderLesson(lesson, container) {
            const progress = State.userProgress[lesson.id] || { status: 'not-started' };
            const lessonCard = document.createElement('div');
            lessonCard.className = 'lesson-card fade-in';
            lessonCard.setAttribute('role', 'listitem');

            const status = progress.completed ? { class: 'completed', text: 'Завершен' }
                : progress.status === 'in-progress' ? { class: 'in-progress', text: 'В процессе' }
                : { class: 'not-started', text: 'Не начат' };

            lessonCard.innerHTML = `
                <div class="status ${status.class}">${status.text}</div>
                <h3>${lesson.title}</h3>
                <p>${lesson.description}</p>
                <button class="btn" data-lesson-id="${lesson.id}" aria-label="Предпросмотр урока ${lesson.title}">Предпросмотр</button>
            `;

            lessonCard.querySelector('button').addEventListener('click', () => UI.showLessonPreview(lesson.id));
            container.appendChild(lessonCard);
        }

        function createShowMoreButton(id, label, lessons, container, initialCount) {
            const button = document.createElement('button');
            button.className = 'btn outline-btn show-more-btn pulse';
            button.id = id;
            button.textContent = `Ещё (${lessons.length - initialCount})`;
            button.setAttribute('aria-label', label);
            button.setAttribute('type', 'button');
            button.setAttribute('role', 'button');
            button.onclick = () => {
                lessons.slice(initialCount).forEach(lesson => renderLesson(lesson, container));
                const buttonContainer = container.querySelector('.show-more-container');
                if (buttonContainer) buttonContainer.remove();
                if (lessons.length >= Data.course.totalLessons) {
                    UI.showNotification('Уроков больше нет, новые появятся скоро!');
                }
                Analytics.trackEvent('show_more_clicked', { buttonId: id, remaining: lessons.length - initialCount });
            };
            return button;
        }

        if (availableLessons.length === 0) {
            availableLessonsContainer.innerHTML = '<p class="no-lessons-message">Нет доступных уроков. Новые уроки скоро 😉!</p>';
        } else {
            const initialAvailableCount = Math.min(5, availableLessons.length);
            availableLessons.slice(0, initialAvailableCount).forEach(lesson => renderLesson(lesson, availableLessonsContainer));

            if (availableLessons.length > initialAvailableCount) {
                const availableShowMoreBtn = createShowMoreButton(
                    'show-more-available-btn',
                    `Показать ещё ${availableLessons.length - initialAvailableCount} доступных уроков`,
                    availableLessons,
                    availableLessonsContainer,
                    initialAvailableCount
                );
                const availableButtonContainer = document.createElement('div');
                availableButtonContainer.className = 'show-more-container fade-in';
                availableButtonContainer.appendChild(availableShowMoreBtn);
                availableLessonsContainer.appendChild(availableButtonContainer);
            }
        }

        if (completedLessons.length === 0) {
            completedLessonsContainer.innerHTML = '<p class="no-lessons-message">Нет пройденных уроков. Начните обучение!</p>';
        } else {
            const initialCompletedCount = Math.min(5, completedLessons.length);
            completedLessons.slice(0, initialCompletedCount).forEach(lesson => renderLesson(lesson, completedLessonsContainer));

            if (completedLessons.length > initialCompletedCount) {
                const completedShowMoreBtn = createShowMoreButton(
                    'show-more-completed-btn',
                    `Показать ещё ${completedLessons.length - initialCompletedCount} пройденных уроков`,
                    completedLessons,
                    completedLessonsContainer,
                    initialCompletedCount
                );
                const completedButtonContainer = document.createElement('div');
                completedButtonContainer.className = 'show-more-container fade-in';
                completedButtonContainer.appendChild(completedShowMoreBtn);
                completedLessonsContainer.appendChild(completedButtonContainer);
            }
        }

        this.hideLoading(availableLessonsContainer);
        this.hideLoading(completedLessonsContainer);
    },

    renderAchievements() {
        DOM.elements.achievementsContainer.innerHTML = '';
        Data.achievements.forEach(achievement => {
            const isUnlocked = State.achievements.includes(achievement.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.setAttribute('role', 'listitem');
            card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
            `;
            DOM.elements.achievementsContainer.appendChild(card);
        });
    },

    renderBadges() {
        DOM.elements.badgesContainer.innerHTML = '';
        Data.badges.forEach(badge => {
            const isUnlocked = State.badges.includes(badge.id);
            const card = document.createElement('div');
            card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.setAttribute('role', 'listitem');
            card.innerHTML = `
                <div class="badge-icon">${badge.icon}</div>
                <h4>${badge.title}</h4>
                <p>${badge.description}</p>
            `;
            DOM.elements.badgesContainer.appendChild(card);
        });
    },

    renderLeaderboard() {
        DOM.elements.leaderboardContainer.innerHTML = '';
        if (Data.leaderboard.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'leaderboard-empty';
            emptyMessage.textContent = 'Таблица лидеров пока пуста. Завершайте уроки, чтобы попасть сюда!';
            DOM.elements.leaderboardContainer.appendChild(emptyMessage);
            return;
        }
        Data.leaderboard.forEach((user, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.setAttribute('role', 'listitem');
            item.innerHTML = `
                <span class="position">${index + 1}</span>
                <img src="${user.avatar}" alt="Аватар ${user.name}" loading="lazy" width="40" height="40">
                <div>
                    <h4>${user.name}</h4>
                    <p>${user.points} очков</p>
                </div>
            `;
            DOM.elements.leaderboardContainer.appendChild(item);
        });
    },

    renderQuiz(lessonId) {
        const lesson = Data.course.lessons.find(l => l.id === lessonId);
        if (!lesson || !lesson.quiz) return;

        DOM.elements.quizQuestions.innerHTML = '';
        lesson.quiz.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'quiz-question';
            questionDiv.setAttribute('role', 'listitem');

            const optionsHtml = q.options.map((option, optIndex) => `
                <label class="quiz-option">
                    <input type="radio" name="question-${index}" value="${optIndex}" aria-label="${option}" required /> ${option}
                </label>
            `).join('');

            questionDiv.innerHTML = `
                <h4>${index + 1}. ${q.question}</h4>
                <div class="quiz-options">${optionsHtml}</div>
            `;
            DOM.elements.quizQuestions.appendChild(questionDiv);
        });

        DOM.elements.quizResult.style.display = 'none';
        DOM.elements.quizResult.className = 'result-container';
        DOM.elements.quizResult.textContent = '';
        DOM.elements.submitQuizBtn.onclick = () => UI.checkQuiz(lessonId);
    },

    showLessonPreview(lessonId) {
        Utils.closeMenu();
        const lesson = Data.course.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        DOM.elements.previewTitle.textContent = lesson.title;
        DOM.elements.previewDescription.textContent = lesson.description;
        DOM.elements.lessonPreviewModal.style.display = 'flex';
        DOM.elements.lessonPreviewModal.focus();

        DOM.elements.startLessonBtn.onclick = () => {
            DOM.elements.lessonPreviewModal.style.display = 'none';
            UI.openLesson(lessonId);
        };

        DOM.elements.closeModalBtn.onclick = () => {
            DOM.elements.lessonPreviewModal.style.display = 'none';
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                DOM.elements.lessonPreviewModal.style.display = 'none';
                DOM.elements.lessonPreviewModal.removeEventListener('keydown', handleEscape);
            }
        };
        DOM.elements.lessonPreviewModal.addEventListener('keydown', handleEscape);
    },

    openLesson(lessonId) {
        Utils.closeMenu();
        State.currentLessonId = lessonId;
        const lesson = Data.course.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        if (!State.userProgress[lessonId] || State.userProgress[lessonId].status === 'not-started') {
            State.userProgress[lessonId] = { status: 'in-progress', completed: false, quizCompleted: false, quizScore: 0 };
            UI.updateStreak();
            saveProgress();
            Activity.logActivity(Activity.activityTypes.LESSON_STARTED, { lessonId });
        }

        DOM.elements.lessonLoading.style.display = 'block';
        DOM.elements.lessonContent.style.display = 'none';
        DOM.elements.quizContainer.style.display = 'none';

        setTimeout(() => {
            DOM.elements.lessonContent.innerHTML = lesson.content;
            DOM.elements.lessonContent.style.display = 'block';
            DOM.elements.lessonLoading.style.display = 'none';
            UI.showPage('lesson');
        }, 500);

        DOM.elements.nextBtn.textContent = 'Далее: Тест';
        DOM.elements.nextBtn.style.display = 'block';
        DOM.elements.nextBtn.onclick = () => {
            DOM.elements.lessonContent.style.display = 'none';
            UI.renderQuiz(lessonId);
            DOM.elements.quizContainer.style.display = 'block';
            DOM.elements.nextBtn.style.display = 'none';
        };
    },

    checkQuiz(lessonId) {
        const lesson = Data.course.lessons.find(l => l.id === lessonId);
        if (!lesson || !lesson.quiz) return;

        let correctAnswers = 0;
        const totalQuestions = lesson.quiz.length;
        let allAnswered = true;

        lesson.quiz.forEach((q, index) => {
            const selected = document.querySelector(`input[name="question-${index}"]:checked`);
            if (!selected) allAnswered = false;
            if (selected && parseInt(selected.value) === q.correctAnswer) correctAnswers++;
        });

        if (!allAnswered) {
            DOM.elements.quizResult.className = 'result-container error';
            DOM.elements.quizResult.textContent = 'Пожалуйста, ответьте на все вопросы!';
            DOM.elements.quizResult.style.display = 'block';
            return;
        }

        const score = Math.round((correctAnswers / totalQuestions) * 100);
        State.userProgress[lessonId].quizCompleted = true;
        State.userProgress[lessonId].quizScore = score;

        Activity.logActivity(Activity.activityTypes.QUIZ_COMPLETED, { lessonId, score });

        if (score >= 70) {
            State.userProgress[lessonId].completed = true;
            State.points += 50;
            Activity.logActivity(Activity.activityTypes.LESSON_COMPLETED, { lessonId });
            DOM.elements.quizResult.className = 'result-container success';
            DOM.elements.quizResult.textContent = `Поздравляем! ${correctAnswers}/${totalQuestions} (${score}%). Урок завершен!`;
            UI.triggerConfetti();
            if (State.isSoundEnabled) UI.playSuccessSound();
            saveProgress();
            saveStats();
            Analytics.trackEvent('quiz_completed', { lessonId, score });
        } else {
            DOM.elements.quizResult.className = 'result-container error';
            DOM.elements.quizResult.textContent = `${correctAnswers}/${totalQuestions} (${score}%). Нужно 70%+. Попробуйте снова!`;
        }

        DOM.elements.quizResult.style.display = 'block';
        DOM.elements.nextBtn.style.display = 'none';
    },

    checkAchievements() {
        Data.achievements.forEach(achievement => {
            if (!State.achievements.includes(achievement.id) && achievement.condition(State.userProgress, State)) {
                State.achievements.push(achievement.id);
                Activity.logActivity(Activity.activityTypes.ACHIEVEMENT_UNLOCKED, { achievementId: achievement.id });
                UI.showToast(`Достижение: ${achievement.title}!`, achievement.icon);
                UI.triggerConfetti();
                saveProgress();
            }
        });
    },

    checkBadges() {
        Data.badges.forEach(badge => {
            if (!State.badges.includes(badge.id) && badge.condition(State.userProgress, State)) {
                State.badges.push(badge.id);
                State.points += badge.points;
                Activity.logActivity(Activity.activityTypes.BADGE_EARNED, { badgeId: badge.id });
                UI.showToast(`Награда: ${badge.title}!`, badge.icon);
                UI.triggerConfetti();
                saveProgress();
            }
        });
    },

    showToast(message, icon) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `<span class="icon">${icon}</span><p>${message}</p>`;
        DOM.elements.toastContainer.appendChild(toast);
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transition = 'opacity 0.3s';
        }, 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            disableForReducedMotion: true
        });
    },

    playSuccessSound() {
        if ('Audio' in window) {
            const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
            audio.play().catch(error => {
                console.warn('Sound playback failed:', error);
                UI.showToast('Воспроизведение звука заблокировано. Проверьте настройки браузера.', '⚠️');
            });
        } else {
            console.warn('Audio API not supported');
            UI.showToast('Звук не поддерживается в этом браузере.', '⚠️');
        }
    },

    showPage(page) {
        Utils.closeMenu();
        DOM.elements.homePage.style.display = page === 'home' ? 'block' : 'none';
        DOM.elements.lessonPage.style.display = page === 'lesson' ? 'block' : 'none';
        DOM.elements.achievementsPage.style.display = page === 'achievements' ? 'block' : 'none';
        DOM.elements.profilePage.style.display = page === 'profile' ? 'block' : 'none';
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => link.removeAttribute('aria-current'));
        DOM.elements[`${page}-link`]?.setAttribute('aria-current', 'page');
        DOM.elements[`mobile-${page}-link`]?.setAttribute('aria-current', 'page');

        if (page === 'profile') {
            try {
                Activity.renderActivities();
                UI.updateProfileDisplay();
            } catch (error) {
                console.error('Error rendering profile page:', error);
                UI.showToast('Ошибка отображения профиля.', '❌');
            }
        } else if (page === 'achievements') {
            try {
                UI.renderAchievements();
            } catch (error) {
                console.error('Error rendering achievements page:', error);
                UI.showToast('Ошибка отображения достижений.', '❌');
            }
        }
    },

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        DOM.elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
        const storage = storageAvailable ? localStorage : MemoryStorage;
        storage.setItem('theme', isDark ? 'dark' : 'light');
    },

    toggleContrast() {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        const storage = storageAvailable ? localStorage : MemoryStorage;
        storage.setItem('contrast', isHighContrast ? 'high' : 'normal');
    },

    toggleMenu() {
        State.isMenuOpen = !State.isMenuOpen;
        DOM.elements.navMenu.classList.toggle('active', State.isMenuOpen);
        DOM.elements.hamburger.classList.toggle('active', State.isMenuOpen);
        DOM.elements.hamburger.setAttribute('aria-expanded', State.isMenuOpen);
        DOM.elements.navMenu.setAttribute('aria-hidden', !State.isMenuOpen);
        DOM.elements.navOverlay.classList.toggle('active', State.isMenuOpen);
        document.body.style.overflow = State.isMenuOpen ? 'hidden' : '';
        Analytics.trackEvent('hamburger_clicked', { isExpanded: State.isMenuOpen });
        if (State.isMenuOpen) {
            DOM.elements.navMenu.focus();
        } else {
            DOM.elements.hamburger.focus();
        }
    },

    showLoading(container) {
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.setAttribute('aria-label', 'Загрузка уроков');
        container.appendChild(loader);
    },

    hideLoading(container) {
        const loader = container.querySelector('.loader');
        if (loader) loader.remove();
    },

    continueLearning() {
        const availableLessons = Data.course.lessons.filter(lesson => !State.userProgress[lesson.id]?.completed);
        if (availableLessons.length === 0) {
            this.showNotification('Уроков больше нет, новые появятся скоро!');
        } else {
            const firstAvailableLesson = availableLessons[0];
            this.showLessonPreview(firstAvailableLesson.id);
            Analytics.trackEvent('continue_learning_clicked', { lessonId: firstAvailableLesson.id });
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('login');
        State.login = null;
        State.userProgress = {};
        State.points = 0;
        State.streak = 0;
        State.achievements = [];
        State.badges = [];
        UI.updateProfileDisplay();
        UI.showToast('Вы вышли из аккаунта', '✅');
        window.location.href = 'login.html';
    }
};

// Обработчик события для navOverlay
DOM.elements.navOverlay.addEventListener('click', () => {
    if (State.isMenuOpen) {
        UI.toggleMenu();
    }
});

loadUserData();
loadProgress();

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('notification-close-btn');
    if (closeBtn) {
        closeBtn.add-determinedEventListener('click', () => UI.hideNotification());
    }

    const continueBtn = document.getElementById('continue-learning-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', (e) => {
            e.preventDefault();
            UI.continueLearning();
        });
    }

    // Обработчики для кнопок на странице профиля
    if (DOM.elements.loginButton) {
        DOM.elements.loginButton.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
    if (DOM.elements.registerButton) {
        DOM.elements.registerButton.addEventListener('click', () => {
            window.location.href = 'register.html';
        });
    }
    if (DOM.elements.logoutButton) {
        DOM.elements.logoutButton.addEventListener('click', () => {
            UI.logout();
        });
    }
});

/** Initialization */
function init() {
    try {
        UI.renderLessons();
        UI.renderAchievements();
        UI.renderBadges();
        UI.renderLeaderboard();
        UI.updateProgressDisplay();
        UI.updateStatsDisplay();
        UI.updateProfileDisplay();

        const storage = storageAvailable ? localStorage : MemoryStorage;
        if (storage.getItem('theme') === 'dark') {
            console.log('Applying dark theme');
            UI.toggleTheme();
        }
        if (storage.getItem('contrast') === 'high') {
            console.log('Applying high contrast');
            UI.toggleContrast();
        }

        UI.Notifications.showProgressMovedNotification();

        const addClickHandler = (element, handler, eventName) => {
            if (element) {
                element.addEventListener('click', (e) => {
                    try {
                        console.log(`${eventName} clicked`);
                        handler(e);
                    } catch (error) {
                        console.error(`Error in ${eventName} handler:`, error);
                        UI.showToast(`Ошибка в ${eventName}. Проверьте консоль для деталей.`, '❌');
                    }
                });
            } else {
                console.warn(`Element for ${eventName} not found`);
            }
        };

        addClickHandler(DOM.elements.backBtn, () => {
            UI.showPage('home');
        }, 'backBtn');

        addClickHandler(DOM.elements.startLearningBtn, (e) => {
            e.preventDefault();
            if (Data.course.lessons.length > 0) UI.showLessonPreview(Data.course.lessons[0].id);
            Analytics.trackEvent('start_learning_clicked');
        }, 'startLearningBtn');

        addClickHandler(DOM.elements.continueLearningBtn, (e) => {
            e.preventDefault();
            const nextLesson = Data.course.lessons.find(lesson => !State.userProgress[lesson.id]?.completed);
            if (nextLesson) UI.showLessonPreview(nextLesson.id);
            Analytics.trackEvent('continue_learning_clicked');
        }, 'continueLearningBtn');

        addClickHandler(DOM.elements.homeLink, (e) => {
            e.preventDefault();
            UI.showPage('home');
            Analytics.trackEvent('nav_home_clicked');
        }, 'homeLink');

        addClickHandler(DOM.elements.achievementsLink, (e) => {
            e.preventDefault();
            UI.showPage('achievements');
            Analytics.trackEvent('nav_achievements_clicked');
        }, 'achievementsLink');

        addClickHandler(DOM.elements.profileLink, (e) => {
            e.preventDefault();
            UI.showPage('profile');
            Analytics.trackEvent('nav_profile_clicked');
        }, 'profileLink');

        addClickHandler(DOM.elements.mobileHomeLink, (e) => {
            e.preventDefault();
            UI.showPage('home');
            Analytics.trackEvent('mobile_nav_home_clicked');
        }, 'mobileHomeLink');

        addClickHandler(DOM.elements.mobileAchievementsLink, (e) => {
            e.preventDefault();
            UI.showPage('achievements');
            Analytics.trackEvent('mobile_nav_achievements_clicked');
        }, 'mobileAchievementsLink');

        addClickHandler(DOM.elements.mobileProfileLink, (e) => {
            e.preventDefault();
            UI.showPage('profile');
            Analytics.trackEvent('mobile_nav_profile_clicked');
        }, 'mobileProfileLink');

        addClickHandler(DOM.elements.changeAvatarBtn, () => {
            const newAvatar = prompt('Введите URL аватара:', State.userProfile.avatar);
            if (!newAvatar || !Utils.validateUrl(newAvatar)) {
                if (newAvatar) UI.showToast('Неверный URL аватара!', '❌');
                return;
            }

            const img = new Image();
            img.onload = () => {
                State.userProfile.avatar = newAvatar;
                saveProfile();
                Analytics.trackEvent('avatar_changed');
                UI.showToast('Аватар успешно обновлен!', '✅');
            };
            img.onerror = () => {
                UI.showToast('Не удалось загрузить изображение!', '❌');
            };
            img.src = newAvatar;
        }, 'changeAvatarBtn');

        addClickHandler(DOM.elements.saveProfileBtn, () => {
            const newName = Utils.sanitizeInput(DOM.elements.userNameInput.value.trim());
            if (newName && newName.length <= 20) {
                State.userProfile.name = newName || 'Пользователь';
                State.userProfile.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}`;
                saveProfile();
                Activity.logActivity(Activity.activityTypes.PROFILE_UPDATED);
                UI.showToast('Профиль сохранен!', '✅');
                Analytics.trackEvent('profile_saved');
            } else {
                UI.showToast('Имя слишком длинное или пустое!', '❌');
            }
        }, 'saveProfileBtn');

        addClickHandler(DOM.elements.themeToggle, () => {
            UI.toggleTheme();
        }, 'themeToggle');

        addClickHandler(DOM.elements.contrastToggle, () => {
            UI.toggleContrast();
        }, 'contrastToggle');

        addClickHandler(DOM.elements.hamburger, () => {
            UI.toggleMenu();
        }, 'hamburger');

        addClickHandler(DOM.elements.navOverlay, () => {
            Utils.closeMenu();
        }, 'navOverlay');

        addClickHandler(DOM.elements.closeModalBtn, () => {
            DOM.elements.lessonPreviewModal.style.display = 'none';
        }, 'closeModalBtn');

        addClickHandler(DOM.elements.shareAchievements, () => {
            const text = `Я набрал ${State.points} очков в обучении кибербезопасности! 🚀`;
            if ('share' in navigator && typeof navigator.share === 'function') {
                navigator.share({ title: 'Мои достижения', text, url: window.location.href })
                    .then(() => {
                        Activity.logActivity(Activity.activityTypes.COURSE_SHARED);
                    })
                    .catch(error => {
                        console.warn('Share error:', error);
                        if ('clipboard' in navigator && typeof navigator.clipboard.writeText === 'function') {
                            navigator.clipboard.writeText(text)
                                .then(() => {
                                    UI.showToast('Текст скопирован в буфер обмена!', '📋');
                                })
                                .catch(err => {
                                    console.error('Clipboard copy failed:', err);
                                    UI.showToast('Не удалось поделиться. Скопируйте текст вручную.', '❌');
                                });
                        } else {
                            prompt('Скопируйте текст для публикации:', text);
                        }
                    });
            } else {
                if ('clipboard' in navigator && typeof navigator.clipboard.writeText === 'function') {
                    navigator.clipboard.writeText(text)
                        .then(() => {
                            UI.showToast('Текст скопирован в буфер обмена!', '📋');
                        })
                        .catch(err => {
                            console.error('Clipboard copy failed:', err);
                            UI.showToast('Не удалось поделиться. Скопируйте текст вручную.', '❌');
                        });
                } else {
                    prompt('Скопируйте текст для публикации:', text);
                }
                Activity.logActivity(Activity.activityTypes.COURSE_SHARED);
            }
            Analytics.trackEvent('achievements_shared');
        }, 'shareAchievements');

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && State.isMenuOpen) {
                Utils.closeMenu();
            }
        });

        DOM.elements.userNameInput.addEventListener('input', Utils.debounce(() => {
            const newName = DOM.elements.userNameInput.value.trim();
            if (newName.length > 20) {
                UI.showToast('Имя не должно превышать 20 символов!', '❌');
            }
        }, 500));

        DOM.elements.navMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && State.isMenuOpen) {
                Utils.closeMenu();
            }
        });
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

init();
window.saveProgress = saveProgress;
