# Loqa Claude Code Command

This directory contains the unified Claude Code command for Loqa development. The `/loqa` command provides AI-enhanced workflow automation, intelligent task management, and cross-repository coordination through a discoverable CLI-style interface.

## 🚀 Quick Installation

**One-command installation:**
```bash
curl -fsSL "https://raw.githubusercontent.com/loqalabs/loqa/main/project/claude-code-commands/install.sh" | bash
```

**Or clone and install manually:**
```bash
git clone https://github.com/loqalabs/loqa.git
cd loqa/project/claude-code-commands
./install.sh
```

## 📋 The Unified `/loqa` Command

**One command, all functionality.** The `/loqa` command uses a CLI-style interface similar to `git`, `docker`, or `kubectl`:

### **🔍 Discovery Pattern**
```bash
/loqa                    # Show all categories: task, dev, plan, capture
/loqa task              # Show task actions: create, list, update, resume  
/loqa dev               # Show dev actions: work, branch, pr, test, analyze
/loqa plan              # Show planning actions: recommend, strategy
/loqa capture           # Show capture actions: thought, idea
```

### **🚀 Command Examples**
| Usage | Purpose | 
|-------|---------|
| `/loqa task create "Fix login bug"` | Create detailed backlog tasks with intelligent complexity routing |
| `/loqa task list --status=active` | List tasks across repositories with filtering |
| `/loqa task resume abc-123 "My answer"` | Resume draft task creation and answer interview questions |
| `/loqa dev work --priority=P1` | Begin working on tasks with AI selection and workspace detection |
| `/loqa dev branch --taskId=21` | Create feature branches from tasks with proper naming |
| `/loqa dev pr --draft=true` | Create pull requests with task linking and templates |
| `/loqa dev test --repositories=loqa-hub,loqa-relay` | Run cross-service integration tests |
| `/loqa dev analyze --protoChanges=audio.proto` | Analyze protocol change impact across repositories |
| `/loqa plan recommend --roleContext=developer` | Get AI-powered task recommendations |
| `/loqa plan strategy --title="Migrate to gRPC"` | Plan strategic changes with impact analysis |
| `/loqa capture thought "Memory leak in audio processing"` | Capture technical thoughts with intelligent task suggestions |
| `/loqa capture idea "Add real-time collaboration"` | Capture feature ideas with intelligent evaluation |

## 📖 Documentation

For complete documentation, examples, and workflows, see:
- **[DEVELOPER_COMMANDS.md](../../DEVELOPER_COMMANDS.md)** - Complete developer user guide
- **[CLAUDE.md](../../CLAUDE.md)** - Claude Code integration instructions

## 🛠️ Installation Options

### Default Installation
```bash
./install.sh
```
Installs commands to `~/.claude/commands/`

### Custom Directory
```bash
./install.sh --dir /custom/path
```

### Force Overwrite
```bash
./install.sh --force
```
Overwrites existing commands

### Help
```bash
./install.sh --help
```

## 🔄 Updating Commands

To update to the latest version:
1. Pull the latest Loqa repository
2. Run the installer with `--force`:
```bash
cd loqa/project/claude-code-commands
git pull
./install.sh --force
```

## 🎯 New: Comprehensive Task Creation System

The latest update introduces a powerful task creation system that ensures every task is **fully actionable**, **properly scoped**, and **ready for immediate work**.

### Key Features

- **🧠 Intelligent Evaluation**: Thoughts and ideas are automatically analyzed against current project priorities
- **📋 Guided Interviews**: 5-question structured process ensures complete task definition
- **🔄 Persistent Drafts**: Resume interrupted task creation exactly where you left off
- **🏗️ Multi-Repository Coordination**: Automatic repository detection and cross-repo task creation
- **⚡ Smart Breakdown**: Complex tasks automatically split into manageable subtasks
- **💾 File-Based Persistence**: All work saved in `.loqa-assistant/` directory (gitignored)

### Quick Start

1. **Simple task**: `/loqa task create "Fix login bug"` (auto-upgraded if complex)
2. **Complex task**: `/loqa task create "Implement real-time collaboration"`  
3. **Resume work**: `/loqa task resume` (shows available drafts and interviews)
4. **Answer questions**: `/loqa task resume abc-123 "My detailed answer"`

### Smart Integration

- **`/loqa capture thought`** and **`/loqa capture idea`** now evaluate against project goals and suggest task creation
- **`/loqa task create`** automatically upgrades to comprehensive creation for complex scenarios
- All existing workflows preserved - new features enhance without breaking changes

## 🧪 Testing Installation

After installation, test that commands are working:
```bash
# In Claude Code, try:
/loqa                    # Show all categories
/loqa task              # Show task actions  
/loqa dev               # Show development actions
/loqa task create "Test guided task creation"
/loqa capture thought "Test thought capture with intelligent evaluation"
```

## 📁 Command File

| File | Command | Description |
|------|---------|-------------|
| `loqa.md` | `/loqa` | Unified command with all Loqa development functionality |

**Previous individual commands have been consolidated into the single `/loqa` command with a discoverable CLI interface.**

## 🐛 Troubleshooting

**Commands not showing up in Claude Code?**
- Make sure Claude Code is installed and updated
- Check that commands are in `~/.claude/commands/` (or your custom directory)
- Restart Claude Code after installation

**Permission denied?**
```bash
chmod +x install.sh
```

**Installation fails?**
- Make sure you have write permissions to the target directory
- Try installing to a custom directory with `--dir`

## 🤝 Contributing

Found a bug or have suggestions? Please open an issue in the main Loqa repository.

## 📄 License

These commands are part of the Loqa project and are licensed under AGPLv3.