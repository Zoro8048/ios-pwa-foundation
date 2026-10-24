import { test, describe } from 'node:test';
import assert from 'node:assert';
import { WakeLockService } from '../src/hardware/WakeLockService.js';

describe('WakeLockService', () => {
  test('should safely report support in current environment', () => {
    const service = new WakeLockService();
    assert.strictEqual(typeof service.isSupported(), 'boolean');
    assert.strictEqual(service.isActive(), false);
    service.destroy();
  });
});
