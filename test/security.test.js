'use strict';

// Security Test Agent
// Checks for common vulnerabilities: oversized payloads, injection via the
// task field, prototype-pollution risks, and presence of security headers.

const request = require('supertest');
const { freshApp } = require('./helpers');

describe('Security', () => {
  let app;

  beforeEach(() => {
    app = freshApp();
  });

  test('sets security headers via helmet', async () => {
    const res = await request(app).get('/todos');
    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    // helmet removes the framework fingerprint header.
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('rejects oversized payloads with 413', async () => {
    const huge = { task: 'x'.repeat(20 * 1024) }; // 20kb > 10kb limit
    const res = await request(app)
      .post('/todos')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(huge));
    expect(res.status).toBe(413);
  });

  test('rejects malformed JSON with 400', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Content-Type', 'application/json')
      .send('{ "task": ');
    expect(res.status).toBe(400);
  });

  test('does not execute injection payloads; stores task verbatim', async () => {
    const payload = '"><script>alert(1)</script>';
    const res = await request(app).post('/todos').send({ task: payload });
    expect(res.status).toBe(201);
    expect(res.body.task).toBe(payload);
  });

  test('is not vulnerable to prototype pollution via req.body', async () => {
    await request(app)
      .post('/todos')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ task: 'ok', __proto__: { polluted: true } }));
    // Global Object prototype must remain clean.
    expect({}.polluted).toBeUndefined();
    expect(Object.prototype.polluted).toBeUndefined();
  });

  test('ignores extra/unexpected fields in the body', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ task: 'clean', id: 999, admin: true });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, task: 'clean' });
  });
});
