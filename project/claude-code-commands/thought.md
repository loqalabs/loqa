---
description: "Capture technical thoughts, concerns, and insights for later processing"
allowed_tools: ["mcp__loqa-assistant__capture_thought"]
---

# Capture Technical Thought

Capture a technical thought, concern, or insight with parameters:

$ARGUMENTS

Please use the MCP function `mcp__loqa-assistant__capture_thought` with the following parameters parsed from the arguments above:

- **content**: The thought content (required, can be provided as `--content="..."` or as the main argument)
- **context**: Optional context about where this thought came from (if provided as `--context=...`)
- **tags**: Optional tags to categorize the thought (if provided as `--tags=tag1,tag2,tag3`)
- **category**: Defaults to "technical-architecture" for /thought command

This command is for technical concerns, architecture insights, and development observations. For feature ideas, use `/idea` instead.

Examples:
- `/thought "Need to investigate memory leaks in audio processing"`
- `/thought --content="Consider using NATS for inter-service communication" --context="Performance review"`
- `/thought "Authentication middleware needs refactoring" --tags=technical-debt,security`