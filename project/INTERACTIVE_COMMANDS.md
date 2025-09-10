# Interactive Workflow Commands

This document describes the comprehensive interactive MCP commands that replace the previous copy-paste template system, providing a superior user experience for managing Loqa project workflows.

## 🚀 **Command Overview**

The following interactive commands replace the old prompt templates:

| Command | Replaces | Purpose |
|---------|----------|---------|
| `/start-task-work` | `ISSUE_WORK_PROMPT.md` | Unified backlog task workflow with auto-selection |
| `/plan-strategic-shift` | `STRATEGIC_SHIFT_PROMPT.md` | Strategic planning with phase-by-phase guidance |
| `/capture-comprehensive-thought` | Enhanced thought capture | Full workflow thought processing |
| `/start-complex-todo` | Enhanced task creation | Complex backlog task planning and breakdown |

## 🎯 **Key Benefits**

- **✅ Interactive**: Prompts for missing information instead of copy-paste
- **✅ Role-Aware**: Automatically detects and applies role specializations
- **✅ Integrated**: Directly creates files, issues, and updates projects
- **✅ Comprehensive**: Includes all workflow guidance and best practices
- **✅ Consistent**: Ensures proper branching, testing, and quality gates

## 📋 **Detailed Command Reference**

### `/start-task-work` - Unified Backlog Task Workflow

Unified command for starting work on backlog tasks with intelligent auto-selection or manual task specification.

**Usage:**
```bash
/start-task-work                                    # Auto-select next task
/start-task-work --taskId=task-1                   # Work on specific task
/start-task-work --priority=P1 --repository=loqa-hub # Auto-select from filtered tasks
```

**Key Parameters:**
- `taskId`: Specific backlog task ID (e.g., task-1, task-21) - leave empty for auto-selection
- `taskFile`: Direct path to backlog task file (alternative to taskId)
- `autoSelect`: Auto-select next recommended task (default: true if no taskId/taskFile)
- `priority`: Filter auto-selection by priority level (P1/P2/P3)
- `repository`: Filter auto-selection by repository
- `roleContext`: Role specialization (architect/developer/devops/qa/github-cli-specialist/general/auto-detect)
- `createBranch`: Create feature branch for this task (default: true)
- `updateStatus`: Update task status to 'In Progress' (default: true)
- `testingRequirements`: Override default testing requirements

**Features:**
- ✅ Intelligent auto-selection using ./tools/lb next aggregator logic
- ✅ Manual task selection by ID or file path
- ✅ Full integration with backlog.md system and role specialization
- ✅ Automatic feature branch creation and status updates
- ✅ Priority and repository filtering for auto-selection
- ✅ Role-specific workflow optimization

**Examples:**
```bash
/start-task-work                                    # Auto-select next recommended task
/start-task-work --taskId=task-19                   # Work on specific high-priority task
/start-task-work --priority=P1                      # Auto-select next P1 task
/start-task-work --repository=loqa-hub --roleContext=developer # Hub-specific development work
```

### `/plan-strategic-shift` - Strategic Planning

Replaces `STRATEGIC_SHIFT_PROMPT.md` with interactive strategic shift planning.

**Usage:**
```bash
/plan-strategic-shift
```

**Key Parameters:**
- `shiftType` (required): Type of shift (focus/technology/approach/design-philosophy/branding)
- `currentState` (required): What we're shifting away from
- `desiredState` (required): What we're shifting toward
- `motivation` (required): Why this shift is needed
- `urgency`: Priority level (critical/high/medium/low)
- `roleContext`: Role specialization for planning perspective

**Features:**
- ✅ 5-phase strategic planning process
- ✅ Role-specific planning considerations
- ✅ Multi-repository coordination planning
- ✅ Constraint and risk analysis
- ✅ Comprehensive documentation updates

**Example:**
```bash
/plan-strategic-shift --shiftType=technology --currentState="REST APIs" --desiredState="gRPC throughout" --motivation="Performance and type safety"
```

### `/capture-comprehensive-thought` - Enhanced Thought Capture

Enhanced version of thought capture with full workflow integration.

**Usage:**
```bash
/capture-comprehensive-thought
```

**Key Parameters:**
- `thought` (required): The idea, concern, or consideration
- `context`: What triggered this thought
- `category`: Thought category (technical-architecture/privacy-security/etc.)
- `timeline`: When to revisit (next-sprint/next-quarter/etc.)
- `impactLevel`: Impact assessment (low/medium/high/critical)
- `roleContext`: Role specialization for processing

**Features:**
- ✅ Role-based thought categorization
- ✅ Backlog system integration (backlog.md CLI, board view, web interface)
- ✅ Review trigger setting
- ✅ Connection to related work
- ✅ Automatic file organization

**Example:**
```bash
/capture-comprehensive-thought --thought="Need offline-first update mechanism" --category=technical-architecture --impactLevel=high
```

### `/start-complex-todo` - Enhanced Task Creation

Enhanced backlog task creation with comprehensive planning and role optimization.

**Usage:**
```bash
/start-complex-todo
```

**Key Parameters:**
- `title` (required): Task title
- `category` (required): Task category (feature/bug-fix/technical-debt/etc.)
- `priority` (required): Priority level (P1/P2/P3)
- `description`: Detailed task description
- `acceptanceCriteria`: What does 'done' look like
- `estimatedEffort`: Time estimate
- `roleContext`: Role specialization for task structure
- `breakdown`: Whether to break down into smaller tasks

**Features:**
- ✅ Role-specific task structuring
- ✅ Complexity analysis and breakdown recommendations
- ✅ Quality gates establishment
- ✅ Automatic template selection
- ✅ Integration with backlog system

**Example:**
```bash
/start-complex-todo --title="Implement collision detection" --category=feature --priority=P1 --breakdown=true
```

## 🎭 **Role Specialization**

All commands support automatic role detection or manual role selection:

### **Available Roles:**
- **architect**: System design, architecture decisions, protocol changes
- **developer**: Feature implementation, bug fixes, code optimization  
- **devops**: Infrastructure, deployment, monitoring, containerization
- **qa**: Testing strategy, quality assurance, validation processes
- **github-cli-specialist**: Multi-repository GitHub operations and workflow coordination
- **general**: Multi-disciplinary tasks, documentation, planning
- **auto-detect**: Automatic role selection based on task content

### **Role Detection:**
Commands automatically analyze your task content and select the most appropriate role specialization, providing:

- ✅ Role-specific best practices and methodologies
- ✅ Optimized workflow guidance
- ✅ Appropriate tool and framework recommendations
- ✅ Role-focused quality gates and completion criteria

## 🔄 **Migration from Templates**

### **Old Workflow (Deprecated):**
1. Copy template from `*_PROMPT.md` file
2. Manually fill in placeholders
3. Paste into Claude
4. Follow static guidance

### **New Workflow (Current):**
1. Run interactive command (e.g., `/start-issue-work`)
2. Answer prompts or provide parameters
3. Receive role-optimized, comprehensive guidance
4. Automatic integration with project systems

### **Migration Complete:**
✅ All copy-paste templates have been replaced with interactive commands  
✅ Template files have been removed from the repository  
✅ Full integration with backlog.md system established

## 🛠️ **Advanced Usage**

### **Chaining Commands:**
```bash
# Start with strategic planning
/plan-strategic-shift --shiftType=technology --currentState="monolith" --desiredState="microservices"

# Create implementation tasks
/start-complex-todo --title="Extract user service" --category=feature --priority=P1

# Work on backlog tasks
/start-task-work --priority=P1 --roleContext=developer
```

### **Role-Specific Workflows:**
```bash
# Architecture-focused approach
/start-task-work --roleContext=architect

# DevOps-focused approach  
/start-task-work --roleContext=devops

# GitHub CLI specialist for multi-repo work
/start-task-work --roleContext=github-cli-specialist

# QA-focused approach
/start-task-work --roleContext=qa
```

## 📋 **Backlog.md System Integration**

All interactive commands are designed to work seamlessly with the backlog.md task management system:

### **Key Integration Points:**
- **📝 Task Creation**: Commands automatically create tasks in `backlog/tasks/` directory
- **💭 Thought Capture**: Ideas saved to `backlog/drafts/` for later processing
- **📊 Board View**: Use `backlog board view` to see Kanban-style task organization
- **🌐 Web Interface**: Access via `backlog browser` for rich editing and management
- **🔄 Workflow**: Thoughts can be promoted to formal tasks using `/start-complex-todo`

### **Workflow Integration:**
```bash
# Capture initial idea
/capture-comprehensive-thought --thought="Need better error handling"

# Convert to formal task when ready
/start-complex-todo --title="Implement centralized error handling" --priority=P2

# Work on backlog task with automated selection
/start-task-work --priority=P1 --roleContext=developer

# View progress in backlog system
backlog board view    # Terminal Kanban view
backlog browser       # Web interface
```

### **File Organization:**
```
backlog/
├── tasks/           # Formal tasks created by /start-complex-todo
│   ├── task-001-implement-auth.md
│   └── task-002-fix-logging.md
├── drafts/          # Thoughts captured by /capture-comprehensive-thought
│   ├── thought-2024-01-15-auth-improvement.md
│   └── thought-2024-01-16-performance-ideas.md
└── templates/       # Task templates for different types of work
    ├── bug-fix-template.md
    ├── feature-template.md
    └── general-task-template.md
```

## 📊 **Benefits Over Templates**

| Aspect | Templates | Interactive Commands |
|--------|-----------|---------------------|
| **User Experience** | Copy-paste, manual editing | Interactive prompts |
| **Role Optimization** | Generic guidance | Role-specific specialization |
| **Integration** | Manual file creation | Automatic project integration |
| **Consistency** | Relies on user discipline | Enforced best practices |
| **Maintenance** | Update multiple files | Single command enhancement |
| **Discovery** | Must know template exists | Commands are discoverable |
| **Validation** | No validation | Parameter validation |
| **Context Aware** | Static content | Dynamic, context-aware guidance |

## 🚨 **Migration Notes**

1. **Existing Template References**: Update any documentation or bookmarks to use the new commands
2. **Team Training**: Inform team members about the new interactive workflow
3. **Process Updates**: Update any documented processes to reference the new commands
4. **Cleanup**: The old template files are preserved for reference but should not be used

## 📚 **Related Documentation**

- **Role Configurations**: `/project/role-configs/README.md`
- **MCP Server Setup**: `/project/loqa-rules-mcp/README.md`
- **Workflow Implementation**: `/project/WORKFLOW_IMPLEMENTATION_PLAN.md`
- **Backlog Management**: `/project/backlog/templates/README.md`

---

*This interactive command system provides a superior user experience while maintaining all the comprehensive guidance and best practices of the original template system.*