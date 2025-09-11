---
description: "Create fully-scoped, actionable tasks with intelligent complexity detection and guided interview process"
allowed_tools: ["mcp__loqa-assistant__add_todo", "mcp__loqa-assistant__start_comprehensive_task_creation"]
---

# Create Task

**The single entry point for all task creation.** Create fully-scoped, actionable tasks using intelligent analysis and guided workflow. The system automatically detects task complexity and ensures proper scoping, requirements definition, and multi-repository coordination.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly and create the task.

If no parameters are provided, use this interactive workflow:

1. **Ask for task description**: "Please describe the task you'd like to create in your own words. What do you want to accomplish? (Can be just a rough idea - we'll flesh it out together if needed!)"

2. **AI Analysis**: Analyze the user's description to intelligently determine:
   - **Complexity level**: Simple, medium, or high complexity based on content analysis
   - **Repository scope**: Which repositories will be affected
   - **Template suggestion**: Best template based on task nature
   - **Priority assessment**: Based on urgency indicators and project alignment

3. **Intelligent routing**: The system automatically chooses the best creation method:

   **For Simple Tasks** (well-defined, single repository, clear scope):
   - Use `mcp__loqa-assistant__add_todo` for direct creation
   - Present final task details for confirmation
   
   **For Complex Tasks** (automatically detected):
   - Use `mcp__loqa-assistant__start_comprehensive_task_creation` 
   - Start guided 5-question interview process to ensure complete definition

4. **Guided interview process** (for complex tasks):
   - **Scope**: What specific problem does this solve? Current vs desired state?
   - **Acceptance Criteria**: How will we know it's complete? What are the specific criteria?
   - **Technical Requirements**: Any technical constraints, architectural considerations?
   - **Dependencies**: Does this depend on other work? Any blockers or prerequisites?
   - **Complexity**: How complex is this? Does it need breakdown into smaller tasks?

5. **Final task creation**: After completion:
   - Detect complexity and suggest task breakdown if needed
   - Determine correct repositories for task placement
   - Create fully-scoped task(s) ready for immediate work

## Parameters for MCP Functions

### Simple Task Creation (`mcp__loqa-assistant__add_todo`)
- **title**: Clear, descriptive task title (required)
- **template**: Template to use (feature/bug-fix/protocol-change/cross-repo/general)
- **priority**: Task priority level (High/Medium/Low, defaults to Medium)
- **type**: Type of work (Feature/Bug Fix/Improvement/Documentation)
- **assignee**: Who will work on this task

### Complex Task Creation (`mcp__loqa-assistant__start_comprehensive_task_creation`)
- **initialInput**: The initial task idea or description (required)
- **skipInterview**: Set to true to attempt direct creation for simple tasks (optional, defaults to false)

## Examples

**Simple task creation (direct):**
- `/create-task --title="Fix login button alignment" --priority=Low`
- `/create-task --title="Update API documentation" --template=general`
- `/create-task "Add logging to user service"`

**Complex task creation (starts interview):**  
- `/create-task "Implement real-time voice collaboration"`
- `/create-task "Migrate authentication system to OAuth 2.0"`
- `/create-task "Add multi-language support across all services"`

**Interactive usage:**
- `/create-task` (no parameters) → starts interactive workflow with intelligent routing

**Force simple creation:**
- `/create-task --title="Complex task title" --skipInterview=true`

## Smart Upgrade to Comprehensive Creation

When the system detects complex requirements, you'll see:
```
🎯 This task appears complex and would benefit from comprehensive creation.

Starting guided interview process to ensure full scope definition...

Interview ID: abc-123-def

Question 1: What specific problem does this task solve? Please describe the current state and desired end state.
```

This ensures complex tasks get proper scoping, acceptance criteria, and multi-repository coordination.

## When to Use

✅ **Use /create-task for ALL task creation:**
- **Simple tasks**: Well-defined scope, single repository, clear solutions
- **Complex tasks**: Multi-repository coordination, architectural changes, unclear requirements
- **Any task**: The system intelligently routes to the appropriate creation method

The command automatically:
- **Detects complexity** and routes simple tasks to direct creation
- **Upgrades complex tasks** to comprehensive creation with guided interview
- **Ensures complete scoping** for all tasks before creation
- **Coordinates multi-repository** work when needed

💡 **This is your single entry point** - no need to choose between different task creation commands.