'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');
const { TodoStore } = require('../src/store');

// Spin up the app on an ephemeral port and return a small fetch helper plus a
// teardown function.
function startServer(overrides = {}) {
  const config = {
    port: 0,
    dataFile: ':memory:',
    apiKey: '',
    maxTaskLength: 500,
    defaultLimit: 20,
    maxLimit: 100,
    logging: false,
    ...overrides,
  };
  const store = new TodoStore({ file: config.dataFile });
  const app = createApp({ config, store });
  const server = app.listen(0);

  return new Promise((resolve) => {
    server.on('listening', () => {
      const { port } = server.address();
      const base = `http://127.0.0.1:${port}`;
      const request = (method, path, { body, headers } = {}) =>
        fetch(base + path, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      resolve({
        request,
        store,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

test('GET /todos returns an empty array initially', async () => {
  const ctx = await startServer();
  try {
    const res = await ctx.request('GET', '/todos');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(await res.json(), []);
  } finally {
    await ctx.close();
  }
});

test('POST /todos creates a todo with completed=false by default', async () => {
  const ctx = await startServer();
  try {
    const res = await ctx.request('POST', '/todos', { body: { task: '  Buy milk  ' } });
    assert.strictEqual(res.status, 201);
    const todo = await res.json();
    assert.strictEqual(todo.id, 1);
    assert.strictEqual(todo.task, 'Buy milk');
    assert.strictEqual(todo.completed, false);
  } finally {
    await ctx.close();
  }
});

test('POST /todos rejects missing and empty tasks', async () => {
  const ctx = await startServer();
  try {
    const empty = await ctx.request('POST', '/todos', { body: { task: '   ' } });
    assert.strictEqual(empty.status, 400);
    assert.deepStrictEqual(await empty.json(), { error: 'task is required' });

    const missing = await ctx.request('POST', '/todos', { body: {} });
    assert.strictEqual(missing.status, 400);
  } finally {
    await ctx.close();
  }
});

test('POST /todos enforces the maximum task length', async () => {
  const ctx = await startServer({ maxTaskLength: 5 });
  try {
    const res = await ctx.request('POST', '/todos', { body: { task: 'toolong' } });
    assert.strictEqual(res.status, 400);
    assert.match((await res.json()).error, /at most 5 characters/);
  } finally {
    await ctx.close();
  }
});

test('PUT /todos/:id updates task and completed', async () => {
  const ctx = await startServer();
  try {
    await ctx.request('POST', '/todos', { body: { task: 'first' } });
    const res = await ctx.request('PUT', '/todos/1', {
      body: { task: 'updated', completed: true },
    });
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(await res.json(), {
      id: 1,
      task: 'updated',
      completed: true,
    });
  } finally {
    await ctx.close();
  }
});

test('PATCH /todos/:id updates only completed', async () => {
  const ctx = await startServer();
  try {
    await ctx.request('POST', '/todos', { body: { task: 'first' } });
    const res = await ctx.request('PATCH', '/todos/1', { body: { completed: true } });
    assert.strictEqual(res.status, 200);
    const todo = await res.json();
    assert.strictEqual(todo.task, 'first');
    assert.strictEqual(todo.completed, true);
  } finally {
    await ctx.close();
  }
});

test('PUT/PATCH/GET/DELETE on unknown id return 404', async () => {
  const ctx = await startServer();
  try {
    for (const method of ['GET', 'PUT', 'PATCH', 'DELETE']) {
      const opts =
        method === 'PUT' || method === 'PATCH' ? { body: { task: 'x' } } : {};
      const res = await ctx.request(method, '/todos/999', opts);
      assert.strictEqual(res.status, 404, `${method} should 404`);
    }
  } finally {
    await ctx.close();
  }
});

test('DELETE /todos/:id removes a todo', async () => {
  const ctx = await startServer();
  try {
    await ctx.request('POST', '/todos', { body: { task: 'first' } });
    const del = await ctx.request('DELETE', '/todos/1');
    assert.strictEqual(del.status, 204);
    const list = await (await ctx.request('GET', '/todos')).json();
    assert.deepStrictEqual(list, []);
  } finally {
    await ctx.close();
  }
});

test('GET /todos supports filtering, sorting and pagination', async () => {
  const ctx = await startServer();
  try {
    await ctx.request('POST', '/todos', { body: { task: 'b', completed: true } });
    await ctx.request('POST', '/todos', { body: { task: 'a', completed: false } });
    await ctx.request('POST', '/todos', { body: { task: 'c', completed: true } });

    // Filter completed=true
    const completed = await (
      await ctx.request('GET', '/todos?completed=true')
    ).json();
    assert.strictEqual(completed.length, 2);
    assert.ok(completed.every((t) => t.completed === true));

    // Sort by task ascending
    const sorted = await (await ctx.request('GET', '/todos?sort=task')).json();
    assert.deepStrictEqual(
      sorted.map((t) => t.task),
      ['a', 'b', 'c']
    );

    // Pagination
    const page = await (await ctx.request('GET', '/todos?limit=2&offset=1')).json();
    assert.strictEqual(page.total, 3);
    assert.strictEqual(page.limit, 2);
    assert.strictEqual(page.offset, 1);
    assert.strictEqual(page.items.length, 2);
  } finally {
    await ctx.close();
  }
});

test('API key auth is enforced when configured', async () => {
  const ctx = await startServer({ apiKey: 'secret' });
  try {
    const unauth = await ctx.request('GET', '/todos');
    assert.strictEqual(unauth.status, 401);

    const auth = await ctx.request('GET', '/todos', {
      headers: { 'x-api-key': 'secret' },
    });
    assert.strictEqual(auth.status, 200);

    // Health check stays open.
    const health = await ctx.request('GET', '/health');
    assert.strictEqual(health.status, 200);
  } finally {
    await ctx.close();
  }
});

test('unknown routes return a standardized 404 error shape', async () => {
  const ctx = await startServer();
  try {
    const res = await ctx.request('GET', '/nope');
    assert.strictEqual(res.status, 404);
    assert.deepStrictEqual(await res.json(), { error: 'Not found' });
  } finally {
    await ctx.close();
  }
});
