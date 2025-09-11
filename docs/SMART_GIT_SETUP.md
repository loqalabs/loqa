# Smart Git Detection for Loqa Development

## Overview

Smart Git Detection automatically finds the correct git repository root from any subdirectory, eliminating the common problem of running git commands from the wrong location.

## ⚡ Quick Start

### One-time Setup (Per Developer)

```bash
cd loqa/
./tools/install-smart-git.sh
```

### Usage

```bash
# From anywhere in the loqa repository:
./tools/smart-git status           # Shows repo context + git status  
./tools/smart-git branch feat-x    # Creates feature branch properly
./tools/smart-git commit "message" # Commits from correct root
./tools/smart-git push origin main # Any git command works
```

### Optional: Global Access

Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export PATH="/path/to/loqa/tools:$PATH"
```

Then use: `smart-git <command>` from anywhere.

## 🔍 How It Works

### Problem Solved
```bash
# Before (error-prone):
cd loqa/project/loqa-assistant-mcp/
git status                         # ❌ May fail or show wrong context
cd ../../                          # ❌ Manual navigation required  
git checkout -b feature/new-thing  # ❌ Easy to forget

# After (automatic):
smart-git status                   # ✅ Works from any subdirectory
smart-git branch feature/new-thing # ✅ Finds repo root automatically
```

### Smart Detection Algorithm

1. **Start from current directory**
2. **Walk up directory tree** looking for `.git/`
3. **Stop at workspace boundaries** (multiple Loqa repos, workspace indicators)
4. **Execute git commands** from the detected repository root
5. **Show context** (repo root + your relative location)

### Workspace Boundary Detection

The smart detection automatically stops at workspace boundaries to prevent:
- ❌ Searching beyond the intended project scope
- ❌ Finding unrelated `.git` directories in parent folders
- ❌ Performance issues from excessive filesystem traversal

**Workspace indicators detected:**
- Multiple Loqa repositories (`loqa`, `loqa-hub`, `loqa-commander`, etc.)
- Workspace configuration files (`.workspace`, `workspace.json`, `lerna.json`, `rush.json`)

**Example behavior:**
```
/workspace/                    # ← Stops here (workspace boundary)
├── loqa/ (.git)              # ← Git repo found
├── loqa-hub/ (.git)          # ← Git repo found  
└── loqa-commander/ (.git)    # ← Git repo found

# From /workspace/: Returns "not in git repo" (stops at boundary)
# From /workspace/loqa/tools/: Returns loqa repo root
```

### Example Output

```bash
$ cd loqa/project/loqa-assistant-mcp/src/utils/
$ smart-git status

Repository: /Users/dev/loqa
Current path: project/loqa-assistant-mcp/src/utils
Branch: main  
Has changes: true
Changes:
M  project/loqa-assistant-mcp/src/index.ts
?? project/new-feature/
```

## 🚀 Advanced Usage

### Feature Branch Creation
```bash
smart-git branch feature/my-awesome-feature
# Automatically:
# 1. Fetches origin/main
# 2. Switches to main  
# 3. Pulls latest changes
# 4. Creates and switches to new branch
```

### Smart Commits
```bash
smart-git commit "Fix MCP server shutdown" file1.ts file2.ts
# Automatically:
# 1. Adds specified files (or uses git add if no files specified)
# 2. Commits with message
# 3. Returns commit hash
```

### Any Git Command
```bash
smart-git log --oneline -10        # Git log from repo root
smart-git diff HEAD~1              # Git diff from repo root
smart-git push origin feature-x    # Git push from repo root
```

## 💻 Integration with Development Tools

### Claude Code (AI Assistant)

The smart git detection integrates with Claude Code through the MCP server, providing AI-enhanced git workflows:

```
/intelligent_task_prioritization   # AI task selection
/create-branch-from-task          # Auto-branch creation
/create-pr-from-task              # Auto-PR generation
```

### Manual Integration

Use in scripts and tools:
```bash
#!/bin/bash
# Always works regardless of current directory
REPO_ROOT=$(smart-git rev-parse --show-toplevel)
cd "$REPO_ROOT" 
# ... rest of script
```

## 📋 Installation Details

### What Gets Installed

1. **Smart Git CLI**: `loqa/tools/smart-git` (executable wrapper)
2. **TypeScript Source**: `loqa/project/loqa-assistant-mcp/src/utils/`
3. **Compiled JavaScript**: `loqa/project/loqa-assistant-mcp/dist/`

### Requirements

- **Node.js** (already required for Loqa development)
- **Git** (obviously!)
- **NPM** (for building TypeScript utilities)

### Zero Configuration

After running `./tools/install-smart-git.sh` once, it works immediately for:
- ✅ All existing developers
- ✅ New team members (after they run the installer)
- ✅ CI/CD pipelines (can use the same commands)
- ✅ Scripts and automation

## 🛠️ Troubleshooting

### Command Not Found
```bash
# Reinstall:
cd loqa/
./tools/install-smart-git.sh
```

### "Not in a git repository"
```bash
# Verify you're in the loqa workspace:
pwd
# Should show: /path/to/loqa or a subdirectory

# Check git detection:
smart-git status

# If you're in a workspace root (multiple repos), this is expected:
ls
# Should show: loqa/ loqa-hub/ loqa-commander/ etc.
# Solution: Navigate into a specific repository: cd loqa/
```

### Workspace Boundary Issues
```bash
# If detection stops unexpectedly at a workspace boundary:

# Check what the detection sees:
node /path/to/loqa/project/loqa-assistant-mcp/dist/utils/git-repo-detector.js $(pwd)

# Common causes:
# - You're in a directory with multiple repositories (intended behavior)
# - Directory contains workspace config files (.workspace, lerna.json, etc.)
# - Multiple directories match Loqa repository patterns
```

### Build Errors
```bash
# Clean rebuild:
cd loqa/project/loqa-assistant-mcp/
rm -rf node_modules/ dist/
npm install
npm run build
```

## 🎯 Benefits for Teams

### Consistency
- **Same commands work** for all developers regardless of their current directory
- **Eliminates confusion** about repository context
- **Reduces git command failures** due to wrong working directory

### Productivity  
- **No more `cd` gymnastics** to find the right directory
- **Faster feature branch creation** with built-in best practices
- **Context-aware status** shows both repo root and your location

### Reliability
- **Automatic repository detection** prevents executing commands in wrong repos
- **Error handling** with clear messages when not in a git repository
- **Consistent behavior** across different development environments

## 📚 For More Information

- **Source Code**: `loqa/project/loqa-assistant-mcp/src/utils/`
- **Examples**: `loqa/project/smart-git-demo.sh`
- **MCP Integration**: `loqa/project/loqa-assistant-mcp/README.md`

The smart git detection makes Loqa development more reliable and productive for the entire team!