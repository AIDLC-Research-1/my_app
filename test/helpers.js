'use strict';

// Returns a fresh app instance with an empty in-memory store, so each test
// starts from a clean state regardless of ordering.
function freshApp() {
  let app;
  jest.isolateModules(() => {
    ({ app } = require('../index'));
  });
  return app;
}

module.exports = { freshApp };
