# Loqa Unified Development Command - Developer User Guide

This guide provides comprehensive documentation for Loqa's unified `/loqa` command with discoverable categories and AI-enhanced automation. The command streamlines development tasks through intelligent task selection, cross-repository coordination, and predictive workflow intelligence.

## 🚨 **IMPORTANT: Unified Command Structure**

**The unified `/loqa` command structure:**
- `/loqa` - Show available categories (task, dev, plan, capture)
- `/loqa [category]` - Show actions for a category  
- `/loqa [category] [action] [args]` - Execute specific command

## 📋 **Complete Command Reference**

**For the authoritative command structure**, see: `/project/claude-code-commands/loqa.md`

The unified `/loqa` command provides discoverable categories with full functionality.

## 🚀 Installation

**One-command installation:**
```bash
curl -fsSL "https://raw.githubusercontent.com/loqalabs/loqa/main/project/claude-code-commands/install.sh" | bash
```

**Or clone and install manually:**
```bash
git clone https://github.com/loqalabs/loqa.git
cd loqa/project/claude-code-commands
./install.sh
```

**Custom installation:**
```bash
./install.sh --dir /custom/path    # Install to custom directory
./install.sh --force              # Overwrite existing commands
```

## Quick Start

For immediate productivity, use the **unified `/loqa` command** with discoverable categories:

```bash
/loqa                           # Show all available categories and usage
/loqa dev work                  # AI-enhanced task selection and workflow setup
/loqa task create "description" # Interactive task creation with AI-powered templates
/loqa capture idea "content"    # Intelligent feature idea capture with categorization  
/loqa capture thought "content" # Technical thought capture with smart analysis
/loqa dev branch --taskId=21    # Interactive branch creation from tasks
/loqa dev pr --draft=true       # Interactive PR creation with quality checklists
/loqa plan strategy "title"     # Strategic planning with comprehensive impact analysis
/loqa dev analyze --repository=loqa-hub # Protocol analysis with cross-repo impact
```

**✨ Revolutionary Interactive Experience**: All commands now work conversationally! Simply run them without parameters to get:

- 🗣️ **Natural Language Input**: Describe your intent in your own words
- 🤖 **AI-Powered Suggestions**: Get intelligent parameter recommendations
- 🔍 **Guided Questions**: Follow-up questions to refine your approach
- ✅ **Smart Confirmation**: Review and modify before execution
- 🔄 **Full Compatibility**: Traditional parameter syntax still works perfectly

**Example Interactive Flow:**
```bash
/loqa task create
# → "Please describe the task you'd like to create in your own words..."
# → You: "I need to fix the memory leak in audio processing"
# → AI: "I suggest: Title: 'Fix memory leak in audio processing module', 
#       Template: bug-fix, Priority: High, Tags: performance,technical-debt"
# → You: "Looks good!"
# → Creates structured task automatically
```

## Command Categories

### 🎯 **Core Workflow Commands**

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/loqa dev work` | Begin working on backlog tasks with intelligent selection | Starting development work, need guidance on what to work on |
| `/loqa plan recommend` | Get AI-enhanced task recommendations | Unsure which task to tackle next, want optimized suggestions |
| `/loqa capture thought` | Quickly capture technical thoughts and concerns | Have a technical concern that needs to be recorded for later |
| `/loqa capture idea` | Quickly capture feature ideas and improvements | Have a feature idea or improvement that needs to be recorded |
| `/loqa task create` | Create detailed, structured tasks in the backlog | Planning complex work that needs to be broken down |

### 🚀 **Git & GitHub Automation**

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/loqa dev branch` | Create properly named feature branches from tasks | Ready to start implementation work on a task |
| `/loqa dev pr` | Create structured PRs with automatic task linking | Feature is complete and ready for review |
| `/loqa dev test` | Run comprehensive cross-service tests | Need to validate changes across multiple services |
| `/loqa dev analyze` | Analyze protocol changes across repositories | Making changes to shared protocols or APIs |

### 🎨 **Strategic Planning**

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/loqa plan strategy` | Plan major architectural or technology changes | Considering significant changes to technology stack or approach |

## Key Features

### ✨ **Intelligent Automation**
- **AI-Enhanced Task Selection**: Multi-criteria scoring considers priority, role fit, time constraints, and context
- **Automatic Role Detection**: Commands adapt based on detected work type (architect, developer, devops, qa, etc.)
- **Cross-Repository Awareness**: Understands dependencies and coordination needs across all Loqa services
- **Quality Gate Integration**: Ensures all testing and validation requirements are met

### 📝 **Seamless Integration**
- **Backlog.md System**: Direct integration with Loqa's task management system
- **GitHub Workflow**: Automated branch creation, PR generation, and issue linking
- **Docker Orchestration**: Automated testing with proper service coordination
- **Protocol Analysis**: Impact assessment for gRPC and API changes

---

# Complete Command Reference

## 🎯 Core Workflow Commands

### `/loqa dev work` - Begin Development Work

**Purpose**: The primary command for starting development work. **Interactive mode** asks about your preferences and intelligently recommends the best tasks for you.

**Interactive Usage (Recommended):**
```bash
/loqa dev work           # Starts guided workflow asking about your preferences
# → "What kind of work would you like to focus on today?"
# → AI suggests 2-3 optimal tasks based on your response
# → Select and begin work automatically
```

**Traditional Usage:**
```bash
/loqa dev work --taskId=task-21   # Work on a specific task
/loqa dev work --priority=P1 --repository=loqa-hub   # Filter and auto-select
```

**Key Features:**
- 🤖 **AI Task Selection**: Automatically chooses the optimal next task based on priority, your role, available time, and context
- 🌱 **Auto Branch Creation**: Creates properly named feature branches (`feature/task-21-descriptive-name`)
- 📄 **Backlog Integration**: Updates task status and integrates with the backlog.md system
- 🔍 **Role Adaptation**: Provides specialized guidance based on your role (developer, architect, devops, etc.)

**Parameters:**
- `taskId`: Work on specific task (e.g., `task-21`)
- `priority`: Filter auto-selection (`P1`, `P2`, `P3`)
- `repository`: Focus on specific repo (`loqa-hub`, `loqa-commander`, etc.)
- `roleContext`: Set role manually (`developer`, `architect`, `devops`, `qa`)

**Examples:**
```bash
# Let AI choose the best task for you
/loqa dev work

# Work on a high-priority Hub service task
/loqa dev work --priority=P1 --repository=loqa-hub

# Work as an architect on system design tasks
/loqa dev work --roleContext=architect
```

**When to Use:**
- ✅ Starting your development session
- ✅ Need guidance on what to work on next
- ✅ Want automatic branch creation and task setup
- ✅ Need role-specific workflow optimization

### `/loqa plan recommend` - Get AI Task Recommendations

**Purpose**: Get intelligent, AI-powered recommendations for which task to work on next.

**Usage:**
```bash
/loqa plan recommend                    # Get general recommendations
/loqa plan recommend --roleContext=developer --timeAvailable=2h
```

**Key Features:**
- 🤖 **Multi-Criteria AI Scoring**: Analyzes priority (40%), status (20%), role match (20%), time fit (10%), context (10%)
- 🔍 **Cross-Repository Scanning**: Reviews tasks across all 8 Loqa repositories
- ⏱️ **Time-Aware**: Matches tasks to your available time window
- 👥 **Role Optimization**: Recommends tasks that match your specialization

**Parameters:**
- `roleContext`: Your role (`developer`, `architect`, `devops`, `qa`, `auto-detect`)
- `timeAvailable`: Time constraint (`30min`, `2h`, `flexible`)
- `repositoryFocus`: Focus on specific repo
- `priority`: Filter by priority level
- `showTop`: Number of recommendations (default: 3)

**Example Output:**
```
🏆 Recommended Task: task-21-implement-auth-middleware (Score: 9.2/10)
   Priority: P1 | Effort: 2-3h | Role Match: developer (95%)
   Repository: loqa-hub | Context: Authentication enhancement
   
   Reasoning: High-priority security task matching your developer role perfectly.
```

**When to Use:**
- ❓ Unsure what to work on next
- ⏱️ Have limited time and want optimal task selection
- 🎯 Want tasks that match your role and expertise
- 📈 Need to understand task priorities across repositories

### `/loqa capture thought` and `/loqa capture idea` - Capture Ideas and Notes

**Purpose**: Quickly capture ideas, technical insights, concerns, or observations using **interactive workflows** that help structure and categorize your thoughts.

**Interactive Usage (Recommended):**
```bash
/loqa capture thought    # Starts guided workflow for technical thoughts
# → "Please describe your technical thought, concern, or insight..."
# → AI suggests appropriate tags, context, and categorization
# → Confirm and save structured thought

/loqa capture idea      # Starts guided workflow for feature ideas  
# → "Please describe your feature idea..."
# → AI suggests relevant tags and proper categorization
# → Confirm and save structured idea
```

**Traditional Usage:**
```bash
/loqa capture thought "Memory leak in audio processing" --tags=technical-debt,performance
/loqa capture idea "Add real-time collaboration" --tags=feature,collaboration --context="user feedback"
```

**Key Features:**
- 📝 **Smart Categorization**: Automatically categorizes by type (architecture, feature-idea, technical-debt, etc.)
- 🔗 **Backlog Integration**: Saves to `backlog/drafts/` for later processing
- ⏰ **Timeline Tracking**: Sets review dates and urgency levels
- 📋 **Conversion Ready**: Can be promoted to formal tasks using `/start-complex-todo`

**Categories:**
- `architecture`: System design ideas and concerns
- `feature-idea`: New feature concepts
- `technical-debt`: Code quality improvements needed
- `process-improvement`: Workflow and development process ideas
- `research-topic`: Things that need investigation
- `bug-insight`: Observations about bugs or potential issues
- `optimization`: Performance or efficiency improvements

**Quick Examples:**
```bash
# Technical concern (use /loqa capture thought)
/loqa capture thought
# "Need to investigate memory leaks in audio processing"

# Architecture insight (use /loqa capture thought) 
/loqa capture thought
# "Consider using NATS for inter-service communication instead of direct gRPC"

# Feature idea (use /loqa capture idea)
/loqa capture idea
# "Add real-time collaboration features for voice commands"
```

**When to Use:**
- 💡 Had an idea while working on something else
- 🔍 Noticed a potential problem or improvement
- 📄 Need to record something for later investigation
- ⚙️ Thinking about process or architecture improvements

### `/loqa task create` - Create Detailed Tasks

**Purpose**: Create comprehensive, well-structured tasks using **interactive workflows** that guide you through proper planning and breakdown.

**Interactive Usage (Recommended):**
```bash
/loqa task create        # Starts guided task creation workflow
# → "Please describe the task you'd like to create in your own words..."
# → AI suggests title, template, priority, type, and assignee
# → Review and modify suggestions before creating
# → Creates structured task with proper breakdown
```

**Traditional Usage:**
```bash
/loqa task create --title="Implement auth middleware" --template=feature --priority=High
```

**Key Features:**
- 📝 **Template-Based**: Uses appropriate templates (feature, bug-fix, protocol-change, etc.)
- 🧩 **Smart Breakdown**: Suggests breaking complex tasks into manageable subtasks
- 🎯 **Acceptance Criteria**: Helps define clear completion criteria
- 📅 **Effort Estimation**: Provides time estimates and complexity analysis

**Task Categories:**
- `feature`: New functionality or enhancements
- `bug-fix`: Defect resolution and fixes
- `technical-debt`: Code quality improvements
- `documentation`: Documentation creation or updates
- `devops-infrastructure`: Deployment, CI/CD, monitoring
- `research-exploration`: Investigation and proof-of-concept work
- `security-compliance`: Security improvements and compliance

**Example Workflow:**
```
1. Run: /loqa task create
2. Title: "Implement real-time voice activity detection"
3. Category: feature
4. Priority: P1
5. Gets automatic breakdown into:
   - Research VAD algorithms
   - Implement VAD in audio pipeline
   - Add VAD configuration options
   - Write tests for VAD functionality
   - Update documentation
```

**When to Use:**
- 🛠️ Planning significant new work
- 📈 Need to break down complex requirements
- 🔄 Converting captured thoughts/ideas into formal tasks
- 📋 Want structured task planning with proper templates

### `/loqa plan strategy` - Plan Major Changes

**Purpose**: Plan significant architectural, technology, or strategic changes using **interactive workflows** that guide you through comprehensive analysis and risk assessment.

**Interactive Usage (Recommended):**
```bash
/loqa plan strategy      # Starts guided strategic planning workflow
# → "Please describe the strategic change you're planning..."
# → AI suggests title, type, risk level, scope, and timeline
# → Guided questions about drivers, concerns, and constraints
# → Creates comprehensive 5-phase strategic plan
```

**Traditional Usage:**
```bash
/loqa plan strategy --title="Migrate to gRPC" --type=technology --description="Replace REST with gRPC"
```

**Key Features:**
- 📋 **5-Phase Planning**: Analysis, Design, Implementation, Migration, Validation
- 🔄 **Multi-Repository Impact**: Considers all affected services and repositories
- ⚠️ **Risk Assessment**: Identifies potential risks and mitigation strategies
- 🗺️ **Coordination Planning**: Plans cross-team and cross-repository coordination

**Shift Types:**
- `technology`: Changing tech stack or tools
- `architecture`: System design changes
- `approach`: Development or operational approach changes
- `focus`: Product or business focus shifts

**When to Use:**
- 🔄 Considering major technology changes (e.g., REST → gRPC)
- 🏢 Architectural refactoring (e.g., monolith → microservices)
- 📋 Process changes (e.g., testing strategy overhaul)
- 📈 Strategic product direction changes

---

## 🚀 Git & GitHub Automation Commands

### `/loqa dev branch` - Create Feature Branches

**Purpose**: Create properly named feature branches using **interactive workflows** that help you select tasks and target repositories.

**Interactive Usage (Recommended):**
```bash
/loqa dev branch         # Starts guided branch creation workflow
# → "What task or work would you like to create a branch for?"
# → Shows available tasks if no specific task mentioned
# → AI suggests branch prefix, repository, and naming
# → Creates and switches to properly named branch
```

**Traditional Usage:**
```bash
/loqa dev branch --taskId=21      # Create branch for specific task
/loqa dev branch task-21 --repository=loqa-hub --branchPrefix=bugfix
```

**Key Features:**
- 🏷️ **Smart Naming**: Creates branches like `feature/task-21-implement-auth-middleware`
- 🔄 **Proper Git Flow**: Automatically fetches latest, creates branch, switches to it
- 📂 **Cross-Repository**: Works across all Loqa repositories
- 📝 **Task Integration**: Reads task files to extract descriptive titles

**Parameters:**
- `taskId`: Task ID (e.g., `21`, `task-21`)
- `repository`: Target repo (auto-detected if not specified)
- `branchPrefix`: Branch prefix (`feature`, `bugfix`, `hotfix`)

**Example Output:**
```bash
✅ Created branch: feature/task-21-implement-auth-middleware
✅ Switched to new branch
✅ Ready for development on task-21
```

**When to Use:**
- 🌱 Ready to start implementation work on a task
- 🔄 Need proper feature branch with consistent naming
- 📋 Following Loqa's mandatory branching workflow

### `/loqa dev test` - Run Cross-Service Tests

**Purpose**: Execute comprehensive integration tests across Loqa services with Docker orchestration.

**Usage:**
```bash
/loqa dev test                             # Run all integration tests
/loqa dev test --repositories=loqa-hub,loqa-relay
```

**Key Features:**
- 🐳 **Docker Orchestration**: Automatically starts required services (hub, stt, tts, ollama, nats)
- 🔗 **Service Coordination**: Tests services in proper dependency order
- 📊 **Comprehensive Reporting**: Detailed results with timing and error analysis
- 🧩 **Smart Cleanup**: Automatically cleans up Docker services after tests

**Test Suites:**
- `integration`: Service-to-service communication tests
- `e2e`: End-to-end workflow tests
- `performance`: Load and performance tests

**Example Output:**
```bash
🔄 Starting Docker services: hub, stt, tts, ollama, nats
✅ All services healthy
🧪 Running integration tests for loqa-hub...
🧪 Running e2e tests for voice pipeline...
✅ All tests passed (45 tests, 3m 42s)
🧩 Cleaning up Docker services
```

**When to Use:**
- ⚙️ Before creating pull requests
- 🔄 After making changes that affect service communication
- 📊 Validating system health across repositories
- ✅ As part of quality gate validation

### `/loqa dev pr` - Create Pull Requests

**Purpose**: Create structured pull requests using **interactive workflows** that guide you through comprehensive descriptions and quality checks.

**Interactive Usage (Recommended):**
```bash
/loqa dev pr                      # Starts guided PR creation workflow
# → "Please describe what you've accomplished in this pull request..."
# → AI suggests title, type, and comprehensive description
# → Guided quality checklist (tests, docs, breaking changes)
# → Creates structured PR with proper task linking
```

**Traditional Usage:**
```bash
/loqa dev pr --taskId=21 --draft=true --title="Implement auth middleware"
```

**Key Features:**
- 🔗 **Smart Task Detection**: Extracts task info from branch names like `feature/task-21-description`
- 📝 **Structured Templates**: Auto-generates comprehensive PR descriptions
- ✅ **Quality Checklists**: Includes testing, validation, and completion checklists
- 📄 **Backlog Integration**: Links directly to backlog tasks with relative URLs

**Auto-Generated PR Template:**
```markdown
## Summary
Implements authentication middleware (task-21)

## Changes
- [ ] Added JWT validation middleware
- [ ] Updated API endpoint protection
- [ ] Added authentication tests

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass  
- [ ] Manual testing completed

## Task Completion
- [ ] All acceptance criteria met
- [ ] Documentation updated
- [ ] Quality gates passed

**Related Task**: [task-21](../backlog/tasks/task-021-implement-auth-middleware.md)
```

**Parameters:**
- `taskId`: Specific task ID (auto-detected from branch)
- `draft`: Create as draft PR
- `baseBranch`: Target branch (default: `main`)

**When to Use:**
- ✅ Feature implementation is complete
- 📋 Ready for code review
- 🔗 Want proper task linking and documentation

### `/loqa dev analyze` - Analyze Protocol Changes

**Purpose**: Analyze the impact of protocol and API changes using **interactive workflows** that guide you through comprehensive impact assessment.

**Interactive Usage (Recommended):**
```bash
/loqa dev analyze                 # Starts guided protocol analysis workflow
# → "Please describe the protocol or API changes you're planning..."
# → AI suggests change type, affected files, and risk level
# → Guided questions about compatibility and rollout timeline
# → Provides comprehensive impact analysis and coordination plan
```

**Traditional Usage:**
```bash
/loqa dev analyze --protoChanges=audio.proto,skills.proto --changeType=breaking
```

**Key Features:**
- 🔍 **Change Detection**: Automatically detects protocol changes from git history
- 🗺️ **Impact Mapping**: Maps changes to consuming services (hub, relay, skills, commander)
- ⚠️ **Breaking Change Analysis**: Identifies potentially breaking changes
- 📋 **Coordination Planning**: Provides step-by-step coordination recommendations

**Example Analysis Output:**
```bash
🔍 Detected Changes:
  - audio.proto: Added new StreamingConfig message
  - skills.proto: Modified SkillRequest structure

⚠️ Impact Assessment:
  ✅ loqa-hub: Minor changes, regenerate bindings
  ⚠️ loqa-relay: Breaking change - update streaming logic
  ✅ loqa-skills: Compatible change
  📋 loqa-commander: UI updates needed for new config

🗺️ Recommended Coordination:
  1. Update loqa-proto and regenerate bindings
  2. Create feature branches in affected repos
  3. Update loqa-relay streaming implementation
  4. Test cross-service integration
  5. Deploy in coordination order
```

**When to Use:**
- 🔄 Making changes to gRPC protocol definitions
- 🔗 Modifying shared APIs or data structures
- 🗺️ Planning coordinated updates across services
- ⚠️ Assessing risk before major protocol changes


---

## 🔄 Complete Development Workflows

### 🎆 **Complete Feature Development Workflow**

**Scenario**: You're starting your development session and want to work on the most impactful task.

```bash
# 1. Get AI recommendations for what to work on
/loqa plan recommend --roleContext=developer --timeAvailable=3h

# 2. Start working on the recommended task
/loqa dev work --taskId=21

# 3. Create feature branch (if not auto-created)
/loqa dev branch --taskId=21

# [Do your development work]

# 4. Run integration tests before PR
/loqa dev test

# 5. Create pull request with task linking
/loqa dev pr
```

### 🔗 **Cross-Repository Protocol Changes**

**Scenario**: You're making changes to gRPC protocols that affect multiple services.

```bash
# 1. Plan the strategic change
/loqa plan strategy --shiftType=technology

# 2. Analyze impact across services
/loqa dev analyze --protoChanges=audio.proto,skills.proto

# 3. Create coordinated branches
/loqa dev branch --taskId=15 --repository=loqa-proto
/loqa dev branch --taskId=15 --repository=loqa-hub
/loqa dev branch --taskId=15 --repository=loqa-relay

# [Make coordinated changes]

# 4. Test integration across services
/loqa dev test --repositories=loqa-hub,loqa-relay,loqa-skills

# 5. Create coordinated PRs
/loqa dev pr --repository=loqa-proto
/loqa dev pr --repository=loqa-hub
/loqa dev pr --repository=loqa-relay
```

### 💡 **Idea to Implementation Workflow**

**Scenario**: You had an idea while working on something else and want to process it properly.

```bash
# 1. Capture the initial idea
/loqa capture idea
# "Need real-time collaboration features for voice commands"

# 2. Convert to formal task when ready
/loqa task create --title="Implement real-time collaboration" --category=feature

# 3. Start implementation
/loqa dev work --taskId=25

# 4. Follow standard development workflow...
```

---

## 👥 Role-Based Development

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

---

## 📋 Practical Usage Examples

### 🌅 **Starting Your Day**

**You want to start development work but aren't sure what to prioritize.**

```bash
# Get AI recommendations based on your role and available time
/loqa plan recommend --roleContext=developer --timeAvailable=4h

# Start the recommended task with automatic setup
/loqa dev work --taskId=21
```

### 💡 **Capturing Ideas During Work**

**You're working on authentication and realize you need better error handling.**

```bash
# Quickly capture the thought without losing focus
/loqa capture thought
# Enter: "Need centralized error handling for auth failures"
# Category: technical-debt
# Impact: medium
```

### 🔗 **Working Across Multiple Repos**

**You're implementing a new gRPC service that affects hub and relay.**

```bash
# Start with impact analysis
/loqa dev analyze-dependency-impact --protoChanges=newservice.proto

# Create coordinated branches
/create-branch-from-task --taskId=33 --repository=loqa-proto
/create-branch-from-task --taskId=33 --repository=loqa-hub  
/create-branch-from-task --taskId=33 --repository=loqa-relay

# After development, run integration tests
/run-integration-tests --repositories=loqa-hub,loqa-relay

# Create coordinated PRs
/create-pr-from-task --repository=loqa-proto
/create-pr-from-task --repository=loqa-hub
/create-pr-from-task --repository=loqa-relay
```

### 🏢 **Planning Major Changes**

**You want to migrate from REST to gRPC for better performance.**

```bash
# Plan the strategic shift
/loqa plan strategy-strategic-shift
# Type: technology
# From: REST APIs
# To: gRPC throughout
# Motivation: Performance and type safety
```

### 📦 **Converting Ideas to Tasks**

**You captured a thought earlier and now want to work on it.**

```bash
# Check your captured thoughts
backlog task list --status=draft

# Convert the idea to a formal task
/start-complex-todo
# Title: "Implement centralized error handling"
# Category: technical-debt
# Priority: P2

# Start working on it
/loqa dev work --taskId=34
```

---

## 🔧 Advanced Usage & Tips

### ⚙️ **Command Parameters Tips**

**Most parameters are optional and auto-detected:**
```bash
# Minimal usage - let AI decide everything
/loqa dev work

# Specific usage - control what you need
/loqa dev work --priority=P1 --repository=loqa-hub

# Role-specific usage - get specialized guidance  
/loqa dev work --roleContext=architect
```

**Smart auto-detection works across commands:**
```bash
# These commands auto-detect task from current branch:
/create-pr-from-task
/run-integration-tests
/loqa dev analyze-dependency-impact
```

### 🔗 **Cross-Repository Coordination**

**When working across multiple repositories:**

1. **Always analyze impact first:**
   ```bash
   /loqa dev analyze-dependency-impact
   ```

2. **Create branches in dependency order:**
   - loqa-proto (if protocol changes)
   - loqa-hub (core service)
   - loqa-relay (client service)
   - loqa-skills (if skills affected)
   - loqa-commander (if UI changes)

3. **Test integration comprehensively:**
   ```bash
   /run-integration-tests --repositories=affected-repos
   ```

4. **Coordinate PR reviews and merges**

### 🎯 **Role Optimization Tips**

**Let commands auto-detect your role for optimal guidance:**
- Commands analyze task content, files, and context
- Provide role-specific best practices and quality gates
- Adapt guidance as your work evolves

**Override role detection when needed:**
```bash
# Force architect perspective for development task
/loqa dev work --roleContext=architect --taskId=21

# Use github-cli-specialist for complex multi-repo work
/loqa dev pr --roleContext=github-cli-specialist
```

---

## 📋 Backlog.md Integration

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
/loqa capture thought
# "Need better error handling"

# Convert to formal task when ready
/start-complex-todo --title="Implement centralized error handling" --priority=P2

# Work on backlog task with automated selection
/loqa dev work --priority=P1 --roleContext=developer

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
├── drafts/          # Thoughts captured by /loqa capture thought and /loqa capture idea
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