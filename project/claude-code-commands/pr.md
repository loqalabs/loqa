---
description: "Create structured pull requests with automatic task linking and templates"
allowed_tools: ["mcp__loqa-assistant__create_pr_from_task"]
---

# Create Pull Request

Create structured pull requests with automatic task linking, proper templates, and quality checklists:

$ARGUMENTS

Please use the MCP function `mcp__loqa-assistant__create_pr_from_task` with the following parameters parsed from the arguments above:

- **taskId**: Backlog task ID for linking (if provided as `--taskId=...`, auto-detected from branch name)
- **repository**: Target repository (if provided as `--repository=...`, auto-detected from current directory)
- **title**: PR title (if provided as `--title=...`, auto-generated from task)
- **baseBranch**: Target branch for PR (if provided as `--baseBranch=...`, defaults to "main")
- **draft**: Create as draft PR (if provided as `--draft=true`, defaults to false)

This command auto-detects task info from branch names like `feature/task-21-description` and creates comprehensive PR descriptions with checklists.

Examples:
- `/pr` - Auto-detect everything from current context
- `/pr --taskId=21 --draft=true` - Create draft PR for specific task
- `/pr --title="Emergency hotfix" --baseBranch=main` - Custom configuration