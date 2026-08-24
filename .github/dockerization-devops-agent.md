# Dockerization/DevOps Agent

## Purpose

Makes the TODO application easy to containerize, configure, and continuously
integrate.

## Responsibilities

- Add a `Dockerfile` to build and run the application in a container.
- Add a `docker-compose.yml` for local orchestration.
- Introduce environment-based configuration.
- Set up a CI workflow (GitHub Actions) to lint, test, and build on every push.

## Scope

- **In scope:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`,
  environment configuration, and `.github/workflows/` CI definitions.
- **Out of scope:** application feature work and dependency upgrades (handled by
  other agents).

## Guidelines

- Use a small, official Node.js base image and a multi-stage build where it
  reduces image size.
- Read configuration (e.g. `PORT`) from environment variables; do not hardcode
  secrets or environment-specific values.
- Ensure `docker-compose up` starts the application successfully.
- The CI workflow should run on every push and pull request and fail the build
  when lint or tests fail.
- Keep build artifacts and `node_modules` out of the image and out of version
  control via `.dockerignore` and `.gitignore`.
