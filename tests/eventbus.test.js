import { test, describe } from 'node:test';
import assert from 'node:assert';
import { EventBus } from '../src/core/EventBus.js';

describe('EventBus', () => {
  test('should subscribe and receive emitted payload', () => {
    const bus = new EventBus();
    let received = null;

    bus.on('item:selected', (data) => {
      received = data;
    });

    bus.emit('item:selected', { id: 42, title: 'Item 42' });
    assert.deepStrictEqual(received, { id: 42, title: 'Item 42' });
  });

  test('should support multiple subscribers to the same event', () => {
    const bus = new EventBus();
    let count1 = 0;
    let count2 = 0;

    bus.on('tick', () => count1++);
    bus.on('tick', () => count2++);

    bus.emit('tick');
    assert.strictEqual(count1, 1);
    assert.strictEqual(count2, 1);
  });

  test('should subscribe once and auto-unsubscribe', () => {
    const bus = new EventBus();
    let count = 0;
    bus.once('ping', () => count++);

    bus.emit('ping');
    bus.emit('ping');
    assert.strictEqual(count, 1);
  });

  test('should unsubscribe cleanly', () => {
    const bus = new EventBus();
    let count = 0;
    const unsub = bus.on('ping', () => count++);

    bus.emit('ping');
    assert.strictEqual(count, 1);

    unsub();
    bus.emit('ping');
    assert.strictEqual(count, 1);
  });
});
