# Cross-Repository Backlog Aggregation System

This system provides comprehensive task management across all Loqa repositories with smart prioritization and filtering capabilities.

## Quick Start

```bash
# From the loqa repository root:
./tools/lb overview              # See all repositories at a glance
./tools/lb next                  # Get your recommended next task
./tools/lb list --priority=P1    # View high priority tasks
```

## System Overview

**Total Tasks Found**: 33 tasks across 5 repositories
- **loqa**: 22 tasks (main orchestration and planning)
- **loqa-hub**: 4 tasks (core service development)
- **loqa-commander**: 2 tasks (UI/dashboard work)
- **loqa-skills**: 3 tasks (plugin system work)
- **www-loqalabs-com**: 2 tasks (website development)

**Current Status**: All tasks are "To Do" (P2 priority), ready for prioritization and assignment.

## Available Commands

### Overview & Stats
```bash
./tools/lb overview              # Repository summary with task counts
./tools/lb stats                 # Detailed statistics + recent tasks
```

### Task Discovery
```bash
./tools/lb list                  # All active tasks in table format
./tools/lb next                  # AI-recommended next task to work on
./tools/lb repo loqa-hub         # Tasks for specific repository
./tools/lb search "github"       # Find GitHub-related tasks
./tools/lb priority P1           # All high-priority tasks
```

### Filtering & Formatting
```bash
./tools/lb list --priority=P2    # Filter by priority (P1/P2/P3)
./tools/lb list --status="To Do" # Filter by status
./tools/lb list --repo=loqa-hub  # Filter by repository
./tools/lb list --format=brief   # Compact format
./tools/lb list --format=json    # JSON output for scripts
./tools/lb list --include-done   # Include completed tasks
```

## Priority System

The system uses a three-tier priority system:

- **P1 (High)** - 🔴 Urgent, blocking other work
- **P2 (Medium)** - 🟡 Important, planned work (default)
- **P3 (Low)** - 🔵 Nice-to-have, future work

## Smart Task Selection

The `./tools/lb next` command uses intelligent prioritization:

1. **In Progress P1** tasks (resume urgent work)
2. **To Do P1** tasks (start urgent work)
3. **In Progress P2** tasks (continue planned work) 
4. **To Do P2** tasks (start planned work)
5. **Any other active** tasks

## Integration with Existing Workflow

### With Role-Based System
```bash
# Use role detection to find relevant tasks
/detect-role --title="GitHub operations" --description="Multi-repo coordination"
# Then filter tasks by detected role capabilities
./tools/lb search "github"
```

### With MCP Commands
```bash
# Create new tasks using MCP
/add-todo "Task title" --template=cross-repo-work --priority=High

# Then view in aggregator
./tools/lb list --priority=P1
```

### With Repository Dependencies
The system respects Loqa's dependency order:
1. **loqa-proto** (protocol definitions)
2. **loqa-skills** (plugin system)
3. **loqa-hub** (core service)
4. **loqa-relay** (audio client)
5. **loqa-commander** (UI dashboard)

## Task File Format

The aggregator parses these metadata patterns from backlog task files:

```markdown
# Task Title

## Metadata
- **Priority**: P1|P2|P3
- **Status**: To Do|In Progress|Done
- **Category**: Feature|Bug Fix|Documentation|etc.
- **Effort**: 1 day|1 week|etc.

## Description
Task description here...
```

## Output Examples

### Overview
```
=== Loqa Ecosystem - Backlog Overview ===

loqa:                     22 tasks   0 in progress  22 to do   0 P1  22 P2   0 P3
loqa-hub:                  4 tasks   0 in progress   4 to do   0 P1   4 P2   0 P3

=== TOTALS ===
All repositories:         33 tasks   0 in progress  33 to do   0 P1  33 P2   0 P3
```

### Task List
```
Repository          Task                                             Priority Status       Category       
==================== ================================================ ======== ============ ===============
loqa                 Hardware Evaluation Setup HA Voice PE dev       P2       To Do        General        
loqa-hub             Multi Relay Collision Detection and Arbit       P2       To Do        General        
loqa-commander       Plugin based Observer Widgets System            P2       To Do        General        
```

### Next Task Recommendation
```
=== Recommended Next Task ===

Repository: loqa
Task: Plugin based Commander Widgets System
Priority: P2
Status: To Do
File: /path/to/task/file.md

Recommended Actions:
1. cd /Users/anna/Projects/loqalabs/loqa
2. Edit task: /path/to/task/file.md
3. Update status to 'In Progress'
4. Create feature branch: git checkout -b feature/plugin-based-commander
```

## Advanced Usage

### Scripting Integration
```bash
# Get high priority tasks in JSON format
./tools/lb list --priority=P1 --format=json | jq '.priority'

# Count tasks by repository
./tools/lb list --format=json | jq -r '.repo' | sort | uniq -c

# Find blocking tasks
./tools/lb search "blocking\|urgent\|critical"
```

### Workflow Automation
```bash
# Check if there are any P1 tasks before starting new work
if ./tools/lb list --priority=P1 >/dev/null 2>&1; then
    echo "⚠️  High priority tasks exist!"
    ./tools/lb list --priority=P1
else
    echo "✅ Ready to start new work"
    ./tools/lb next
fi
```

## File Locations

- **Main Script**: `./tools/backlog-aggregator.sh`
- **Shortcut**: `./tools/lb` (symlink for convenience)
- **Documentation**: `./tools/README-BACKLOG-AGGREGATION.md`

## Repository Coverage

The system automatically scans these repositories for backlog tasks:
- `loqa/` - Main orchestration and project management
- `loqa-hub/` - Core service implementation
- `loqa-commander/` - Vue.js administrative dashboard
- `loqa-relay/` - Audio capture client
- `loqa-proto/` - Protocol definitions
- `loqa-skills/` - Plugin system
- `www-loqalabs-com/` - Marketing website
- `loqalabs-github-config/` - Organization configuration

## Performance Notes

- Compatible with bash 3.2+ (macOS default)
- Scans up to 8 repositories efficiently
- Colored output for better readability
- Handles missing repositories gracefully
- Temporary files cleaned up automatically