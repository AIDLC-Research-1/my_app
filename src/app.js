'use strict';

const path = require('path');
const express = require('express');
const { createTodoStore } = require('./todoStore');
const { createTodosRouter } = require('./routes/todos');

/*
 * Build a fully-configured Express application. Static assets are served first
 * so the React UI is available at "/", and unmatched paths fall through to the
 * /todos API routes.
 */
function createApp() {
  const app = express();
  app.use(express.json());

  // Serve the React single-page UI (and its vendored assets) from ../public.
  app.use(express.static(path.join(__dirname, '..', 'public')));

  const store = createTodoStore();
  app.use('/todos', createTodosRouter(store));

  return app;
}

module.exports = { createApp };
