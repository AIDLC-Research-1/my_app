'use strict';

const express = require('express');
const defaultConfig = require('./config');
const { TodoStore } = require('./store');
const { createTodosRouter } = require('./routes/todos');
const {
  requestLogger,
  apiKeyAuth,
  notFound,
  errorHandler,
} = require('./middleware');

// Build and configure an Express application. Dependencies (config and store)
// can be injected, which keeps the app easy to test in isolation.
function createApp({ config = defaultConfig, store } = {}) {
  const todoStore = store || new TodoStore({ file: config.dataFile });

  const app = express();
  app.use(express.json());

  if (config.logging) {
    app.use(requestLogger);
  }

  // Health check (unauthenticated).
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(apiKeyAuth(config.apiKey));

  app.use('/todos', createTodosRouter(todoStore, config));

  app.use(notFound);
  app.use(errorHandler);

  app.locals.store = todoStore;
  return app;
}

module.exports = { createApp };
