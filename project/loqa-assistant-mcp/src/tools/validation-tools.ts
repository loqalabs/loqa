import { LoqaRulesValidator } from '../validators/index.js';

/**
 * Validation-related MCP tools
 * Handles commit validation, branch validation, quality gates, etc.
 */

export const validationTools = [
  {
    name: "validation:CommitMessage",
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
    name: "validation:BranchName",
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
    name: "validation:PreCommit",
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
    name: "validation:RepositoryInfo",
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
    name: "validation:QualityGates",
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
    name: "validation:DiagnoseWorkspace",
    description: "Diagnose workspace context and provide detailed environment information",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "validation:BacklogContext",
    description: "Validate current directory context is safe for backlog commands and provide recommendations",
    inputSchema: {
      type: "object",
      properties: {
        targetRepo: {
          type: "string",
          description: "Optional target repository name to validate against (e.g. 'loqa', 'loqa-hub')"
        }
      }
    }
  }
];

export async function handleValidationTool(name: string, args: any): Promise<any> {
  const validator = new LoqaRulesValidator();

  switch (name) {
    case "validation:CommitMessage": {
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

    case "validation:BranchName": {
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

    case "validation:PreCommit": {
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

    case "validation:RepositoryInfo": {
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

    case "validation:QualityGates": {
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

    case "validation:DiagnoseWorkspace": {
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

    case "validation:BacklogContext": {
      const { targetRepo } = args;
      try {
        const { detectWorkspaceContext } = await import('../utils/context-detector.js');
        const context = await detectWorkspaceContext();
        const validator = new LoqaRulesValidator();
        
        let validation = {
          safe: false,
          context: context.type,
          currentDirectory: process.cwd(),
          issues: [] as string[],
          warnings: [] as string[],
          recommendations: [] as string[]
        };
        
        // Check if we're in workspace root (dangerous for backlog commands)
        if (context.type === 'workspace-root') {
          validation.issues.push("❌ Currently in workspace root - backlog commands will create unwanted directories");
          validation.recommendations.push("Navigate to target repository first (e.g. 'cd loqa', 'cd loqa-hub')");
        }
        
        // Check if we're in a valid git repository
        if (context.type === 'individual-repo') {
          const repoInfo = await validator.getRepositoryInfo();
          
          // Check if it's a Loqa repository
          if (!repoInfo.isLoqaRepository) {
            validation.warnings.push("⚠️ Not in a recognized Loqa repository");
            validation.recommendations.push("Ensure you're in the correct repository for your task");
          }
          
          // Check target repo if specified
          if (targetRepo && context.currentRepository !== targetRepo) {
            validation.warnings.push(`⚠️ Currently in '${context.currentRepository}' but target is '${targetRepo}'`);
            validation.recommendations.push(`Navigate to target repository: cd ../${targetRepo}`);
          }
          
          // Check for existing backlog
          const fs = await import('fs/promises');
          const path = await import('path');
          
          try {
            await fs.access(path.join(process.cwd(), 'backlog'));
            validation.recommendations.push("✅ Backlog directory exists - safe to create tasks");
            validation.safe = validation.issues.length === 0;
          } catch {
            validation.warnings.push("⚠️ No existing backlog directory - will be created");
            validation.recommendations.push("First task will initialize backlog in this repository");
            validation.safe = validation.issues.length === 0;
          }
        }
        
        // Check if we're in unknown context
        if (context.type === 'unknown') {
          validation.issues.push("❌ Could not determine repository context");
          validation.recommendations.push("Navigate to a Loqa repository root directory");
        }
        
        // Generate status message
        let message = validation.safe ? "✅ Safe for backlog commands" : "❌ Not safe for backlog commands";
        if (validation.warnings.length > 0) {
          message += ` (${validation.warnings.length} warnings)`;
        }
        
        let report = `🔍 **Backlog Context Validation**\n\n`;
        report += `📂 **Current Directory**: ${validation.currentDirectory}\n`;
        report += `🏷️ **Context**: ${validation.context}\n`;
        report += `✅ **Safe for Backlog**: ${validation.safe ? 'Yes' : 'No'}\n\n`;
        
        if (context.currentRepository) {
          report += `📦 **Current Repository**: ${context.currentRepository}\n`;
          if (targetRepo && targetRepo !== context.currentRepository) {
            report += `🎯 **Target Repository**: ${targetRepo}\n`;
          }
        }
        
        if (validation.issues.length > 0) {
          report += `\n🚨 **Issues**:\n`;
          validation.issues.forEach(issue => report += `${issue}\n`);
        }
        
        if (validation.warnings.length > 0) {
          report += `\n⚠️ **Warnings**:\n`;
          validation.warnings.forEach(warning => report += `${warning}\n`);
        }
        
        if (validation.recommendations.length > 0) {
          report += `\n💡 **Recommendations**:\n`;
          validation.recommendations.forEach(rec => report += `${rec}\n`);
        }
        
        report += `\n📋 **Available Repositories**:\n`;
        context.availableRepositories.forEach(repo => {
          const isCurrent = repo === context.currentRepository ? ' (current)' : '';
          const isTarget = repo === targetRepo ? ' (target)' : '';
          report += `• ${repo}${isCurrent}${isTarget}\n`;
        });
        
        return {
          content: [{
            type: "text",
            text: report
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to validate backlog context: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    default:
      throw new Error(`Unknown validation tool: ${name}`);
  }
}