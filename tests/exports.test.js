import { test, describe } from 'node:test';
import assert from 'node:assert';
import * as Foundation from '../src/index.js';

describe('Package Exports (src/index.js)', () => {
  test('should export all expected core classes', () => {
    assert.strictEqual(typeof Foundation.EventBus, 'function');
    assert.strictEqual(typeof Foundation.DeviceDetector, 'function');
    assert.strictEqual(typeof Foundation.StorageManager, 'function');
  });

  test('should export all expected hardware services', () => {
    assert.strictEqual(typeof Foundation.AudioHaptics, 'function');
    assert.strictEqual(typeof Foundation.WakeLockService, 'function');
    assert.strictEqual(typeof Foundation.ShareService, 'function');
    assert.strictEqual(typeof Foundation.BadgeService, 'function');
    assert.strictEqual(typeof Foundation.CameraService, 'function');
  });

  test('should export all expected UI components', () => {
    assert.strictEqual(typeof Foundation.BottomSheet, 'function');
    assert.strictEqual(typeof Foundation.SegmentedControl, 'function');
    assert.strictEqual(typeof Foundation.InsetGroup, 'function');
    assert.strictEqual(typeof Foundation.Toast, 'function');
    assert.strictEqual(typeof Foundation.LegalNoticeSheet, 'function');
  });
});
