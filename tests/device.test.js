import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DeviceDetector } from '../src/core/DeviceDetector.js';

describe('DeviceDetector', () => {
  test('should return complete diagnostics object with boolean capability flags', () => {
    const diag = DeviceDetector.getDiagnostics();
    assert.strictEqual(typeof diag.isIOS, 'boolean');
    assert.strictEqual(typeof diag.isStandalone, 'boolean');
    assert.strictEqual(typeof diag.hasTouch, 'boolean');
    assert.strictEqual(typeof diag.hasWakeLock, 'boolean');
    assert.strictEqual(typeof diag.hasWebShare, 'boolean');
    assert.strictEqual(typeof diag.hasAppBadge, 'boolean');
    assert.strictEqual(typeof diag.hasBarcodeDetector, 'boolean');
    assert.strictEqual(typeof diag.hasCamera, 'boolean');
    assert.strictEqual(typeof diag.hasVibrate, 'boolean');
  });
});
