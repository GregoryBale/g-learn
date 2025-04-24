/**
 * Activity Module for Cybersecurity Learning Platform
 * Tracks and displays user activities in the profile section
 */

/** Activity Module */
const Activity = {
    // Define activity types
    activityTypes: {
        LESSON_STARTED: 'lesson_started',
        LESSON_COMPLETED: 'lesson_completed',
        QUIZ_COMPLETED: 'quiz_completed',
        ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
        BADGE_EARNED: 'badge_earned',
        PROFILE_UPDATED: 'profile_updated',
        COURSE_SHARED: 'course_shared'
    },

    // Load activities from localStorage
    loadActivities() {
        try {
            const storage = storageAvailable ? localStorage : MemoryStorage;
            const saved = storage.getItem('userActivities');
            if (!saved) {
                console.log('No activities found in storage');
                return [];
            }
            const activities = JSON.parse(saved);
            if (!Array.isArray(activities)) {
                console.warn('Invalid activities format, resetting to empty array');
                storage.setItem('userActivities', JSON.stringify([]));
                return [];
            }
            console.log('Loaded activities:', activities);
            return activities;
        } catch (error) {
            console.error('Error loading activities:', error);
            UI.showToast('Ошибка загрузки активности. Данные сброшены.', '❌');
            const storage = storageAvailable ? localStorage : MemoryStorage;
            storage.setItem('userActivities', JSON.stringify([]));
            return [];
        }
    },
    // Save activities to localStorage
    saveActivities(activities) {
        try {
            if (!Array.isArray(activities)) {
                throw new Error('Activities must be an array');
            }
            const storage = storageAvailable ? localStorage : MemoryStorage;
            storage.setItem('userActivities', JSON.stringify(activities));
            console.log('Saved activities:', activities);
        } catch (error) {
            console.error('Error saving activities:', error);
            UI.showToast('Не удалось сохранить активность.', '❌');
        }
    },
    // Log a new activity
logActivity(type, details = {}) {
    if (!this.activityTypes[type]) {
        console.warn('Unknown activity type:', type);
        return;
    }

    console.log('Logging activity:', { type, details });
    const activities = this.loadActivities();
    const activity = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        timestamp: new Date().toISOString(),
        details: { ...details } // Гарантируем, что details всегда объект
    };

    activities.unshift(activity);
    if (activities.length > 100) {
        activities.pop();
    }

    this.saveActivities(activities);
    if (DOM.elements.profilePage && DOM.elements.profilePage.style.display === 'block') {
        console.log('Profile page is visible, rendering activities');
        this.renderActivities();
    }
    Analytics.trackEvent('activity_logged', { type, details });
},

    // Render activities to the DOM
    renderActivities() {
        console.log('Rendering activities');
        const container = DOM.elements.activityStatistics;
        if (!container) {
            console.error('Activity statistics container not found');
            UI.showToast('Ошибка отображения активности.', '❌');
            return;
        }
    
        container.innerHTML = '';
        const activities = this.loadActivities();
    
        if (activities.length === 0) {
            container.innerHTML = '<p class="no-activity">Пока нет активности. Начните обучение! 🚀</p>';
            return;
        }
    
        activities.forEach(activity => {
            try {
                const activityElement = document.createElement('div');
                activityElement.className = 'activity-item';
                activityElement.setAttribute('role', 'listitem');
    
                // Проверяем, существует ли details, и устанавливаем значения по умолчанию
                const details = activity.details || {};
                const lessonId = details.lessonId || null;
                const achievementId = details.achievementId || null;
                const badgeId = details.badgeId || null;
    
                const lesson = lessonId
                    ? Data.course.lessons.find(l => l.id === lessonId)
                    : null;
                const achievement = achievementId
                    ? Data.achievements.find(a => a.id === achievementId)
                    : null;
                const badge = badgeId
                    ? Data.badges.find(b => b.id === badgeId)
                    : null;
    
                if (!lesson && lessonId) {
                    console.warn(`Lesson not found for lessonId: ${lessonId}`);
                }
                if (!achievement && achievementId) {
                    console.warn(`Achievement not found for achievementId: ${achievementId}`);
                }
                if (!badge && badgeId) {
                    console.warn(`Badge not found for badgeId: ${badgeId}`);
                }
    
                let icon = '';
                let text = '';
                const date = new Date(activity.timestamp);
                const formattedTime = date.toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                });
    
                switch (activity.type) {
                    case this.activityTypes.LESSON_STARTED:
                        icon = '📖';
                        text = `Начали урок: ${lesson ? lesson.title : 'Неизвестный урок'}`;
                        break;
                    case this.activityTypes.LESSON_COMPLETED:
                        icon = '✅';
                        text = `Завершили урок: ${lesson ? lesson.title : 'Неизвестный урок'}`;
                        break;
                    case this.activityTypes.QUIZ_COMPLETED:
                        icon = '📝';
                        text = `Пройден тест: ${lesson ? lesson.title : 'Неизвестный урок'} (${details.score || 0}%)`;
                        break;
                    case this.activityTypes.ACHIEVEMENT_UNLOCKED:
                        icon = achievement?.icon || '🏆';
                        text = `Получено достижение: ${achievement ? achievement.title : 'Неизвестное достижение'}`;
                        break;
                    case this.activityTypes.BADGE_EARNED:
                        icon = badge?.icon || '🏅';
                        text = `Заработана награда: ${badge ? badge.title : 'Неизвестная награда'}`;
                        break;
                    case this.activityTypes.PROFILE_UPDATED:
                        icon = '🧑';
                        text = 'Обновлен профиль';
                        break;
                    case this.activityTypes.COURSE_SHARED:
                        icon = '🤝';
                        text = 'Поделились курсом';
                        break;
                    default:
                        icon = '❓';
                        text = 'Неизвестная активность';
                }
    
                activityElement.innerHTML = `
                    <div class="activity-icon">${icon}</div>
                    <div class="activity-details">
                        <p class="activity-text">${text}</p>
                        <p class="activity-time">${formattedTime}</p>
                    </div>
                `;
                container.appendChild(activityElement);
            } catch (error) {
                console.error('Error rendering activity:', activity, error);
                UI.showToast('Ошибка отображения активности.', '❌');
            }
        });
    }
};
