# Loqa Assistant MCP Server & Pre-commit Hooks

Comprehensive development workflow assistance for the Loqa ecosystem. This system provides interactive commands, issue management, role-based specialization, and automated rule enforcement to streamline development across all repositories.

## ✨ Recent Updates

**September 2025**:
- ✅ **NEW: Intelligent Issue Prioritization**: AI-powered GitHub issue discovery and ranking across all repositories with smart scoring
- ✅ **FIXED: GitHub Issue Provider**: Complete rewrite with direct GitHub CLI integration, now properly finds and parses all issues
- ✅ **NEW: GitHub Comment Preview Workflow**: Added conversational GitHub comment functionality with preview, confirmation, and delegation to GitHub MCP
- ✅ **Fixed Critical Workflow Bug**: ProcessConversationalResponse now properly handles GitHub operations instead of bypassing preview workflow
- ✅ **Enhanced Natural Language Parsing**: Intelligent detection of "add comment to issue #X" patterns with content extraction
- 🚀 **Foundation for Future Expansion**: Established architecture for PR creation, issue creation/editing workflows
- ✅ **Fixed AI Attribution False Positives**: Updated pattern detection to avoid false positives with "claude-code-commands"
- ✅ **Cleaned Up Development Files**: Removed obsolete test scripts and development documentation
- ✅ **Streamlined Hook Management**: Enhanced `update-hooks.sh` for force-updating hooks across all repositories

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or compatible package manager
- Git (for pre-commit hooks)
- **No additional dependencies required** - hooks use only standard shell tools

### Installation

**One-Command Setup** (handles everything automatically):
```bash
cd loqa/project/loqa-assistant-mcp
./install-hooks.sh
```

This automatically:
- ✅ **Installs Dependencies**: Runs `npm install` if needed
- ✅ **Builds MCP Server**: Runs `npm run build` if needed  
- ✅ **Discovers Repositories**: Finds all Git repositories in workspace
- ✅ **Installs Hooks**: Deploys pre-commit hooks to all repositories
- ✅ **Backs Up Existing**: Preserves any existing hooks with timestamps
- ✅ **Works Anywhere**: Uses relative paths (no hardcoded user paths)

**Manual Setup** (if you prefer step-by-step):
```bash
cd loqa/project/loqa-assistant-mcp
npm install          # Install dependencies
npm run build        # Build MCP server  
./install-hooks.sh   # Install hooks
```

## ✅ What Gets Enforced

### 🛡️ Git Hook Protection (Automatic)
- **🚫 Direct Main Branch Commits**: Pre-commit hook blocks commits to `main` or `master` branches
- **🚫 AI Attribution in Messages**: Commit-msg hook blocks "🤖 Generated with Claude Code", "Co-Authored-By: Claude", etc.
- **💡 Best Practice Suggestions**: Recommends conventional branch naming and commit formats

### 🔧 MCP Server Validation (for Claude Code sessions)
- **📋 Advanced Validation**: Full commit message analysis and quality checking
- **🏗️  Quality Gate Validation**: Verifies repository has proper testing/linting setup
- **📊 Repository Analysis**: Comprehensive project health checking

## 🔧 How It Works

### Git Hooks (Dual Protection)

**Pre-commit Hook**:
- **Location**: `.git/hooks/pre-commit` in each repository
- **Trigger**: Runs before `git commit` processes the message
- **Purpose**: Branch protection (prevents main/master commits)
- **Dependencies**: None - uses only standard git commands

**Commit-msg Hook**:
- **Location**: `.git/hooks/commit-msg` in each repository  
- **Trigger**: Runs after commit message is written
- **Purpose**: AI attribution detection and message validation
- **Dependencies**: None - uses only standard shell tools

### MCP Server
- **Purpose**: Comprehensive development workflow assistance for Claude Code sessions
- **Location**: `loqa/project/loqa-assistant-mcp/dist/index.js`  
- **Capabilities**: Interactive commands, issue management, role specialization, validation tools
- **When**: Used during Claude Code development sessions for workflow automation and assistance

## 🛠️ Developer Usage

### Testing Hooks Manually

```bash
# Test pre-commit hook (branch protection)
echo "test message" | .git/hooks/pre-commit
# ✅ Passes on feature branches, ❌ fails on main/master

# Test commit-msg hook (AI attribution detection)
echo "fix bug 🤖 Generated with Claude Code" > /tmp/test-msg
.git/hooks/commit-msg /tmp/test-msg
# ❌ Will fail with AI attribution violation

# Test with a good commit message
echo "fix(auth): resolve validation bug" > /tmp/test-msg  
.git/hooks/commit-msg /tmp/test-msg
# ✅ Will pass with helpful suggestions
```

### Re-installing Hooks

If you need to update or reinstall hooks:

```bash
cd loqa/project/loqa-assistant-mcp
./install-hooks.sh  # Automatically detects and updates all repositories
```

### Checking Hook Status

```bash
# Verify hook is installed
ls -la .git/hooks/pre-commit

# Check hook content  
grep "Loqa Pre-commit Hook" .git/hooks/pre-commit
```

## 🐙 GitHub Integration

### **Built-in GitHub Issue Provider** ⭐ (Recommended)

The Loqa Assistant MCP server includes a **robust built-in GitHub Issue Provider** with direct GitHub CLI integration:

**✅ Current Status**: Fully functional with comprehensive issue discovery and management
- 🎯 **Intelligent Issue Prioritization**: AI-powered discovery across all repositories
- 📊 **Complete Issue Parsing**: Full GitHub issue data including labels, descriptions, metadata
- 🚀 **Direct GitHub CLI Integration**: Reliable, fast, and comprehensive
- 🏢 **Multi-Repository Support**: Scans all Loqa repositories (loqa, loqa-hub, loqa-commander, etc.)

### **Official GitHub MCP Server** (Alternative)

For advanced GitHub operations beyond issue management, you can also use the **official GitHub MCP server**:

📘 **See [GITHUB_MCP_SETUP.md](./GITHUB_MCP_SETUP.md)** for complete setup instructions.

**Benefits of Official GitHub MCP Server:**
- ✅ Native GitHub API integration (not CLI command parsing)
- ✅ Advanced PR management and Actions integration
- ✅ Granular tool control for complex workflows
- ✅ Official GitHub support and maintenance

### **Recommendation**

- **✅ Use Built-in Provider**: For issue discovery, prioritization, and basic issue management
- **🔧 Add Official Server**: For advanced PR workflows, Actions, and complex GitHub operations
- **🚀 Best of Both**: Many users run both for comprehensive GitHub integration

## 🚀 GitHub Issues Integration

**NEW ARCHITECTURE**: The MCP server now focuses on **GitHub Issues** as the primary issue tracking system, providing seamless integration with GitHub's native issue management.

### Key Changes:
- ✅ **GitHub Issues Primary**: Direct integration with GitHub Issues API
- ✅ **Enhanced Issue Provider**: Intelligent fallback and provider selection
- ✅ **Cross-Repository Support**: Work with issues across multiple repositories
- ✅ **Native GitHub Features**: Labels, assignments, comments, and linking

### GitHub Integration Benefits:
- 🔗 **Cross-Repository Linking**: Issues can reference work across multiple repos
- 👥 **Team Collaboration**: Native GitHub commenting, assignments, and notifications
- 📊 **Project Tracking**: GitHub Projects, milestones, and advanced filtering
- 🛡️ **Access Control**: GitHub's built-in permissions and security

## 🏗️ MCP Server Tools (GitHub-Backed)

All MCP tools now work directly with GitHub Issues while providing enhanced Claude Code integration:

### 🚨 Issue Management (GitHub-Backed)

**`issue:CaptureThought` - Quick idea capture**
```bash
# Creates GitHub Issue or adds as comment
# Intelligent provider selection based on repository context
```

**`issue:ListIssues` - Displays GitHub Issues**
```bash  
# Lists open GitHub Issues with filtering and search
# Cross-repository support for workspace-wide view
```

**`issue:CaptureComprehensiveThought` - Advanced idea capture**
```bash
# Full-featured thought capture with categorization
# Automatic follow-up suggestions and task creation
```

### 🎯 **NEW: Intelligent Interview System - Comprehensive Issue Creation**

**Revolutionary GitHub issue creation through natural conversation** - The intelligent interview system guides users through targeted questions to create fully-fleshed out GitHub issues with professional structure and comprehensive details.

#### **Key Features**
- 🎯 **7-Question Interview Flow** - Covers title, description, type, priority, repository, acceptance criteria, technical notes
- 💬 **Seamless Conversation** - Natural language responses without command syntax
- 📊 **Smart Analysis** - Auto-detects issue type, priority, and repository from initial context
- 💾 **Persistent Sessions** - Interview state survives MCP server restarts, can be resumed anytime
- 🔗 **GitHub Integration** - Creates comprehensive GitHub issues with proper labels and formatting
- 🧠 **Context Awareness** - Automatically distinguishes between answers and commands

#### **Available Interview Commands**

**`issue:StartInterview` - Begin intelligent interview**
```typescript
{
  "name": "issue:StartInterview",
  "arguments": {
    "initialInput": "Add rate limiting to STT service API endpoints"
  }
}
```

**`issue:ProcessConversationalResponse` - Natural conversation processing**

Handles multiple types of conversational input with intelligent parsing and preview workflows:

**🎯 GitHub Comment Operations (NEW)**
```typescript
// Add comment to GitHub issue with preview
{
  "name": "issue:ProcessConversationalResponse",
  "arguments": {
    "message": "Add a comment to issue #33: This is my test comment content"
  }
}
// Returns: Preview with confirmation options (yes/no/revise)
```

**🔄 Preview Confirmations**
```typescript
// Confirm or cancel pending operations
{
  "name": "issue:ProcessConversationalResponse",
  "arguments": {
    "message": "yes"  // or "no" or revision details
  }
}
```

**💬 Interview Responses**
```typescript
// Answer interview questions naturally
{
  "name": "issue:ProcessConversationalResponse",
  "arguments": {
    "message": "JWT Authentication with secure session management and token expiration"
  }
}
```

**Key Features:**
- ✅ **GitHub Comment Preview**: Natural language → Preview → Confirmation → Delegation to GitHub MCP
- ✅ **Smart Context Detection**: Automatically detects operation type from message content
- ✅ **Workflow Integration**: Seamlessly handles confirmations, revisions, and cancellations
- 🚀 **Extensible Architecture**: Foundation ready for PR creation, issue creation/editing workflows

**`issue:AnswerInterviewQuestion` - Direct question response**
```typescript
{
  "name": "issue:AnswerInterviewQuestion",
  "arguments": {
    "interviewId": "uuid-of-interview",
    "answer": "High priority - security is critical for production"
  }
}
```

**`issue:ListActiveInterviews` - View/resume interviews**
```typescript
{
  "name": "issue:ListActiveInterviews",
  "arguments": {}
}
```

#### **Interview Question Flow**

1. **Title** - Concise, descriptive issue title
2. **Description** - Detailed explanation of requirements
3. **Type** - feature, bug-fix, protocol-change, cross-repo, general
4. **Priority** - High/Medium/Low with reasoning
5. **Repository** - Target repository with validation
6. **Acceptance Criteria** - Definition of "done" with specific requirements
7. **Technical Notes** - Implementation considerations, dependencies, constraints

#### **Generated GitHub Issues Include**

- ✅ **Professional Structure** - Description, Acceptance Criteria, Technical Notes, Metadata sections
- 🏷️ **Smart Labels** - Automatic type, priority, and scope labels
- 🔗 **Cross-Repository Coordination** - Dependency tracking and coordination notes
- ⚠️ **Breaking Change Detection** - Automatic warnings for breaking changes
- 📋 **Comprehensive Metadata** - Interview ID, creation context, repository tracking

#### **Usage Examples**

**Natural Language (Recommended)**:
```bash
# Via Claude Code - most user-friendly approach
"Start an interview to create a GitHub issue for implementing user authentication"
"I need to create an issue for fixing the memory leak in voice processing"
```

**Direct MCP Tool Usage**:
```javascript
// Start interview
await callTool("issue:StartInterview", {
  initialInput: "Add comprehensive logging to all gRPC endpoints"
});

// Respond conversationally (no special syntax needed)
await callTool("issue:ProcessConversationalResponse", {
  message: "Structured logging with request IDs, duration, and error tracking"
});
```

#### **Storage and Persistence**

- **Location**: `{workspace}/.loqa-assistant/interviews/interviews.json`
- **Format**: JSON with full interview state and metadata
- **Cleanup**: Automatic cleanup of completed interviews
- **Resume**: Interrupted interviews can be resumed anytime

### 🏢 Workspace Management Tools

**Cross-repository coordination and intelligent issue discovery across the entire Loqa ecosystem.**

**`workspace:IntelligentIssuePrioritization` - AI-Powered Issue Discovery ⭐**
```typescript
{
  "name": "workspace:IntelligentIssuePrioritization",
  "arguments": {
    "timeframe": "today",  // today, week, sprint, month
    "role": "developer",   // optional: developer, qa, devops, architect
    "repository": "loqa-hub" // optional: focus on specific repo
  }
}
```

**Key Features**:
- 🎯 **Smart Issue Discovery**: Scans all GitHub repositories (loqa, loqa-hub, loqa-commander, etc.)
- 📊 **AI-Powered Scoring**: Intelligent ranking based on priority, type, role context, and complexity
- 🔍 **Complete Issue Details**: Fetches full issue data including labels, descriptions, and metadata
- 🧠 **Enhanced Analysis**: Project health assessment, bottleneck identification, and optimization recommendations

**Example Response**:
```
🎯 Intelligent Issue Prioritization

📊 Analysis Summary:
- Total issues found: 43
- Eligible issues: 43
- Context: developer role, today timeframe, all repository focus

⭐ Recommended Issue:
- **🛠️ Developer-First Installation & Setup Experience** (loqa)
- Priority: High, Score: 4/10

🔄 Alternative Issues:
- **💰 GitHub Sponsors Setup & Community Funding** (loqa) - Score: 4/10
- **🌊 Real-Time Streaming LLM Implementation** (loqa) - Score: 4/10
```

**`workspace:Status` - Multi-Repository Overview**
```typescript
{
  "name": "workspace:Status",
  "arguments": {}
}
```

**`workspace:Health` - GitHub Issues Health Check**
```typescript
{
  "name": "workspace:Health",
  "arguments": {}
}
```

**`workspace:RunQualityChecks` - Cross-Repository Validation**
```typescript
{
  "name": "workspace:RunQualityChecks",
  "arguments": {
    "repository": "loqa-hub" // optional: specific repo
  }
}
```

### 🔍 Validation Tools

**`validation_RepositoryInfo` - Repository Context**
```json
{
  "name": "validation_RepositoryInfo", 
  "arguments": {
    "repoPath": "/path/to/repository"
  }
}
```

**Purpose**: Provides comprehensive repository information including branch status and GitHub integration.

**Key Features**:
- ✅ **Repository Detection**: Identifies current repository and workspace context
- ⚠️ **Branch Status**: Shows current branch, remote tracking, and clean/dirty status
- 🔗 **GitHub Integration**: Validates GitHub API access and repository configuration
- 💡 **Smart Recommendations**: Provides guidance for repository operations

**Use Cases**:
- Before running GitHub Issues operations
- When unsure about repository context or GitHub access
- To verify proper repository configuration

**`validate_commit_message` - Commit Quality**
```json
{
  "name": "validate_commit_message",
  "arguments": {
    "message": "fix(auth): resolve validation bug"
  }
}
```

**`get_repository_info` - Repository Health**
```json
{
  "name": "get_repository_info",
  "arguments": {
    "repoPath": "/path/to/repo"
  }
}
```

### 🚨 Migration from Custom to CLI-First

**OLD (Bypassed CLI)**: ❌
- Custom task file creation
- Manual numbering systems  
- Inconsistent formatting
- Database inconsistencies

**NEW (GitHub Issues)**: ✅
- All issues created via GitHub Issues API
- Native GitHub numbering and formatting
- Consistent workflow automation
- Full GitHub ecosystem integration

## 📁 File Structure

```
loqa/project/loqa-assistant-mcp/
├── README.md                    # This file
├── package.json                 # Node.js dependencies  
├── tsconfig.json               # TypeScript configuration
├── src/index.ts                # MCP server source code
├── dist/index.js               # Built MCP server (auto-generated)
├── pre-commit-hook.sh          # Pre-commit hook template
├── install-hooks.sh            # Hook installation script
└── test-hook-simple.sh         # Hook testing utility
```

## 🔍 Troubleshooting

### Hook Not Running
```bash
# Check if hook exists and is executable
ls -la .git/hooks/pre-commit

# Make executable if needed
chmod +x .git/hooks/pre-commit
```

### Hook Can't Find MCP Server
The hook searches these locations automatically:
- `../loqa/project/loqa-assistant-mcp/dist/index.js`
- `../../loqa/project/loqa-assistant-mcp/dist/index.js`  

If still not found:
```bash
# Rebuild MCP server
cd loqa/project/loqa-assistant-mcp
npm run build
```

### Bypass Hook for Emergency
```bash
# Only use in genuine emergencies - rules exist for good reasons!
git commit --no-verify -m "emergency fix"
```

## 🔧 Development

### Modifying Rules
1. Edit `src/index.ts` for MCP server logic
2. Edit `pre-commit-hook.sh` for git hook logic  
3. Run `npm run build` to rebuild
4. Run `./install-hooks.sh` to update hooks

### Adding New Validations
1. Add validation logic to `LoqaRulesValidator` class
2. Expose as MCP tool in `server.setRequestHandler`
3. Update pre-commit hook if needed for git integration
4. Add tests and documentation

## 📋 Rules Reference

| Rule | Enforcement | Bypass |
|------|-------------|--------|
| No direct main branch commits | Pre-commit hook | `--no-verify` |
| No AI attribution in commits | Commit-msg hook | `--no-verify` |
| Feature branch naming | Pre-commit suggestion | N/A |
| Conventional commits | Commit-msg suggestion | N/A |
| Quality gates configured | MCP server only | N/A |

## 🎯 Integration Status

- ✅ **Pre-commit Hooks**: Installed across all 8 Loqa repositories (branch protection)
- ✅ **Commit-msg Hooks**: Installed across all 8 Loqa repositories (AI attribution blocking)
- ✅ **MCP Server**: Built and functional with advanced validation tools
- ✅ **.claude-code.json**: Updated with rule enforcement documentation
- 🔄 **Interactive Commands**: Planned for Phase 1B
- 🔄 **Quality Gate Integration**: Planned for Phase 3

## 📞 Support

If you encounter issues:

1. **Check Prerequisites**: Ensure Node.js 18+ and npm are installed
2. **Rebuild**: Try `npm run build` in the MCP server directory
3. **Reinstall**: Run `./install-hooks.sh` to refresh all hooks
4. **Test Manually**: Use test scripts to isolate problems
5. **Review Logs**: Check git commit output for specific error messages

The system is designed to be robust and fail gracefully - if validation fails, it will explain what needs to be fixed.