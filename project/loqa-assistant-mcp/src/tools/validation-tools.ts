import { LoqaRulesValidator } from '../validators/index.js';

/**
 * Validation-related MCP tools
 * Handles commit validation, branch validation, quality gates, etc.
 */

export const validationTools = [
  {
    name: "validate_commit_message",
    description: "Validate commit message against Loqa rules and detect AI attribution",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The commit message to validate"
        }
      },
      required: ["message"]
    }
  },
  {
    name: "validate_branch_name",
    description: "Validate branch name follows proper conventions",
    inputSchema: {
      type: "object",
      properties: {
        branchName: {
          type: "string",
          description: "The branch name to validate"
        }
      },
      required: ["branchName"]
    }
  },
  {
    name: "validate_pre_commit",
    description: "Run comprehensive pre-commit validation including commit message and quality gates",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The commit message to validate"
        },
        repoPath: {
          type: "string",
          description: "Optional repository path (defaults to current directory)"
        }
      },
      required: ["message"]
    }
  },
  {
    name: "get_repository_info",
    description: "Get comprehensive repository information including branch status and Loqa detection",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description: "Optional repository path (defaults to current directory)"
        }
      }
    }
  },
  {
    name: "validate_quality_gates",
    description: "Validate quality gates for the repository",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string", 
          description: "Optional repository path (defaults to current directory)"
        }
      }
    }
  },
  {
    name: "diagnose_workspace",
    description: "Diagnose workspace context and provide detailed environment information",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

export async function handleValidationTool(name: string, args: any): Promise<any> {
  const validator = new LoqaRulesValidator();

  switch (name) {
    case "validate_commit_message": {
      const { message } = args;
      const result = await validator.validateCommitMessage(message);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            valid: result.valid,
            violations: result.violations,
            warnings: result.warnings,
            message: result.valid ? "✅ Commit message is valid" : "❌ Commit message has violations"
          }, null, 2)
        }]
      };
    }

    case "validate_branch_name": {
      const { branchName } = args;
      const result = await validator.validateBranchName(branchName);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            valid: result.valid,
            violations: result.violations,
            warnings: result.warnings,
            message: result.valid ? "✅ Branch name is valid" : "❌ Branch name has violations"
          }, null, 2)
        }]
      };
    }

    case "validate_pre_commit": {
      const { message, repoPath } = args;
      const result = await validator.validatePreCommit(message, repoPath);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            valid: result.valid,
            violations: result.violations,
            warnings: result.warnings,
            message: result.valid ? "✅ Pre-commit validation passed" : "❌ Pre-commit validation failed"
          }, null, 2)
        }]
      };
    }

    case "get_repository_info": {
      const { repoPath } = args;
      const repoInfo = await validator.getRepositoryInfo(repoPath);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            repository: repoInfo,
            message: `📁 Repository: ${repoInfo.path} | Branch: ${repoInfo.currentBranch} | Loqa: ${repoInfo.isLoqaRepository ? '✅' : '❌'}`
          }, null, 2)
        }]
      };
    }

    case "validate_quality_gates": {
      const { repoPath } = args;
      const result = await validator.validateQualityGates(repoPath);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            valid: result.valid,
            violations: result.violations,
            warnings: result.warnings,
            message: result.valid ? "✅ Quality gates validation passed" : "❌ Quality gates have violations"
          }, null, 2)
        }]
      };
    }

    case "diagnose_workspace": {
      try {
        const { detectWorkspaceContext } = await import('../utils/context-detector.js');
        const context = await detectWorkspaceContext();
        
        let diagnostic = `🔍 **Workspace Diagnostic Report**\n\n`;
        diagnostic += `📂 **Current Directory**: ${process.cwd()}\n`;
        diagnostic += `🏷️ **Context Type**: ${context.type}\n`;
        diagnostic += `🏢 **Is Loqa Workspace**: ${context.isLoqaWorkspace ? '✅' : '❌'}\n\n`;
        
        if (context.currentRepository) {
          diagnostic += `📦 **Current Repository**: ${context.currentRepository}\n`;
          diagnostic += `🌿 **Current Branch**: ${context.currentBranch || 'Unknown'}\n`;
          diagnostic += `⚠️ **Uncommitted Changes**: ${context.hasUncommittedChanges ? '⚠️ Yes' : '✅ No'}\n\n`;
        }
        
        if (context.workspaceRoot) {
          diagnostic += `🏠 **Workspace Root**: ${context.workspaceRoot}\n\n`;
        }
        
        diagnostic += `📋 **Available Repositories** (${context.availableRepositories.length}):\n`;
        if (context.availableRepositories.length > 0) {
          for (const repo of context.availableRepositories) {
            const isCurrent = repo === context.currentRepository ? ' (current)' : '';
            diagnostic += `• ${repo}${isCurrent}\n`;
          }
        } else {
          diagnostic += `❌ No Loqa repositories found\n`;
        }
        
        diagnostic += `\n**Recommendations**:\n`;
        if (!context.isLoqaWorkspace) {
          diagnostic += `• Navigate to a directory containing Loqa repositories\n`;
          diagnostic += `• Clone Loqa repositories if missing\n`;
        } else if (context.type === 'workspace-root') {
          diagnostic += `• You're in the workspace root - good for multi-repo operations\n`;
          diagnostic += `• Navigate to specific repositories for repo-specific tasks\n`;
        } else if (context.type === 'individual-repo') {
          diagnostic += `• You're in a specific repository - good for focused work\n`;
          diagnostic += `• Use workspace tools from here for cross-repo operations\n`;
        }
        
        return {
          content: [{
            type: "text",
            text: diagnostic
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to diagnose workspace: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    default:
      throw new Error(`Unknown validation tool: ${name}`);
  }
}