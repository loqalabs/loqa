import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { SmartGitHelpers } from '../utils/smart-git-helpers.js';
import { executeGitCommand } from '../utils/git-repo-detector.js';
import { LoqaWorkspaceManager } from '../managers/index.js';

/**
 * Smart Git MCP Tools - Direct integration of smart-git functionality into MCP
 * Provides intelligent git operations with repository context detection
 */

export const SmartGitTools = {
  // Core smart git status
  async handleSmartGitStatus(): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const result = await SmartGitHelpers.getSmartStatus();
      
      if (!result.success) {
        throw new McpError(ErrorCode.InternalError, `Smart git status failed: ${result.error}`);
      }

      let output = [];
      output.push(`📁 **Repository**: ${result.repoRoot}`);
      output.push(`📍 **Current path**: ${result.relativePath || '(root)'}`);
      output.push(`🌿 **Branch**: ${result.currentBranch}`);
      output.push(`📝 **Has changes**: ${result.hasChanges ? 'Yes' : 'No'}`);
      
      // Check if main is behind when we're on main branch
      if (result.currentBranch === 'main') {
        const mainStatus = await SmartGitHelpers.checkMainStatus();
        if (mainStatus.success && mainStatus.isBehind) {
          output.push('');
          output.push(`⚠️  **Main is ${mainStatus.commitsBeind} commits behind origin/main**`);
          output.push(`💡 Consider running smart git sync to pull updates and cleanup merged branches`);
        }
      }
      
      if (result.status) {
        output.push('');
        output.push('📋 **Changes**:');
        output.push('```');
        output.push(result.status);
        output.push('```');
      }

      return {
        content: [{ type: "text", text: output.join('\n') }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Smart git status error: ${error}`);
    }
  },

  // Smart branch creation
  async handleSmartGitBranch(branchName: string): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      if (!branchName) {
        throw new McpError(ErrorCode.InvalidParams, 'Branch name is required');
      }

      const result = await SmartGitHelpers.createFeatureBranch(branchName);
      
      if (!result.success) {
        throw new McpError(ErrorCode.InternalError, `Smart git branch creation failed: ${result.error}`);
      }

      const output = [
        `✅ **Created and switched to branch**: ${result.branchName}`,
        `📁 **Repository**: ${result.repoRoot}`,
        `🔄 **Fetched latest changes** from origin/main`,
        '',
        `🚀 **Ready for development** on feature branch!`
      ];

      return {
        content: [{ type: "text", text: output.join('\n') }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Smart git branch error: ${error}`);
    }
  },

  // Smart commit with optional file specification
  async handleSmartGitCommit(message: string, files?: string[]): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      if (!message) {
        throw new McpError(ErrorCode.InvalidParams, 'Commit message is required');
      }

      const result = await SmartGitHelpers.smartCommit(message, files);
      
      if (!result.success) {
        throw new McpError(ErrorCode.InternalError, `Smart git commit failed: ${result.error}`);
      }

      const output = [
        `✅ **Committed**: ${result.commitHash?.substring(0, 8)}`,
        `📁 **Repository**: ${result.repoRoot}`,
        `💬 **Message**: ${message}`
      ];

      if (files && files.length > 0) {
        output.push(`📄 **Files**: ${files.join(', ')}`);
      }

      return {
        content: [{ type: "text", text: output.join('\n') }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Smart git commit error: ${error}`);
    }
  },

  // General smart git command execution
  async handleSmartGitCommand(command: string, args: string[] = []): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      if (!command) {
        throw new McpError(ErrorCode.InvalidParams, 'Git command is required');
      }

      const result = await executeGitCommand([command, ...args]);
      
      if (!result.success) {
        throw new McpError(ErrorCode.InternalError, `Smart git command failed: ${result.stderr || 'Unknown error'}`);
      }

      const output = [
        `🔧 **Command**: git ${command} ${args.join(' ')}`,
        `📁 **Repository**: ${result.repoRoot}`,
        ''
      ];

      if (result.stdout) {
        output.push('📋 **Output**:');
        output.push('```');
        output.push(result.stdout);
        output.push('```');
      }

      return {
        content: [{ type: "text", text: output.join('\n') }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Smart git command error: ${error}`);
    }
  },

  // Smart git sync (pull + cleanup merged branches)
  async handleSmartGitSync(): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const repoInfo = await SmartGitHelpers.getSmartStatus();
      
      if (!repoInfo.success) {
        throw new McpError(ErrorCode.InternalError, 'Not in a git repository');
      }

      // First pull latest changes
      const pullResult = await executeGitCommand(['pull', 'origin', 'main']);
      const output = [`🔄 **Syncing repository**: ${repoInfo.repoRoot}`];
      
      if (pullResult.success) {
        output.push('✅ **Pulled latest changes** from origin/main');
      } else {
        output.push(`⚠️ **Pull warning**: ${pullResult.stderr || 'Unknown error'}`);
      }

      // Then cleanup merged branches (if we're on main)
      if (repoInfo.currentBranch === 'main') {
        const cleanupResult = await executeGitCommand(['branch', '--merged', 'main']);
        if (cleanupResult.success && cleanupResult.stdout) {
          const mergedBranches = cleanupResult.stdout
            .split('\n')
            .map((b: string) => b.trim())
            .filter((b: string) => b && !b.includes('main') && !b.includes('master') && !b.startsWith('*'));
          
          if (mergedBranches.length > 0) {
            output.push('');
            output.push('🧹 **Merged branches found** (consider cleaning up):');
            mergedBranches.forEach((branch: string) => {
              output.push(`  - ${branch}`);
            });
            output.push('');
            output.push('💡 **Tip**: Use `git branch -d <branch-name>` to delete merged branches');
          }
        }
      }

      return {
        content: [{ type: "text", text: output.join('\n') }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Smart git sync error: ${error}`);
    }
  },

  // Repository context detection
  async handleSmartGitContext(): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const workspaceManager = new LoqaWorkspaceManager();
      const context = await workspaceManager.getWorkspaceStatus();
      
      const output = [
        `🏠 **Workspace**: Multi-repository workspace detected`,
        `📁 **Current Directory**: ${process.cwd()}`,
        '',
        `🗂️ **Known Repositories**:`,
      ];

      for (const repo of context.repositories) {
        const statusResult = await SmartGitHelpers.getSmartStatus(repo.path);
        if (statusResult.success) {
          output.push(`  - **${repo.name}**: ${statusResult.currentBranch} ${statusResult.hasChanges ? '(has changes)' : '(clean)'}`);
        } else {
          output.push(`  - **${repo.name}**: (not a git repo or error)`);
        }
      }

      return {
        content: [{ type: "text", text: output.join('\n') }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Smart git context error: ${error}`);
    }
  }
};