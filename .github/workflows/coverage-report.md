---
name: "Coverage Report Agent Workflow"
description: "Invokes the coverage-report agent to run the test suite with coverage and report the results. The agent does all the work — no deterministic build steps."
on:
  workflow_dispatch:
  push:
    branches:
      - main
    paths:
      - "index.js"
      - "test/**"
      - "package.json"
      - "package-lock.json"

engine: copilot # Can also use claude-code, openai-codex, or google-gemini

model: claude-sonnet-4-5

permissions:
  contents: read

# Do the work by invoking ONLY the coverage-report custom agent.
imports:
  - .github/agents/coverage-report.agent.md

# The agent generates and reports the coverage itself; its findings are
# published as an issue. This is the agent's own output, not a build step.
safe-outputs:
  create-issue:
    title-prefix: "[coverage] "
    labels: [automation, coverage]
    max: 1

# Give the agent the tools it needs to install deps and run coverage itself.
# There are deliberately NO post-steps — the agent builds the report on its own.
tools:
  bash:
    - "npm:*"
    - "npx:*"
    - "node:*"
    - "ls:*"
    - "cat:*"
---

# Coverage Report via Agent

This workflow's only worker is the imported **`coverage-report`** agent. It
performs everything itself — there are no deterministic workflow steps that run
or collect coverage.

Follow the imported agent's instructions to:

1. Ensure the project's dependencies are available first — if `node_modules` is
   missing, install them with `npm ci` (Jest is a devDependency).
2. Run the test suite with coverage yourself:
   - `npx jest --coverage --coverageReporters=text --coverageReporters=lcov`
3. Read the generated summary, identify the lowest-covered files and notable
   uncovered lines, and note whether any configured threshold was met.
4. Report the results as a single issue: overall statements/branches/functions/
   lines percentages, a short per-file table highlighting the least-covered
   files, and the path to the generated `coverage/` output.

Do not modify application code, tests, dependencies, or coverage thresholds. If
tests fail, report the failures rather than changing code to force a green run.
