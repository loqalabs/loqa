import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Git Preference Detection Tool
 * Suggests using smart-git MCP tools instead of regular git commands
 */

export const gitPreferenceTools = [
  {
    name: "git_guidance",
    description: "🎯 Get recommendations for git operations - suggests smart-git MCP tools over regular git commands",
    inputSchema: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          description: "Git operation you want to perform (status, commit, branch, etc.)"
        }
      },
      required: ["operation"],
      additionalProperties: false
    }
  }
];

export async function handleGitPreferenceTool(name: string, args: any): Promise<any> {
  if (name === "git_guidance") {
    return getGitOperationGuidance(args.operation);
  }
  
  throw new McpError(ErrorCode.MethodNotFound, `Unknown git preference tool: ${name}`);
}

async function getGitOperationGuidance(operation: string): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const guidance = getGitGuidanceForOperation(operation.toLowerCase());
  
  return {
    content: [{ type: "text", text: guidance }]
  };
}

function getGitGuidanceForOperation(operation: string): string {
  const guidanceMap: Record<string, string> = {
    'status': `
🚀 **For git status, use the smart-git MCP tool instead:**

**❌ Instead of:** \`Bash: git status\`
**✅ Use:** \`smart-git_status\`

**Benefits:**
- 📁 Shows repository context and path
- 🌿 Enhanced branch information
- ⚠️ Detects when main is behind origin
- 🔄 Suggests sync operations when needed
`,

    'branch': `
🚀 **For creating branches, use the smart-git MCP tool instead:**

**❌ Instead of:** \`Bash: git checkout -b feature/name\`
**✅ Use:** \`smart-git_branch\` with \`branchName: "feature/name"\`

**Benefits:**
- 🔄 Automatically fetches latest main first
- 📁 Works from any subdirectory
- ✅ Creates properly based branch
- 🎯 Repository context awareness
`,

    'commit': `
🚀 **For commits, use the smart-git MCP tool instead:**

**❌ Instead of:** \`Bash: git commit -m "message"\`
**✅ Use:** \`smart-git_commit\` with \`message: "message"\`

**Benefits:**
- 📁 Works from any subdirectory in the repository
- 🎯 Automatic repository root detection
- 📄 Optional file specification
- ✅ Enhanced commit feedback with hash
`,

    'add': `
🚀 **For staging files, use the smart-git MCP tool:**

**❌ Instead of:** \`Bash: git add .\`
**✅ Use:** \`smart-git_command\` with \`command: "add", args: ["."]\`

**Benefits:**
- 📁 Executes from repository root regardless of current directory
- 🎯 Repository context awareness
- ✅ Enhanced output with repository information
`,

    'sync': `
🚀 **For syncing with main, use the smart-git MCP tool:**

**❌ Instead of:** Multiple git commands
**✅ Use:** \`smart-git_sync\`

**Benefits:**
- 🔄 Pulls latest changes from origin/main
- 🧹 Shows merged branches that can be cleaned up
- ⚠️ Safe operation with warnings
- 📋 Comprehensive sync reporting
`,

    'context': `
🚀 **For repository overview, use the smart-git MCP tool:**

**✅ Use:** \`smart-git_context\`

**Benefits:**
- 🗂️ Shows status across all known repositories
- 🏠 Workspace context detection
- 🌿 Branch status for each repository
- 📊 Multi-repository overview
`
  };

  const specificGuidance = guidanceMap[operation];
  
  if (specificGuidance) {
    return specificGuidance;
  }

  // General guidance for any git operation
  return `
🚀 **For "${operation}", consider using smart-git MCP tools:**

**Available Smart Git Tools:**
- \`smart-git_status\` - Enhanced status with context
- \`smart-git_branch\` - Create feature branches (fetches latest main)  
- \`smart-git_commit\` - Smart commit from any subdirectory
- \`smart-git_command\` - Execute any git command from repo root
- \`smart-git_sync\` - Pull latest + show merged branches for cleanup
- \`smart-git_context\` - Show status across all repositories

**General Benefits:**
- 📁 **Repository Context** - Always operates from the correct repository root
- 🎯 **Multi-Repository Awareness** - Works across all Loqa repositories  
- ✅ **Enhanced Output** - Rich formatted responses with emojis and context
- 🚀 **Workflow Integration** - Designed for the Loqa development workflow

**💡 Use \`smart-git_command\` for any git operation not covered by specific tools.**
`;
}