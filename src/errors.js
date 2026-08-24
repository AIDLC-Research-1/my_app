'use strict';

// A small error type that carries an HTTP status code so route handlers can
// signal client errors and let the global error handler format the response.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

module.exports = { ApiError };
