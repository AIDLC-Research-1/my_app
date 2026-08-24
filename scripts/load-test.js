'use strict';

// Performance / Load Test Agent
//
// Runs a dependency-free load test against the TODO API to measure throughput
// and latency under concurrent requests, and to surface potential memory
// growth from the in-memory store under sustained load.
//
// Usage:
//   node scripts/load-test.js [--duration=10] [--concurrency=50]
//
// Exits non-zero if no requests succeed, so it can gate CI if desired.

const http = require('http');
const { app } = require('../index');

function parseArg(name, fallback) {
  const match = process.argv.find((a) => a.startsWith(`--${name}=`));
  return match ? Number(match.split('=')[1]) : fallback;
}

const DURATION_SEC = parseArg('duration', 10);
const CONCURRENCY = parseArg('concurrency', 50);

function fire(port, method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const started = process.hrtime.bigint();
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
        res.on('data', () => {});
        res.on('end', () => {
          const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
          resolve({ ok: res.statusCode < 500, ms: elapsedMs });
        });
      }
    );
    req.on('error', () => resolve({ ok: false, ms: 0 }));
    if (data) req.write(data);
    req.end();
  });
}

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

async function run() {
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const { port } = server.address();

  const latencies = [];
  let success = 0;
  let failure = 0;

  const rssStart = process.memoryUsage().rss;
  const deadline = Date.now() + DURATION_SEC * 1000;

  function record(r) {
    if (r.ok) {
      success += 1;
      latencies.push(r.ms);
    } else {
      failure += 1;
    }
  }

  async function worker(id) {
    let i = 0;
    while (Date.now() < deadline) {
      // Mixed workload: create, list, and occasionally delete.
      record(await fire(port, 'POST', '/todos', { task: `load-${id}-${i}` }));
      record(await fire(port, 'GET', '/todos'));
      if (i % 5 === 0) {
        record(await fire(port, 'DELETE', `/todos/${i}`));
      }
      i += 1;
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i));
  await Promise.all(workers);

  if (global.gc) global.gc();
  const rssEnd = process.memoryUsage().rss;

  latencies.sort((a, b) => a - b);
  const total = success + failure;
  const p = (q) => (latencies.length ? latencies[Math.floor(latencies.length * q)] : 0);
  const throughput = (success / DURATION_SEC).toFixed(0);

  console.log('--- Load test results ---');
  console.log(`Duration:        ${DURATION_SEC}s`);
  console.log(`Concurrency:     ${CONCURRENCY}`);
  console.log(`Requests:        ${total} (ok=${success}, failed=${failure})`);
  console.log(`Throughput:      ${throughput} req/s`);
  console.log(`Latency p50:     ${p(0.5).toFixed(2)} ms`);
  console.log(`Latency p95:     ${p(0.95).toFixed(2)} ms`);
  console.log(`Latency p99:     ${p(0.99).toFixed(2)} ms`);
  console.log(`RSS start/end:   ${mb(rssStart)} MB -> ${mb(rssEnd)} MB`);
  console.log(
    global.gc
      ? '(memory measured after forced GC; large growth may indicate a leak)'
      : '(run with --expose-gc for accurate leak detection)'
  );

  server.close();

  if (success === 0) {
    console.error('No successful requests — load test failed.');
    process.exitCode = 1;
  }
}

run();
