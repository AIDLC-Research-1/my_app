---
name: Documentation and Quality Agent Pipeline
on:
  push:
    branches: [ main ]
engine: copilot                # You can also use claude or codex
permissions:
  contents: read               # Highly secure; reads by default
  issues: read
  pull-requests: read
  copilot-requests: write      # Use GitHub Actions token-based inference (no PAT secret needed)
tools:
  github:
  edit:
safe-outputs:
  create-pull-request:
    labels: [automated-docs]
---

# Multi-Agent Pipeline Objective
Act as a team of specialized software agents to ensure our documentation matches recent code updates.

## Step 1: Code Analyzer Agent
* Scan the recent commits in this push.
* Identify any new functions, modified classes, or updated API routing.
* Extract the core signature changes.

## Step 2: Technical Writer Agent
* Open the `docs/API.md` file.
* Cross-reference the Code Analyzer's findings with the existing documentation.
* Rewrite or append sections to ensure the documentation perfectly mirrors the codebase.

## Step 3: Editor & Compliance Agent
* Review the modified `docs/API.md`.
* Ensure the tone remains professional and clear.
* Verify that no raw credentials or internal environment variables were accidentally exposed in the text.

## Safe Output
* Open a Pull Request with the updated markdown files labeled "automated-docs".
