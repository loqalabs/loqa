---
description: "Create structured pull requests with automatic task linking and templates"
allowed_tools: ["mcp__loqa-assistant__create_pr_from_task"]
---

# Create Pull Request

Create structured pull requests using an interactive workflow with automatic task linking, proper templates, and quality checklists.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly and create the pull request.

If no parameters are provided, use this interactive workflow:

1. **Ask about the PR**: "Please describe what you've accomplished in this pull request in your own words. What changes are you submitting?"

2. **AI Analysis**: Analyze the user's description and current context to intelligently suggest:
   - **taskId**: Extract from current branch name or user description
   - **title**: Clear, descriptive PR title based on the changes described
   - **repository**: Auto-detect from current directory and git context
   - **baseBranch**: Target branch (main/develop) based on change type
   - **prType**: Type of PR (feature/bugfix/hotfix/docs) based on changes

3. **Guided questions**: Ask follow-up questions to improve the PR:
   - "Is this ready for review, or should I create it as a draft?"
   - "Are there any breaking changes that reviewers should be aware of?"
   - "Which reviewers should I assign, or should I let the system auto-assign?"
   - "Are there any specific testing instructions for reviewers?"
   - "Should this PR target main branch, or a different branch?"

4. **Quality checklist**: Guide through quality checks:
   - "Have you run all tests and quality checks locally?"
   - "Are there any new dependencies or configuration changes?"
   - "Does this change require documentation updates?"
   - "Are there any migration steps needed for this change?"

5. **Preview PR**: Show comprehensive PR details: "I'll create this PR: [show title, description, checklist, reviewers]. Does this look good?"

6. **Create PR**: After confirmation, use the MCP function `mcp__loqa-assistant__create_pr_from_task` with the final parameters.

## Parameters for MCP Function

- **taskId**: Backlog task ID for linking (if provided as `--taskId=...`, auto-detected from branch name)
- **repository**: Target repository (if provided as `--repository=...`, auto-detected from current directory)
- **title**: PR title (if provided as `--title=...`, auto-generated from task)
- **baseBranch**: Target branch for PR (if provided as `--baseBranch=...`, defaults to "main")
- **draft**: Create as draft PR (if provided as `--draft=true`, defaults to false)

This command auto-detects task info from branch names like `feature/task-21-description` and creates comprehensive PR descriptions with checklists.

## Examples

Non-interactive usage:
- `/pr --taskId=21 --draft=true` - Create draft PR for specific task
- `/pr --title="Emergency hotfix" --baseBranch=main` - Custom configuration
- `/pr --repository=loqa-hub --draft=false` - Specify repository

Interactive usage:
- `/pr` (no parameters) → starts guided PR creation workflow