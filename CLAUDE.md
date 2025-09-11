# Claude Code Instructions for Loqa Project

## 🚨 CRITICAL: Backlog.md Integration

This project uses **backlog.md** for AI-friendly task management. Claude Code should:

### Task Management Commands (Claude Code Safe)
```bash
# SAFE - Use these in Claude Code:
backlog task list                     # List all tasks
backlog task create "Task title"      # Create new task
backlog overview                      # Project statistics
backlog board view --no-interactive   # Non-interactive board view

# AVOID - These hang in Claude Code:
# backlog browser                     # Interactive web interface
# backlog board view                  # Interactive board (without --no-interactive)
```

### Integration Guidelines
1. **Task Creation**: When user requests work, create backlog tasks using `backlog task create`
2. **Status Tracking**: Check task status with `backlog task list`
3. **Templates**: Use templates in `/backlog/templates/` for consistent task structure
4. **Cross-Repo**: Use `cross-repo-work-template.md` for multi-repository coordination

### 🤖 AI Development Commands
For enhanced development workflows, use the interactive commands in **[DEVELOPER_COMMANDS.md](./DEVELOPER_COMMANDS.md)**:
- `/work` - Begin working with intelligent task selection
- `/recommend` - Get AI recommendations for next tasks  
- `/thought` - Quickly capture technical concerns and insights
- `/idea` - Quickly capture feature ideas and improvements
- `/branch` - Create properly named feature branches
- `/pr` - Generate structured PRs with task linking

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