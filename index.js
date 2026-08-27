'use strict';

const path = require('path');
const express = require('express');

const app = express();
app.use(express.json());

// Serve the React single-page UI (and its vendored assets) from ./public.
// Static files are matched first; unmatched paths fall through to the API
// routes below, so requests like GET /todos are unaffected.
app.use(express.static(path.join(__dirname, 'public')));

let todos = [];
let nextId = 1;

// Get all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Add a todo
app.post('/todos', (req, res) => {
  const task = req.body?.task;
  if (!task || typeof task !== 'string' || task.trim() === '') {
    return res.status(400).json({ error: 'task is required' });
  }
  const todo = { id: nextId++, task: task.trim() };
  todos.push(todo);
  res.status(201).json(todo);
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const index =
    /^\d+$/.test(req.params.id) && Number.isSafeInteger(id)
      ? todos.findIndex((t) => t.id === id)
      : -1;
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  todos.splice(index, 1);
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`TODO server running on port ${PORT}`);
});

module.exports = { app, server };
