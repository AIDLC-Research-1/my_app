# Performance/Load Test Agent

## Purpose

Measures the TODO application's performance under load and surfaces resource
issues in the in-memory store.

## Responsibilities

- Run load tests (for example with k6 or Artillery) against the running server.
- Measure throughput and latency under concurrent requests.
- Identify memory leaks from the in-memory store under sustained high load.

## Scope

- **In scope:** load-test scripts/scenarios, thresholds for latency and
  throughput, and the scripts to run them.
- **Out of scope:** functional correctness testing, contract validation, and
  security testing (handled by other agents).

## Guidelines

- Use an established load-testing tool such as k6 or Artillery rather than
  ad-hoc loops.
- Define clear scenarios (create, list, delete) and ramp-up profiles, and record
  throughput and latency percentiles (p95, p99).
- Watch process memory over long runs to detect growth in the in-memory `todos`
  store that is not reclaimed.
- Run load tests against a dedicated instance, not shared or production state,
  and honor the `PORT` environment variable.
- Report results with clear pass/fail thresholds so regressions in performance
  are actionable.
