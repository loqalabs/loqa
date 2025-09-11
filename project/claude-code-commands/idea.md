---
description: "Capture feature ideas and improvements for later processing"
allowed_tools: ["mcp__loqa-assistant__capture_thought"]
---

# Capture Feature Idea

Capture a feature idea or improvement with parameters:

$ARGUMENTS

Please use the MCP function `mcp__loqa-assistant__capture_thought` with the following parameters parsed from the arguments above:

- **content**: The idea content (required, can be provided as `--content="..."` or as the main argument)
- **context**: Optional context about where this idea came from (if provided as `--context=...`)
- **tags**: Optional tags to categorize the idea (if provided as `--tags=tag1,tag2,tag3`)
- **category**: Defaults to "feature-idea" for /idea command

This command is for feature ideas, improvements, and enhancements. For technical concerns, use `/thought` instead.

Examples:
- `/idea "Add real-time collaboration features for voice commands"`
- `/idea --content="Implement offline-first update mechanism" --context="User feedback session"`
- `/idea "Voice activity detection for better UX" --tags=feature,voice-processing`