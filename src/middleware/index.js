'use strict';

const { ApiError } = require('../errors');

// Lightweight request logging middleware. Logs method, path, status code and
// duration once the response has finished.
function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    // eslint-disable-next-line no-console
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`
    );
  });
  next();
}

// Optional API key authentication. Enabled only when an API key is configured;
// otherwise it is a no-op so local development keeps working out of the box.
function apiKeyAuth(apiKey) {
  return function (req, res, next) {
    if (!apiKey) {
      return next();
    }
    const provided = req.get('x-api-key');
    if (provided && provided === apiKey) {
      return next();
    }
    return next(new ApiError(401, 'Invalid or missing API key'));
  };
}

// 404 handler for unknown routes.
function notFound(req, res, next) {
  next(new ApiError(404, 'Not found'));
}

// Global error handler producing a standardized error response shape:
// `{ "error": "message" }`.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = Number.isInteger(err.status) ? err.status : 500;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  const message = status >= 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
}

module.exports = { requestLogger, apiKeyAuth, notFound, errorHandler };
