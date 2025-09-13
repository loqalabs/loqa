# Loqa Pragmatic Development Workflow Guide

This guide provides comprehensive documentation for Loqa's pragmatic, MCP-powered development workflow that prioritizes GitHub Issues as the single source of truth while providing high-leverage AI assistance where it adds value.

## 🚀 **New Pragmatic Philosophy**

**AI where it helps, simplicity everywhere else**

- ✅ **GitHub Issues First** - Single source of truth, no dual tracking
- ✅ **High-Leverage AI** - Issue creation, impact analysis, coordination
- ✅ **Quality Automation** - Automated quality gates across repositories
- ✅ **YAGNI Principle** - "Would this help a solo developer?"
- ❌ **No Enterprise Bloat** - No analytics dashboards, complex reporting, or over-engineering

---

## 🤖 **MCP Server Setup for Claude Code**

### Quick Setup

1. **Add MCP Configuration** to `~/.mcp.json`:

```json
{
  "mcpServers": {
    "loqa-assistant": {
      "command": "[workspace root]/loqa/project/loqa-assistant-mcp/start-mcp.sh",
      "args": [],
      "env": {}
    }
  }
}
```

2. **Build and Install MCP Server**:

```bash
cd loqa/project/loqa-assistant-mcp
npm run build
```

3. **Restart Claude Code** to activate MCP integration.

---

## 🎯 **Primary Workflow: GitHub Issues + MCP**

### Issue Management (Natural Language Commands)

```bash
# Issue Creation with AI Enhancement
"Create a new issue for implementing JWT authentication with high priority"
"Create a bug report for STT processing timeout in loqa-hub"
"Generate an issue for cross-repo protocol changes with breaking change analysis"

# Issue Discovery and Management
"Show me what issues I should work on next"
"List open issues with label 'bug' in loqa-hub repository"
"Find high priority issues across all Loqa repositories"

# Cross-Repository Coordination
"Create coordinated issues for updating gRPC to v1.60 across all services"
"Link issue loqa-hub#123 with related loqa-proto#456"
```

### Quality Gates Automation

```bash
# Repository Quality Validation
"Run quality checks for the current repository"
"List available quality checks for loqa-hub"
"Run autofix commands to clean up code formatting"
"Validate quality gates configuration across all repositories"

# Multi-Repository Quality Coordination
"Run quality gates across all repositories in dependency order"
"Check which repositories have failing quality checks"
```

### Cross-Repository Coordination

```bash
# Change Impact Analysis
"Analyze the impact of changes in loqa-proto on other repositories"
"Generate coordination plan for breaking API changes"
"Create dependency graph for protocol buffer updates"

# Coordinated Operations
"Create coordinated feature branches across affected repositories"
"Generate coordinated pull requests with proper cross-references"
```

---

## 🛠️ **Smart Git Operations (MCP Tools)**

### Enhanced Git Commands

```bash
# Smart git operations with repository context
smart-git_status                           # Enhanced status with repository context
smart-git_branch(branchName: "feature/auth")  # Create feature branch (fetches main)
smart-git_commit(message: "Fix auth bug")  # Smart commit from any subdirectory
smart-git_sync                             # Pull + show merged branches for cleanup
smart-git_context                          # Show status across all repositories
```

### Git Operation Guidance

```bash
# Get intelligent recommendations
git_guidance(operation: "status")          # Get recommendations for git operations
git_guidance(operation: "branch")          # Branch creation guidance
git_guidance(operation: "commit")          # Commit best practices
```

---

## 📋 **GitHub Issues Templates (Minimal + AI Enhanced)**

### Available Templates

**Cross-Repository Coordination Template:**
```yaml
name: Cross-Repository Coordination
description: Coordinate changes across multiple Loqa repositories
body:
  - type: dropdown
    id: change_type
    attributes:
      label: Change Type
      options:
        - Protocol Update
        - Breaking Change
        - Feature Coordination
        - Bug Fix Coordination
```

**Protocol Change Template:**
```yaml
name: Protocol Change
description: Changes to gRPC protocol definitions
body:
  - type: dropdown
    id: breaking_change
    attributes:
      label: Breaking Change
      options:
        - "Yes - Requires coordination"
        - "No - Backwards compatible"
```

### AI Enhancement Features

- **Automatic Context Detection** - Templates adapt to repository type
- **Cross-Repository Impact Analysis** - AI detects affected repositories
- **Acceptance Criteria Generation** - AI suggests comprehensive acceptance criteria
- **Dependency Linking** - Automatic linking of related issues across repositories

---

## 🏗️ **Quality Gates System**

### Repository-Specific Quality Checks

**Go Services (loqa-hub, loqa-relay, loqa-skills):**
```bash
# Standard quality checks
go fmt ./...
go vet ./...
golangci-lint run
go test ./...
```

**TypeScript Services (loqa-commander, www-loqalabs-com):**
```bash
# Standard quality checks
npm run lint
npm run format
npm run type-check
npm run test
```

**Protocol Repository (loqa-proto):**
```bash
# Protocol validation
make format
make lint
make validate
make breaking-change-check
```

### Centralized Configuration

Quality gates are configured in `project/loqa-assistant-mcp/config/quality-gates.json`:

```json
{
  "default": {
    "checks": {
      "lint": { "command": "make lint", "required": true },
      "test": { "command": "make test", "required": true }
    }
  },
  "repositoryOverrides": {
    "loqa-hub": {
      "inherit": "default",
      "checks": {
        "go-fmt": { "command": "go fmt ./...", "required": true },
        "go-vet": { "command": "go vet ./...", "required": true }
      }
    }
  }
}
```

---

## 🔄 **Multi-Repository Workflow Examples**

### Scenario 1: Protocol Update

1. **Create Protocol Issue**:
   ```bash
   "Create an issue for adding audio compression support to the protocol with breaking change analysis"
   ```

2. **Impact Analysis**:
   ```bash
   "Analyze the impact of protocol changes on loqa-hub, loqa-relay, and loqa-skills"
   ```

3. **Coordinated Implementation**:
   ```bash
   "Create coordinated feature branches for audio compression across affected repositories"
   ```

4. **Quality Validation**:
   ```bash
   "Run quality gates across all repositories in dependency order"
   ```

### Scenario 2: Cross-Service Feature

1. **Feature Planning**:
   ```bash
   "Create an issue for JWT authentication system affecting loqa-hub and loqa-commander"
   ```

2. **Coordination Setup**:
   ```bash
   "Generate coordination plan for authentication feature with dependency analysis"
   ```

3. **Implementation Tracking**:
   ```bash
   "Create linked issues in loqa-hub and loqa-commander for authentication work"
   ```

---

## 🎯 **Development Best Practices**

### Issue-First Development

1. **Always Start with GitHub Issues** - Create issues before starting work
2. **Use Proper Labels** - Apply consistent labeling across repositories
3. **Link Related Issues** - Connect dependencies across repositories
4. **Update Issue Status** - Keep GitHub Issues current with progress

### Quality Gates Compliance

1. **Run Quality Checks Before Commits** - `make quality-check` in each repository
2. **Fix All Quality Issues** - No exceptions for failing checks
3. **Use Autofix When Available** - Let automation handle formatting
4. **Cross-Repository Validation** - Ensure changes work across services

### Cross-Repository Coordination

1. **Analyze Impact First** - Understand which repositories are affected
2. **Create Matching Branches** - Use consistent naming across repositories
3. **Coordinate Pull Requests** - Link PRs with proper cross-references
4. **Follow Dependency Order** - Update in proper sequence (proto → services → UI)

---

## 📚 **Additional Resources**

### Core Documentation
- **[GitHub Issues Workflow Guide](./docs/workflow/github-issues-workflow-guide.md)** - GitHub Issues best practices
- **[Cross-Repository Coordination](./project/loqa-assistant-mcp/CROSS_REPO_COORDINATION.md)** - Multi-repo workflow details
- **[Quality Gates Documentation](./project/loqa-assistant-mcp/QUALITY_GATES.md)** - Quality validation system

### Technical References
- **[MCP Server Setup](./project/loqa-assistant-mcp/README.md)** - Complete MCP server documentation
- **[Repository Structure](./project/README.md)** - Multi-repository architecture
- **[Skills Development](./docs/skills.md)** - Voice command development guide

---

## 🏆 **Success Metrics**

**Pragmatic Workflow Achievements:**
- ✅ **42% Code Reduction** - Removed over-engineered enterprise features
- ✅ **Single Source of Truth** - GitHub Issues for all task management
- ✅ **High-Leverage AI** - Smart assistance without complexity
- ✅ **Quality Automation** - Consistent validation across 8 repositories
- ✅ **Developer Productivity** - Reduced coordination overhead through intelligent automation

**YAGNI Validation:** Every feature passes the "Would this help a solo developer?" test.

---

*The pragmatic workflow system: AI where it helps, simplicity everywhere else.*