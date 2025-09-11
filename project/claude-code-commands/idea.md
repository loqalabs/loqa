---
description: "Capture feature ideas and improvements for later processing"
allowed_tools: ["mcp__loqa-assistant__capture_thought"]
---

# Capture Feature Idea

Capture a feature idea or improvement using an interactive workflow.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly and capture the idea.

If no parameters are provided, use this interactive workflow:

1. **Ask for idea description**: "Please describe your feature idea in your own words. What would you like to see implemented or improved?"

2. **AI Analysis**: Analyze the user's description to intelligently suggest:
   - **content**: Clear, well-structured version of their idea
   - **context**: Inferred context (e.g., "user experience improvement", "performance optimization")
   - **tags**: Relevant tags based on the idea nature (e.g., feature, voice-processing, ui, performance)
   - **category**: Defaults to "feature-idea"

3. **Confirmation**: Present suggestions to user: "Based on your description, I suggest capturing this idea with the following details: [show suggestions]. Would you like to save the idea with these parameters, or would you like to modify any of them?"

4. **Capture idea**: Only after user confirmation, use the MCP function `mcp__loqa-assistant__capture_thought` with the final parameters.

## Parameters for MCP Function

- **content**: The idea content (required, can be provided as `--content="..."` or as the main argument)
- **context**: Optional context about where this idea came from (if provided as `--context=...`)
- **tags**: Optional tags to categorize the idea (if provided as `--tags=tag1,tag2,tag3`)
- **category**: Defaults to "feature-idea" for /idea command

This command is for feature ideas, improvements, and enhancements. For technical concerns, use `/thought` instead.

## Examples

Non-interactive usage:
- `/idea "Add real-time collaboration features for voice commands"`
- `/idea --content="Implement offline-first update mechanism" --context="User feedback session"`
- `/idea "Voice activity detection for better UX" --tags=feature,voice-processing`

Interactive usage:
- `/idea` (no parameters) → starts interactive workflow