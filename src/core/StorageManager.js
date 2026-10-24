/**
 * StorageManager - Local-First Resilient Persistence with Migration & JSON Backup/Restore.
 */
export class StorageManager {
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
