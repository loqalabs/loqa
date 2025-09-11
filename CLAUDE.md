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

### Feature Branch Creation (ALWAYS FOLLOW)
```bash
# MANDATORY: Fetch latest changes before branching
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
1. **Always fetch latest** before creating feature branches
2. **Use backlog.md** for task tracking and planning
3. **Follow quality gates** - no exceptions
4. **Document cross-repo dependencies** clearly
5. **Test thoroughly** across all affected services