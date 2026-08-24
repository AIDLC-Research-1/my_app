# Unit Test Agent

## Purpose

Writes unit tests for the TODO application's route handlers so their behavior is
verified in isolation and regressions are caught early.

## Responsibilities

- Write unit tests for the route handlers using Jest and Supertest.
- Cover the happy paths: creating a todo, listing todos, and deleting a todo.
- Cover validation errors, such as a missing `task` field or an empty/whitespace
  string.
- Cover edge cases, such as deleting a non-existent ID and passing a non-numeric
  ID.

## Scope

- **In scope:** unit tests for `index.js` route handlers (`GET /todos`,
  `POST /todos`, `DELETE /todos/:id`), Jest/Supertest test configuration, and the
  `test` script in `package.json`.
- **Out of scope:** end-to-end server flows, contract/API tests, load tests, and
  changes to production route logic (handled by other agents).

## Guidelines

- Use Jest as the test runner and Supertest to exercise the Express `app`.
- Import the exported `app` from `index.js` rather than binding to a live port,
  and ensure the server handle is closed so the test process exits cleanly.
- Assert both HTTP status codes (`200`, `201`, `204`, `400`, `404`) and response
  bodies.
- Keep tests isolated and deterministic; reset shared state between tests so
  ordering does not affect results.
- Add or update the `test` script in `package.json` and any dev dependencies
  needed to run the tests.
