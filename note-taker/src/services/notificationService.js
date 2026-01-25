import { notesAPI } from './api';

class NotificationService {
  constructor() {
    this.checkInterval = null;
    this.permission = 'default';
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  // Show a notification
  showNotification(title, options = {}) {
    if (this.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    }
  }

  // Check for due reminders
  async checkReminders() {
    try {
      const response = await notesAPI.getAll({ isTrashed: false });
      const notes = response.data.notes;

      const now = new Date();

      for (const note of notes) {
        if (note.reminder?.dateTime && !note.reminder.notified) {
          const reminderTime = new Date(note.reminder.dateTime);

          // Check if reminder time has passed
          if (reminderTime <= now) {
            // Show notification
            const preview = note.content.substring(0, 50);
            const body = preview + (note.content.length > 50 ? '...' : '');

            const notification = this.showNotification('Note Reminder', {
              body: body,
              tag: note._id
            });

            // Handle notification click
            if (notification) {
              notification.onclick = () => {
                window.focus();
                // Navigate to the note (you can customize this)
                notification.close();
              };
            }

            // Mark as notified
            await notesAPI.update(note._id, {
              reminder: {
                ...note.reminder,
                notified: true
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  // Start checking for reminders every minute
  startChecking() {
    if (this.checkInterval) {
      return; // Already checking
    }

    // Check immediately
    this.checkReminders();

    // Then check every minute
    this.checkInterval = setInterval(() => {
      this.checkReminders();
    }, 60000); // 60 seconds
  }

  // Stop checking for reminders
  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
