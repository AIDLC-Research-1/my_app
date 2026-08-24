# my_app – Node.js TODO Application

A REST API server for managing a TODO list, built with Express 5.

## Features

- CRUD todos with a `completed` status field
- Filtering, sorting and pagination on the list endpoint
- File-based JSON persistence via a data-access layer (survives restarts)
- Input validation, request logging and a standardized error handler
- Optional API-key authentication
- Docker / docker-compose support and a GitHub Actions CI workflow

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

The server listens on port **3000** by default. Configuration is environment
based — see [`.env.example`](.env.example) for all options:

```bash
PORT=8080 API_KEY=secret npm start
```

## Configuration

| Variable          | Default             | Description                                         |
|-------------------|---------------------|-----------------------------------------------------|
| `PORT`            | `3000`              | HTTP port                                           |
| `DATA_FILE`       | `data/todos.json`   | JSON store path; `:memory:` disables persistence    |
| `API_KEY`         | *(empty)*           | When set, requests must send `x-api-key` header     |
| `MAX_TASK_LENGTH` | `500`               | Maximum task length in characters                   |
| `DEFAULT_LIMIT`   | `20`                | Default page size for pagination                    |
| `MAX_LIMIT`       | `100`               | Maximum page size for pagination                    |

## API Endpoints

| Method | Path         | Description                        | Body (JSON)                              |
|--------|--------------|------------------------------------|------------------------------------------|
| GET    | `/health`    | Health check (no auth)             | –                                        |
| GET    | `/todos`     | List todos (filter/sort/paginate)  | –                                        |
| GET    | `/todos/:id` | Get a single todo                  | –                                        |
| POST   | `/todos`     | Add a new todo                     | `{ "task": "...", "completed": false }`  |
| PUT    | `/todos/:id` | Replace a todo (task required)     | `{ "task": "...", "completed": true }`   |
| PATCH  | `/todos/:id` | Update task and/or completed       | `{ "completed": true }`                  |
| DELETE | `/todos/:id` | Delete a todo by ID                | –                                        |

### List query parameters

| Parameter   | Description                                              |
|-------------|---------------------------------------------------------|
| `completed` | Filter by status: `true` or `false`                     |
| `sort`      | Sort field: `id`, `task` or `completed`                 |
| `order`     | Sort direction: `asc` (default) or `desc`               |
| `limit`     | Page size (enables paginated response)                  |
| `offset`    | Number of items to skip (enables paginated response)    |

When `limit` or `offset` is supplied, the response is an object
`{ "total", "limit", "offset", "items": [...] }`; otherwise a plain array is
returned.

Errors use a consistent shape: `{ "error": "message" }`.

## Examples

```bash
# Add a todo
curl -X POST http://localhost:3000/todos \
     -H "Content-Type: application/json" \
     -d '{"task": "Buy groceries"}'

# List completed todos, sorted by task
curl "http://localhost:3000/todos?completed=true&sort=task"

# Mark a todo as completed
curl -X PATCH http://localhost:3000/todos/1 \
     -H "Content-Type: application/json" \
     -d '{"completed": true}'

# Delete todo with id 1
curl -X DELETE http://localhost:3000/todos/1

# With API-key auth enabled
curl http://localhost:3000/todos -H "x-api-key: secret"
```

## Testing & Linting

```bash
npm test     # run the test suite (node --test)
npm run lint # syntax-check all source files
```

## Docker

```bash
# Build and run with docker-compose
docker compose up --build
```

The compose service persists data in a named volume and reads configuration
from environment variables (see `docker-compose.yml`).
