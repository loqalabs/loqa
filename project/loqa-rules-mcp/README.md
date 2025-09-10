# Loqa Workflow Rules MCP Server & Pre-commit Hooks

Automated workflow rule enforcement for the Loqa ecosystem. This system prevents common violations like AI attribution in commits and ensures consistent development practices across all repositories.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or compatible package manager
- Git (for pre-commit hooks)
- **No additional dependencies required** - hooks use only standard shell tools

### Installation

1. **Install and Build the MCP Server**:
   ```bash
   cd loqa/project/loqa-rules-mcp
   npm install
   npm run build
   ```

2. **Install Pre-commit Hooks Across All Repositories**:
   ```bash
   ./install-hooks.sh
   ```
   
   This automatically:
   - Discovers all Git repositories in the Loqa workspace
   - Installs pre-commit hooks in each repository  
   - Backs up any existing hooks
   - Uses relative paths (works on any developer machine)

## ✅ What Gets Enforced

The system automatically prevents:

- **🚫 AI Attribution in Commits**: Blocks messages with "🤖 Generated with Claude Code", "Co-Authored-By: Claude", etc.
- **🚫 Direct Main Branch Commits**: Prevents commits to `main` or `master` branches
- **⚠️  Poor Commit Practices**: Warns about short messages and suggests conventional commit format

## 🔧 How It Works

### Pre-commit Hooks
- **Location**: `.git/hooks/pre-commit` in each repository
- **Trigger**: Runs automatically before every `git commit`
- **Validation**: Uses simple shell pattern matching (no external dependencies)
- **Fallback**: Gracefully skips validation if MCP server unavailable

### MCP Server
- **Purpose**: Advanced validation tools for Claude Code sessions
- **Location**: `loqa/project/loqa-rules-mcp/dist/index.js`
- **Tools**: Commit validation, branch checking, quality gate verification

## 🛠️ Developer Usage

### Testing Hooks Manually

```bash
# Test with a problematic commit message
echo "fix bug 🤖 Generated with Claude Code" | .git/hooks/pre-commit
# ❌ Will fail with clear violation message

# Test with a good commit message  
echo "fix(auth): resolve validation bug" | .git/hooks/pre-commit
# ✅ Will pass (but warn about main branch if applicable)
```

### Re-installing Hooks

If you need to update or reinstall hooks:

```bash
cd loqa/project/loqa-rules-mcp
./install-hooks.sh  # Automatically detects and updates all repositories
```

### Checking Hook Status

```bash
# Verify hook is installed
ls -la .git/hooks/pre-commit

# Check hook content  
grep "Loqa Pre-commit Hook" .git/hooks/pre-commit
```

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
loqa/project/loqa-rules-mcp/
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
- `../loqa/project/loqa-rules-mcp/dist/index.js`
- `../../loqa/project/loqa-rules-mcp/dist/index.js`  

If still not found:
```bash
# Rebuild MCP server
cd loqa/project/loqa-rules-mcp
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
| No AI attribution in commits | Pre-commit hook | `--no-verify` |
| No direct main branch commits | Pre-commit hook | `--no-verify` |
| Feature branch naming | Warning only | N/A |
| Conventional commits | Suggestion only | N/A |
| Quality gates configured | MCP tools only | N/A |

## 🎯 Integration Status

- ✅ **Pre-commit Hooks**: Installed across all 8 Loqa repositories
- ✅ **MCP Server**: Built and functional  
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