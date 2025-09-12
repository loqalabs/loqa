---
description: "Unified Loqa development command with intelligent task management, workflow automation, and cross-repository coordination"
allowed_tools: ["mcp__loqa-assistant__add_todo", "mcp__loqa-assistant__start_comprehensive_task_creation", "mcp__loqa-assistant__capture_thought", "mcp__loqa-assistant__capture_comprehensive_thought", "mcp__loqa-assistant__intelligent_task_prioritization", "mcp__loqa-assistant__list_tasks", "mcp__loqa-assistant__continue_task_development", "mcp__loqa-assistant__answer_task_interview_question", "mcp__loqa-assistant__create_branch_from_task", "mcp__loqa-assistant__create_pr_from_task", "mcp__loqa-assistant__run_integration_tests", "mcp__loqa-assistant__analyze_dependency_impact", "mcp__loqa-assistant__plan_strategic_shift", "mcp__loqa-assistant__start_task_work"]
---

# Loqa Development Command

**The unified command for all Loqa development workflows.** Provides intelligent task management, development automation, and cross-repository coordination through a discoverable CLI-style interface.

## Usage Patterns

```bash
/loqa                           # Show all available categories
/loqa [category]                # Show available actions for category
/loqa [category] [action] [args] # Execute specific command
```

## Command Structure

Parse `$ARGUMENTS` to determine the command structure:

### **No Arguments** → Show Available Categories
If `$ARGUMENTS` is empty, show:

```
🚀 **Loqa Development Command**

Available categories:
• **task** - Task management (create, list, update, resume)
• **dev** - Development workflow (work, branch, pr, test, analyze)  
• **plan** - Planning & strategy (recommend, strategy)
• **capture** - Knowledge capture (thought, idea)

Usage: /loqa [category] [action] [args]
Examples:
  /loqa task create "Fix login bug"
  /loqa dev work --priority=P1
  /loqa plan recommend --roleContext=developer
  /loqa capture thought "Memory leak in audio processing"

Type `/loqa [category]` to see available actions for a category.
```

### **One Argument** → Show Available Actions
If `$ARGUMENTS` contains only a category, show available actions:

#### `/loqa task`
```
📋 **Task Management Commands**

Available actions:
• **create** - Create detailed backlog tasks with intelligent complexity routing
• **list** - List tasks across repositories with filtering options
• **update** - Update existing tasks with new information
• **resume** - Resume draft task creation and answer interview questions

Usage: /loqa task [action] [args]
Examples:
  /loqa task create "Implement real-time collaboration"
  /loqa task list --status=active
  /loqa task update task-123 --status=in-progress
  /loqa task resume abc-123 "My detailed answer"
```

#### `/loqa dev`  
```
🛠️ **Development Workflow Commands**

Available actions:
• **work** - Begin working on tasks with AI selection and workspace detection
• **branch** - Create feature branches from tasks with proper naming
• **pr** - Create pull requests with task linking and templates
• **test** - Run cross-service integration tests with dependency awareness
• **analyze** - Analyze protocol change impact across repositories

Usage: /loqa dev [action] [args]
Examples:
  /loqa dev work --priority=P1
  /loqa dev branch --taskId=21
  /loqa dev pr --draft=true
  /loqa dev test --repositories=loqa-hub,loqa-relay
  /loqa dev analyze --protoChanges=audio.proto
```

#### `/loqa plan`
```
📋 **Planning & Strategy Commands**

Available actions:
• **recommend** - Get AI-powered task recommendations based on context
• **strategy** - Plan strategic changes with impact analysis

Usage: /loqa plan [action] [args]
Examples:
  /loqa plan recommend --roleContext=developer --timeAvailable=2h
  /loqa plan strategy --title="Migrate to gRPC" --scope=breaking
```

#### `/loqa capture`
```
📝 **Knowledge Capture Commands**

Available actions:
• **thought** - Capture technical thoughts, concerns, and insights
• **idea** - Capture feature ideas and improvements with evaluation

Usage: /loqa capture [action] [args]
Examples:
  /loqa capture thought "Memory leak in audio processing"
  /loqa capture idea "Add real-time collaboration features"
```

### **Two+ Arguments** → Execute Command
If `$ARGUMENTS` contains subject + action + optional args, execute the appropriate command:

## Command Implementations

### **Task Commands**

#### `/loqa task create [description] [--args]`
Use the MCP function `mcp__loqa-assistant__start_comprehensive_task_creation` or `mcp__loqa-assistant__add_todo` based on complexity.

**Interactive fallback**: If no description provided, ask: "Please describe the task you'd like to create. What do you want to accomplish?"

**Complexity detection**: Analyze the description to determine if simple task creation (`add_todo`) or comprehensive creation (`start_comprehensive_task_creation`) is needed.

**Seamless Interview Flow**: For complex tasks, the system may initiate an AI-guided interview. Once started, users can respond conversationally without needing special commands - the system automatically detects and processes interview responses.

#### `/loqa task list [--status] [--repository] [--priority]`
Use the MCP function `mcp__loqa-assistant__list_tasks` with optional filtering.

**Interactive fallback**: If no args, show all active tasks across repositories.

#### `/loqa task update [task-id] [--field=value]`
Update task status, priority, or other fields. Parse task ID from first argument.

**Interactive fallback**: If no task ID provided, ask: "Which task would you like to update? (Provide task ID or description)"

#### `/loqa task resume [draft-id] [answer]`
Use the MCP function `mcp__loqa-assistant__continue_task_development` or `mcp__loqa-assistant__answer_task_interview_question`.

**Interactive fallback**: If no args, show available drafts and interviews.

**Seamless Interview Experience**: When an interview is active, users can provide conversational responses directly without explicit commands. The system automatically detects interview context and processes answers seamlessly.

### **Development Commands**

#### `/loqa dev work [--args]`
Use the MCP function `mcp__loqa-assistant__start_task_work` with workspace detection and role optimization.

**Interactive fallback**: If no args, ask: "What kind of work would you like to focus on today?"

#### `/loqa dev branch [--taskId] [--name]`
Use the MCP function `mcp__loqa-assistant__create_branch_from_task`.

**Interactive fallback**: If no task ID, ask: "Which task would you like to create a branch for?"

#### `/loqa dev pr [--taskId] [--draft] [--title]`
Use the MCP function `mcp__loqa-assistant__create_pr_from_task`.

**Interactive fallback**: Check current branch and associated task, create PR with task linking.

#### `/loqa dev test [--repositories] [--scope]`
Use the MCP function `mcp__loqa-assistant__run_integration_tests`.

**Interactive fallback**: If no args, run tests for current repository context.

#### `/loqa dev analyze [--protoChanges] [--repository]`
Use the MCP function `mcp__loqa-assistant__analyze_dependency_impact`.

**Interactive fallback**: If no args, analyze current repository changes.

### **Planning Commands**

#### `/loqa plan recommend [--args]`
Use the MCP function `mcp__loqa-assistant__intelligent_task_prioritization`.

Parse arguments like `--roleContext=developer`, `--timeAvailable=2h`, `--repository=loqa-hub`, `--priority=P1`.

#### `/loqa plan strategy [--title] [--scope]`
Use the MCP function `mcp__loqa-assistant__plan_strategic_shift`.

**Interactive fallback**: If no title, ask: "What strategic change are you planning?"

### **Capture Commands**

#### `/loqa capture thought [content] [--tags]`
Use the MCP function `mcp__loqa-assistant__capture_thought` or `mcp__loqa-assistant__capture_comprehensive_thought`.

**Interactive fallback**: If no content, ask: "What technical thought or concern would you like to capture?"

#### `/loqa capture idea [content] [--tags]`
Similar to thought capture but focused on feature ideas and improvements.

**Interactive fallback**: If no content, ask: "What feature idea or improvement would you like to capture?"

## Error Handling

### **Invalid Category**
If category is not one of: `task`, `dev`, `plan`, `capture`, show:

```
❌ Unknown category: '[category]'

Available categories: task, dev, plan, capture
Use `/loqa` to see all available commands.
```

### **Invalid Action**
If action is not valid for the given category, show:

```
❌ Unknown action '[action]' for category '[category]'

Use `/loqa [category]` to see available actions.
```

### **Missing Arguments**
For commands that require arguments, provide helpful error messages and interactive prompts.

## Argument Parsing

Parse `$ARGUMENTS` using this logic:

1. **Split arguments**: `args = $ARGUMENTS.split(' ')`
2. **Determine structure**:
   - `args.length == 0` → Show subjects
   - `args.length == 1` → Show actions for subject
   - `args.length >= 2` → Execute command
3. **Parse flags**: Look for `--flag=value` or `--flag value` patterns
4. **Extract positional args**: Everything that's not a flag

## Examples

```bash
# Discovery
/loqa                                    # Show all subjects
/loqa task                              # Show task actions

# Task management
/loqa task create "Fix login bug"       # Simple task creation
/loqa task list --status=active         # List active tasks
/loqa task resume                       # Show available drafts

# Development workflow  
/loqa dev work --priority=P1            # Work on P1 tasks
/loqa dev branch --taskId=21            # Create branch from task
/loqa dev pr --draft=true               # Create draft PR

# Planning & strategy
/loqa plan recommend --roleContext=developer
/loqa plan strategy --title="Migrate to gRPC"

# Knowledge capture
/loqa capture thought "Memory leak in audio processing"
/loqa capture idea "Add real-time collaboration"
```

This unified command provides a clean, discoverable interface while maintaining all the powerful functionality of the individual commands.