import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { SmartGitTools } from './smart-git-tools.js';

/**
 * Smart Git MCP Tool Definitions
 * Provides MCP tool definitions for smart git functionality
 */

export const smartGitTools = [
  {
    name: "smart-git_status",
    description: "🚀 PREFERRED: Get intelligent git status with repository context detection (use instead of 'git status')",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: "smart-git_branch",
    description: "🚀 PREFERRED: Create feature branch with smart git detection - fetches latest main (use instead of 'git checkout -b')",
    inputSchema: {
      type: "object",
      properties: {
        branchName: {
          type: "string",
          description: "Name of the new branch to create"
        }
      },
      required: ["branchName"],
      additionalProperties: false
    }
  },
  {
    name: "smart-git_commit",
    description: "🚀 PREFERRED: Create smart commit from any subdirectory (use instead of 'git commit')",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Commit message"
        },
        files: {
          type: "array",
          items: { type: "string" },
          description: "Optional specific files to commit (defaults to all staged files)"
        }
      },
      required: ["message"],
      additionalProperties: false
    }
  },
  {
    name: "smart-git_command",
    description: "🚀 PREFERRED: Execute any git command from repository root with smart detection (use instead of Bash git commands)",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Git command to execute (without 'git' prefix)"
        },
        args: {
          type: "array",
          items: { type: "string" },
          description: "Arguments for the git command"
        }
      },
      required: ["command"],
      additionalProperties: false
    }
  },
  {
    name: "smart-git_sync",
    description: "Sync repository with origin/main and show merged branches for cleanup",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: "smart-git_context",
    description: "Show repository context and status across all known repositories",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  }
];

/**
 * Handle smart git tool calls
 */
export async function handleSmartGitTool(name: string, args: any): Promise<any> {
  switch (name) {
    case "smart-git_status":
      return SmartGitTools.handleSmartGitStatus();
      
    case "smart-git_branch":
      return SmartGitTools.handleSmartGitBranch(args.branchName);
      
    case "smart-git_commit":
      return SmartGitTools.handleSmartGitCommit(args.message, args.files);
      
    case "smart-git_command":
      return SmartGitTools.handleSmartGitCommand(args.command, args.args || []);
      
    case "smart-git_sync":
      return SmartGitTools.handleSmartGitSync();
      
    case "smart-git_context":
      return SmartGitTools.handleSmartGitContext();
      
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown smart git tool: ${name}`);
  }
}