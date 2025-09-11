---
description: "Begin comprehensive task work with intelligent workspace detection, role optimization, and model selection"
---

# Work on Tasks

Begin comprehensive task work using an interactive workflow or intelligent MCP system.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly and begin work.

If no parameters are provided, use this interactive workflow:

1. **Ask about work preferences**: "What kind of work would you like to focus on today? You can describe your preferences in your own words."

2. **AI Analysis**: Analyze the user's response to intelligently suggest:
   - **taskId**: Specific task if mentioned, or best-matching available tasks
   - **priority**: Priority level (P1/P2/P3) based on urgency indicators in description
   - **repository**: Target repository based on mentioned components or skills
   - **roleContext**: Role specialization (architect/developer/devops/qa) based on work type
   - **workType**: Type of work (feature/bugfix/refactor/documentation) based on preferences

3. **Guided questions**: Ask follow-up questions to refine task selection:
   - "Do you prefer working on new features, fixing bugs, or improving existing code?"
   - "Which part of the system interests you most? (hub, commander, relay, skills, etc.)"
   - "How much time do you have available? (quick task, half-day, full-day project)"
   - "Are there any specific technologies you want to work with?"

4. **Task recommendations**: Present 2-3 task options: "Based on your preferences, I recommend these tasks: [show options with brief descriptions]. Which one interests you most?"

5. **Begin work**: After user selection, call the appropriate MCP function with the selected parameters.

## Parameters for MCP Function

- If `--taskId=...` is provided, work on that specific task
- If `--title=...` is provided, use that as the task title
- If `--description=...` is provided, use that as the task description  
- If `--files=...` is provided, parse that as file paths
- If `--repository=...` is provided, target that specific repository
- If `--priority=...` is provided, filter by that priority level (P1/P2/P3)
- If `--roleContext=...` is provided, use that role specialization
- If no arguments are provided, use intelligent auto-selection or interactive mode

## Examples

Non-interactive usage:
- `/work --taskId=task-21` - Work on specific task
- `/work --priority=P1 --repository=loqa-hub` - Auto-select P1 task in hub
- `/work --roleContext=architect` - Work on architecture tasks

Interactive usage:
- `/work` (no parameters) → starts guided task selection workflow