'use strict';

// Integration Test Agent
// Spins up the full Express server on an ephemeral port and exercises
// end-to-end flows over real HTTP, including concurrent requests.

const http = require('http');
const { freshApp } = require('./helpers');

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

function requestJson(port, method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path,
        headers: data
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
          : {},
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

describe('Integration: full server end-to-end', () => {
  let server;
  let port;

  beforeAll(async () => {
    server = await listen(freshApp());
    port = server.address().port;
  });

  afterAll((done) => {
    server.close(done);
  });

  test('create several todos, list, delete one, verify list updated', async () => {
    const tasks = ['task-a', 'task-b', 'task-c'];
    for (const task of tasks) {
      const res = await requestJson(port, 'POST', '/todos', { task });
      expect(res.status).toBe(201);
    }

    let list = await requestJson(port, 'GET', '/todos');
    expect(list.status).toBe(200);
    expect(list.body.map((t) => t.task)).toEqual(tasks);

    const del = await requestJson(port, 'DELETE', `/todos/${list.body[1].id}`);
    expect(del.status).toBe(204);

    list = await requestJson(port, 'GET', '/todos');
    expect(list.body.map((t) => t.task)).toEqual(['task-a', 'task-c']);
  });

  test('handles concurrent create requests without losing data', async () => {
    const before = (await requestJson(port, 'GET', '/todos')).body.length;
    const count = 25;
    const creates = Array.from({ length: count }, (_, i) =>
      requestJson(port, 'POST', '/todos', { task: `concurrent-${i}` })
    );
    const results = await Promise.all(creates);
    results.forEach((r) => expect(r.status).toBe(201));

    const ids = results.map((r) => r.body.id);
    expect(new Set(ids).size).toBe(count); // all ids unique

    const after = (await requestJson(port, 'GET', '/todos')).body.length;
    expect(after).toBe(before + count);
  });
});
