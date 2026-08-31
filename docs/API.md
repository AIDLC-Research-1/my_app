# TODO API Reference

This document describes the REST API exposed by the `my_app` server, generated
from the current implementation in `src/`.

## Base URL

The API is mounted at `/todos` on the Express app created by `createApp()`
(`src/app.js`). By default the server listens on port `3000`, configurable via
the `PORT` environment variable.

## Data Model

A **Todo** object has the following shape:

| Field  | Type    | Description                                  |
|--------|---------|-----------------------------------------------|
| `id`   | integer | Non-negative, auto-incrementing, never reused |
| `task` | string  | The trimmed task description                  |

Todos are stored in memory per server process (`src/todoStore.js`); the store
starts empty on each run and does not persist across restarts.

## Endpoints

### `GET /todos`

List all todos.

- **Response:** `200 OK` — a JSON array of Todo objects (empty array if none exist).

```bash
curl http://localhost:3000/todos
```

### `POST /todos`

Create a new todo.

- **Request body:** `{ "task": "<string>" }`
- **Validation:** `task` must be a non-empty string after trimming
  (`normalizeTask` in `src/validation.js`). Whitespace-only or missing values
  are rejected.
- **Responses:**
  - `201 Created` — the created Todo object (`{ id, task }`).
  - `400 Bad Request` — `{ "error": "task is required" }` when validation fails.

```bash
curl -X POST http://localhost:3000/todos \
     -H "Content-Type: application/json" \
     -d '{"task": "Buy groceries"}'
```

### `DELETE /todos/:id`

Delete a todo by its id.

- **Path parameter:** `id` must be a non-negative integer expressed in plain
  digits (`parseTodoId` in `src/validation.js`); values such as `-1`, `1.5`,
  or `abc` are rejected.
- **Responses:**
  - `204 No Content` — todo was found and removed.
  - `404 Not Found` — `{ "error": "Todo not found" }` when the id is invalid
    or does not match an existing todo.

```bash
curl -X DELETE http://localhost:3000/todos/1
```

## Web UI

A static React single-page app is served from the `public/` directory at `/`,
providing forms that call the endpoints above directly from the browser.
