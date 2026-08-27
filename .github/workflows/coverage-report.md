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
  copilot-requests: write

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

Run the imported **`coverage-report`** agent.
