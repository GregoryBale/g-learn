/**
 * Cybersecurity Learning Platform
 * Enhanced with modular structure, accessibility, and fixed navigation menu
 */
const Analytics = {
    trackEvent(eventName, data) {
        console.log(`Analytics event: ${eventName}`, data);
    }
};

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
        lessonLoading: document.getElementById('lesson-loading')
    }
};

/** State Module */
const State = {
    currentLessonId: null,
    userProgress: loadProgress(),
    userStats: loadStats(),
    userProfile: loadProfile(),
    isSoundEnabled: true,
    isMenuOpen: false
};

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
            // Сохраняем прогресс в localStorage
            localStorage.setItem('cybersecurityProgress', JSON.stringify(this.progress));
            // Проверяем, действительно ли данные сохранены
            const savedData = localStorage.getItem('cybersecurityProgress');
            if (savedData && JSON.parse(savedData)) {
                console.log('Progress saved successfully:', this.progress);
                return true; // Успешное сохранение
            } else {
                throw new Error('Failed to verify saved progress');
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            UI.showToast('Не удалось сохранить прогресс. Проверьте настройки браузера.', '❌');
            return false; // Ошибка сохранения
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
function loadProgress() {
    try {
        const saved = localStorage.getItem('userProgress');
        if (saved) return JSON.parse(saved);
    } catch (error) {
        console.error('Error loading progress:', error);
        UI.showToast('Ошибка загрузки прогресса. Данные могут быть недоступны.', '❌');
    }
    const progress = {};
    Data.course.lessons.forEach(lesson => {
        progress[lesson.id] = { status: 'not-started', completed: false, quizCompleted: false, quizScore: 0 };
    });
    return progress;
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
        const saved = localStorage.getItem('userProfile');
        if (saved) return JSON.parse(saved);
        return { name: 'Пользователь', avatar: 'https://ui-avatars.com/api/?name=Пользователь' };
    } catch (error) {
        console.error('Error loading profile:', error);
        return { name: 'Пользователь', avatar: 'https://ui-avatars.com/api/?name=Пользователь' };
    }
}

function saveProgress() {
    localStorage.setItem('userProgress', JSON.stringify(State.userProgress));
    UI.updateProgressDisplay();
    UI.checkAchievements();
    UI.checkBadges();
    UI.showToast('Прогресс сохранён', '✅');
}

function saveStats() {
    try {
        localStorage.setItem('userStats', JSON.stringify(State.userStats));
        UI.updateStatsDisplay();
    } catch (error) {
        console.error('Error saving stats:', error);
    }
}

function saveProfile() {
    try {
        localStorage.setItem('userProfile', JSON.stringify(State.userProfile));
        UI.updateProfileDisplay();
    } catch (error) {
        console.error('Error saving profile:', error);
    }
}

/** UI Module */
const UI = {
    updateProgressDisplay() {
        const totalLessons = Data.course.lessons.length;
        const completedLessons = Data.course.lessons.filter(lesson => State.userProgress[lesson.id]?.completed).length;
        const progressPercentage = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 0;

        Utils.animateProgressCircle(progressPercentage);
        DOM.elements.progressText.textContent = `${progressPercentage}%`;
        DOM.elements.completedLessons.textContent = completedLessons;
        DOM.elements.userPoints.textContent = State.userStats.points;
        DOM.elements.userStreak.textContent = `${State.userStats.streak} дней`;
    },
    updateStatsDisplay() {
        DOM.elements.pointsText.textContent = `Очки: ${State.userStats.points} 🏆`;
        DOM.elements.streakCount.textContent = `Серия: ${State.userStats.streak} дней 🔥`;
        const today = new Date().toISOString().split('T')[0];
        DOM.elements.dailyGoalText.textContent = State.userStats.lastActiveDate === today
            ? 'Цель выполнена! 🎉'
            : 'Пройдите 1 урок для серии!';
    },
    updateProfileDisplay() {
        DOM.elements.userNameInput.value = State.userProfile.name;
        DOM.elements.userAvatar.src = State.userProfile.avatar;
        DOM.elements.userPointsProfile.textContent = State.userStats.points;
        DOM.elements.userStreakProfile.textContent = `${State.userStats.streak} дней`;
    },
    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

        if (State.userStats.lastActiveDate !== today) {
            State.userStats.streak = State.userStats.lastActiveDate === yesterday
                ? State.userStats.streak + 1
                : 1;
            State.userStats.lastActiveDate = today;
            saveStats();
            UI.checkAchievements();
        }
    },
    renderLessons() {
        const availableLessonsContainer = document.getElementById('available-lessons');
        const completedLessonsContainer = document.getElementById('completed-lessons-list');

        // Очищаем контейнеры перед рендерингом
        availableLessonsContainer.innerHTML = '';
        completedLessonsContainer.innerHTML = '';

        // Фильтруем уроки
        const availableLessons = Data.course.lessons.filter(lesson => !State.userProgress[lesson.id]?.completed);
        const completedLessons = Data.course.lessons.filter(lesson => State.userProgress[lesson.id]?.completed);

        // Логи для отладки
        console.log('Available lessons:', availableLessons.length);
        console.log('Completed lessons:', completedLessons.length);

        // Функция для рендеринга одного урока
        function renderLesson(lesson, container) {
            const progress = State.userProgress[lesson.id] || { status: 'not-started' };
            const lessonCard = document.createElement('div');
            lessonCard.className = 'lesson-card';
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

        // Функция для создания кнопки "Ещё..."
        function createShowMoreButton(id, label, lessons, container, initialCount) {
            const button = document.createElement('button');
            button.className = 'btn outline-btn show-more-btn';
            button.id = id;
            button.textContent = `Ещё (${lessons.length - initialCount})`;
            button.setAttribute('aria-label', label);
            button.setAttribute('type', 'button');
            button.setAttribute('role', 'button');
            button.onclick = () => {
                // Рендерим только оставшиеся уроки
                lessons.slice(initialCount).forEach(lesson => renderLesson(lesson, container));
                // Удаляем кнопку
                const buttonContainer = container.querySelector('.show-more-container');
                if (buttonContainer) buttonContainer.remove();
                Analytics.trackEvent('show_more_clicked', { buttonId: id, remaining: lessons.length - initialCount });
            };
            return button;
        }

        // Рендеринг доступных уроков
        if (availableLessons.length === 0) {
            availableLessonsContainer.innerHTML = '<p class="no-lessons-message">Нет доступных уроков. Новые уроки скоро 😉!</p>';
        } else {
            const initialAvailableCount = Math.min(5, availableLessons.length);
            availableLessons.slice(0, initialAvailableCount).forEach(lesson => renderLesson(lesson, availableLessonsContainer));

            // Добавляем кнопку "Ещё" для доступных уроков, если их больше 5
            if (availableLessons.length > initialAvailableCount) {
                const availableShowMoreBtn = createShowMoreButton(
                    'show-more-available-btn',
                    `Показать ещё ${availableLessons.length - initialAvailableCount} доступных уроков`,
                    availableLessons,
                    availableLessonsContainer,
                    initialAvailableCount
                );
                const availableButtonContainer = document.createElement('div');
                availableButtonContainer.className = 'show-more-container';
                availableButtonContainer.appendChild(availableShowMoreBtn);
                availableLessonsContainer.appendChild(availableButtonContainer);
            }
        }

        // Рендеринг пройденных уроков
        if (completedLessons.length === 0) {
            completedLessonsContainer.innerHTML = '<p class="no-lessons-message">Нет пройденных уроков. Начните обучение!</p>';
        } else {
            const initialCompletedCount = Math.min(5, completedLessons.length);
            completedLessons.slice(0, initialCompletedCount).forEach(lesson => renderLesson(lesson, completedLessonsContainer));

            // Добавляем кнопку "Ещё" для пройденных уроков, если их больше 5
            if (completedLessons.length > initialCompletedCount) {
                const completedShowMoreBtn = createShowMoreButton(
                    'show-more-completed-btn',
                    `Показать ещё ${completedLessons.length - initialCompletedCount} пройденных уроков`,
                    completedLessons,
                    completedLessonsContainer,
                    initialCompletedCount
                );
                const completedButtonContainer = document.createElement('div');
                completedButtonContainer.className = 'show-more-container';
                completedButtonContainer.appendChild(completedShowMoreBtn);
                completedLessonsContainer.appendChild(completedButtonContainer);
            }
        }
    },
    renderAchievements() {
        DOM.elements.achievementsContainer.innerHTML = '';
        Data.achievements.forEach(achievement => {
            const isUnlocked = State.userStats.achievements.includes(achievement.id);
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
            const isUnlocked = State.userStats.badges.includes(badge.id);
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
    
        // Обработчик для кнопки "Начать урок"
        DOM.elements.startLessonBtn.onclick = () => {
            DOM.elements.lessonPreviewModal.style.display = 'none';
            UI.openLesson(lessonId);
        };
    
        // Обработчик для кнопки закрытия ("крестик")
        DOM.elements.closeModalBtn.onclick = () => {
            DOM.elements.lessonPreviewModal.style.display = 'none';
        };
    
        // Обработчик для клавиши Escape
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
            // Log lesson started activity
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
    
        // Log quiz completion activity
        Activity.logActivity(Activity.activityTypes.QUIZ_COMPLETED, { lessonId, score });
    
        if (score >= 70) {
            State.userProgress[lessonId].completed = true;
            State.userStats.points += 50;
            // Log lesson completion activity
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
    checkBadges() {
        Data.badges.forEach(badge => {
            if (!State.userStats.badges.includes(badge.id) && badge.condition(State.userProgress, State.userStats)) {
                State.userStats.badges.push(badge.id);
                State.userStats.points += badge.points;
                // Log badge earned activity
                Activity.logActivity(Activity.activityTypes.BADGE_EARNED, { badgeId: badge.id });
                UI.showToast(`Награда: ${badge.title}!`, badge.icon);
                UI.triggerConfetti();
                saveStats();
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
        }, 10); // Небольшая задержка для начала анимации
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
        const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
        audio.play().catch(error => console.error('Error playing sound:', error));
    },
    showPage(page) {
        Utils.closeMenu();
        DOM.elements.homePage.style.display = page === 'home' ? 'block' : 'none';
        DOM.elements.lessonPage.style.display = page === 'lesson' ? 'block' : 'none';
        DOM.elements.achievementsPage.style.display = page === 'achievements' ? 'block' : 'none';
        DOM.elements.profilePage.style.display = page === 'profile' ? 'block' : 'none';
        document.querySelectorAll('.nav-link').forEach(link => link.removeAttribute('aria-current'));
        DOM.elements[`${page}-link`]?.setAttribute('aria-current', 'page');
    
        if (page === 'profile') {
            Activity.renderActivities();
            UI.updateProfileDisplay();
        }
    },
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        DOM.elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    },
    toggleContrast() {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        localStorage.setItem('contrast', isHighContrast ? 'high' : 'normal');
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
    }
};

// Обработчик события для navOverlay
DOM.elements.navOverlay.addEventListener('click', () => {
    if (State.isMenuOpen) {
        UI.toggleMenu(); // Вызываем метод toggleMenu в контексте объекта UI
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

        if (localStorage.getItem('theme') === 'dark') UI.toggleTheme();
        if (localStorage.getItem('contrast') === 'high') UI.toggleContrast();

        DOM.elements.backBtn.addEventListener('click', () => UI.showPage('home'));
        DOM.elements.startLearningBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (Data.course.lessons.length > 0) UI.showLessonPreview(Data.course.lessons[0].id);
            Analytics.trackEvent('start_learning_clicked');
        });
        DOM.elements.continueLearningBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const nextLesson = Data.course.lessons.find(lesson => !State.userProgress[lesson.id]?.completed);
            if (nextLesson) UI.showLessonPreview(nextLesson.id);
            Analytics.trackEvent('continue_learning_clicked');
        });
        DOM.elements.homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            UI.showPage('home');
            Analytics.trackEvent('nav_home_clicked');
        });
        DOM.elements.achievementsLink.addEventListener('click', (e) => {
            e.preventDefault();
            UI.showPage('achievements');
            Analytics.trackEvent('nav_achievements_clicked');
        });
        DOM.elements.profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            UI.showPage('profile');
            Analytics.trackEvent('nav_profile_clicked');
        });
        DOM.elements.changeAvatarBtn.addEventListener('click', () => {
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
        });
        DOM.elements.saveProfileBtn.addEventListener('click', () => {
            const newName = Utils.sanitizeInput(DOM.elements.userNameInput.value.trim());
            if (newName && newName.length <= 20) {
                State.userProfile.name = newName || 'Пользователь';
                State.userProfile.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}`;
                saveProfile();
                // Log profile update activity
                Activity.logActivity(Activity.activityTypes.PROFILE_UPDATED);
                UI.showToast('Профиль сохранен!', '✅');
                Analytics.trackEvent('profile_saved');
            } else {
                UI.showToast('Имя слишком длинное или пустое!', '❌');
            }
        });
        DOM.elements.themeToggle.addEventListener('click', UI.toggleTheme);
        DOM.elements.contrastToggle.addEventListener('click', UI.toggleContrast);
        DOM.elements.hamburger.addEventListener('click', UI.toggleMenu);
        DOM.elements.navOverlay.addEventListener('click', Utils.closeMenu);
        DOM.elements.navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => Utils.closeMenu());
        });
        DOM.elements.closeModalBtn.addEventListener('click', () => {
            DOM.elements.lessonPreviewModal.style.display = 'none';
        });
        DOM.elements.shareAchievements.addEventListener('click', () => {
            const text = `Я набрал ${State.userStats.points} очков в обучении кибербезопасности! 🚀`;
            if (navigator.share) {
                navigator.share({ title: 'Мои достижения', text, url: window.location.href })
                    .then(() => {
                        // Log course shared activity
                        Activity.logActivity(Activity.activityTypes.COURSE_SHARED);
                    })
                    .catch(error => console.error('Share error:', error));
            } else {
                prompt('Скопируйте текст для публикации:', text);
                // Log course shared activity
                Activity.logActivity(Activity.activityTypes.COURSE_SHARED);
            }
            Analytics.trackEvent('achievements_shared');
        });
        DOM.elements.lessonPreviewModal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') DOM.elements.lessonPreviewModal.style.display = 'none';
        });

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
