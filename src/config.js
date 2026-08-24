'use strict';

// Environment-based configuration.
//
// All values can be overridden with environment variables so the same code
// runs unchanged in development, test, Docker and CI.
const path = require('path');

const config = {
  // HTTP port the server listens on.
  port: Number(process.env.PORT) || 3000,

  // Path to the JSON file used by the persistent store. When set to the
  // special value ':memory:' (or left unset in the test environment) the store
  // keeps data in memory only.
  dataFile:
    process.env.DATA_FILE ||
    (process.env.NODE_ENV === 'test'
      ? ':memory:'
      : path.join(__dirname, '..', 'data', 'todos.json')),

  // Optional API key. When set, every request must send a matching
  // `x-api-key` header. When empty, authentication is disabled.
  apiKey: process.env.API_KEY || '',

  // Maximum accepted length of a todo task, in characters.
  maxTaskLength: Number(process.env.MAX_TASK_LENGTH) || 500,

  // Default and maximum page size for the paginated list endpoint.
  defaultLimit: Number(process.env.DEFAULT_LIMIT) || 20,
  maxLimit: Number(process.env.MAX_LIMIT) || 100,

  // Disable request logging (useful during tests).
  logging: process.env.NODE_ENV !== 'test',
};

module.exports = config;
