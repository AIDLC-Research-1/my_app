'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { TodoStore } = require('../src/store');

test('TodoStore persists data to a JSON file across instances', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'todostore-'));
  const file = path.join(dir, 'todos.json');
  try {
    const store = new TodoStore({ file });
    const created = store.create({ task: 'persist me' });
    assert.strictEqual(created.id, 1);
    assert.strictEqual(created.completed, false);
    assert.ok(fs.existsSync(file));

    // A fresh instance reads the same file and continues ids from where it left.
    const reopened = new TodoStore({ file });
    assert.strictEqual(reopened.list().length, 1);
    assert.strictEqual(reopened.list()[0].task, 'persist me');
    const next = reopened.create({ task: 'second' });
    assert.strictEqual(next.id, 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('TodoStore update and remove operate correctly', () => {
  const store = new TodoStore({ file: ':memory:' });
  store.create({ task: 'a' });
  assert.strictEqual(store.update(1, { completed: true }).completed, true);
  assert.strictEqual(store.update(99, { completed: true }), undefined);
  assert.strictEqual(store.remove(1), true);
  assert.strictEqual(store.remove(1), false);
});
