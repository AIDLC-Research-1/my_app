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

## Running with Docker

Build and run the application in a container using Docker:

```bash
# Build the image
docker build -t my_app .

# Run the container (maps host port 3000 to the container)
docker run -p 3000:3000 my_app
```

Override the port via the `PORT` environment variable:

```bash
docker run -e PORT=8080 -p 8080:8080 my_app
```

### Docker Compose

For local orchestration, use Docker Compose:

```bash
# Start the application (builds the image on first run)
docker compose up

# Optionally override the port
PORT=8080 docker compose up
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