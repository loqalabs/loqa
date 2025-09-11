/**
 * Workspace Management MCP tools
 * Handles multi-repository status, health checks, and workspace operations
 */

export const workspaceTools = [
  {
    name: "workspace_status", 
    description: "Get comprehensive status across all repositories in the workspace",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "workspace_health",
    description: "Get backlog health and task statistics across all repositories",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "run_quality_checks",
    description: "Run quality checks across the workspace",
    inputSchema: {
      type: "object",
      properties: {
        repository: {
          type: "string",
          description: "Optional specific repository to check"
        }
      }
    }
  },
  {
    name: "create_branch_from_task",
    description: "Create a feature branch based on a task",
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "Task ID to create branch from"
        },
        repository: {
          type: "string", 
          description: "Repository to create branch in"
        }
      },
      required: ["taskId"]
    }
  },
  {
    name: "run_integration_tests",
    description: "Run integration tests across repositories",
    inputSchema: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          enum: ["all", "affected", "current"],
          description: "Scope of integration tests to run"
        }
      }
    }
  },
  {
    name: "create_pr_from_task",
    description: "Create a pull request from a completed task",
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "Task ID to create PR from"
        },
        repository: {
          type: "string",
          description: "Repository to create PR in"
        },
        baseBranch: {
          type: "string",
          description: "Base branch for the PR (defaults to main)"
        },
        draft: {
          type: "boolean",
          description: "Create as draft PR"
        },
        autoMerge: {
          type: "boolean", 
          description: "Enable auto-merge when checks pass"
        }
      },
      required: ["taskId"]
    }
  },
  {
    name: "analyze_dependency_impact",
    description: "Analyze cross-repository dependency impact of changes",
    inputSchema: {
      type: "object",
      properties: {
        repository: {
          type: "string",
          description: "Repository with changes"
        },
        changeType: {
          type: "string",
          enum: ["breaking", "feature", "bugfix", "internal"],
          description: "Type of change being made"
        }
      },
      required: ["repository", "changeType"]
    }
  },
  {
    name: "intelligent_task_prioritization",
    description: "Get intelligent task prioritization recommendations",
    inputSchema: {
      type: "object",
      properties: {
        repository: {
          type: "string",
          description: "Optional repository filter"
        },
        role: {
          type: "string", 
          description: "Current role context for prioritization"
        },
        timeframe: {
          type: "string",
          enum: ["today", "week", "sprint", "month"],
          description: "Timeframe for prioritization"
        }
      }
    }
  }
];

// Import workspace manager at the function level to avoid circular dependencies
async function getWorkspaceManager() {
  // This will be defined in the main index.ts file as MCPWorkspaceManager
  // We'll handle this through the main tool handler
  throw new Error("Workspace manager should be handled by main tool handler");
}

export async function handleWorkspaceTool(name: string, args: any, workspaceManager: any): Promise<any> {
  switch (name) {
    case "workspace_status": {
      try {
        const status = await workspaceManager.getWorkspaceStatus();
        
        let statusText = `🏢 **Workspace Status Summary**\n\n`;
        statusText += `📊 **Overall**: ${status.summary.activeRepos}/${status.summary.totalRepos} repositories active\n`;
        statusText += `⚠️ **Changes**: ${status.summary.reposWithChanges} repositories have uncommitted changes\n`;
        statusText += `🌿 **Feature Branches**: ${status.summary.reposOnFeatureBranches} repositories on feature branches\n\n`;
        
        statusText += `**Repository Details**:\n`;
        for (const repo of status.repositories) {
          const statusIcon = repo.exists ? (repo.hasChanges ? '⚠️' : '✅') : '❌';
          const branchInfo = repo.currentBranch ? ` (${repo.currentBranch})` : '';
          const changesInfo = repo.aheadBehind ? ` ${repo.aheadBehind}` : '';
          statusText += `${statusIcon} **${repo.name}**${branchInfo}${changesInfo}\n`;
        }

        return {
          content: [{
            type: "text",
            text: statusText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to get workspace status: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "workspace_health": {
      try {
        const health = await workspaceManager.getWorkspaceHealth();
        
        let healthText = `🏥 **Workspace Health Summary**\n\n`;
        healthText += `📋 **Total Backlogs**: ${health.summary.totalBacklogs}\n`;
        healthText += `📝 **Total Tasks**: ${health.summary.totalTasks}\n`;
        healthText += `💭 **Total Drafts**: ${health.summary.totalDrafts}\n`;
        healthText += `✅ **Healthy Backlogs**: ${health.summary.healthyBacklogs}\n\n`;
        
        if (health.repositories.length > 0) {
          healthText += `**Repository Backlog Status**:\n`;
          for (const repo of health.repositories) {
            const healthIcon = repo.status === 'Healthy' ? '✅' : '⚠️';
            healthText += `${healthIcon} **${repo.name}**: ${repo.tasksCount || 0} tasks, ${repo.draftsCount || 0} drafts\n`;
          }
        } else {
          healthText += `📝 **Note**: Initialize backlogs with \`backlog init\` in repositories for detailed health tracking.`;
        }

        return {
          content: [{
            type: "text",
            text: healthText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to get workspace health: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "run_quality_checks":
    case "create_branch_from_task": 
    case "run_integration_tests":
    case "create_pr_from_task":
    case "analyze_dependency_impact":
    case "intelligent_task_prioritization": {
      // These would be implemented with the full workspace manager
      return {
        content: [{
          type: "text",
          text: `🚧 **${name}** is not yet implemented in the current workspace manager.\n\nThis advanced feature requires the full workspace management implementation. The basic workspace status and health checks are available.`
        }]
      };
    }

    default:
      throw new Error(`Unknown workspace tool: ${name}`);
  }
}