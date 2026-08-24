# my_app – Node.js TODO Application

A simple REST API server for managing a TODO list.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node index.js
```

The server listens on port **3000** by default. Override with the `PORT` environment variable:

```bash
PORT=8080 node index.js
```

## API Endpoints

| Method | Path         | Description          | Body (JSON)        |
|--------|--------------|----------------------|--------------------|
| GET    | `/todos`     | List all todos       | –                  |
| POST   | `/todos`     | Add a new todo       | `{ "task": "..." }`|
| DELETE | `/todos/:id` | Delete a todo by ID  | –                  |

## Examples

```bash
# Add a todo
curl -X POST http://localhost:3000/todos \
     -H "Content-Type: application/json" \
     -d '{"task": "Buy groceries"}'

# View all todos
curl http://localhost:3000/todos

# Delete todo with id 1
curl -X DELETE http://localhost:3000/todos/1
```