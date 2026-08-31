'use strict';

/*
 * Input validation helpers for the TODO API. These return a normalized value on
 * success or null on failure, so callers can branch without duplicating the
 * validation rules.
 */

// A task must be a non-empty string; the normalized form is trimmed.
function normalizeTask(task) {
  if (!task || typeof task !== 'string' || task.trim() === '') {
    return null;
  }
  return task.trim();
}

// A todo id must be a non-negative integer expressed in plain digits, so
// values like "-1", "1.5", "abc" or unsafe integers are rejected.
function parseTodoId(raw) {
  const id = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id)) {
    return null;
  }
  return id;
}

module.exports = { normalizeTask, parseTodoId };
