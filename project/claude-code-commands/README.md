# Loqa Claude Code Commands

This directory contains the official Claude Code commands for Loqa development. These commands provide AI-enhanced workflow automation, intelligent task management, and cross-repository coordination.

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

## 📋 Available Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/work` | Begin working on tasks with AI selection | `/work --priority=P1` |
| `/recommend` | Get AI task recommendations | `/recommend --roleContext=developer` |
| `/thought` | Capture technical thoughts with intelligent task suggestions | `/thought "Memory leak in audio processing"` |
| `/idea` | Capture feature ideas with intelligent task suggestions | `/idea "Add real-time collaboration"` |
| `/create-task` | Create detailed backlog tasks with intelligent complexity routing | `/create-task "Implement real-time collaboration"` |
| `/resume-draft` | **NEW**: Resume draft task creation and answer interview questions | `/resume-draft abc-123 "My answer"` |
| `/branch` | Create feature branches from tasks | `/branch --taskId=21` |
| `/pr` | Create pull requests with task linking | `/pr --draft=true` |
| `/test` | Run cross-service integration tests | `/test --repositories=loqa-hub,loqa-relay` |
| `/analyze` | Analyze protocol change impact | `/analyze --protoChanges=audio.proto` |
| `/plan` | Plan strategic changes | `/plan --title="Migrate to gRPC"` |

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

1. **Simple task**: `/create-task "Fix login bug"` (auto-upgraded if complex)
2. **Complex task**: `/create-task "Implement real-time collaboration"`  
3. **Resume work**: `/resume-draft` (shows available drafts and interviews)
4. **Answer questions**: `/resume-draft abc-123 "My detailed answer"`

### Smart Integration

- **`/thought`** and **`/idea`** now evaluate against project goals and suggest task creation
- **`/create-task`** automatically upgrades to comprehensive creation for complex scenarios
- All existing workflows preserved - new features enhance without breaking changes

## 🧪 Testing Installation

After installation, test that commands are working:
```bash
# In Claude Code, try:
/work --help
/recommend
/thought "Test thought capture with intelligent evaluation"
/create-task "Test guided task creation"
```

## 📁 Command Files

| File | Command | Description |
|------|---------|-------------|
| `work.md` | `/work` | Task work with intelligent selection |
| `recommend.md` | `/recommend` | AI task recommendations |
| `thought.md` | `/thought` | Capture technical thoughts with intelligent evaluation |
| `idea.md` | `/idea` | Capture feature ideas with intelligent evaluation |
| `create-task.md` | `/create-task` | Create structured tasks with intelligent complexity routing |
| `resume-draft.md` | `/resume-draft` | **NEW**: Resume draft task creation and answer questions |
| `branch.md` | `/branch` | Create feature branches |
| `pr.md` | `/pr` | Create pull requests |
| `test.md` | `/test` | Run integration tests |
| `analyze.md` | `/analyze` | Analyze protocol changes |
| `plan.md` | `/plan` | Strategic planning |
| `list-tasks.md` | `/list-tasks` | Simple task listing |

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