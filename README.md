# my_app – Node.js TODO Application

A simple REST API server for managing a TODO list, bundled with a small React
web UI for using the API from the browser.

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

## Web UI

Once the server is running, open <http://localhost:3000/> in your browser to use
the bundled React interface. The landing page provides forms for the API so you
can:

- **Add** a task (`POST /todos`)
- **View** the current list of tasks (`GET /todos`)
- **Delete** a task (`DELETE /todos/:id`)

The UI is a single-page React application served as static files from the
[`public/`](./public) directory. React, ReactDOM and
[htm](https://github.com/developit/htm) are vendored as UMD builds in
[`public/vendor/`](./public/vendor) (React `18.3.1`, htm `3.1.1`), so the page
works with **no build step** and no runtime CDN dependency.

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