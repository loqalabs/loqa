# Loqa Assistant MCP Server

This MCP server provides Claude Code integration for Loqa development workflows.

## Quick Start

### Option 1: Local Script (Recommended)
```bash
# From anywhere in the Loqa project:
./project/loqa-assistant-mcp/start-mcp.sh
```

### Option 2: Global Command (Optional)
```bash
# Install global command (requires sudo):
./project/loqa-assistant-mcp/install-global-command.sh

# Then use from anywhere:
loqa-mcp
```

### Option 3: Direct npm commands
```bash
cd project/loqa-assistant-mcp
npm install
npm run build
npm start
```

## Claude Code Configuration

The MCP server is already configured in your VS Code settings at:
`/Users/anna/Library/Application Support/Code/User/settings.json`

## Available Commands

Once connected, you can use the unified `/loqa` command in Claude Code with discoverable categories:

### 🚀 The Unified Loqa Command

```bash
/loqa                           # Show all available categories
/loqa [category]                # Show available actions for category  
/loqa [category] [action] [args] # Execute specific command
```

### 📋 Task Management (`/loqa task`)
- `/loqa task create "description"` - **AI-enhanced task creation** with complexity routing and templates
- `/loqa task list --status=active` - **Smart task listing** with cross-repository filtering
- `/loqa task update task-123 --status=done` - **Task updates** with intelligent state management
- `/loqa task resume abc-123` - **Resume draft creation** with AI-guided interview process

### 🛠️ Development Workflow (`/loqa dev`)
- `/loqa dev work --priority=P1` - **AI-powered work sessions** with task selection and context setup
- `/loqa dev branch --taskId=21` - **Smart branch creation** with proper naming conventions
- `/loqa dev pr --draft=true` - **Intelligent PR generation** with comprehensive task linking
- `/loqa dev test --scope=integration` - **Cross-repository testing** with dependency awareness
- `/loqa dev analyze --repository=loqa-hub` - **Impact analysis** with protocol change detection

### 📊 Planning & Strategy (`/loqa plan`)
- `/loqa plan recommend --roleContext=developer` - **AI recommendations** with strategic scoring (0-100)
- `/loqa plan strategy --title="Migration Plan"` - **Strategic planning** with impact analysis and coordination

### 💭 Knowledge Capture (`/loqa capture`)
- `/loqa capture thought "Memory leak concern"` - **Quick thought capture** with automated categorization
- `/loqa capture idea "Real-time collaboration"` - **Advanced analysis** with sprint alignment and follow-up suggestions

## How It Works

1. **Claude Code automatically starts the server** when you begin a conversation
2. **The server connects via stdio** (not HTTP) - this is standard for MCP
3. **Commands become available** in the Claude Code interface
4. **AI features activate** for intelligent workflow automation

## 🧠 AI Enhancement Phases

### Phase 1: Intelligent Task Selection
- **AI-powered task matching** based on project context and skill level
- **Strategic analysis** with bottleneck identification
- **Intelligent prioritization** with scoring systems (0-100 scale)

### Phase 2: Advanced Workflow Intelligence  
- **Enhanced thought capture** with automatic categorization
- **Cross-repository coordination** with dependency graph analysis
- **Sprint alignment analysis** with active task correlation
- **Strategic value scoring** for thoughts and ideas

### Phase 3: Predictive Analytics & Automation
- **Real-time workflow health** monitoring across all repositories
- **Sprint success prediction** based on historical velocity patterns
- **Technical debt trajectory** analysis with trend identification
- **Workflow bottleneck detection** with automated mitigation strategies
- **Predictive analytics** for delivery risk assessment
- **Context-aware recommendations** for optimal next actions

## Troubleshooting

- **Server won't start**: Run `npm install && npm run build` in the MCP directory
- **Commands not available**: Restart VS Code to reload the configuration
- **Permission errors**: Use the local script option instead of global installation