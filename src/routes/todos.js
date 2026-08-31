'use strict';

const express = require('express');
const { normalizeTask, parseTodoId } = require('../validation');

/*
 * Express router for the /todos resource. The router owns HTTP concerns
 * (status codes, request/response shape) while delegating storage to the
 * injected store.
 */
function createTodosRouter(store) {
  const router = express.Router();

  // List all todos.
  router.get('/', (req, res) => {
    res.json(store.list());
  });

  // Add a todo.
  router.post('/', (req, res) => {
    const task = normalizeTask(req.body?.task);
    if (task === null) {
      return res.status(400).json({ error: 'task is required' });
    }
    res.status(201).json(store.add(task));
  });

  // Delete a todo by id.
  router.delete('/:id', (req, res) => {
    const id = parseTodoId(req.params.id);
    if (id === null || !store.remove(id)) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send();
  });

  return router;
}

module.exports = { createTodosRouter };
