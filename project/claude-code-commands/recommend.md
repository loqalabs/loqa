---
description: "Get AI-enhanced task recommendations with multi-criteria scoring"
allowed_tools: ["mcp__loqa-assistant__intelligent_task_prioritization"]
---

# Get Task Recommendations

Get intelligent, AI-powered recommendations for which task to work on next:

$ARGUMENTS

Please use the MCP function `mcp__loqa-assistant__intelligent_task_prioritization` with the following parameters parsed from the arguments above:

- **roleContext**: Your role (developer/architect/devops/qa/auto-detect, if provided as `--roleContext=...`)
- **timeAvailable**: Time constraint (30min/2h/flexible, if provided as `--timeAvailable=...`)
- **repositoryFocus**: Focus on specific repo (if provided as `--repository=...`)
- **priority**: Filter by priority level (P1/P2/P3, if provided as `--priority=...`)
- **showTop**: Number of recommendations (if provided as `--showTop=...`, defaults to 3)

Examples:
- `/recommend` - Get general AI recommendations
- `/recommend --roleContext=developer --timeAvailable=2h` - Role-specific with time constraint
- `/recommend --priority=P1 --repository=loqa-hub` - High-priority Hub tasks