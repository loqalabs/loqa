---
description: "Create a detailed, structured task in the backlog system using templates and priority"
allowed_tools: ["mcp__loqa-assistant__add_todo"]
---

# Create Task

Create a comprehensive, well-structured task using an interactive workflow.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly and create the task.

If no parameters are provided, use this interactive workflow:

1. **Ask for task description**: "Please describe the task you'd like to create in your own words. What do you want to accomplish?"

2. **AI Analysis**: Analyze the user's description to intelligently suggest:
   - **title**: Clear, descriptive task title based on their description
   - **template**: Best template (feature/bug-fix/protocol-change/cross-repo/general) based on task nature
   - **priority**: Priority level (High/Medium/Low) based on urgency indicators in description
   - **type**: Type of work (Feature/Bug Fix/Improvement/Documentation/Refactoring)
   - **assignee**: If mentioned in description

3. **Confirmation**: Present suggestions to user: "Based on your description, I suggest these parameters for your task: [show suggestions]. Would you like to create the task with these parameters, or would you like to modify any of them?"

4. **Create task**: Only after user confirmation, use the MCP function `mcp__loqa-assistant__add_todo` with the final parameters.

## Parameters for MCP Function

- **title**: Clear, descriptive task title (required)
- **template**: Template to use (feature/bug-fix/protocol-change/cross-repo/general, defaults to general)
- **priority**: Task priority level (High/Medium/Low, defaults to Medium)
- **type**: Type of work (Feature/Bug Fix/Improvement/Documentation/Refactoring)
- **assignee**: Who will work on this task

## Examples

Non-interactive usage:
- `/create-task --title="Implement real-time voice activity detection" --template=feature --priority=High`
- `/create-task --title="Fix authentication middleware memory leak" --template=bug-fix --type="Bug Fix"`

Interactive usage:
- `/create-task` (no parameters) → starts interactive workflow