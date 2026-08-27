---
name: "Docker Image Builder Agent Workflow"
description: "Invokes the docker-image-builder agent to build the repository from its Dockerfile, then publishes the built Docker image as a workflow artifact."
on:
  # Build on demand and whenever container-related files change.
  workflow_dispatch:
  push:
    branches:
      - main
    paths:
      - "Dockerfile"
      - ".dockerignore"
      - "package.json"
      - "package-lock.json"
      - "index.js"
      - "public/**"

engine: copilot # Can also use claude-code, openai-codex, or google-gemini

model: claude-sonnet-4-5

permissions:
  contents: read
  copilot-requests: write

# Do the work by invoking ONLY the docker-image-builder custom agent.
imports:
  - .github/agents/docker-image-builder.agent.md

# The agent builds the image itself using its bash docker tools.
tools:
  bash:
    - "docker:*"
    - "ls:*"
    - "cat:*"
    - "npm:*"
    - "node:*"

# The agent runs `docker build` and `docker save` itself; the only remaining
# workflow step uploads the tarball the agent produced, since an Actions
# artifact cannot be produced by the agent directly.
post-steps:
  - name: Upload built image artifact
    uses: actions/upload-artifact@v7.0.1
    with:
      name: my_app-docker-image-${{ github.sha }}
      path: my_app-image.tar
      if-no-files-found: error
      retention-days: 7
---

# Build Docker Image via Agent

This workflow's only agent is the imported **`docker-image-builder`** agent. The
agent performs the build itself; the single post-step only uploads the tarball
the agent produced, because an Actions artifact cannot be emitted by the agent.

Follow the imported agent's instructions to:

1. Locate the `Dockerfile` at the repository root and confirm a `.dockerignore`
   keeps the build context lean.
2. Build the image from the existing `Dockerfile` exactly as it is, using the
   reference `my_app:latest`:
   - `docker build -t my_app:latest .`
3. Export the built image to a tarball at the repository root so the upload step
   can publish it:
   - `docker save my_app:latest -o my_app-image.tar`
4. Verify the image and tarball exist (`docker images my_app:latest`, `ls -l
   my_app-image.tar`) and report the image reference, ID, and size.

Do not modify application code, tests, dependencies, or the `Dockerfile`, and do
not push to any registry. If the build fails, report the exact failing step and
error output. The post-step then uploads `my_app-image.tar` as the workflow's
artifact output.
