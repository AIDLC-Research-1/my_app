'use strict';

const express = require('express');
const { ApiError } = require('../errors');

// Validate and normalize a task value. Returns the sanitized (trimmed) task or
// throws an ApiError describing the problem.
function validateTask(value, maxLength) {
  if (typeof value !== 'string') {
    throw new ApiError(400, 'task is required and must be a string');
  }
  const task = value.trim();
  if (task === '') {
    throw new ApiError(400, 'task is required');
  }
  if (task.length > maxLength) {
    throw new ApiError(400, `task must be at most ${maxLength} characters`);
  }
  return task;
}

// Parse a boolean-ish query/body value ("true"/"false"/true/false).
function parseBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

// Parse and validate the :id route parameter as a positive safe integer.
function parseId(raw) {
  if (!/^\d+$/.test(raw)) {
    return undefined;
  }
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : undefined;
}

function createTodosRouter(store, config) {
  const router = express.Router();
  const maxLength = config.maxTaskLength;

  // List todos with optional filtering, sorting and pagination.
  router.get('/', (req, res) => {
    let items = store.list();

    // Filter by completion status.
    const completedFilter = parseBoolean(req.query.completed);
    if (completedFilter !== undefined) {
      items = items.filter((t) => t.completed === completedFilter);
    }

    // Sorting: sort=id|task|completed, order=asc|desc.
    const sortField = req.query.sort;
    if (sortField && ['id', 'task', 'completed'].includes(sortField)) {
      const order = req.query.order === 'desc' ? -1 : 1;
      items.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1 * order;
        if (a[sortField] > b[sortField]) return 1 * order;
        return 0;
      });
    }

    const total = items.length;

    // Pagination: limit and offset query parameters.
    let limit = Number(req.query.limit);
    let offset = Number(req.query.offset);
    const paginate =
      req.query.limit !== undefined || req.query.offset !== undefined;

    if (paginate) {
      limit =
        Number.isInteger(limit) && limit > 0
          ? Math.min(limit, config.maxLimit)
          : config.defaultLimit;
      offset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
      const page = items.slice(offset, offset + limit);
      return res.json({ total, limit, offset, items: page });
    }

    // Backwards-compatible default: return the full array.
    res.json(items);
  });

  // Get a single todo by id.
  router.get('/:id', (req, res, next) => {
    const id = parseId(req.params.id);
    const todo = id === undefined ? undefined : store.get(id);
    if (!todo) {
      return next(new ApiError(404, 'Todo not found'));
    }
    res.json(todo);
  });

  // Create a todo.
  router.post('/', (req, res, next) => {
    try {
      const task = validateTask(req.body?.task, maxLength);
      let completed = false;
      if (req.body?.completed !== undefined) {
        completed = parseBoolean(req.body.completed);
        if (completed === undefined) {
          throw new ApiError(400, 'completed must be a boolean');
        }
      }
      const todo = store.create({ task, completed });
      res.status(201).json(todo);
    } catch (err) {
      next(err);
    }
  });

  // Fully update a todo (task required).
  router.put('/:id', (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      if (id === undefined || !store.get(id)) {
        throw new ApiError(404, 'Todo not found');
      }
      const task = validateTask(req.body?.task, maxLength);
      let completed = false;
      if (req.body?.completed !== undefined) {
        completed = parseBoolean(req.body.completed);
        if (completed === undefined) {
          throw new ApiError(400, 'completed must be a boolean');
        }
      }
      const todo = store.update(id, { task, completed });
      res.json(todo);
    } catch (err) {
      next(err);
    }
  });

  // Partially update a todo (task and/or completed).
  router.patch('/:id', (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      if (id === undefined || !store.get(id)) {
        throw new ApiError(404, 'Todo not found');
      }
      const fields = {};
      if (req.body?.task !== undefined) {
        fields.task = validateTask(req.body.task, maxLength);
      }
      if (req.body?.completed !== undefined) {
        const completed = parseBoolean(req.body.completed);
        if (completed === undefined) {
          throw new ApiError(400, 'completed must be a boolean');
        }
        fields.completed = completed;
      }
      if (Object.keys(fields).length === 0) {
        throw new ApiError(400, 'no valid fields to update');
      }
      const todo = store.update(id, fields);
      res.json(todo);
    } catch (err) {
      next(err);
    }
  });

  // Delete a todo.
  router.delete('/:id', (req, res, next) => {
    const id = parseId(req.params.id);
    if (id === undefined || !store.remove(id)) {
      return next(new ApiError(404, 'Todo not found'));
    }
    res.status(204).send();
  });

  return router;
}

module.exports = { createTodosRouter, validateTask };
