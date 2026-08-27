---
name: "Docker Image Build Agent"
description: "Invokes the dockerization/DevOps agent to prepare the container build, then publishes the built Docker image as a workflow artifact."
on:
  # Build on demand and whenever container-related files change.
  workflow_dispatch:
  push:
    branches:
      - main
    paths:
      - "Dockerfile"
      - ".dockerignore"
      - "docker-compose.yml"
      - "package.json"
      - "package-lock.json"
      - "index.js"
      - "public/**"

engine: copilot # Can also use claude-code, openai-codex, or google-gemini

model: claude-sonnet-4-5

permissions:
  contents: read
  copilot-requests: write

# Do the work by invoking ONLY the dockerization/DevOps custom agent.
imports:
  - .github/agents/dev-dockerization-devops-agent.md

# If the agent improves the Docker setup, deliver those changes as a pull request.
safe-outputs:
  create-pull-request:
    title-prefix: "[docker-image] "
    labels: [automation, docker]
    draft: true
    if-no-changes: "ignore"
    allowed-files:
      - "Dockerfile"
      - ".dockerignore"
      - "docker-compose.yml"

# Give the agent the tools it needs to inspect and validate the container build.
tools:
  edit:
  bash:
    - "npm:*"
    - "npx:*"
    - "node:*"
    - "docker:*"
    - "ls:*"
    - "cat:*"

# After the agent finishes, build the image on the runner (Docker daemon is
# available here) and upload it as the workflow's artifact output.
post-steps:
  - name: Build Docker image
    env:
      IMAGE_TAG: my_app:${{ github.sha }}
    run: docker build -t "$IMAGE_TAG" .

  - name: Export image to a tarball
    env:
      IMAGE_TAG: my_app:${{ github.sha }}
    run: docker save "$IMAGE_TAG" -o my_app-image.tar

  - name: Upload built image artifact
    uses: actions/upload-artifact@v7.0.1
    with:
      name: my_app-docker-image-${{ github.sha }}
      path: my_app-image.tar
      if-no-files-found: error
      retention-days: 7
---

# Docker Image Build

This workflow's only agent is the imported **`dockerization-devops-agent`**. It
performs all the substantive container work; the deterministic post-steps then
publish the resulting image as a downloadable artifact.

Follow the imported agent's instructions to:

1. Review the container setup for the TODO application: `Dockerfile`,
   `.dockerignore`, `docker-compose.yml`, `package.json`, and `index.js`.
2. Ensure the `Dockerfile` uses a small, official Node.js base image, keeps
   `node_modules` and build artifacts out of the image via `.dockerignore`, and
   reads configuration (such as `PORT`) from environment variables — never
   hardcoding secrets or environment-specific values.
3. If any container file is missing or can be improved, create or update it so
   that `docker build .` produces a working, runnable image. Only touch
   container-related files (`Dockerfile`, `.dockerignore`, `docker-compose.yml`).
4. Validate the setup — for example with `docker build .` — so the image is
   guaranteed to build.

Do not modify application features, tests, or dependencies. If the container
setup is already correct, make no file changes and take no further action; the
post-steps will still build and upload the image artifact.
