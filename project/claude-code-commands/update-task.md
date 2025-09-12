---
description: "Update existing tasks with new information, research notes, or context changes with automatic GitHub issue synchronization"
allowed_tools: ["mcp__loqa-assistant__list_tasks", "mcp__github__get_issue", "mcp__github__update_issue", "mcp__github__add_issue_comment"]
---

# Update Task

Update existing backlog tasks with new information, research notes, implementation details, or context changes. Automatically synchronizes updates with linked GitHub issues and commits changes to maintain task history.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly to identify and update the specified task.

If no parameters are provided, use this interactive workflow:

1. **Task Selection**: Present available tasks for selection:
   - List current tasks with brief descriptions
   - Allow selection by task ID, title search, or interactive choice
   - Show task context including current status and linked issues

2. **Update Type Detection**: Analyze the provided update to determine:
   - **Research notes**: Links, references, or investigation findings
   - **Implementation details**: Technical specifications or architectural decisions
   - **Context changes**: Scope modifications, priority adjustments, or requirement updates
   - **Progress updates**: Status changes, completion notes, or blockers

3. **Content Formatting**: Ensure information is well-structured:
   - Format links with proper markdown syntax
   - Add appropriate section headers
   - Maintain consistent task document structure
   - Include timestamps for update tracking

4. **GitHub Integration**: If task has linked GitHub issues:
   - Update issue description with new context
   - Add comment with detailed update information
   - Maintain synchronization between backlog and issues

5. **Auto-commit**: Automatically commit the task update:
   - Generate descriptive commit message
   - Include task ID and update type
   - Follow Loqa commit conventions

## Parameters

### Task Identification
- `--taskId=task-9`: Update specific task by ID
- `--title="Security Observability"`: Find task by title search
- `--interactive`: Force interactive task selection

### Update Content
- `--note="Research finding..."`: Add research note or reference
- `--context="Additional context..."`: Update task context or scope
- `--link="https://example.com"`: Add reference link with description
- `--section="Implementation Notes"`: Target specific section for update

### Options
- `--sync-github`: Force GitHub issue synchronization (default: auto)
- `--no-commit`: Skip auto-commit (default: auto-commit enabled)
- `--priority=High`: Update task priority
- `--status="In Progress"`: Update task status

## Examples

**Add research note:**
- `/update-task task-9 --note="Check out Claude Trace (https://github.com/badlogic/lemmy/tree/main/apps/claude-trace) for debugging workflow inspiration"`
- `/update-task --title="Security Observability" --link="https://youtube.com/watch?v=example" --context="Video demonstrates relevant debugging techniques"`

**Update implementation details:**
- `/update-task task-15 --section="Technical Requirements" --note="Must support PostgreSQL 15+ for advanced JSON operations"`
- `/update-task --taskId=task-22 --context="Scope expanded to include mobile responsive design"`

**Interactive update:**
- `/update-task` (no parameters) → guided task selection and update workflow
- `/update-task task-12` → show task details and prompt for update content

**Priority/status updates:**
- `/update-task task-8 --priority=High --context="Critical for MVP milestone"`
- `/update-task task-18 --status="Blocked" --note="Waiting for API endpoint implementation"`

## Update Types and Formatting

### Research Notes
```markdown
### Research: [Topic Name]
- **Repository/Link**: [URL]
- **Relevance**: [How it applies to this task]
- **Key Findings**: [Important insights]
- **Next Steps**: [Action items from research]
```

### Implementation Details
```markdown
### Implementation Update - [Date]
- **Technical Approach**: [Method or framework decided]
- **Architecture Changes**: [Impact on system design]
- **Dependencies**: [New requirements or constraints]
- **Timeline Impact**: [Schedule adjustments if needed]
```

### Context Changes
```markdown
### Scope Update - [Date]
- **Previous Scope**: [What was included before]
- **New Scope**: [Updated requirements]
- **Rationale**: [Why the change was needed]
- **Impact Assessment**: [Effect on timeline/resources]
```

## GitHub Synchronization

When tasks have linked GitHub issues, updates automatically:

1. **Issue Description**: Updates main issue description with new context
2. **Comments**: Adds detailed comment with update information
3. **Labels**: Updates issue labels based on priority or status changes
4. **Cross-references**: Maintains links between related issues

Example GitHub update:
```
🔄 Task Update: [Update Type]

**Task ID**: task-9
**Section Updated**: Implementation Notes

**Update Details**:
[Formatted update content]

**Auto-synchronized from backlog task**
```

## Commit Message Format

Auto-generated commits follow this pattern:
```
Update task-[ID]: [Update type] - [Brief description]

- [Specific change 1]
- [Specific change 2]
- Sync with GitHub issue #[number] (if applicable)

[Generated by update-task command]
```

## When to Use

✅ **Use /update-task when:**
- Adding research findings or reference materials
- Recording implementation decisions or technical details
- Updating task scope or requirements based on new information
- Adding progress notes or identifying blockers
- Linking related resources or documentation
- Synchronizing task details with GitHub issues

✅ **Benefits:**
- **Maintains Task History**: All updates are tracked with timestamps
- **GitHub Integration**: Keeps issues and backlog synchronized
- **Auto-formatting**: Ensures consistent, well-structured documentation
- **Version Control**: Automatic commits preserve change history
- **Context Preservation**: Research and decisions are captured for future reference

💡 **Perfect for cases like:** Adding Claude Trace research to security observability tasks, recording architectural decisions, updating technical requirements, or noting relevant resources discovered during development.