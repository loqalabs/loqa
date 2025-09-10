# TODO.md and BACKLOG.md Migration Summary

## Migration Completed: September 10, 2025

The legacy TODO.md and BACKLOG.md files have been successfully migrated to the new backlog.md system.

### Summary of Migration

**Total Tasks Created:** 18 tasks (located in `/Users/anna/Projects/loqalabs/loqa/backlog/tasks/`)

**High Priority (MVP Essential):**
- task-1: Hardware Evaluation Setup - HA Voice PE device for testing
- task-2: Self-Healing Implementation - Enhanced health check system with auto-restart  
- task-3: Hardware Testing - Test voice pipeline with physical hardware

**Medium Priority:**
- task-4: STT Pipeline Enhancement - Confidence thresholds and wake word normalization
- task-5: Multi-Command Intent Parsing - Support compound utterances and chaining
- task-6: Built-in Timer Skill - Local tracking with TTS countdown/complete response
- task-7: Privacy-by-Design Architecture - RAM-only voice processing by default
- task-9: Security-Aware Observability - Privacy-preserving failure debugging
- task-10: Unified System Versioning Architecture - Coordinated service versioning strategy

**Low Priority (Future/P3):**
- task-8: Commander UI Timeline Filtering - Filter by success, failure, or low-confidence events
- task-11: Advanced Developer Experience - CLI tools and skill development framework
- task-12: Privacy-First Update System - P2P distribution without cloud dependencies
- task-13: Skill Security & Trust Architecture - Signing and sandboxing for enterprise
- task-14: Comprehensive Self-Healing Architecture - AI-driven enterprise resilience
- task-15: Hardware Architecture & Manufacturing Strategy - Long-term hardware partnerships

**Completed Items (Historical Reference):**
- task-16: Repository Protection Migration - Rulesets to Branch Protection ✅ COMPLETED
- task-17: Tech Stack Modernization - Go 1.23→1.25, ESLint 8→9, Tailwind 3→4 ✅ COMPLETED
- task-18: Kokoro-82M TTS Integration - Professional natural voices ✅ COMPLETED

### How to Use the New System

**Important:** Run backlog commands from `/Users/anna/Projects/loqalabs/loqa/` directory:

```bash
cd /Users/anna/Projects/loqalabs/loqa/

# View all tasks in Kanban board
backlog board

# List tasks by status  
backlog tasks list

# View specific task details
backlog tasks view task-1

# Create new task
backlog tasks create "Task Title" -d "Description" --priority high --labels "label1,label2"

# Edit existing task
backlog tasks edit task-1

# Open web interface
backlog browser
```

### Old Files Status

- `TODO.md` → Moved to `TODO.md.legacy` (archived)
- `BACKLOG.md` → Moved to `BACKLOG.md.legacy` (archived)

All content has been preserved in the new backlog system with proper categorization, priorities, and labels.

### Next Steps

1. Use `backlog board` to view current task status
2. Update task priorities and assignments as needed
3. Use the new interactive commands from the MCP system to create new tasks
4. Remove or update any references to the old TODO.md/BACKLOG.md files in documentation