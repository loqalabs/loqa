---
description: "List current tasks and drafts in the backlog (simple view)"
allowed_tools: ["mcp__loqa-assistant__list_tasks"]
---

# List Tasks

List current tasks and drafts in the backlog (simple view):

$ARGUMENTS

Please use the MCP function `mcp__loqa-assistant__list_tasks` with the following parameters parsed from the arguments above:

- **repoPath**: Optional repository path (if provided as `--repo=...`, defaults to current directory)

For AI-enhanced task recommendations, use `/recommend` instead.

Examples:
- `/list-tasks` - List tasks in current repository
- `/list-tasks --repo=loqa-hub` - List tasks in specific repository