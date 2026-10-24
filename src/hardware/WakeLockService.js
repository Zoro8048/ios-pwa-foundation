/**
 * WakeLockService - Keeps screen active during continuous use (cooking, gameplay, live brackets).
 * Handles iOS page visibility re-acquisition automatically.
 */
export class WakeLockService {
  constructor() {
    this.sentinel = null;
    this.wanted = false;
    this._onVisibilityChange = this._onVisibilityChange.bind(this);

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVisibilityChange);
    }
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  async request() {
    this.wanted = true;
    if (!this.isSupported()) return false;

    try {
      if (this.sentinel !== null && !this.sentinel.released) {
        return true;
      }
      this.sentinel = await navigator.wakeLock.request('screen');
      this.sentinel.addEventListener('release', () => {
        this.sentinel = null;
      });
      return true;
    } catch (err) {
      console.warn('[WakeLockService] Failed to acquire screen wake lock:', err);
      return false;
    }
  }

  async release() {
    this.wanted = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {}
      this.sentinel = null;
    }
  }

  isActive() {
    return Boolean(this.sentinel && !this.sentinel.released);
  }

  async _onVisibilityChange() {
    if (this.wanted && document.visibilityState === 'visible') {
      await this.request();
    }
  }

  destroy() {
    this.release();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
    }
  }
}
