'use strict';

const request = require('supertest');

// Use an ephemeral port (0) so importing index.js never conflicts with an
// already-bound port and each freshly-required instance gets its own handle.
process.env.PORT = '0';

/*
 * index.js keeps its todo list and id counter in module-level state and starts
 * an HTTP listener as soon as it is required. To keep each test isolated and
 * deterministic we reset the module registry before every test, require a fresh
 * copy of the app (with pristine state and a reset id counter), and close the
 * server handle afterwards so the Jest process exits cleanly.
 */
let app;
let server;

beforeEach(() => {
  jest.resetModules();
  ({ app, server } = require('../index'));
});

afterEach((done) => {
  if (server && server.listening) {
    server.close(done);
  } else {
    done();
  }
});

describe('GET /todos', () => {
  test('returns an empty array when there are no todos', async () => {
    const res = await request(app).get('/todos');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('lists all todos after several are added', async () => {
    await request(app).post('/todos').send({ task: 'first' });
    await request(app).post('/todos').send({ task: 'second' });

    const res = await request(app).get('/todos');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, task: 'first' },
      { id: 2, task: 'second' },
    ]);
  });
});

describe('POST /todos', () => {
  test('creates a todo and returns 201 with the created resource', async () => {
    const res = await request(app).post('/todos').send({ task: 'buy milk' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, task: 'buy milk' });
  });

  test('trims surrounding whitespace from the task', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ task: '   walk the dog   ' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, task: 'walk the dog' });

    // The stored value should be the trimmed version too.
    const list = await request(app).get('/todos');
    expect(list.body).toEqual([{ id: 1, task: 'walk the dog' }]);
  });

  test('auto-increments ids starting at 1', async () => {
    const first = await request(app).post('/todos').send({ task: 'a' });
    const second = await request(app).post('/todos').send({ task: 'b' });
    const third = await request(app).post('/todos').send({ task: 'c' });

    expect(first.body.id).toBe(1);
    expect(second.body.id).toBe(2);
    expect(third.body.id).toBe(3);
  });

  test('continues auto-incrementing ids after a delete (does not reuse ids)', async () => {
    await request(app).post('/todos').send({ task: 'a' }); // id 1
    await request(app).post('/todos').send({ task: 'b' }); // id 2
    await request(app).delete('/todos/1');

    const next = await request(app).post('/todos').send({ task: 'c' });
    expect(next.status).toBe(201);
    expect(next.body.id).toBe(3);
  });

  test('rejects a missing task with 400', async () => {
    const res = await request(app).post('/todos').send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('rejects an empty-string task with 400', async () => {
    const res = await request(app).post('/todos').send({ task: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('rejects a whitespace-only task with 400', async () => {
    const res = await request(app).post('/todos').send({ task: '    ' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('rejects a non-string task with 400', async () => {
    const res = await request(app).post('/todos').send({ task: 123 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('does not persist a todo when validation fails', async () => {
    await request(app).post('/todos').send({ task: '' });

    const list = await request(app).get('/todos');
    expect(list.body).toEqual([]);
  });
});

describe('DELETE /todos/:id', () => {
  test('deletes an existing todo and returns 204', async () => {
    await request(app).post('/todos').send({ task: 'to be removed' });

    const res = await request(app).delete('/todos/1');
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});

    const list = await request(app).get('/todos');
    expect(list.body).toEqual([]);
  });

  test('only removes the targeted todo', async () => {
    await request(app).post('/todos').send({ task: 'keep' }); // id 1
    await request(app).post('/todos').send({ task: 'delete' }); // id 2

    const res = await request(app).delete('/todos/2');
    expect(res.status).toBe(204);

    const list = await request(app).get('/todos');
    expect(list.body).toEqual([{ id: 1, task: 'keep' }]);
  });

  test('returns 404 when deleting a non-existent id', async () => {
    const res = await request(app).delete('/todos/999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 404 for a non-numeric id', async () => {
    const res = await request(app).delete('/todos/abc');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 404 for a negative id', async () => {
    const res = await request(app).delete('/todos/-1');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 404 for a decimal id', async () => {
    await request(app).post('/todos').send({ task: 'x' }); // id 1

    const res = await request(app).delete('/todos/1.5');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
