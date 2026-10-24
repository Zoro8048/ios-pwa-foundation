/**
 * iOS PWA Foundation - Bundled Runtime
 * 100% Zero Runtime Dependencies • Procedural Audio & WebKit Bridges
 * Generated: 2026-10-24T22:41:29.799Z
 */
(() => {
  'use strict';

  // --- src/core/EventBus.js ---
/**
 * EventBus - Decoupled Pub/Sub Event Router for iOS PWA components.
 */
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in event listener for "${event}":`, err);
        }
      }
    }
  }

  clear() {
    this.listeners.clear();
  }
}


  // --- src/core/DeviceDetector.js ---
/**
 * DeviceDetector - Hardware, Platform & WebKit Capabilities Diagnostics.
 */
class DeviceDetector {
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


  // --- src/core/StorageManager.js ---
/**
 * StorageManager - Local-First Resilient Persistence with Migration & JSON Backup/Restore.
 */
class StorageManager {
  constructor({ namespace = 'ios_pwa', version = 1, migrations = {}, defaults = {} } = {}) {
    this.namespace = namespace;
    this.version = version;
    this.migrations = migrations;
    this.defaults = defaults;
    this.storageKey = `${this.namespace}_state`;
    this.metaKey = `${this.namespace}_meta`;
  }

  isAvailable() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = `__test_${Date.now()}__`;
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  load() {
    if (!this.isAvailable()) {
      return { ...this.defaults };
    }

    try {
      const raw = window.localStorage.getItem(this.storageKey);
      const metaRaw = window.localStorage.getItem(this.metaKey);

      if (!raw) {
        this.save(this.defaults);
        return { ...this.defaults };
      }

      let data = JSON.parse(raw);
      let meta = metaRaw ? JSON.parse(metaRaw) : { version: 1 };

      // Apply any pending migrations
      if (meta.version < this.version) {
        data = this._runMigrations(data, meta.version, this.version);
        this.save(data);
      }

      return data;
    } catch (err) {
      console.warn(`[StorageManager] Failed to read ${this.storageKey}, falling back to defaults:`, err);
      return { ...this.defaults };
    }
  }

  save(data) {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(data));
      window.localStorage.setItem(
        this.metaKey,
        JSON.stringify({
          version: this.version,
          updatedAt: new Date().toISOString(),
        })
      );
      return true;
    } catch (err) {
      console.error(`[StorageManager] Quota exceeded or error saving to localStorage:`, err);
      return false;
    }
  }

  exportBackup() {
    const data = this.load();
    const payload = {
      app: this.namespace,
      version: this.version,
      exportedAt: new Date().toISOString(),
      payload: data,
    };
    return JSON.stringify(payload, null, 2);
  }

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      const dataToSave = parsed.payload !== undefined ? parsed.payload : parsed;
      this.save(dataToSave);
      return { success: true, data: dataToSave };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  clear() {
    if (!this.isAvailable()) return;
    try {
      window.localStorage.removeItem(this.storageKey);
      window.localStorage.removeItem(this.metaKey);
    } catch (err) {
      console.error('[StorageManager] Error clearing data:', err);
    }
  }

  estimateUsage() {
    if (!this.isAvailable()) return { bytes: 0, items: 0 };
    let bytes = 0;
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(this.namespace)) {
          const val = window.localStorage.getItem(key) || '';
          bytes += (key.length + val.length) * 2; // UTF-16 approx
        }
      }
      return { bytes, items: window.localStorage.length };
    } catch {
      return { bytes: 0, items: 0 };
    }
  }

  _runMigrations(data, fromVersion, toVersion) {
    let current = { ...data };
    for (let v = fromVersion + 1; v <= toVersion; v++) {
      if (typeof this.migrations[v] === 'function') {
        try {
          current = this.migrations[v](current);
        } catch (mErr) {
          console.error(`[StorageManager] Migration to v${v} failed:`, mErr);
        }
      }
    }
    return current;
  }
}


  // --- src/hardware/AudioHaptics.js ---
/**
 * AudioHaptics - Procedural Web Audio Synthesizer & iOS Micro-Haptic Bridge.
 * Generates tactile audio-sensory feedback with zero external sound files.
 */
class AudioHaptics {
  constructor({ enabled = true } = {}) {
    this.enabled = enabled;
    this.ctx = null;
  }

  _ensureContext() {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!this.ctx) {
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  _vibrate(pattern = 10) {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  /**
   * Light Tap - standard button or pill press
   */
  tap() {
    this._vibrate(8);
    const ctx = this._ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  }

  /**
   * Selection Tick - picker wheels, segmented switches, slider ticks
   */
  tick() {
    this._vibrate(5);
    const ctx = this._ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  }

  /**
   * Heavy Impact - destructive confirmations, bracket match locks, game impacts
   */
  impact() {
    this._vibrate([15, 30, 20]);
    const ctx = this._ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  /**
   * Success Chime - match completion, recipe rescue, task saved
   */
  success() {
    this._vibrate([10, 50, 15]);
    const ctx = this._ensureContext();
    if (!ctx) return;

    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.09, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(587.33, 0.0, 0.09); // D5
    playTone(880.0, 0.07, 0.14); // A5
    playTone(1174.66, 0.14, 0.22); // D6
  }

  /**
   * Laser Scanner Beep - UPC barcode recognized
   */
  scanner() {
    this._vibrate(18);
    const ctx = this._ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, ctx.currentTime); // A6
    osc.frequency.setValueAtTime(2349.32, ctx.currentTime + 0.04); // D7

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.11);
  }

  /**
   * Warning Tone - quota alert, duplicate entry, validation error
   */
  warning() {
    this._vibrate([25, 40, 25]);
    const ctx = this._ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.setValueAtTime(196, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.17);
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
  }
}


  // --- src/hardware/WakeLockService.js ---
/**
 * WakeLockService - Keeps screen active during continuous use (cooking, gameplay, live brackets).
 * Handles iOS page visibility re-acquisition automatically.
 */
class WakeLockService {
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


  // --- src/hardware/ShareService.js ---
/**
 * ShareService - Invokes Native iOS Share Sheet (AirDrop, Messages, Notes) with Clipboard Fallback.
 */
class ShareService {
  static isSupported() {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }

  static async share({ title, text, url, files } = {}) {
    const shareData = {};
    if (title) shareData.title = title;
    if (text) shareData.text = text;
    if (url) shareData.url = url;
    if (files && Array.isArray(files) && files.length > 0) {
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files })) {
        shareData.files = files;
      }
    }

    if (this.isSupported()) {
      try {
        await navigator.share(shareData);
        return { success: true, method: 'native' };
      } catch (err) {
        if (err.name === 'AbortError') {
          return { success: false, reason: 'cancelled' };
        }
        // Fall back to clipboard if native share fails
      }
    }

    // Fallback: Copy URL or text to clipboard
    const copyTarget = url || text || title || '';
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(copyTarget);
        return { success: true, method: 'clipboard' };
      } catch (clipErr) {
        return { success: false, reason: clipErr.message };
      }
    }

    return { success: false, reason: 'unsupported' };
  }
}


  // --- src/hardware/BadgeService.js ---
/**
 * BadgeService - Manages App Badging API on iOS Home Screen icons (e.g. expiring items count).
 */
class BadgeService {
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


  // --- src/hardware/CameraService.js ---
/**
 * CameraService - Camera Viewfinder, Torch Toggle & BarcodeDetector Stream Bridge.
 */
class CameraService {
  constructor({ formats = ['qr_code', 'ean_13', 'upc_a', 'upc_e', 'code_128'] } = {}) {
    this.formats = formats;
    this.stream = null;
    this.videoEl = null;
    this.detector = null;
    this.isScanning = false;
    this.scanInterval = null;
    this.torchActive = false;

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        this.detector = new window.BarcodeDetector({ formats: this.formats });
      } catch (e) {
        console.warn('[CameraService] BarcodeDetector init failed:', e);
      }
    }
  }

  isSupported() {
    return (
      typeof navigator !== 'undefined' &&
      'mediaDevices' in navigator &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  }

  hasBarcodeDetector() {
    return Boolean(this.detector);
  }

  async start({ videoElement, onDetected } = {}) {
    if (!this.isSupported()) {
      throw new Error('Camera mediaDevices API is not supported on this device.');
    }

    this.videoEl = videoElement;

    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (this.videoEl) {
      this.videoEl.srcObject = this.stream;
      this.videoEl.setAttribute('playsinline', 'true');
      await this.videoEl.play();
    }

    if (this.detector && typeof onDetected === 'function') {
      this._startScanLoop(onDetected);
    }

    return true;
  }

  _startScanLoop(onDetected) {
    this.isScanning = true;
    const checkFrame = async () => {
      if (!this.isScanning || !this.videoEl || this.videoEl.readyState < 2) {
        if (this.isScanning) {
          this.scanInterval = requestAnimationFrame(checkFrame);
        }
        return;
      }

      try {
        const barcodes = await this.detector.detect(this.videoEl);
        if (barcodes && barcodes.length > 0) {
          const rawValue = barcodes[0].rawValue;
          if (rawValue) {
            onDetected(rawValue);
          }
        }
      } catch {}

      if (this.isScanning) {
        this.scanInterval = requestAnimationFrame(checkFrame);
      }
    };

    this.scanInterval = requestAnimationFrame(checkFrame);
  }

  async toggleTorch() {
    if (!this.stream) return false;
    const track = this.stream.getVideoTracks()[0];
    if (!track) return false;

    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    if (!capabilities.torch) return false;

    try {
      this.torchActive = !this.torchActive;
      await track.applyConstraints({
        advanced: [{ torch: this.torchActive }],
      });
      return this.torchActive;
    } catch {
      return false;
    }
  }

  stop() {
    this.isScanning = false;
    if (this.scanInterval) {
      cancelAnimationFrame(this.scanInterval);
      this.scanInterval = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoEl) {
      this.videoEl.srcObject = null;
      this.videoEl = null;
    }
    this.torchActive = false;
  }
}


  // --- src/ui/BottomSheet.js ---
/**
 * BottomSheet - Gesture-Driven iOS Spring Action Sheet.
 * Supports swipe-down to dismiss, grabber zone tracking, and backdrop blur.
 */
class BottomSheet {
  constructor({ container, audioHaptics } = {}) {
    this.container = container;
    this.audio = audioHaptics;
    this.isOpen = false;
    this.sheetEl = null;
    this.backdropEl = null;
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.onCloseCallback = null;
  }

  show({ title, subtitle = '', contentHtml = '', onRender, onClose } = {}) {
    this.isOpen = true;
    this.onCloseCallback = onClose;

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'modal-layer';
      document.body.appendChild(this.container);
    }

    this.container.classList.remove('hidden');

    this.container.innerHTML = `
      <div class="modal-backdrop" id="sheet-backdrop">
        <div class="ios-sheet animate-sheet-up" id="sheet-card">
          <div class="sheet-grabber-zone" id="sheet-grabber-zone" aria-label="Drag down to close">
            <div class="sheet-grabber"></div>
          </div>
          <div class="sheet-header">
            <div class="sheet-title-group">
              <h3 class="sheet-title">${title}</h3>
              ${subtitle ? `<p class="sheet-subtitle">${subtitle}</p>` : ''}
            </div>
            <button type="button" class="sheet-close-btn" id="sheet-btn-close" aria-label="Close">✕</button>
          </div>
          <div class="sheet-scrollable-body" id="sheet-body">
            ${contentHtml}
          </div>
        </div>
      </div>
    `;

    this.backdropEl = this.container.querySelector('#sheet-backdrop');
    this.sheetEl = this.container.querySelector('#sheet-card');

    if (this.audio) this.audio.tap();

    // Hook listeners
    this.container.querySelector('#sheet-btn-close').addEventListener('click', () => this.close());
    this.backdropEl.addEventListener('click', (e) => {
      if (e.target === this.backdropEl) this.close();
    });

    this._bindGestures();

    if (typeof onRender === 'function') {
      onRender(this.sheetEl, this);
    }
  }

  _bindGestures() {
    const grabberZone = this.container.querySelector('#sheet-grabber-zone');
    if (!grabberZone || !this.sheetEl) return;

    const onPointerDown = (e) => {
      this.isDragging = true;
      this.startY = e.clientY;
      this.currentY = e.clientY;
      this.sheetEl.style.transition = 'none';
      if (grabberZone.setPointerCapture) grabberZone.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      this.currentY = e.clientY;
      const deltaY = Math.max(0, this.currentY - this.startY);
      this.sheetEl.style.transform = `translateY(${deltaY}px)`;
    };

    const onPointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.sheetEl.style.transition = 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)';

      const deltaY = this.currentY - this.startY;
      if (deltaY > 85) {
        this.close();
      } else {
        this.sheetEl.style.transform = 'translateY(0)';
      }
    };

    grabberZone.addEventListener('pointerdown', onPointerDown);
    grabberZone.addEventListener('pointermove', onPointerMove);
    grabberZone.addEventListener('pointerup', onPointerUp);
    grabberZone.addEventListener('pointercancel', onPointerUp);
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.audio) this.audio.tap();

    if (this.sheetEl) this.sheetEl.classList.add('ios-sheet-closing');
    if (this.backdropEl) this.backdropEl.classList.add('backdrop-closing');

    setTimeout(() => {
      if (this.container) {
        this.container.classList.add('hidden');
        this.container.innerHTML = '';
      }
      if (typeof this.onCloseCallback === 'function') {
        this.onCloseCallback();
      }
    }, 220);
  }
}


  // --- src/ui/SegmentedControl.js ---
/**
 * SegmentedControl - Apple HIG Sliding Pill Segmented Switcher.
 */
class SegmentedControl {
  constructor({ container, options = [], defaultId, onChange, audioHaptics } = {}) {
    this.container = container;
    this.options = options;
    this.selectedId = defaultId || (options[0] ? options[0].id : null);
    this.onChange = onChange;
    this.audio = audioHaptics;
    this.pillEl = null;

    if (this.container) {
      this.render();
    }
  }

  render() {
    this.container.classList.add('ios-segmented-control');
    this.container.innerHTML = `
      <div class="segmented-pill-thumb"></div>
      ${this.options
        .map(
          (opt) => `
        <button type="button" class="segmented-option ${opt.id === this.selectedId ? 'active' : ''}" data-id="${opt.id}">
          ${opt.label}
        </button>
      `
        )
        .join('')}
    `;

    this.pillEl = this.container.querySelector('.segmented-pill-thumb');
    this._bindEvents();
    this.updateThumbPosition();
  }

  _bindEvents() {
    const buttons = this.container.querySelectorAll('.segmented-option');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.select(id);
      });
    });

    window.addEventListener('resize', () => this.updateThumbPosition());
  }

  select(id) {
    if (this.selectedId === id) return;
    this.selectedId = id;

    if (this.audio) this.audio.tick();

    const buttons = this.container.querySelectorAll('.segmented-option');
    buttons.forEach((btn) => {
      if (btn.getAttribute('data-id') === id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.updateThumbPosition();

    if (typeof this.onChange === 'function') {
      this.onChange(id);
    }
  }

  updateThumbPosition() {
    if (!this.pillEl || !this.container) return;
    const activeBtn = this.container.querySelector(`.segmented-option[data-id="${this.selectedId}"]`);
    if (!activeBtn) return;

    const offsetLeft = activeBtn.offsetLeft;
    const width = activeBtn.offsetWidth;

    this.pillEl.style.transform = `translateX(${offsetLeft}px)`;
    this.pillEl.style.width = `${width}px`;
  }
}


  // --- src/ui/InsetGroup.js ---
/**
 * InsetGroup - Apple Settings-style Rounded Inset Grouped Table View Builder.
 */
class InsetGroup {
  static create({ header = '', footer = '', rows = [] } = {}) {
    return `
      <div class="ios-group-container">
        ${header ? `<div class="ios-group-header">${header}</div>` : ''}
        <div class="ios-inset-card">
          ${rows.map((row, idx) => this.renderRow(row, idx === rows.length - 1)).join('')}
        </div>
        ${footer ? `<div class="ios-group-footer">${footer}</div>` : ''}
      </div>
    `;
  }

  static renderRow(row, isLast) {
    const {
      id = '',
      icon = '',
      title = '',
      subtitle = '',
      detail = '',
      badge = '',
      type = 'nav', // 'nav' | 'switch' | 'button' | 'value'
      checked = false,
      destructive = false,
    } = row;

    return `
      <div class="ios-table-row ${isLast ? 'last-row' : ''} ${destructive ? 'destructive-row' : ''}" data-row-id="${id}">
        <div class="row-leading">
          ${icon ? `<span class="row-icon">${icon}</span>` : ''}
          <div class="row-label-group">
            <span class="row-title ${destructive ? 'text-destructive' : ''}">${title}</span>
            ${subtitle ? `<span class="row-subtitle">${subtitle}</span>` : ''}
          </div>
        </div>

        <div class="row-trailing">
          ${badge ? `<span class="ios-badge">${badge}</span>` : ''}
          ${detail ? `<span class="row-detail">${detail}</span>` : ''}
          ${
            type === 'switch'
              ? `
            <label class="ios-switch">
              <input type="checkbox" id="switch-${id}" ${checked ? 'checked' : ''} />
              <span class="ios-switch-slider"></span>
            </label>
          `
              : ''
          }
          ${type === 'nav' ? `<span class="row-chevron">›</span>` : ''}
        </div>
      </div>
    `;
  }
}


  // --- src/ui/Toast.js ---
/**
 * Toast - Floating Pill Notifications for iOS PWAs.
 */
class Toast {
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


  // --- src/ui/LegalNoticeSheet.js ---
/**
 * LegalNoticeSheet - Standardized Non-Commercial & H-1B Compliance Modal.
 */
class LegalNoticeSheet {
  constructor({ bottomSheet, appName = 'iOS PWA Foundation' } = {}) {
    this.sheet = bottomSheet;
    this.appName = appName;
  }

  show() {
    this.sheet.show({
      title: 'Legal & Non-Commercial Notice',
      subtitle: `${this.appName} • Personal Hobby Project`,
      contentHtml: `
        <div class="legal-notice-content">
          <div class="legal-badge-banner">
            <span class="legal-badge-icon">⚖️</span>
            <div>
              <strong>Strictly Non-Commercial Educational Prototype</strong>
              <p>Built exclusively as a private personal life utility.</p>
            </div>
          </div>

          <div class="legal-section">
            <h4>1. Zero Commercialization & Zero Revenue</h4>
            <p>This software is completely free, non-monetized, and contains zero subscriptions, paywalls, in-app purchases, advertisements, tipping mechanisms, affiliate links, or commercial sponsor relationships.</p>
          </div>

          <div class="legal-section">
            <h4>2. 100% Client-Side Local Privacy</h4>
            <p>All data is processed strictly in-memory and persisted solely to local device storage (<code>localStorage</code> / <code>IndexedDB</code>). The application transmits zero analytics, zero crash telemetry, and zero user identifiers to remote servers.</p>
          </div>

          <div class="legal-section">
            <h4>3. Intellectual Property & Employer Independence</h4>
            <p>Developed entirely on personal time and personal non-employer hardware. This project is independent of, and not sponsored, endorsed, or affiliated with, any employer, cloud platform, or corporate entity.</p>
          </div>

          <div class="legal-section">
            <h4>4. Procedural & Open Assets</h4>
            <p>All sounds, graphics, animations, and icons are generated 100% procedurally in browser code (HTML5 Canvas & Web Audio API) with zero proprietary third-party assets.</p>
          </div>
        </div>
      `,
    });
  }
}


  // --- src/main.js ---
/**
 * Main Showcase Application - iOS PWA Foundation Interactive Catalog.
 */













class FoundationShowcase {
  constructor() {
    this.bus = new EventBus();
    this.audio = new AudioHaptics({ enabled: true });
    this.storage = new StorageManager({
      namespace: 'foundation_catalog',
      version: 1,
      defaults: {
        tapCount: 0,
        badgeCount: 0,
        soundEnabled: true,
        lastExport: null,
      },
    });
    this.state = this.storage.load();

    this.wakeLock = new WakeLockService();
    this.camera = new CameraService();
    this.bottomSheet = new BottomSheet({ audioHaptics: this.audio });
    this.toast = new Toast();
    this.legalSheet = new LegalNoticeSheet({
      bottomSheet: this.bottomSheet,
      appName: 'iOS PWA Foundation',
    });
  }

  init() {
    this._renderDiagnostics();
    this._initSoundboard();
    this._initSegmentedControl();
    this._initSheetsDemo();
    this._initHardwareDemos();
    this._initStorageDemo();
    this._initLegalNotice();
    this._initPwaInstall();
  }

  _renderDiagnostics() {
    const diag = DeviceDetector.getDiagnostics();
    const container = document.getElementById('diagnostics-pills');
    if (!container) return;

    container.innerHTML = `
      <div class="status-pill ${diag.isIOS ? 'active' : ''}">
        <span class="status-dot"></span> ${diag.isIOS ? 'iOS / iPadOS' : 'Desktop / Android'}
      </div>
      <div class="status-pill ${diag.isStandalone ? 'active' : ''}">
        <span class="status-dot"></span> ${diag.isStandalone ? 'Standalone PWA' : 'Browser Tab'}
      </div>
      <div class="status-pill ${diag.hasWakeLock ? 'active' : ''}">
        <span class="status-dot"></span> Wake Lock: ${diag.hasWakeLock ? 'Yes' : 'No'}
      </div>
      <div class="status-pill ${diag.hasBarcodeDetector ? 'active' : ''}">
        <span class="status-dot"></span> Barcode Detector: ${diag.hasBarcodeDetector ? 'Yes' : 'No'}
      </div>
      <div class="status-pill ${diag.hasWebShare ? 'active' : ''}">
        <span class="status-dot"></span> Web Share: ${diag.hasWebShare ? 'Yes' : 'No'}
      </div>
      <div class="status-pill ${diag.hasAppBadge ? 'active' : ''}">
        <span class="status-dot"></span> App Badging: ${diag.hasAppBadge ? 'Yes' : 'No'}
      </div>
    `;
  }

  _initSoundboard() {
    const attach = (id, fn) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          fn();
          this.state.tapCount = (this.state.tapCount || 0) + 1;
          this.storage.save(this.state);
        });
      }
    };

    attach('btn-haptic-tap', () => this.audio.tap());
    attach('btn-haptic-tick', () => this.audio.tick());
    attach('btn-haptic-impact', () => this.audio.impact());
    attach('btn-haptic-success', () => this.audio.success());
    attach('btn-haptic-scanner', () => this.audio.scanner());
    attach('btn-haptic-warning', () => this.audio.warning());
  }

  _initSegmentedControl() {
    const container = document.getElementById('segmented-demo-slot');
    if (!container) return;

    new SegmentedControl({
      container,
      options: [
        { id: 'design', label: 'HIG Shell' },
        { id: 'hardware', label: 'Hardware' },
        { id: 'storage', label: 'Storage' },
      ],
      defaultId: 'design',
      audioHaptics: this.audio,
      onChange: (selectedId) => {
        this.toast.show(`Segment switched to: ${selectedId.toUpperCase()}`, { type: 'info' });
      },
    });
  }

  _initSheetsDemo() {
    const btnShort = document.getElementById('row-demo-sheet');
    if (btnShort) {
      btnShort.addEventListener('click', () => {
        this.bottomSheet.show({
          title: 'iOS Bottom Sheet',
          subtitle: 'Interactive Touch Drag & Spring Physics',
          contentHtml: `
            <div style="display:flex; flex-direction:column; gap:1rem; padding: 0.5rem 0;">
              <p style="color:var(--text-secondary); line-height:1.5;">
                This bottom sheet is built according to Apple Human Interface Guidelines.
                You can swipe down from anywhere on the header or grabber to dismiss it.
              </p>
              <div class="ios-inset-card">
                <div class="ios-table-row">
                  <div class="row-leading">
                    <span class="row-icon">🎚️</span>
                    <span class="row-title">Velocity Dismiss Threshold</span>
                  </div>
                  <div class="row-trailing"><span class="row-detail">&gt; 85px flick</span></div>
                </div>
                <div class="ios-table-row last-row">
                  <div class="row-leading">
                    <span class="row-icon">📐</span>
                    <span class="row-title">Safe Area Notch Clearance</span>
                  </div>
                  <div class="row-trailing"><span class="row-detail">calc(90dvh - notch)</span></div>
                </div>
              </div>
              <button type="button" class="btn-primary" id="btn-sheet-action" style="padding:0.75rem; border-radius:var(--radius-sm); background:var(--ios-blue); border:none; color:#fff; font-weight:600; cursor:pointer;">
                Simulate Action
              </button>
            </div>
          `,
          onRender: (sheetEl, sheet) => {
            const actBtn = sheetEl.querySelector('#btn-sheet-action');
            if (actBtn) {
              actBtn.addEventListener('click', () => {
                this.audio.success();
                this.toast.show('Action triggered inside sheet!', { type: 'success' });
                sheet.close();
              });
            }
          },
        });
      });
    }

    const btnCameraSheet = document.getElementById('row-demo-camera');
    if (btnCameraSheet) {
      btnCameraSheet.addEventListener('click', () => {
        this.bottomSheet.show({
          title: 'Camera & Vision Scanner',
          subtitle: 'Rear Camera Stream with BarcodeDetector',
          contentHtml: `
            <div class="viewfinder-box">
              <video id="camera-video" playsinline muted autoplay></video>
              <div class="viewfinder-reticle"></div>
            </div>
            <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
              <button type="button" id="btn-toggle-torch" style="flex:1; padding:0.65rem; border-radius:var(--radius-sm); background:var(--bg-card); border:1px solid var(--border-subtle); color:var(--text-main); font-size:0.82rem; font-weight:600; cursor:pointer;">
                💡 Toggle Torch
              </button>
            </div>
            <div id="scan-result-card" class="status-pill" style="display:none; width:100%; justify-content:center; padding:0.6rem;">
              Scanned: <strong id="scan-code-value" style="margin-left:0.3rem;"></strong>
            </div>
          `,
          onRender: async (sheetEl) => {
            const videoEl = sheetEl.querySelector('#camera-video');
            const resultCard = sheetEl.querySelector('#scan-result-card');
            const codeVal = sheetEl.querySelector('#scan-code-value');
            const torchBtn = sheetEl.querySelector('#btn-toggle-torch');

            try {
              await this.camera.start({
                videoElement: videoEl,
                onDetected: (code) => {
                  this.audio.scanner();
                  if (resultCard && codeVal) {
                    codeVal.textContent = code;
                    resultCard.style.display = 'flex';
                  }
                  this.toast.show(`Barcode detected: ${code}`, { type: 'success' });
                },
              });
            } catch (err) {
              this.toast.show('Camera access unavailable or declined', { type: 'warning' });
            }

            if (torchBtn) {
              torchBtn.addEventListener('click', async () => {
                const on = await this.camera.toggleTorch();
                this.toast.show(`Torch: ${on ? 'ON' : 'OFF'}`, { type: 'info' });
              });
            }
          },
          onClose: () => {
            this.camera.stop();
          },
        });
      });
    }
  }

  _initHardwareDemos() {
    // Web Share
    const shareRow = document.getElementById('row-demo-share');
    if (shareRow) {
      shareRow.addEventListener('click', async () => {
        const res = await ShareService.share({
          title: 'iOS PWA Foundation',
          text: 'Zero-dependency Apple HIG design system & hardware bridges for Progressive Web Apps.',
          url: window.location.href,
        });

        if (res.success) {
          this.audio.success();
          this.toast.show(
            res.method === 'native' ? 'Opened iOS Share Sheet' : 'Copied link to clipboard!',
            { type: 'success' }
          );
        }
      });
    }

    // Wake Lock
    const wakeLockSwitch = document.getElementById('switch-wakelock');
    if (wakeLockSwitch) {
      wakeLockSwitch.addEventListener('change', async (e) => {
        if (e.target.checked) {
          const success = await this.wakeLock.request();
          if (success) {
            this.audio.tap();
            this.toast.show('Screen Wake Lock Active (Screen will not dim)', { type: 'success' });
          } else {
            e.target.checked = false;
            this.toast.show('Wake Lock not supported in this browser', { type: 'warning' });
          }
        } else {
          await this.wakeLock.release();
          this.audio.tap();
          this.toast.show('Screen Wake Lock Released', { type: 'info' });
        }
      });
    }

    // App Badge
    const badgeRow = document.getElementById('row-demo-badge');
    if (badgeRow) {
      badgeRow.addEventListener('click', async () => {
        this.state.badgeCount = ((this.state.badgeCount || 0) % 9) + 1;
        this.storage.save(this.state);
        const ok = await BadgeService.set(this.state.badgeCount);
        this.audio.tap();
        if (ok) {
          this.toast.show(`App Icon Badge set to: ${this.state.badgeCount}`, { type: 'success' });
        } else {
          this.toast.show('Badging API requires standalone Home Screen PWA', { type: 'info' });
        }
      });
    }

    const clearBadgeBtn = document.getElementById('btn-clear-badge');
    if (clearBadgeBtn) {
      clearBadgeBtn.addEventListener('click', async () => {
        this.state.badgeCount = 0;
        this.storage.save(this.state);
        await BadgeService.clear();
        this.audio.tap();
        this.toast.show('App Badge cleared', { type: 'info' });
      });
    }
  }

  _initStorageDemo() {
    const exportRow = document.getElementById('row-demo-export');
    if (exportRow) {
      exportRow.addEventListener('click', () => {
        const json = this.storage.exportBackup();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pwa_foundation_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.audio.success();
        this.toast.show('Exported local JSON backup!', { type: 'success' });
      });
    }
  }

  _initLegalNotice() {
    const legalBtn = document.getElementById('btn-open-legal');
    if (legalBtn) {
      legalBtn.addEventListener('click', () => {
        this.legalSheet.show();
      });
    }
  }

  _initPwaInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.__deferredPrompt = e;
    });
  }
}

// Auto-boot showcase on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new FoundationShowcase();
    app.init();
    window.__app = app;
  });
}


})();
