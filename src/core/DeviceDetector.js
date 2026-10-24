/**
 * DeviceDetector - Hardware, Platform & WebKit Capabilities Diagnostics.
 */
export class DeviceDetector {
  static get isIOS() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isStandardIOS = /iPad|iPhone|iPod/.test(ua);
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isStandardIOS || isIPadOS;
  }

  static get isStandalone() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const isIOSStandalone = window.navigator.standalone === true;
    const isMediaStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    return Boolean(isIOSStandalone || isMediaStandalone);
  }

  static get hasTouch() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  }

  static get hasWakeLock() {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  static get hasWebShare() {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }

  static get hasAppBadge() {
    return typeof navigator !== 'undefined' && 'setAppBadge' in navigator;
  }

  static get hasBarcodeDetector() {
    return typeof window !== 'undefined' && 'BarcodeDetector' in window;
  }

  static get hasCamera() {
    return (
      typeof navigator !== 'undefined' &&
      'mediaDevices' in navigator &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  }

  static get hasVibrate() {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  static getDiagnostics() {
    return {
      isIOS: this.isIOS,
      isStandalone: this.isStandalone,
      hasTouch: this.hasTouch,
      hasWakeLock: this.hasWakeLock,
      hasWebShare: this.hasWebShare,
      hasAppBadge: this.hasAppBadge,
      hasBarcodeDetector: this.hasBarcodeDetector,
      hasCamera: this.hasCamera,
      hasVibrate: this.hasVibrate,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
    };
  }
}
