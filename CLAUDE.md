# Claude Code Instructions for Loqa Project

## 🚨 CRITICAL: Backlog.md Integration

This project uses **backlog.md** for AI-friendly task management. Claude Code should:

### Task Management Commands (Claude Code Safe)
```bash
# ⚠️ CRITICAL: Always run backlog commands from TARGET REPOSITORY root directory
# Examples:
cd loqa                    # For main orchestration tasks
cd loqa-hub               # For hub service tasks  
cd loqa-commander         # For UI tasks
cd loqa-skills            # For skill development tasks

# RECOMMENDED: Validate context before backlog commands (MCP tool)
/validate-backlog-context              # Check if current directory is safe
/validate-backlog-context --target=loqa-hub  # Check for specific target repo

# SAFE - Use these in Claude Code (from target repo root):
backlog task list                     # List all tasks
backlog task create "Task title"      # Create new task
backlog overview                      # Project statistics
backlog board view --no-interactive   # Non-interactive board view

# AVOID - These hang in Claude Code:
# backlog browser                     # Interactive web interface
# backlog board view                  # Interactive board (without --no-interactive)

# ❌ NEVER run backlog commands from workspace root (/Users/.../loqalabs/)
# This creates unwanted backlog directories outside of git repositories
```

### Integration Guidelines
1. **Task Creation**: When user requests work, create backlog tasks using `backlog task create`
2. **Status Tracking**: Check task status with `backlog task list`
3. **Templates**: Use templates in `/backlog/templates/` for consistent task structure
4. **Cross-Repo**: Use `cross-repo-work-template.md` for multi-repository coordination

### 🚨 **CRITICAL: Automatic Task Closure Workflow**

**NEVER require user prompting for task completion** - Claude Code must automatically close tasks when work is finished:

#### **Mandatory Completion Checklist (AUTO-EXECUTE):**
```bash
# When ALL acceptance criteria are met, AUTOMATICALLY:

1. ✅ Update task status in backlog file:
   - Change status to "✅ COMPLETED" 
   - Add completion date
   - Add PR links and metrics
   - Mark all acceptance criteria as [x]

2. ✅ Close related GitHub issues:
   - Add comprehensive completion comment with metrics
   - Close issue with proper status update
   - Reference PR numbers and branch names

3. ✅ Update any cross-references:
   - Link PRs to issues and tasks
   - Update related task dependencies
   - Record completion in project documentation
```

#### **Completion Triggers (AUTO-DETECT):**
- All acceptance criteria verified ✅
- PR merged successfully
- All tests passing
- No blocking issues remaining
- User indicates work is complete

#### **What NOT to do:**
- ❌ Never leave tasks in "in_progress" when work is done
- ❌ Never require user to remind about closure
- ❌ Never leave GitHub issues open after completion
- ❌ Never forget to add completion metadata

**This is standard workflow automation - not optional!**

### 🤖 AI-Powered Development Commands (Phases 1-3)
The unified `/loqa` command provides advanced AI-powered workflow intelligence with discoverable categories:

```bash
/loqa                           # Show all available categories and usage
/loqa [category]                # Show available actions for a category
/loqa [category] [action] [args] # Execute specific AI-enhanced commands
```

#### 📋 Task Management (`/loqa task`)
- **AI-enhanced task creation** with complexity routing and intelligent templates
- **Cross-repository task management** with filtering and status tracking
- **Interactive task development** with AI-guided interview processes

#### 🛠️ Development Workflow (`/loqa dev`) 
- **AI-powered work sessions** with intelligent task selection and context setup
- **Smart branch creation** with proper naming conventions from task context
- **Intelligent PR generation** with comprehensive task linking and templates
- **Cross-repository testing** with dependency awareness and impact analysis

#### 📊 Planning & Strategy (`/loqa plan`)
- **AI recommendations** with strategic value scoring (0-100) and bottleneck analysis  
- **Strategic planning** with comprehensive impact analysis and risk assessment
- **Predictive analytics** for sprint success probability and delivery forecasting

#### 💭 Knowledge Capture (`/loqa capture`)
- **Quick thought capture** with automated categorization and strategic value assessment
- **Advanced idea analysis** with sprint alignment, cross-repo impact, and follow-up suggestions
- **Technical debt insights** with trajectory analysis and automated recommendations

**Enhanced with 3-Phase AI Intelligence:**
- **Phase 1**: Intelligent task selection with project context understanding
- **Phase 2**: Cross-repository coordination with dependency graph analysis  
- **Phase 3**: Predictive analytics with workflow automation and bottleneck detection

## 🚨 CRITICAL: Git Workflow

### Smart Git MCP Tools (PREFERRED)
Use the integrated smart git MCP tools for intelligent repository operations with rich context:

```bash
# MCP Tools available in Claude Code (no installation needed):
smart-git_status                           # Enhanced status with repository context
smart-git_branch(branchName: "feature/new-ui")  # Create feature branch (fetches main)
smart-git_commit(message: "Fix bug")       # Smart commit from any subdirectory
smart-git_sync                             # Pull + show merged branches for cleanup
smart-git_context                          # Show status across all repositories
smart-git_command(command: "add", args: ["."])  # Any git command from repo root

# Get git operation guidance:
git_guidance(operation: "status")          # Get recommendations for git operations
```

**Enhanced MCP Features:**
- 🚀 **Integrated into Claude Code** - No external scripts needed
- 📁 **Repository Context Detection** - Always operates from correct repo root
- 🎯 **Multi-Repository Awareness** - Works across all Loqa repositories
- ✅ **Rich Formatted Output** - Enhanced responses with emojis and markdown
- 🔧 **Smart Guidance System** - Suggests optimal tools for git operations
- 🔄 **Workflow Integration** - Designed for Loqa development patterns

**Benefits for Claude Code:**
- ✅ **Direct MCP Integration** - No shell script dependencies
- ✅ **Enhanced Context Awareness** - Repository detection and path resolution
- ✅ **Structured Responses** - Rich markdown output with actionable information
- ✅ **Comprehensive Git Coverage** - Handles all git operations intelligently
- ✅ **Preference Guidance** - Actively suggests smart-git over regular git commands

### Feature Branch Creation (ALWAYS FOLLOW)
```bash
# RECOMMENDED: Use smart git MCP tool (works from anywhere)
smart-git_branch(branchName: "feature/issue-name")

# OR Traditional approach (manual directory navigation):
git fetch origin main
git checkout main  
git pull origin main
git checkout -b feature/issue-name
```

### Quality Gates (NON-NEGOTIABLE)
```bash
# ALL must pass before declaring work complete:
make quality-check    # Service-specific quality validation
make test            # All tests must pass
docker-compose build # Docker builds must succeed
```

## Project Context

**Architecture**: Multi-repository microservices
- `loqa-hub` (Go) - Central service, gRPC, STT/TTS, LLM
- `loqa-commander` (Vue.js) - Admin dashboard
- `loqa-relay` (Go) - Audio capture client  
- `loqa-proto` (Protocol Buffers) - gRPC definitions
- `loqa-skills` (Go plugins) - Modular skill system
- `www-loqalabs-com` (Vue.js) - Marketing website

## Workflow Integration

### 1. Task-Driven Development
- Create backlog tasks for all significant work
- Use appropriate templates from `/backlog/templates/`
- Link to GitHub issues when applicable

### 2. Cross-Repository Coordination  
- Use `cross-repo-work-template.md` for multi-repo work
- Create matching feature branches across affected repositories
- Coordinate quality checks and testing

### 3. Quality Assurance
- Run `make quality-check` before completing tasks
- Ensure all tests pass
- Update documentation proactively

## Available Templates
- `general-task-template.md` - Standard tasks
- `bug-fix-template.md` - Bug fixes and defect resolution
- `feature-template.md` - New features and enhancements
- `protocol-change-template.md` - gRPC/API changes
- `cross-repo-work-template.md` - Multi-repository coordination

## Best Practices
1. **Use smart git MCP tools** - `smart-git_*` MCP tools for all git operations
2. **Always fetch latest** before creating feature branches
3. **Use backlog.md** for task tracking and planning
4. **Follow quality gates** - no exceptions
5. **Document cross-repo dependencies** clearly
6. **Test thoroughly** across all affected services