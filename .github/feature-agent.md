# Feature Agent

## Purpose

Adds new API endpoints or fields to the TODO application, extending its
functionality while keeping the existing behavior intact.

## Responsibilities

- Add new API endpoints, for example `PUT /todos/:id` for updating existing tasks.
- Introduce new fields on the todo resource, such as a `completed` status field.
- Add pagination to list endpoints, for example `GET /todos?page=1&limit=20`.
- Support filtering and sorting on `GET /todos` (e.g. by `completed` status or
  creation order).

## Scope

- **In scope:** `index.js` route handlers, request/response shapes, README API
  documentation, and accompanying tests.
- **Out of scope:** authentication, persistence layer changes, and dependency
  upgrades (handled by other agents).

## Guidelines

- Make the smallest possible change that fully implements the requested feature.
- Preserve backward compatibility of existing endpoints (`GET /todos`,
  `POST /todos`, `DELETE /todos/:id`).
- Validate all new inputs and return appropriate HTTP status codes
  (`200`, `201`, `204`, `400`, `404`).
- Update the API table and examples in `README.md` to reflect new endpoints and
  fields.
- Add or update tests to cover the new behavior.
