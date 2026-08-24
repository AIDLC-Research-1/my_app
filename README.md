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

## QA Agents (Test Suites)

The repository ships with six QA "agents", each implemented as a runnable test
suite or script. Install dev dependencies first with `npm install`.

| Agent | What it does | Command |
|-------|--------------|---------|
| Unit Test Agent | Tests route handlers with Jest + Supertest: happy paths, validation errors, edge cases | `npm run test:unit` |
| Integration Test Agent | Spins up the full Express server and tests end-to-end flows, including concurrent requests | `npm run test:integration` |
| Contract/API Test Agent | Validates live responses against `openapi.yaml` and flags any drift | `npm run test:contract` |
| Security Test Agent | Checks oversized payloads, injection, prototype pollution, and security headers (helmet) | `npm run test:security` |
| Performance/Load Test Agent | Dependency-free load test measuring throughput/latency and memory growth | `npm run load-test` |
| Regression Test Agent | Re-runs the full suite with a coverage report and thresholds | `npm run test:regression` |

Run the entire suite at once:

```bash
npm test
```

The load test accepts optional arguments:

```bash
npm run load-test -- --duration=10 --concurrency=50
```

### API contract

The API is documented in [`openapi.yaml`](./openapi.yaml). The Contract Test
Agent asserts that responses conform to this spec, so keep the spec and the
routes in sync.