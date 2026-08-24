'use strict';

const express = require('express');

const app = express();
app.use(express.json());

let todos = [];
let nextId = 1;

// Get all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Add a todo
app.post('/todos', (req, res) => {
  const { task } = req.body;
  if (!task || typeof task !== 'string' || task.trim() === '') {
    return res.status(400).json({ error: 'task is required' });
  }
  const todo = { id: nextId++, task: task.trim() };
  todos.push(todo);
  res.status(201).json(todo);
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = todos.findIndex((t) => t.id === id);
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
