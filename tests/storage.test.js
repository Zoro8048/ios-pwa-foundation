import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { StorageManager } from '../src/core/StorageManager.js';

describe('StorageManager', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    global.window = {
      localStorage: {
        getItem: (k) => mockStorage[k] || null,
        setItem: (k, v) => {
          mockStorage[k] = String(v);
        },
        removeItem: (k) => {
          delete mockStorage[k];
        },
        get length() {
          return Object.keys(mockStorage).length;
        },
        key: (i) => Object.keys(mockStorage)[i] || null,
      },
    };
  });

  test('should return defaults on initial load', () => {
    const sm = new StorageManager({
      namespace: 'test_app',
      defaults: { count: 0, theme: 'dark' },
    });

    const data = sm.load();
    assert.strictEqual(data.count, 0);
    assert.strictEqual(data.theme, 'dark');
  });

  test('should save and reload modified data', () => {
    const sm = new StorageManager({
      namespace: 'test_app',
      defaults: { count: 0 },
    });

    sm.save({ count: 15 });
    const loaded = sm.load();
    assert.strictEqual(loaded.count, 15);
  });

  test('should run schema migrations when version advances', () => {
    const smV1 = new StorageManager({
      namespace: 'migrate_app',
      version: 1,
      defaults: { oldField: 'legacy' },
    });
    smV1.save({ oldField: 'legacy-data' });

    const smV2 = new StorageManager({
      namespace: 'migrate_app',
      version: 2,
      migrations: {
        2: (state) => ({ ...state, newField: state.oldField.toUpperCase() }),
      },
    });

    const upgraded = smV2.load();
    assert.strictEqual(upgraded.newField, 'LEGACY-DATA');
  });

  test('should export and import valid JSON backups', () => {
    const sm = new StorageManager({
      namespace: 'backup_app',
      defaults: { key: 'secret' },
    });

    sm.save({ key: 'updated-secret' });
    const json = sm.exportBackup();
    assert.ok(json.includes('updated-secret'));

    const restoreSm = new StorageManager({ namespace: 'restore_app' });
    const res = restoreSm.importBackup(json);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.key, 'updated-secret');
  });
});
