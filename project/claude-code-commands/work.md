---
description: "Begin comprehensive task work with intelligent workspace detection, role optimization, and model selection"
---

# Work on Tasks

I'll start comprehensive task work using the intelligent MCP system with the following arguments: `$ARGUMENTS`

Let me parse the arguments and call the appropriate MCP function:

- If `--taskId=...` is provided, I'll work on that specific task
- If `--title=...` is provided, I'll use that as the task title
- If `--description=...` is provided, I'll use that as the task description  
- If `--files=...` is provided, I'll parse that as file paths
- If `--repository=...` is provided, I'll target that specific repository
- If `--priority=...` is provided, I'll filter by that priority level (P1/P2/P3)
- If `--roleContext=...` is provided, I'll use that role specialization
- If no arguments are provided, I'll use intelligent auto-selection

Examples:
- `/work` - Auto-select and start work with intelligent defaults
- `/work --taskId=task-21` - Work on specific task
- `/work --priority=P1 --repository=loqa-hub` - Auto-select P1 task in hub
- `/work --roleContext=architect` - Work on architecture tasks