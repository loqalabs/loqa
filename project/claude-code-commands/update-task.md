---
description: "Update existing tasks with new information, research notes, or context changes with automatic GitHub issue synchronization"
allowed_tools: ["mcp__loqa-assistant__list_tasks", "mcp__github__get_issue", "mcp__github__update_issue", "mcp__github__add_issue_comment"]
---

# Update Task

Update existing backlog tasks with new information, research notes, implementation details, or context changes. Automatically synchronizes updates with linked GitHub issues and commits changes to maintain task history.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly to identify and update the specified task.

If no parameters are provided, use this interactive workflow:

1. **Task Identification**: Multiple flexible ways to locate the task:
   - **Direct ID**: `task-9`, `task-024`, etc.
   - **Repository + Task**: `loqa-hub/task-15`, `loqa-commander/task-8`
   - **GitHub Issue**: `loqalabs/loqa#84`, `#85`, `issue-49`
   - **Description Search**: "security observability", "voice collaboration"
   - **Interactive Browse**: Show available tasks for selection
   
2. **Smart Task Discovery**: When no specific task is provided:
   - List recent tasks across all repositories
   - Search by keywords in title/description
   - Filter by status, priority, or assignee
   - Show GitHub issue links and status

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

### Task Identification (Multiple Flexible Methods)
- `--taskId=task-9`: Update specific task by ID
- `--repo-task=loqa-hub/task-15`: Repository and task ID combination
- `--github-issue=loqalabs/loqa#84`: GitHub repository and issue number
- `--issue-id=#85`: Issue number (assumes current repo)
- `--title="Security Observability"`: Find task by title search
- `--search="voice collaboration"`: Search in task descriptions
- `--interactive`: Force interactive task selection and browsing

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

### Task Identification Methods

**Direct task ID:**
- `/update-task task-9 --note="Check out Claude Trace for debugging workflow inspiration"`
- `/update-task task-024 --context="Added dependency on Phase 1 evaluation"`

**Repository + task combination:**
- `/update-task loqa-hub/task-15 --note="Performance requirements updated"`
- `/update-task loqa-commander/task-8 --priority=High --context="Critical for UI overhaul"`

**GitHub issue identification:**
- `/update-task loqalabs/loqa#84 --note="Research completed, ready for implementation"`
- `/update-task #85 --context="Blocked pending API design review"`
- `/update-task issue-49 --link="https://example.com/security-docs"`

**Search and discovery:**
- `/update-task --search="voice collaboration" --note="New WebRTC approach identified"`
- `/update-task --title="Security Observ" --link="https://youtube.com/watch?v=example"`

**Interactive browsing:**
- `/update-task` → "Which task would you like to update? You can specify by:"
  - Task ID: `task-9`
  - Repository: `loqa-hub/task-15`  
  - GitHub issue: `#84` or `loqalabs/loqa#85`
  - Description: `"the security observability task"`
- `/update-task --interactive` → browse available tasks with filtering

### Update Content Examples

**Research notes:**
- `/update-task task-9 --note="Claude Trace (https://github.com/badlogic/lemmy/tree/main/apps/claude-trace) demos innovative debugging workflows"`
- `/update-task #84 --link="https://youtube.com/watch?v=example&t=636s" --context="Video shows relevant debugging techniques at 10:36"`

**Implementation updates:**
- `/update-task loqa-hub/task-15 --section="Technical Requirements" --note="Must support PostgreSQL 15+ for JSON operations"`
- `/update-task --search="authentication" --context="OAuth 2.0 implementation approach decided"`

**Status and priority changes:**
- `/update-task task-8 --priority=High --context="Critical for MVP milestone"`
- `/update-task issue-49 --status="Blocked" --note="Waiting for security audit completion"`

### Natural Language Responses

When asked "Which task?", users can respond with:
- `"task-9"` → Direct ID
- `"loqa-hub task about voice processing"` → Repository + description
- `"GitHub issue 84"` or `"issue #85"` → GitHub issue reference  
- `"the security observability debugging task"` → Description search
- `"show me recent tasks"` → Browse available tasks

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

## Interactive Task Discovery Workflow

When no task is specified (`/update-task` with no parameters):

```
🔍 Which task would you like to update?

You can specify the task in any of these ways:
• Task ID: task-9, task-024
• Repository + Task: loqa-hub/task-15, loqa-commander/task-8  
• GitHub Issue: #84, loqalabs/loqa#85, issue-49
• Description: "security observability task", "voice collaboration feature"
• Browse: "show recent tasks" or "list all tasks"

Please describe which task you want to update:
```

**User Response Examples:**
- `"task-9"` → Direct lookup of task-9
- `"the security debugging task"` → Search task descriptions for matching keywords
- `"loqa-hub task about voice processing"` → Search loqa-hub repository tasks
- `"GitHub issue 84"` → Lookup GitHub issue #84 and find linked backlog task
- `"show me recent tasks"` → Display last 10 tasks across all repositories
- `"list loqa-commander tasks"` → Show all tasks for loqa-commander repository

**Follow-up Clarification:**
If multiple matches found:
```
🎯 Found multiple tasks matching "voice processing":

1. task-12 (loqa-hub): Voice activity detection implementation
2. task-18 (loqa-relay): Voice capture optimization  
3. task-21 (loqa-commander): Voice timeline visualization

Which task would you like to update? (1, 2, 3, or be more specific)
```

**Cross-Repository Discovery:**
```
📋 Recent Tasks Across All Repositories:

loqa-hub:
• task-15: Authentication system refactor (In Progress)
• task-12: Voice activity detection (To Do) 

loqa-commander:  
• task-8: UI dashboard redesign (High Priority)
• task-21: Timeline visualization (Medium)

loqa-skills:
• task-7: Home Assistant integration (Blocked)

Which task would you like to update?
```

💡 **Perfect for cases like:** Adding Claude Trace research to security observability tasks, recording architectural decisions, updating technical requirements, or noting relevant resources discovered during development.