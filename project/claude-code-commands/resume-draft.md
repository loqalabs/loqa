---
description: "Resume draft task creation and continue incomplete task definition interviews"
allowed_tools: ["mcp__loqa-assistant__continue_task_development", "mcp__loqa-assistant__answer_task_interview_question"]
---

# Resume Draft Task Creation

Resume creation of draft tasks or continue active task definition interviews where you left off.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them to resume specific tasks.

If no parameters are provided, use this interactive workflow:

1. **Show available work**: Use `mcp__loqa-assistant__continue_task_development` to display:
   - **Active interviews** currently in progress with current question
   - **Draft tasks** saved for later completion with timestamps
   - **Status overview** of all incomplete task work

2. **User selection**: Present options to user:
   - Continue specific active interview
   - Resume specific draft task  
   - Start new comprehensive task creation

3. **Resume work**: Based on user choice:
   - For active interviews: Show current question and allow direct answer
   - For draft tasks: Resume the interview process from where it was left
   - Accept answers directly in the same command to streamline workflow

## Parameters for MCP Functions

- **draftId**: Optional specific draft ID to resume (for `mcp__loqa-assistant__continue_task_development`)
- **interviewId**: Interview ID when providing answer (for `mcp__loqa-assistant__answer_task_interview_question`)  
- **answer**: Answer to current interview question (for `mcp__loqa-assistant__answer_task_interview_question`)

## Examples

**Show available work:**
- `/resume-draft` (no parameters) → lists all available drafts and active interviews

**Resume specific draft:**
- `/resume-draft --draft=abc-123-def`
- `/resume-draft --resume=xyz-789-ghi`

**Answer interview question:**
Provide answers directly in the resume command:
- `/resume-draft abc-123-def "Here is my answer to the current question"`
- `/resume-draft --interview=abc-123-def --answer="Detailed response"`

## What You'll See

### Active Interviews
```
🔄 Active Interviews (2):
• Real-time collaboration (abc-123) - How will we know this task is complete? What are...
• Fix authentication system (def-456) - Does this task depend on other work being...

Use /resume-draft <id> "your answer" to continue.
```

### Available Drafts
```
📝 Available Drafts (3):
• Voice activity detection (ghi-789) - Implement VAD for better UX... (2 hours ago)
• Protocol buffer updates (jkl-012) - Update gRPC definitions for new... (1 day ago)
• Database migration (mno-345) - Migrate from SQLite to PostgreSQL... (3 days ago)

Use /resume-draft <draft-id> to resume.
```

### No Work Available
```
📋 Task Development Status

No drafts or active interviews found.

Use /create-task "your task idea" to begin.
```

## Smart Features

- **Conversation History**: Resume exactly where the interview left off
- **Time Management**: Shows when drafts were created and last modified
- **Auto-Cleanup**: Old interviews automatically moved to drafts, very old drafts cleaned up
- **Context Preservation**: All previous answers and accumulated information preserved
- **Cross-Session**: Works across different Claude Code sessions - your work persists

## Integration with Other Commands

- Works seamlessly with `/create-task` for starting new work
- Accepts answers directly, eliminating need for separate answer command
- Integrates with `/thought` and `/idea` when they suggest task creation
- Connects to standard task creation workflow when interviews complete

## Clear Distinction

- **`/resume-draft`** = Continue creating/defining a task (task creation process)
- **`/work`** = Start working on an already-defined task (task execution process)
- No confusion between task definition vs task implementation