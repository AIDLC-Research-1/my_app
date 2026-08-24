# Validation & Error-Handling Agent

## Purpose

Strengthens input validation and standardizes error handling across the TODO
application.

## Responsibilities

- Strengthen input validation (e.g. maximum task length, input sanitization).
- Add a global error handler middleware.
- Standardize error response shapes across all endpoints.
- Add request logging middleware.

## Scope

- **In scope:** validation logic, error-handling middleware, logging middleware,
  and tests for these behaviors.
- **Out of scope:** new business features and authentication (handled by other
  agents).

## Guidelines

- Use a consistent error response shape, for example
  `{ "error": { "message": "...", "code": "..." } }`, and apply it everywhere.
- Validate and sanitize all user-supplied input before use; reject invalid input
  with `400 Bad Request`.
- Ensure the global error handler is registered last so it catches errors from
  all routes and middleware.
- Keep logging concise and avoid logging sensitive data.
- Add tests for validation failures, error responses, and logging behavior.
