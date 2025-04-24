// Notification module for progress indicators moved to Profile tab
const Notification = {
    // DOM elements
    elements: {
        progressMovedNotification: document.getElementById('progress-moved-notification'),
        progressMovedOkBtn: document.getElementById('progress-moved-ok-btn')
    },

    // Cookie utilities
    setCookie(name, value, days) {
        try {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `; expires=${date.toUTCString()}`;
            document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
            console.log(`Cookie set: ${name}=${value}`);
            return true;
        } catch (error) {
            console.error('Error setting cookie:', error);
            return false;
        }
    },

    getCookie(name) {
        try {
            const nameEQ = encodeURIComponent(name) + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trim();
                if (c.indexOf(nameEQ) === 0) {
                    const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
                    console.log(`Cookie found: ${name}=${value}`);
                    return value;
                }
            }
            console.log(`Cookie not found: ${name}`);
            return null;
        } catch (error) {
            console.error('Error getting cookie:', error);
            return null;
        }
    },

    // Show notification if not dismissed
    showNotification() {
        if (!this.elements.progressMovedNotification || !this.elements.progressMovedOkBtn) {
            console.error('Notification elements not found:', this.elements);
            return;
        }

        const hasSeenNotification = this.getCookie('progressMovedNotification');
        if (hasSeenNotification !== 'true') {
            console.log('Showing notification');
            this.elements.progressMovedNotification.style.display = 'flex';
        } else {
            console.log('Notification already dismissed');
            this.elements.progressMovedNotification.style.display = 'none';
        }
    },

    // Initialize notification
    init() {
        if (!this.elements.progressMovedNotification || !this.elements.progressMovedOkBtn) {
            console.error('Notification elements not found:', this.elements);
            return;
        }

        // Handle OK button click
        const handleOkClick = () => {
            console.log('OK button clicked');
            if (this.setCookie('progressMovedNotification', 'true', 365)) {
                this.elements.progressMovedNotification.style.display = 'none';
            }
        };

        // Remove existing listeners to prevent duplicates
        this.elements.progressMovedOkBtn.removeEventListener('click', handleOkClick);
        this.elements.progressMovedOkBtn.addEventListener('click', handleOkClick);

        // Listen for page navigation events
        const handlePageShown = (e) => {
            if (e.detail.page === 'home') {
                this.showNotification();
            }
        };

        // Remove existing listeners to prevent duplicates
        document.removeEventListener('pageShown', handlePageShown);
        document.addEventListener('pageShown', handlePageShown);

        // Initial check on page load
        document.addEventListener('DOMContentLoaded', () => {
            const homePage = document.getElementById('home-page');
            if (homePage && homePage.style.display !== 'none') {
                this.showNotification();
            }
        }, { once: true });
    }
};

// Initialize notification
Notification.init();
