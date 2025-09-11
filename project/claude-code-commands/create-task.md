---
description: "Create a detailed, structured task in the backlog system using templates and priority"
allowed_tools: ["mcp__loqa-assistant__add_todo"]
---

# Create Task

Create a comprehensive, well-structured task with parameters:

$ARGUMENTS

Please use the MCP function `mcp__loqa-assistant__add_todo` with the following parameters parsed from the arguments above:

- **title**: Clear, descriptive task title (required)
- **template**: Template to use (feature/bug-fix/protocol-change/cross-repo/general, if provided as `--template=...`, defaults to general)
- **priority**: Task priority level (High/Medium/Low, if provided as `--priority=...`, defaults to Medium)
- **type**: Type of work (Feature/Bug Fix/Improvement/Documentation/Refactoring, if provided as `--type=...`)
- **assignee**: Who will work on this task (if provided as `--assignee=...`)

This command creates formal tasks with proper planning, templates, and breakdown recommendations.

Examples:
- `/create-task --title="Implement real-time voice activity detection" --template=feature --priority=High`
- `/create-task --title="Fix authentication middleware memory leak" --template=bug-fix --type="Bug Fix"`
- `/create-task --title="Protocol change: Add streaming config" --template=protocol-change --priority=Medium`