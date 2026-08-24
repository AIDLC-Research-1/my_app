# Integration Test Agent

## Purpose

Verifies the TODO application works end-to-end by exercising the full Express
server across multi-step flows.

## Responsibilities

- Spin up the full Express server and test end-to-end flows.
- Exercise a complete flow: create several todos, list them, delete one, and
  verify the list is updated.
- Test concurrent-request behavior to ensure the in-memory store stays
  consistent under parallel calls.

## Scope

- **In scope:** integration tests that start the real server (listening on a
  port), the flows across `GET`, `POST`, and `DELETE`, and their test
  configuration.
- **Out of scope:** isolated handler unit tests, contract/API spec validation,
  and load/performance benchmarking (handled by other agents).

## Guidelines

- Start the actual server (honoring the `PORT` environment variable) and make
  real HTTP requests against it; tear it down when tests complete.
- Chain requests so later assertions depend on the observed state from earlier
  steps (e.g. the ID returned by a create is later deleted).
- When testing concurrency, issue requests in parallel and assert the final
  state is correct and free of duplicate or lost items.
- Keep each test run self-contained so it can be executed repeatably without
  manual cleanup.
- Add any dev dependencies and test scripts required to run the integration
  suite.
