---
name: "Scheduled QA Unit Test Agent"
description: "Runs the QA unit-test agent on a schedule to keep the TODO application's unit tests healthy."
on:
  # Run automatically as a cron job every 5 minutes
  # (5 minutes is the minimum interval GitHub Actions allows for schedules).
  schedule:
    - cron: "*/5 * * * *"
  # Also allow manual runs for testing the workflow.
  workflow_dispatch:

engine: copilot # Can also use claude-code, openai-codex, or google-gemini

model: claude-sonnet-4-5

permissions:
  contents: read
  copilot-requests: write

# Run the existing qa-unit-test custom agent by importing its instructions.
imports:
  - .github/agents/qa-unit-test-agent.md

# The agent only proposes new/updated unit tests; deliver any changes as a pull request.
safe-outputs:
  create-pull-request:
    title-prefix: "[qa-unit-tests] "
    labels: [automation, tests]
    draft: true
    if-no-changes: "ignore"
    allowed-files:
      - "test/**"
      - "**/*.test.js"

# Give the agent the tools it needs to write and run the unit tests.
tools:
  edit:
  bash:
    - "npm:*"
    - "npx:*"
    - "node:*"
---

# Scheduled Unit Test Run

This workflow runs automatically every 5 minutes and delegates to the
`qa-unit-test-agent` (imported above) to keep the unit tests for the TODO
application healthy.

Follow the imported agent's instructions to:

1. Review the Express route handlers in `index.js` and the existing tests in
   the `test/` directory.
2. Identify any route-handler behavior that is untested or under-tested.
3. Add or improve Jest/supertest unit tests under `test/` so each route
   handler's behavior is verified in isolation.

Only modify test files. If the existing tests already cover the current
behavior, make no changes and take no further action.
