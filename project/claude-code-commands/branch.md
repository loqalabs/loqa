---
description: "Create properly named feature branches from backlog tasks"
allowed_tools: ["mcp__loqa-assistant__create_branch_from_task"]
---

# Create Feature Branch

Create properly named feature branches from backlog tasks, following Loqa's git workflow standards:

$ARGUMENTS

Please use the MCP function `mcp__loqa-assistant__create_branch_from_task` with the following parameters parsed from the arguments above:

- **taskId**: Backlog task ID (required, can be provided as `--taskId=...` or as main argument)
- **repository**: Target repository (if provided as `--repository=...`, auto-detected from current directory)
- **branchPrefix**: Branch prefix (if provided as `--branchPrefix=...`, defaults to "feature")
- **switchToBranch**: Switch to new branch after creation (defaults to true)

This command creates branches like `feature/task-21-descriptive-title` with proper git workflow integration.

Examples:
- `/branch --taskId=21` - Create branch for task 21
- `/branch task-21` - Same as above (shorthand)
- `/branch --taskId=21 --repository=loqa-hub` - Create branch in specific repo
- `/branch --taskId=12 --branchPrefix=bugfix` - Use different prefix