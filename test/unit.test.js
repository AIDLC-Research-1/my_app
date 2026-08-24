'use strict';

// Unit Test Agent
// Tests the route handlers directly via Supertest, covering happy paths,
// validation errors, and edge cases.

const request = require('supertest');
const { freshApp } = require('./helpers');

describe('Unit: route handlers', () => {
  let app;

  beforeEach(() => {
    app = freshApp();
  });

  describe('happy paths', () => {
    test('POST /todos creates a todo (201)', async () => {
      const res = await request(app).post('/todos').send({ task: 'Buy milk' });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 1, task: 'Buy milk' });
    });

    test('POST /todos trims surrounding whitespace', async () => {
      const res = await request(app).post('/todos').send({ task: '  hello  ' });
      expect(res.status).toBe(201);
      expect(res.body.task).toBe('hello');
    });

    test('GET /todos lists todos (200)', async () => {
      await request(app).post('/todos').send({ task: 'a' });
      await request(app).post('/todos').send({ task: 'b' });
      const res = await request(app).get('/todos');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { id: 1, task: 'a' },
        { id: 2, task: 'b' },
      ]);
    });

    test('GET /todos returns an empty array initially', async () => {
      const res = await request(app).get('/todos');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('DELETE /todos/:id removes a todo (204)', async () => {
      await request(app).post('/todos').send({ task: 'delete me' });
      const del = await request(app).delete('/todos/1');
      expect(del.status).toBe(204);
      const list = await request(app).get('/todos');
      expect(list.body).toEqual([]);
    });
  });

  describe('validation errors', () => {
    test('POST /todos without task returns 400', async () => {
      const res = await request(app).post('/todos').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('POST /todos with empty string returns 400', async () => {
      const res = await request(app).post('/todos').send({ task: '' });
      expect(res.status).toBe(400);
    });

    test('POST /todos with whitespace-only string returns 400', async () => {
      const res = await request(app).post('/todos').send({ task: '   ' });
      expect(res.status).toBe(400);
    });

    test('POST /todos with non-string task returns 400', async () => {
      const res = await request(app).post('/todos').send({ task: 123 });
      expect(res.status).toBe(400);
    });
  });

  describe('edge cases', () => {
    test('DELETE non-existent id returns 404', async () => {
      const res = await request(app).delete('/todos/9999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    test('DELETE non-numeric id returns 404', async () => {
      const res = await request(app).delete('/todos/abc');
      expect(res.status).toBe(404);
    });

    test('DELETE with unsafe integer id returns 404', async () => {
      const res = await request(app).delete('/todos/99999999999999999999');
      expect(res.status).toBe(404);
    });

    test('ids keep incrementing after deletion', async () => {
      await request(app).post('/todos').send({ task: 'first' });
      await request(app).delete('/todos/1');
      const res = await request(app).post('/todos').send({ task: 'second' });
      expect(res.body.id).toBe(2);
    });
  });
});
