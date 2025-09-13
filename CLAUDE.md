# Claude Code Instructions for Loqa Project

## 🚨 CRITICAL: GitHub Issues - Primary Issue Management

This project uses **GitHub Issues** as the primary issue management system. Claude Code should:

### GitHub Issues Management (Claude Code Safe)

```bash
# 🎯 PRIMARY: Use GitHub Issues for all active issue management
gh issue list                          # List all open issues
gh issue create --title "Issue title"   # Create new issue
gh issue view 123                       # View specific issue details
gh issue edit 123 --add-label "priority-high"  # Update issue

# 🤖 PREFERRED: Use MCP GitHub tools via Claude Code
"Create a new issue for implementing JWT authentication with high priority"
"List open issues across all Loqa repositories that need attention"
"Show me issues with label 'bug' in loqa-hub repository"
```

### Integration Guidelines

1. **Issue Creation**: Create GitHub issues using templates for different work types
2. **Status Tracking**: Use GitHub Projects for visual progress tracking
3. **Cross-Repository Coordination**: Use GitHub issue linking and mentions
4. **Templates**: Available issue templates for feature, bug-fix, protocol-change, cross-repo work

### 🚨 **CRITICAL: Automatic Issue Closure Workflow**

**NEVER require user prompting for issue completion** - Claude Code must automatically close issues when work is finished:

#### **Mandatory Completion Checklist (AUTO-EXECUTE):**

```bash
# When ALL acceptance criteria are met, AUTOMATICALLY:

1. ✅ Update GitHub issue status:
   - Add completion comment with metrics
   - Close issue with proper labels
   - Reference PR numbers and branch names
   - Update linked issues in other repositories

2. ✅ Update GitHub Projects:
   - Move issue to "Done" column
   - Update custom fields (completion date, effort)
   - Update milestone progress

3. ✅ Cross-repository coordination:
   - Update dependent issues
   - Sync status across linked repositories
   - Record completion in coordination tracking
```

#### **Completion Triggers (AUTO-DETECT):**

- All acceptance criteria verified ✅
- PR merged successfully
- All tests passing
- No blocking issues remaining
- User indicates work is complete

#### **What NOT to do:**

- ❌ Never leave issues open when work is done
- ❌ Never require user to remind about closure
- ❌ Never forget to update linked issues
- ❌ Never skip updating project status

**This is standard workflow automation - not optional!**

### 🤖 Pragmatic MCP Workflow System

The new MCP server provides pragmatic, high-value AI assistance without over-engineering:

#### **GitHub Issues Integration** (MCP Tools)
```bash
# Natural language commands via Claude Code + MCP
"Create a new issue for JWT authentication with high priority"
"Show me issues across all Loqa repositories that need attention"
"Create a feature branch for issue #123"
"List open issues with label 'bug' in loqa-hub repository"
```

#### **Quality Gates Automation** (MCP Tools)
```bash
# Repository quality validation
"Run quality checks for the current repository"
"List available quality checks for loqa-hub"
"Run autofix commands to clean up code formatting"
"Validate quality gates configuration"
```

#### **Cross-Repository Coordination** (MCP Tools)
```bash
# Multi-repository workflow management
"Analyze the impact of changes in loqa-proto on other repositories"
"Create coordinated feature branches across affected repositories"
"Run quality gates across all repositories in dependency order"
"Generate coordination plan for breaking API changes"
```

#### **Smart Issue Templates** (GitHub + AI Enhancement)
- **Minimal GitHub Templates** - 10-line templates vs complex 78-line forms
- **AI-Powered Enhancement** - Claude Code adds context and acceptance criteria
- **Repository-Specific Context** - Templates adapt to service type and requirements
- **Cross-Repository Linking** - Automatic dependency and coordination detection

**Pragmatic Design Principles:**
- ✅ **High-Leverage AI** - AI where it adds significant value (issue creation, impact analysis)
- ✅ **GitHub Issues First** - Single source of truth, no dual tracking systems
- ✅ **YAGNI Compliance** - "Would this help a solo developer?" test applied to all features
- ❌ **No Analytics Dashboards** - Simple is better than complex for small teams

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

### 1. Issue-Driven Development

- Create GitHub issues for all significant work
- Use appropriate issue templates for different work types
- Link related issues across repositories when applicable

### 2. Cross-Repository Coordination

- Use `cross-repo-work-template.md` for multi-repo work
- Create matching feature branches across affected repositories
- Coordinate quality checks and testing

### 3. Quality Assurance

- Run `make quality-check` before completing issues
- Ensure all tests pass
- Update documentation proactively

## Available Templates

- `general-task-template.md` - Standard tasks
- `bug-fix-template.md` - Bug fixes and defect resolution
- `feature-template.md` - New features and enhancements
- `protocol-change-template.md` - gRPC/API changes
- `cross-repo-work-template.md` - Multi-repository coordination

## GitHub Issues - Primary Issue Management

**Simple, pragmatic issue management using GitHub Issues directly:**

```bash
# Create issues with appropriate labels and priority
gh issue create --title "Implement JWT authentication" --label "feature,high-priority" --assignee "@developer"
gh issue create --title "Fix audio streaming bug" --label "bug,critical" --body "Audio cuts out after 30 seconds"

# Manage and track issues
gh issue list --label "high-priority" --state open        # Focus on priority work
gh issue list --label "in-progress"                       # See active work
gh issue view 123                                          # Get issue details
gh issue edit 123 --add-label "blocked" --remove-label "in-progress"

# Cross-repository coordination through linking
gh issue create --title "Update gRPC protocol for auth" \
  --body "Depends on loqalabs/loqa-hub#123" \
  --label "protocol,breaking-change" \
  --repo loqalabs/loqa-proto
```

**Standard Labels for Consistency:**
- **Type**: `feature`, `bug`, `enhancement`, `documentation`, `infrastructure`
- **Priority**: `critical`, `high-priority`, `medium-priority`, `low-priority`
- **Status**: `in-progress`, `blocked`, `needs-review`, `ready-to-test`
- **Scope**: `protocol`, `ui`, `backend`, `skills`, `cross-repo`

## Orchestration Repository Specifics

**This repository (`loqa/`) is the orchestration hub** for the multi-service Loqa architecture.

### **Critical Orchestration Requirements**

- **Individual services are in parallel directories**: `../loqa-hub/`, `../loqa-relay/`, etc.
- **Changes to orchestration affect ALL services** - test thoroughly
- **Docker Compose changes impact entire system** - verify all services

### **Essential Orchestration Commands**

```bash
# Primary Development (from loqa/tools/)
make setup      # Initial setup, clone repos, download models
make build      # Build all Docker images
make start      # Start all services via Docker Compose
make test       # Run Go tests across all services
make dev        # Start development environment with status
make logs       # View service logs
make stop       # Stop all services
make clean      # Clean containers and volumes

# Docker Compose Operations
docker-compose up -d      # Start all services
docker-compose build     # Build all images
docker-compose down      # Stop all services
docker-compose ps        # Show running services
docker-compose logs -f   # Follow service logs

# Mandatory Quality Gates (NON-NEGOTIABLE)
docker-compose build   # All service builds must succeed
docker-compose up -d   # Full system must start successfully
make test             # Cross-service integration tests
make quality-check    # All orchestration validation
```

### **Service Architecture Reference**

**Core Services & Ports:**
- **Hub** (`:3000` HTTP, `:50051` gRPC) - Central orchestrator with STT/TTS/LLM pipeline
- **Commander UI** (`:5173`) - Vue.js administrative dashboard
- **STT** (`:8000` REST) - OpenAI-compatible Speech-to-Text service
- **TTS** (`:8880` REST) - OpenAI-compatible Text-to-Speech service (Kokoro-82M)
- **NATS** (`:4222`, `:8222` monitoring) - Message bus
- **Ollama** (`:11434`) - Local LLM (Llama 3.2)

**Repository Structure:**
```
loqa/                    # ← This orchestration repository
├── docker-compose.yml  # Main orchestration file
├── tools/Makefile     # Development commands
└── ...

../loqa-hub/           # Central service (Go)
../loqa-commander/     # Vue.js administrative dashboard
../loqa-relay/         # Audio capture client (Go)
../loqa-proto/         # gRPC protocol definitions
../loqa-skills/        # Modular skill plugin system
```

## Best Practices

1. **Use smart git MCP tools** - `smart-git_*` MCP tools for all git operations
2. **Always fetch latest** before creating feature branches
3. **Use GitHub Issues** for issue tracking and planning
4. **Follow quality gates** - no exceptions
5. **Document cross-repo dependencies** clearly
6. **Test thoroughly** across all affected services
7. **Never push directly to main** - always use feature branches and PRs
