# Loqa Assistant MCP Server & Pre-commit Hooks

Comprehensive development workflow assistance for the Loqa ecosystem. This system provides interactive commands, task management, role-based specialization, and automated rule enforcement to streamline development across all repositories.

## ✨ Recent Updates

**September 2025**: 
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
- **Capabilities**: Interactive commands, task management, role specialization, validation tools
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

For GitHub operations, use the **official GitHub MCP server** instead of custom implementations:

📘 **See [GITHUB_MCP_SETUP.md](./GITHUB_MCP_SETUP.md)** for complete setup instructions.

**Benefits of Official GitHub MCP Server:**
- ✅ Native GitHub API integration (not CLI command parsing)
- ✅ Multi-repository workflow support 
- ✅ Granular tool control (Issues, PRs, Actions, etc.)
- ✅ Official GitHub support and maintenance
- ✅ Better Claude Code compatibility

**Migration Note**: The `github-cli-specialist` role has been removed in favor of the official solution.

## 🏗️ MCP Server Tools

When using the MCP server directly (for Claude Code integration):

### `validate_commit_message`
```json
{
  "name": "validate_commit_message",
  "arguments": {
    "message": "fix(auth): resolve validation bug"
  }
}
```

### `validate_pre_commit`  
```json
{
  "name": "validate_pre_commit",
  "arguments": {
    "message": "fix(auth): resolve validation bug",
    "repoPath": "/path/to/repo"
  }
}
```

### `get_repository_info`
```json
{
  "name": "get_repository_info",
  "arguments": {
    "repoPath": "/path/to/repo"
  }
}
```

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