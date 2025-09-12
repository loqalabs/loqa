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

### Smart Git Detection (RECOMMENDED)
Use the enhanced smart git system for reliable repository operations from any subdirectory:

```bash
# Install once per developer:
./tools/install-smart-git.sh

# Enhanced commands with rich output:
./tools/smart-git status                    # Enhanced status with context
./tools/smart-git branch feature/new-ui    # Create feature branch
./tools/smart-git commit "Fix bug"          # Smart commit from anywhere

# Common git commands (auto-executed from repo root):
./tools/smart-git add .                     # Stage all changes
./tools/smart-git push origin main          # Push to remote
./tools/smart-git pull origin main          # Pull from remote
./tools/smart-git log --oneline -5          # View commit history
./tools/smart-git diff --cached             # Show staged changes

# Get comprehensive help:
./tools/smart-git help                      # Show all available commands
```

**Enhanced Features:**
- 📋 **3 Enhanced Commands**: `status`, `branch`, `commit` with rich formatting
- 🔧 **14 Common Commands**: `add`, `push`, `pull`, `fetch`, `checkout`, `log`, `diff`, `merge`, `rebase`, `reset`, `stash`, `tag`, `remote`, `show`, `blame`
- 🎯 **Universal Fallback**: Any other git command executed from repository root
- 📁 **Repository Context**: Always shows which repo and path commands execute from

**Benefits for Claude Code:**
- ✅ **Eliminates directory confusion** - works from any subdirectory
- ✅ **Prevents git command failures** due to wrong working directory
- ✅ **Enhanced user experience** with emojis and clear formatting
- ✅ **Comprehensive git coverage** - handles all common git operations
- ✅ **Consistent behavior** regardless of current directory

### Feature Branch Creation (ALWAYS FOLLOW)
```bash
# RECOMMENDED: Use smart git (works from anywhere)
./tools/smart-git branch feature/issue-name

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
1. **Use smart git detection** - `./tools/smart-git` for all git operations
2. **Always fetch latest** before creating feature branches
3. **Use backlog.md** for task tracking and planning
4. **Follow quality gates** - no exceptions
5. **Document cross-repo dependencies** clearly
6. **Test thoroughly** across all affected services