'use strict';

const fs = require('fs');
const path = require('path');

// Data-access layer for todos.
//
// Provides a small, synchronous CRUD API backed by a JSON file so data
// survives restarts. Passing ':memory:' (or no file) keeps everything in
// memory, which is handy for tests. The rest of the application depends only
// on this interface, so the storage backend can be swapped later without
// touching the routes.
class TodoStore {
  constructor({ file = ':memory:' } = {}) {
    this.file = file && file !== ':memory:' ? file : null;
    this.todos = [];
    this.nextId = 1;
    this._load();
  }

  _load() {
    if (!this.file) {
      return;
    }
    try {
      const raw = fs.readFileSync(this.file, 'utf8');
      const data = JSON.parse(raw);
      this.todos = Array.isArray(data.todos) ? data.todos : [];
      this.nextId =
        Number.isSafeInteger(data.nextId) && data.nextId > 0
          ? data.nextId
          : this._computeNextId();
    } catch (err) {
      if (err.code === 'ENOENT') {
        // First run: no file yet, start empty and create it on first write.
        this.todos = [];
        this.nextId = 1;
        return;
      }
      throw err;
    }
  }

  _computeNextId() {
    return this.todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  }

  _persist() {
    if (!this.file) {
      return;
    }
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const payload = JSON.stringify(
      { todos: this.todos, nextId: this.nextId },
      null,
      2
    );
    fs.writeFileSync(this.file, payload);
  }

  list() {
    return this.todos.slice();
  }

  get(id) {
    return this.todos.find((t) => t.id === id);
  }

  create({ task, completed = false }) {
    const todo = { id: this.nextId++, task, completed: Boolean(completed) };
    this.todos.push(todo);
    this._persist();
    return todo;
  }

  update(id, fields) {
    const todo = this.get(id);
    if (!todo) {
      return undefined;
    }
    if (Object.prototype.hasOwnProperty.call(fields, 'task')) {
      todo.task = fields.task;
    }
    if (Object.prototype.hasOwnProperty.call(fields, 'completed')) {
      todo.completed = Boolean(fields.completed);
    }
    this._persist();
    return todo;
  }

  remove(id) {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) {
      return false;
    }
    this.todos.splice(index, 1);
    this._persist();
    return true;
  }
}

module.exports = { TodoStore };
