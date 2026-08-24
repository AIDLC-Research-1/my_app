'use strict';

const express = require('express');
const helmet = require('helmet');

const app = express();
// Security headers (Security Test Agent).
app.use(helmet());
// Limit request body size to mitigate oversized-payload attacks.
app.use(express.json({ limit: '10kb' }));

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

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }
  if (err.status === 400 || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  return res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`TODO server running on port ${PORT}`);
  });
}

module.exports = { app, server };
