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

Once connected, you can use these commands in Claude Code:

- `/start-task-work` - AI-enhanced task prioritization
- `/intelligent_task_prioritization` - Smart task recommendations
- `/create-branch-from-task` - Create git branches from tasks
- `/run-integration-tests` - Run comprehensive testing
- `/create-pr-from-task` - Create PRs with task linking
- `/analyze-dependency-impact` - Cross-repo impact analysis

## How It Works

1. **Claude Code automatically starts the server** when you begin a conversation
2. **The server connects via stdio** (not HTTP) - this is standard for MCP
3. **Commands become available** in the Claude Code interface
4. **AI features activate** for intelligent workflow automation

## Troubleshooting

- **Server won't start**: Run `npm install && npm run build` in the MCP directory
- **Commands not available**: Restart VS Code to reload the configuration
- **Permission errors**: Use the local script option instead of global installation