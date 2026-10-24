/**
 * Toast - Floating Pill Notifications for iOS PWAs.
 */
export class Toast {
  constructor({ container } = {}) {
    this.container = container;
  }

  show(message, { duration = 2400, type = 'info' } = {}) {
    if (!this.container) {
      let existing = document.getElementById('toast-container');
      if (!existing) {
        existing = document.createElement('div');
        existing.id = 'toast-container';
        existing.className = 'toast-layer';
        document.body.appendChild(existing);
      }
      this.container = existing;
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type} animate-toast-in`;
    toastEl.textContent = message;

    this.container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.add('toast-fading');
      setTimeout(() => {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      }, 200);
    }, duration);
  }
}
