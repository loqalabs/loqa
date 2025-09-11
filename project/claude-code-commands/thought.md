---
description: "Capture technical thoughts, concerns, and insights for later processing"
allowed_tools: ["mcp__loqa-assistant__capture_thought"]
---

# Capture Technical Thought

Capture a technical thought, concern, or insight using an interactive workflow.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly and capture the thought.

If no parameters are provided, use this interactive workflow:

1. **Ask for thought description**: "Please describe your technical thought, concern, or insight in your own words. What technical issue, observation, or idea do you want to capture?"

2. **AI Analysis**: Analyze the user's description to intelligently suggest:
   - **content**: Clear, well-structured version of their technical thought
   - **context**: Inferred context (e.g., "code review observation", "performance analysis", "architecture consideration")
   - **tags**: Relevant technical tags based on the thought nature (e.g., performance, security, technical-debt, architecture, refactoring)
   - **category**: Defaults to "technical-architecture"

3. **Confirmation**: Present suggestions to user: "Based on your description, I suggest capturing this technical thought with the following details: [show suggestions]. Would you like to save the thought with these parameters, or would you like to modify any of them?"

4. **Capture thought**: Only after user confirmation, use the MCP function `mcp__loqa-assistant__capture_thought` with the final parameters.

## Parameters for MCP Function

- **content**: The thought content (required, can be provided as `--content="..."` or as the main argument)
- **context**: Optional context about where this thought came from (if provided as `--context=...`)
- **tags**: Optional tags to categorize the thought (if provided as `--tags=tag1,tag2,tag3`)
- **category**: Defaults to "technical-architecture" for /thought command

This command is for technical concerns, architecture insights, and development observations. For feature ideas, use `/idea` instead.

## Examples

Non-interactive usage:
- `/thought "Need to investigate memory leaks in audio processing"`
- `/thought --content="Consider using NATS for inter-service communication" --context="Performance review"`
- `/thought "Authentication middleware needs refactoring" --tags=technical-debt,security`

Interactive usage:
- `/thought` (no parameters) → starts interactive workflow