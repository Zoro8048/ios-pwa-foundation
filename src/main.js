/**
 * Main Showcase Application - iOS PWA Foundation Interactive Catalog.
 */
import { EventBus } from './core/EventBus.js';
import { DeviceDetector } from './core/DeviceDetector.js';
import { StorageManager } from './core/StorageManager.js';
import { AudioHaptics } from './hardware/AudioHaptics.js';
import { WakeLockService } from './hardware/WakeLockService.js';
import { ShareService } from './hardware/ShareService.js';
import { BadgeService } from './hardware/BadgeService.js';
import { CameraService } from './hardware/CameraService.js';
import { BottomSheet } from './ui/BottomSheet.js';
import { SegmentedControl } from './ui/SegmentedControl.js';
import { InsetGroup } from './ui/InsetGroup.js';
import { Toast } from './ui/Toast.js';
import { LegalNoticeSheet } from './ui/LegalNoticeSheet.js';

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
