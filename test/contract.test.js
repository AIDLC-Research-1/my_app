'use strict';

// Contract / API Test Agent
// Loads the OpenAPI spec and asserts that live responses from the API match
// the documented schemas. Any drift between the routes and the spec fails.

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const request = require('supertest');
const { freshApp } = require('./helpers');

const spec = yaml.load(
  fs.readFileSync(path.join(__dirname, '..', 'openapi.yaml'), 'utf8')
);

const ajv = new Ajv({ allErrors: true, strict: false });

function schemaFor(pathKey, method, status) {
  const op = spec.paths[pathKey][method];
  const response = op.responses[String(status)];
  const schema = response.content?.['application/json']?.schema;
  return resolveRefs(schema);
}

// Inline $ref pointers to #/components/schemas so Ajv can compile standalone.
function resolveRefs(node) {
  if (Array.isArray(node)) return node.map(resolveRefs);
  if (node && typeof node === 'object') {
    if (node.$ref) {
      const name = node.$ref.replace('#/components/schemas/', '');
      return resolveRefs(spec.components.schemas[name]);
    }
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = resolveRefs(v);
    return out;
  }
  return node;
}

function validate(schema, data) {
  const ok = ajv.validate(schema, data);
  return { ok, errors: ajv.errors };
}

describe('Contract: responses match the OpenAPI spec', () => {
  let app;

  beforeEach(() => {
    app = freshApp();
  });

  test('spec declares the implemented paths and methods', () => {
    expect(spec.paths['/todos']).toHaveProperty('get');
    expect(spec.paths['/todos']).toHaveProperty('post');
    expect(spec.paths['/todos/{id}']).toHaveProperty('delete');
  });

  test('GET /todos 200 body matches schema', async () => {
    await request(app).post('/todos').send({ task: 'contract' });
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    const { ok, errors } = validate(schemaFor('/todos', 'get', 200), res.body);
    expect(errors).toBeFalsy();
    expect(ok).toBe(true);
  });

  test('POST /todos 201 body matches schema', async () => {
    const res = await request(app).post('/todos').send({ task: 'contract' });
    expect(res.status).toBe(201);
    const { ok, errors } = validate(schemaFor('/todos', 'post', 201), res.body);
    expect(errors).toBeFalsy();
    expect(ok).toBe(true);
  });

  test('POST /todos 400 error body matches schema', async () => {
    const res = await request(app).post('/todos').send({});
    expect(res.status).toBe(400);
    const { ok } = validate(schemaFor('/todos', 'post', 400), res.body);
    expect(ok).toBe(true);
  });

  test('DELETE /todos/:id 404 error body matches schema', async () => {
    const res = await request(app).delete('/todos/123');
    expect(res.status).toBe(404);
    const { ok } = validate(schemaFor('/todos/{id}', 'delete', 404), res.body);
    expect(ok).toBe(true);
  });

  test('created todo has no undocumented properties', async () => {
    const res = await request(app).post('/todos').send({ task: 'strict' });
    // Todo schema sets additionalProperties: false.
    const { ok, errors } = validate(schemaFor('/todos', 'post', 201), res.body);
    expect(errors).toBeFalsy();
    expect(ok).toBe(true);
  });
});
