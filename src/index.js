/**
 * iOS PWA Foundation - Package Entry Point
 * Zero-dependency, Apple HIG design system, WebKit hardware bridges, and component primitives.
 */

// Core Primitives
export { EventBus } from './core/EventBus.js';
export { DeviceDetector } from './core/DeviceDetector.js';
export { StorageManager } from './core/StorageManager.js';

// WebKit Hardware Bridges
export { AudioHaptics } from './hardware/AudioHaptics.js';
export { WakeLockService } from './hardware/WakeLockService.js';
export { ShareService } from './hardware/ShareService.js';
export { BadgeService } from './hardware/BadgeService.js';
export { CameraService } from './hardware/CameraService.js';

// UI Components
export { BottomSheet } from './ui/BottomSheet.js';
export { SegmentedControl } from './ui/SegmentedControl.js';
export { InsetGroup } from './ui/InsetGroup.js';
export { Toast } from './ui/Toast.js';
export { LegalNoticeSheet } from './ui/LegalNoticeSheet.js';
