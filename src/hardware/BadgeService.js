/**
 * BadgeService - Manages App Badging API on iOS Home Screen icons (e.g. expiring items count).
 */
export class BadgeService {
  static isSupported() {
    return typeof navigator !== 'undefined' && typeof navigator.setAppBadge === 'function';
  }

  static async set(count = 0) {
    if (!this.isSupported()) return false;
    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
      return true;
    } catch (err) {
      console.warn('[BadgeService] Failed to set app badge:', err);
      return false;
    }
  }

  static async clear() {
    if (!this.isSupported()) return false;
    try {
      await navigator.clearAppBadge();
      return true;
    } catch {
      return false;
    }
  }
}
