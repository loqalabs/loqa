# Claude Code MCP Server Setup Guide

## ✅ **Configuration Complete**

Your Loqa Assistant MCP server is now configured to work with Claude Code!

## 🎯 **What You Can Do Now**

### **Available Commands in Claude Code:**

1. **🚀 AI-Enhanced Task Management:**
   ```
   /start-task-work
   /start-task-work --priority=P1 --roleContext=developer
   /intelligent_task_prioritization --timeAvailable=2h
   ```

2. **🌿 Automated Branch Creation:**
   ```
   /create-branch-from-task --taskId=21
   ```

3. **🧪 Integration Testing:**
   ```
   /run-integration-tests --testSuites=integration,e2e
   ```

4. **🔀 PR Creation:**
   ```
   /create-pr-from-task
   ```

5. **🔍 Dependency Analysis:**
   ```
   /analyze-dependency-impact --protoChanges=audio.proto
   ```

## 🔧 **Configuration Details**

**Location:** `/Users/anna/Library/Application Support/Code/User/settings.json`

**Configuration Added:**
```json
"claudeCode.mcpServers": {
    "loqa-assistant": {
        "command": "npm",
        "args": ["start"],
        "cwd": "/Users/anna/Projects/loqalabs/loqa/project/loqa-assistant-mcp"
    }
}
```

## 📋 **How to Use**

### **Step 1: Open VS Code with Claude Code Extension**
- Make sure you have the Claude Code extension installed in VS Code
- Open any project or file in VS Code

### **Step 2: Access Claude Code**
- Open the Claude Code panel/chat interface in VS Code
- The MCP server will automatically start when you begin a conversation

### **Step 3: Use Custom Commands**
```
/start-task-work --priority=P1
```

**Claude Code will:**
1. Automatically start the MCP server (`npm start`)
2. Connect to your Loqa Assistant server
3. Execute the AI-enhanced task prioritization
4. Return intelligent task recommendations

## 🧠 **AI Features Available**

### **Intelligent Task Prioritization:**
- **Multi-criteria scoring:** Priority (40%) + Status (20%) + Role (20%) + Time (10%) + Context (10%)
- **Cross-repository analysis:** Scans all 8 Loqa repositories
- **Role-based matching:** architect, developer, devops, qa
- **Time-effort correlation:** Matches tasks to available time

### **Workflow Automation:**
- **Branch creation** from backlog tasks
- **Integration testing** with Docker orchestration
- **PR creation** with automatic task linking
- **Impact analysis** for protocol changes

## 🔄 **Testing the Setup**

1. **Open VS Code**
2. **Start Claude Code** conversation
3. **Try a command:**
   ```
   /intelligent_task_prioritization
   ```
4. **Verify output** shows AI recommendations with scoring

## 🛠️ **Troubleshooting**

### **If Commands Don't Work:**
1. **Check VS Code settings** are saved correctly
2. **Restart VS Code** to reload configuration
3. **Verify MCP server** can start: `cd /Users/anna/Projects/loqalabs/loqa/project/loqa-assistant-mcp && npm start`

### **Common Issues:**
- **"Command not found"** → VS Code settings not saved
- **"Server connection failed"** → Check npm dependencies in MCP directory
- **"No tasks found"** → Verify backlog.md files exist in repositories

## 🎉 **You're Ready!**

Your Claude Code setup now includes:
- ✅ AI-enhanced task prioritization
- ✅ Complete Phase 4 automation suite
- ✅ Cross-repository coordination
- ✅ Intelligent workflow guidance

Start using `/start-task-work` for AI-powered development workflow automation!