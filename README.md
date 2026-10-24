# iOS PWA Foundation 📱

> Zero-dependency, Apple Human Interface Guidelines (HIG) design system, WebKit hardware bridges, and shared component primitives for iOS-first Progressive Web Apps.

[![PWA Ready](https://img.shields.io/badge/PWA-iOS%20Standalone%20Ready-blue.svg)](https://developer.apple.com/safari/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20ES6)-success.svg)](./package.json)
[![Tests Passing](https://img.shields.io/badge/Tests-10%2F10%20Passing-brightgreen.svg)](./tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](./package.json)

---

## 1. Why This Exists

Building responsive, native-feeling browser utilities on iOS requires solving repetitive platform quirks:
- Handling the **Dynamic Island** and hardware notch (`env(safe-area-inset-top)`).
- Clearing the **iOS Home Indicator** swipe line (`env(safe-area-inset-bottom)`).
- Simulating native **Taptic Engine haptics** via procedural Web Audio micro-pulses (bypassing `navigator.vibrate` restrictions).
- Fluid **spring physics bottom sheets** with drag-to-dismiss gesture tracking.
- WebKit hardware integrations (**WakeLock**, **BarcodeDetector**, **WebShare**, **AppBadging**).
- **H-1B immigration hygiene:** Persistent non-commercial notices and 100% local privacy (zero telemetry, zero ads, zero monetization).

**`ios-pwa-foundation`** isolates these foundational pieces into a reusable toolkit. Any new app (such as `fairsplit` or future utilities) can be spun up in hours with 100% native iOS fidelity out of the box.

---

## 2. Architecture & File Hierarchy

```
ios-pwa-foundation/
├── index.html                   # Interactive Component Catalog / HIG Playground
├── style.css                    # Master Apple HIG Design System & Tokens
├── manifest.webmanifest         # PWA Manifest (standalone, orientation, icons)
├── sw.js                        # Offline Cache Service Worker
├── icon.svg                     # Procedural Vector Squircle Icon
├── icon-192.png                 # iOS Home Screen App Icon (192x192)
├── icon-512.png                 # High-Resolution Splash Icon (512x512)
├── package.json                 # Zero-dependency npm scripts
├── scripts/
│   └── bundle.js                # Zero-dependency ES6 module bundler -> app.js
├── src/
│   ├── core/
│   │   ├── EventBus.js          # Decoupled pub/sub event router
│   │   ├── DeviceDetector.js    # iOS, Standalone, Touch & API detection
│   │   └── StorageManager.js    # Local-first persistence, migrations & JSON backups
│   ├── hardware/
│   │   ├── AudioHaptics.js      # Procedural sound & micro-haptic bridge
│   │   ├── CameraService.js     # Camera stream, Torch toggle & BarcodeDetector
│   │   ├── WakeLockService.js   # Screen wake lock with visibility auto-resume
│   │   ├── ShareService.js      # Web Share API with clipboard fallback
│   │   └── BadgeService.js      # Home Screen icon badge controller
│   ├── ui/
│   │   ├── BottomSheet.js       # Touch-draggable spring sheet with grabber
│   │   ├── SegmentedControl.js  # Apple sliding pill segmented switcher
│   │   ├── InsetGroup.js        # Rounded Inset Grouped Table View builder
│   │   ├── Toast.js             # Floating pill notifications
│   │   └── LegalNoticeSheet.js  # Standardized H-1B disclaimer modal
│   └── main.js                  # Showcase catalog application
└── tests/
    ├── eventbus.test.js         # 3 tests
    ├── storage.test.js          # 4 tests
    ├── device.test.js           # 1 test
    ├── audio.test.js            # 1 test
    └── wakelock.test.js         # 1 test
```

---

## 3. Core Component Usage Guide

### A. Bottom Sheet Modal (`BottomSheet.js`)
Native iOS action sheet sliding from the bottom with grabber bar and velocity swipe-to-dismiss:

```javascript
import { BottomSheet } from './ui/BottomSheet.js';
import { AudioHaptics } from './hardware/AudioHaptics.js';

const audio = new AudioHaptics();
const sheet = new BottomSheet({ audioHaptics: audio });

sheet.show({
  title: 'Edit Item',
  subtitle: 'Pantry Inventory',
  contentHtml: `<p>Your custom form or content here.</p>`,
  onRender: (sheetEl, sheetInstance) => {
    // Attach custom event listeners inside sheet
  },
  onClose: () => {
    // Cleanup on dismissal
  }
});
```

### B. Procedural Audio & Micro-Haptics (`AudioHaptics.js`)
Produces instant tactile feedback through the speaker without needing audio assets:

```javascript
import { AudioHaptics } from './hardware/AudioHaptics.js';

const haptics = new AudioHaptics();

haptics.tap();      // 4ms micro-tick for buttons and pills
haptics.tick();     // 6ms click for segmented controls and wheels
haptics.impact();   // 15ms thud for destructive actions or hits
haptics.success();  // Ascending 3-tone harmonic bell
haptics.scanner();  // Laser chirp for barcode recognition
haptics.warning();  // Low dual-tone alert
```

### C. Screen Wake Lock (`WakeLockService.js`)
Keeps the device screen active during recipes, tournaments, or active runs:

```javascript
import { WakeLockService } from './hardware/WakeLockService.js';

const wakeLock = new WakeLockService();

// Acquire screen lock
await wakeLock.request();

// Release when done
await wakeLock.release();
```

### D. Native Web Share (`ShareService.js`)
Invokes native iOS Share Sheet (AirDrop, Messages, Mail) with automatic clipboard fallback:

```javascript
import { ShareService } from './hardware/ShareService.js';

await ShareService.share({
  title: 'Check out my bracket',
  text: 'I picked Ramen over Pizza!',
  url: window.location.href,
});
```

### E. App Badging API (`BadgeService.js`)
Displays numeric notification counts on the user's iOS Home Screen icon:

```javascript
import { BadgeService } from './hardware/BadgeService.js';

await BadgeService.set(3); // Sets badge count to 3
await BadgeService.clear(); // Clears badge
```

### F. Local-First Storage (`StorageManager.js`)
Key-value storage with schema migrations, corrupted state recovery, and JSON backup export:

```javascript
import { StorageManager } from './core/StorageManager.js';

const storage = new StorageManager({
  namespace: 'myapp',
  version: 2,
  defaults: { items: [], score: 0 },
  migrations: {
    2: (oldState) => ({ ...oldState, upgraded: true }),
  },
});

const state = storage.load();
storage.save({ ...state, score: 100 });
const backupJson = storage.exportBackup();
```

---

## 4. How to Bootstrap a New App (e.g. `FairSplit`)

To spin up a new zero-dependency PWA using this foundation:

```bash
# 1. Create your new app directory
mkdir -p /Users/keerthan/MyWork/fairsplit
cd /Users/keerthan/MyWork/fairsplit

# 2. Copy the foundation components and design system
cp -r /Users/keerthan/MyWork/ios-pwa-foundation/src/core src/
cp -r /Users/keerthan/MyWork/ios-pwa-foundation/src/hardware src/
cp -r /Users/keerthan/MyWork/ios-pwa-foundation/src/ui src/
cp /Users/keerthan/MyWork/ios-pwa-foundation/style.css .
cp /Users/keerthan/MyWork/ios-pwa-foundation/scripts/bundle.js scripts/

# 3. Add your domain logic in src/domain/ and start coding!
```

---

## 5. Local Development

Run the interactive component catalog:

```bash
cd /Users/keerthan/MyWork/ios-pwa-foundation

# Run unit tests
npm test

# Start local server
npm start # http://localhost:8080
```

---

## 6. Legal & Non-Commercial Compliance

- **Personal Hobby Status:** Strictly non-monetized, zero revenue, zero ads, and zero tip/subscription jars.
- **Client-Side Privacy:** 100% in-browser processing via `localStorage`. Zero telemetry, zero analytics tracking, and zero cloud API keys.
- **Procedural Assets:** 100% procedural vector icons and Web Audio synthesis with no third-party copyrighted media.
