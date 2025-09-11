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
| **🚀 Phase 4 Automation Commands** |
| `/create-branch-from-task` | Manual branch creation | Automated feature branch creation from backlog tasks |
| `/run-integration-tests` | Manual testing coordination | Cross-service integration testing with Docker orchestration |
| `/create-pr-from-task` | Manual PR creation | Automated PR creation with task linking and templates |
| `/analyze-dependency-impact` | Manual impact assessment | Protocol change impact analysis across repositories |
| `/intelligent_task_prioritization` | Manual task selection | AI-enhanced task prioritization with multi-criteria scoring |

## 🎯 **Key Benefits**

### **Core Interactive Features:**
- **✅ Interactive**: Prompts for missing information instead of copy-paste
- **✅ Role-Aware**: Automatically detects and applies role specializations
- **✅ Integrated**: Directly creates files, issues, and updates projects
- **✅ Comprehensive**: Includes all workflow guidance and best practices
- **✅ Consistent**: Ensures proper branching, testing, and quality gates

### **Phase 4 Automation Enhancements:**
- **✅ End-to-End Automation**: Complete workflow from branch creation to PR management
- **✅ Cross-Repository Coordination**: Intelligent multi-repository awareness and coordination
- **✅ Quality Assurance Integration**: Automated testing with Docker orchestration
- **✅ Impact Analysis**: Proactive protocol change impact assessment
- **✅ Zero Manual Coordination**: Eliminates repetitive workflow tasks

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
- ✅ **AI-Enhanced Auto-Selection**: Multi-criteria intelligent scoring with role matching, time availability, and context analysis
- ✅ Manual task selection by ID or file path
- ✅ Full integration with backlog.md system and role specialization
- ✅ Automatic feature branch creation and status updates
- ✅ Priority and repository filtering for auto-selection
- ✅ Role-specific workflow optimization with intelligent reasoning

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

## 🚀 **Phase 4 Automation Commands**

### `/create-branch-from-task` - Automated Branch Creation

Creates feature branches from backlog tasks with consistent naming and proper git workflow.

**Usage:**
```bash
/create-branch-from-task                           # Auto-detect task from current context
/create-branch-from-task --taskId=21              # Create branch for specific task
/create-branch-from-task --taskId=5 --repository=loqa-hub  # Cross-repository branch creation
```

**Key Parameters:**
- `taskId`: Backlog task ID (e.g., '21', 'task-21') - auto-detected if not provided
- `taskFile`: Direct path to task file (alternative to taskId)
- `repository`: Target repository (auto-detected from current directory if not provided)
- `branchPrefix`: Branch prefix (default: 'feature')
- `switchToBranch`: Switch to new branch after creation (default: true)

**Features:**
- ✅ Smart branch naming: `feature/task-21-descriptive-title`
- ✅ Task file parsing for automatic title extraction
- ✅ Cross-repository support with auto-detection
- ✅ Git workflow integration (fetch, pull, create, switch)
- ✅ Comprehensive error handling and guidance

**Examples:**
```bash
/create-branch-from-task --taskId=21                # feature/task-21-plugin-based-widgets
/create-branch-from-task --taskFile=task-005-auth.md --branchPrefix=bugfix
/create-branch-from-task --taskId=12 --repository=loqa-commander --switchToBranch=false
```

### `/run-integration-tests` - Cross-Service Testing Automation

Runs integration tests with Docker Compose orchestration across multiple repositories.

**Usage:**
```bash
/run-integration-tests                             # Run all integration tests with Docker
/run-integration-tests --repositories=loqa-hub,loqa-relay  # Test specific services
/run-integration-tests --testSuites=e2e --cleanup=false   # Custom test configuration
```

**Key Parameters:**
- `repositories`: Specific repositories to test (defaults to core integration repos)
- `testSuites`: Test suites to run: integration, e2e (defaults to both)
- `dockerCompose`: Use Docker Compose orchestration (default: true)
- `cleanup`: Cleanup Docker services after testing (default: true)

**Features:**
- ✅ Docker Compose service orchestration (loqa-hub, stt, tts, ollama, nats)
- ✅ Multi-repository test execution in proper dependency order
- ✅ Flexible test suite selection (integration, e2e, custom)
- ✅ Service health monitoring and automatic cleanup
- ✅ Comprehensive reporting with timing and error analysis

**Examples:**
```bash
/run-integration-tests                             # Full integration test suite
/run-integration-tests --repositories=loqa-hub --testSuites=integration
/run-integration-tests --dockerCompose=false      # Skip Docker orchestration
```

### `/create-pr-from-task` - Automated PR Creation with Task Linking

Creates pull requests from feature branches with automatic task linking and structured templates.

**Usage:**
```bash
/create-pr-from-task                               # Auto-detect task from current branch
/create-pr-from-task --taskId=21 --draft=true     # Create draft PR for specific task
/create-pr-from-task --title="Custom Title" --baseBranch=develop  # Custom PR configuration
```

**Key Parameters:**
- `repository`: Target repository (auto-detected if not provided)
- `taskId`: Backlog task ID for linking (auto-detected from branch if not provided)
- `taskFile`: Direct path to task file (alternative to taskId)
- `title`: PR title (auto-generated from task if not provided)
- `branchName`: Source branch name (uses current branch if not provided)
- `baseBranch`: Target branch for PR (default: 'main')
- `draft`: Create as draft PR (default: false)

**Features:**
- ✅ Intelligent task detection from branch names (`feature/task-21-description`)
- ✅ Auto-generated PR titles and comprehensive body templates
- ✅ Automatic backlog task linking with relative URLs
- ✅ Structured checklists (changes, testing, task completion, quality gates)
- ✅ Cross-repository support with context awareness

**Examples:**
```bash
/create-pr-from-task                               # Auto-detect everything from context
/create-pr-from-task --taskId=21 --draft=true     # Draft PR with specific task link
/create-pr-from-task --title="Emergency Hotfix" --baseBranch=main --draft=false
```

### `/analyze-dependency-impact` - Protocol Change Impact Analysis

Analyzes impact of protocol changes across consuming repositories with risk assessment.

**Usage:**
```bash
/analyze-dependency-impact                         # Analyze recent proto changes
/analyze-dependency-impact --protoChanges=audio.proto,skills.proto  # Specific files
/analyze-dependency-impact --repository=loqa-proto --checkBreaking=true  # Custom analysis
```

**Key Parameters:**
- `protoChanges`: Specific proto files changed (auto-detected from git if not provided)
- `repository`: Protocol repository to analyze (default: 'loqa-proto')
- `checkBreaking`: Check for breaking changes (default: true)
- `analyzeDownstream`: Analyze impact on consuming repositories (default: true)

**Features:**
- ✅ Automatic protocol change detection from git history
- ✅ Cross-service impact mapping (loqa-hub, loqa-relay, loqa-skills, loqa-commander)
- ✅ Breaking change identification with risk assessment
- ✅ Effort estimation and coordination recommendations
- ✅ Build system specific change requirements (Go, Node.js)

**Examples:**
```bash
/analyze-dependency-impact                         # Analyze recent changes
/analyze-dependency-impact --protoChanges=audio.proto --checkBreaking=true
/analyze-dependency-impact --repository=loqa-proto --analyzeDownstream=false
```

### `/intelligent_task_prioritization` - AI-Enhanced Task Selection

Provides intelligent task prioritization across all repositories using multi-criteria AI scoring.

**Usage:**
```bash
/intelligent_task_prioritization                      # Get AI recommendations
/intelligent_task_prioritization --roleContext=developer --timeAvailable=2h  # Role-specific recommendations
/intelligent_task_prioritization --priority=P1 --repositoryFocus=loqa-hub     # Filtered analysis
```

**Key Parameters:**
- `roleContext`: Role specialization (architect/developer/devops/qa/github-cli-specialist/general/auto-detect)
- `timeAvailable`: Available time constraint (e.g., '30min', '2h', 'flexible')
- `repositoryFocus`: Focus on specific repository (e.g., 'loqa-hub', 'loqa-commander')
- `priority`: Filter by priority level (P1/P2/P3/High/Medium/Low)
- `criteria`: Custom scoring criteria array (priority, role-match, effort, impact, context)
- `showTop`: Number of alternative recommendations to show (default: 3)

**Features:**
- ✅ **Multi-Criteria AI Scoring**: Priority (40%), Status (20%), Role Match (20%), Time (10%), Context (10%)
- ✅ **Cross-Repository Analysis**: Scans all 8 Loqa repositories simultaneously
- ✅ **Intelligent Reasoning**: Provides detailed explanations for recommendations
- ✅ **Role-Based Keyword Matching**: Matches tasks to developer specializations
- ✅ **Time-Effort Correlation**: Recommends tasks that fit available time windows
- ✅ **Comprehensive Context Analysis**: Considers task content, category, and repository focus

**Examples:**
```bash
/intelligent_task_prioritization                      # General AI recommendations
/intelligent_task_prioritization --roleContext=architect --timeAvailable=flexible
/intelligent_task_prioritization --priority=P1 --repositoryFocus=loqa-hub --showTop=5
```

## 🔄 **Complete Automation Workflow**

### **End-to-End Development Automation:**
```bash
# 1. Get AI-enhanced task recommendations
/intelligent_task_prioritization --roleContext=developer --timeAvailable=2h

# 2. Create feature branch from recommended task
/create-branch-from-task --taskId=21

# 3. Develop features with quality assurance
/run-integration-tests --testSuites=integration,e2e

# 4. Create PR with automatic task linking
/create-pr-from-task  # Auto-detects task from branch

# 5. Analyze protocol change impact (if applicable)
/analyze-dependency-impact --protoChanges=audio.proto
```

### **Cross-Repository Coordination:**
```bash
# Multi-repository branch creation
/create-branch-from-task --taskId=15 --repository=loqa-hub
/create-branch-from-task --taskId=15 --repository=loqa-proto

# Coordinated testing across services
/run-integration-tests --repositories=loqa-hub,loqa-relay,loqa-skills

# Impact analysis for breaking changes
/analyze-dependency-impact --checkBreaking=true --analyzeDownstream=true
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

## 📊 **Benefits Over Manual Processes**

| Aspect | Manual Process | Interactive Commands | Phase 4 Automation |
|--------|----------------|---------------------|-------------------|
| **User Experience** | Copy-paste, manual editing | Interactive prompts | Intelligent automation |
| **Role Optimization** | Generic guidance | Role-specific specialization | Context-aware optimization |
| **Integration** | Manual file creation | Automatic project integration | End-to-end workflow automation |
| **Consistency** | Relies on user discipline | Enforced best practices | Automated consistency |
| **Maintenance** | Update multiple files | Single command enhancement | Self-maintaining automation |
| **Discovery** | Must know process exists | Commands are discoverable | Proactive suggestions |
| **Validation** | No validation | Parameter validation | Intelligent validation |
| **Context Awareness** | Static content | Dynamic, context-aware guidance | Multi-repository awareness |
| **Coordination** | Manual cross-repo work | Guided coordination | Automated coordination |
| **Quality Assurance** | Manual testing | Guided testing strategy | Automated testing orchestration |
| **Task Selection** | Manual priority sorting | Simple aggregator logic | AI-enhanced multi-criteria scoring |

## 🚨 **Migration Notes**

1. **Existing Template References**: Update any documentation or bookmarks to use the new commands
2. **Team Training**: Inform team members about the new interactive workflow
3. **Process Updates**: Update any documented processes to reference the new commands
4. **Cleanup**: The old template files are preserved for reference but should not be used

## 📚 **Related Documentation**

- **Role Configurations**: `/project/role-configs/README.md`
- **MCP Server Setup**: `/project/loqa-assistant-mcp/README.md`
- **Workflow Implementation**: `/project/WORKFLOW_IMPLEMENTATION_PLAN.md`
- **Backlog Management**: `/project/backlog/templates/README.md`

---

*This interactive command system provides a superior user experience while maintaining all the comprehensive guidance and best practices of the original template system.*