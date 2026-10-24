import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AudioHaptics } from '../src/hardware/AudioHaptics.js';

describe('AudioHaptics', () => {
  test('should initialize and support enable/disable toggle without errors', () => {
    const audio = new AudioHaptics({ enabled: true });
    assert.strictEqual(audio.enabled, true);

    audio.setEnabled(false);
    assert.strictEqual(audio.enabled, false);

    // Calling methods in Node environment safely gracefully no-ops
    audio.tap();
    audio.tick();
    audio.impact();
    audio.success();
    audio.scanner();
    audio.warning();
  });
});
