'use strict';

const request = require('supertest');

// Use an ephemeral port (0) so importing index.js never conflicts with an
// already-bound port and each freshly-required instance gets its own handle.
process.env.PORT = '0';

/*
 * These tests cover the static React UI that index.js serves from ./public.
 * As with the API tests, we reset the module registry before every test so we
 * get a fresh app instance, and close the server handle afterwards so the Jest
 * process exits cleanly.
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

describe('Static React UI', () => {
  test('GET / serves the landing page HTML', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain('<div id="root">');
    expect(res.text).toContain('<title>TODO App</title>');
    expect(res.text).toContain('/app.js');
  });

  test('serves the React application script', async () => {
    const res = await request(app).get('/app.js');

    expect(res.status).toBe(200);
    expect(res.type).toMatch(/javascript/);
    expect(res.text).toContain('ReactDOM');
  });

  test('serves the stylesheet', async () => {
    const res = await request(app).get('/styles.css');

    expect(res.status).toBe(200);
    expect(res.type).toBe('text/css');
  });

  test('serves the vendored React runtime', async () => {
    const res = await request(app).get('/vendor/react.production.min.js');

    expect(res.status).toBe(200);
    expect(res.type).toMatch(/javascript/);
  });

  test('returns 404 for unknown static assets', async () => {
    const res = await request(app).get('/does-not-exist.js');

    expect(res.status).toBe(404);
  });

  test('does not shadow the /todos API', async () => {
    const res = await request(app).get('/todos');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
