---
description: "Create properly named feature branches from backlog tasks"
allowed_tools: ["mcp__loqa-assistant__create_branch_from_task"]
---

# Create Feature Branch

Create properly named feature branches from backlog tasks using an interactive workflow, following Loqa's git workflow standards.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly and create the branch.

If no parameters are provided, use this interactive workflow:

1. **Ask about the work**: "What task or work would you like to create a branch for? You can describe it in your own words or provide a task ID."

2. **AI Analysis**: Analyze the user's response to intelligently suggest:
   - **taskId**: Extract task ID if mentioned, or suggest finding/creating a matching task
   - **branchPrefix**: Best prefix (feature/bugfix/hotfix/docs) based on work type
   - **repository**: Target repository based on described work or current directory
   - **branchName**: Descriptive branch name based on the work description

3. **Show available tasks**: If no specific task ID mentioned, show recent/relevant tasks: "I found these tasks that might match your description: [list 3-5 relevant tasks]. Which one would you like to work on, or should I help you create a new task?"

4. **Repository selection**: If working across multiple repos, ask: "Which repository should I create this branch in? Current options: [list relevant repositories based on the work]"

5. **Guided questions**: Ask follow-up questions to refine branch creation:
   - "Is this new feature work, a bug fix, or something else?"
   - "Should I switch to the new branch immediately after creating it?"
   - "Any specific naming preferences for the branch?"

6. **Confirmation**: Present branch details: "I'll create branch `[prefix]/[name]` in repository `[repo]` for task `[taskId]`. Should I proceed?"

7. **Create branch**: After confirmation, use the MCP function `mcp__loqa-assistant__create_branch_from_task` with the final parameters.

## Parameters for MCP Function

- **taskId**: Backlog task ID (required, can be provided as `--taskId=...` or as main argument)
- **repository**: Target repository (if provided as `--repository=...`, auto-detected from current directory)
- **branchPrefix**: Branch prefix (if provided as `--branchPrefix=...`, defaults to "feature")
- **switchToBranch**: Switch to new branch after creation (defaults to true)

This command creates branches like `feature/task-21-descriptive-title` with proper git workflow integration.

## Examples

Non-interactive usage:
- `/branch --taskId=21` - Create branch for task 21
- `/branch task-21` - Same as above (shorthand)
- `/branch --taskId=21 --repository=loqa-hub` - Create branch in specific repo
- `/branch --taskId=12 --branchPrefix=bugfix` - Use different prefix

Interactive usage:
- `/branch` (no parameters) → starts guided branch creation workflow