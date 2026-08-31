# TODO API Reference

This document describes the REST API exposed by the `my_app` TODO server. All
endpoints are mounted under the `/todos` path and exchange JSON.

Base URL: `http://localhost:3000` (or the configured `PORT`).

## Data model

A todo item has the following shape:

| Field  | Type   | Description                          |
| ------ | ------ | ------------------------------------ |
| `id`   | number | Non-negative integer, assigned by the server, never reused. |
| `task` | string | The trimmed, non-empty task description. |

## Endpoints

### `GET /todos`

List all todo items currently stored.

**Response** — `200 OK`

```json
[
  { "id": 1, "task": "Buy milk" }
]
```

### `POST /todos`

Create a new todo item.

**Request body**

```json
{ "task": "Buy milk" }
```

- `task` must be a non-empty string; it is trimmed before storage.

**Responses**

- `201 Created` — returns the created todo item, e.g. `{ "id": 1, "task": "Buy milk" }`.
- `400 Bad Request` — returned when `task` is missing, not a string, or blank: `{ "error": "task is required" }`.

### `DELETE /todos/:id`

Delete a todo item by id.

- `:id` must be a non-negative integer expressed in plain digits (e.g. `1`, `42`). Values such as `-1`, `1.5`, or `abc` are rejected.

**Responses**

- `204 No Content` — the todo item was found and removed.
- `404 Not Found` — the id is invalid or no matching todo exists: `{ "error": "Todo not found" }`.

## Web UI

A React single-page UI is served from `/` and consumes this API directly from
the browser (see `public/app.js`).
