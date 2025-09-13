/**
 * Workspace Management MCP tools
 * Handles multi-repository status, health checks, and workspace operations
 */

export const workspaceTools = [
  {
    name: "workspace:Status", 
    description: "Get comprehensive status across all repositories in the workspace",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "workspace:Health",
    description: "Get GitHub Issues health and issue statistics across all repositories",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "workspace:RunQualityChecks",
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
    name: "workspace:CreateBranchFromIssue",
    description: "Create a feature branch based on an issue",
    inputSchema: {
      type: "object",
      properties: {
        issueId: {
          type: "string",
          description: "Issue ID to create branch from"
        },
        repository: {
          type: "string", 
          description: "Repository to create branch in"
        }
      },
      required: ["issueId"]
    }
  },
  {
    name: "workspace:RunIntegrationTests",
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
    name: "workspace:CreatePRFromIssue",
    description: "Create a pull request from a completed issue",
    inputSchema: {
      type: "object",
      properties: {
        issueId: {
          type: "string",
          description: "Issue ID to create PR from"
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
      required: ["issueId"]
    }
  },
  {
    name: "workspace:AnalyzeDependencyImpact",
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
    name: "workspace:IntelligentIssuePrioritization",
    description: "Get intelligent issue prioritization recommendations",
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

// Import workspace manager at the function level to avoid circular dependencies - currently unused
async function _getWorkspaceManager() {
  // This will be defined in the main index.ts file as MCPWorkspaceManager
  // We'll handle this through the main tool handler
  throw new Error("Workspace manager should be handled by main tool handler");
}

export async function handleWorkspaceTool(name: string, args: any, workspaceManager: any): Promise<any> {
  switch (name) {
    case "workspace:Status": {
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

    case "workspace:Health": {
      try {
        const health = await workspaceManager.getWorkspaceHealth();
        
        let healthText = `🏥 **Workspace Health Summary**\n\n`;
        healthText += `📋 **Total Repositories**: ${health.summary.totalRepositories || 0}\n`;
        healthText += `📝 **Total Issues**: ${health.summary.totalIssues || 0}\n`;
        healthText += `💭 **Open Issues**: ${health.summary.openIssues || 0}\n`;
        healthText += `✅ **Healthy Repositories**: ${health.summary.healthyRepositories || 0}\n\n`;
        
        if (health.repositories.length > 0) {
          healthText += `**Repository Issues Status**:\n`;
          for (const repo of health.repositories) {
            const healthIcon = repo.status === 'Healthy' ? '✅' : '⚠️';
            healthText += `${healthIcon} **${repo.name}**: ${repo.issuesCount || 0} issues\n`;
          }
        } else {
          healthText += `📝 **Note**: GitHub Issues integration provides health tracking across repositories.`;
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

    case "workspace:RunQualityChecks": {
      try {
        const result = await workspaceManager.runQualityChecks(args);
        
        let resultText = `🔍 **Quality Checks Results**\n\n`;
        resultText += `📊 **Summary**: ${result.summary.successful}/${result.summary.totalChecked} repositories passed\n`;
        resultText += `⏱️ **Duration**: ${result.summary.totalDuration}ms\n`;
        resultText += `📋 **Execution Order**: ${result.executionOrder.join(' → ')}\n\n`;
        
        if (result.results.length > 0) {
          resultText += `**Repository Results**:\n`;
          for (const repo of result.results) {
            const statusIcon = repo.successful ? '✅' : '❌';
            resultText += `${statusIcon} **${repo.repository}** (${repo.duration}ms)\n`;
            
            if (repo.checks && repo.checks.length > 0) {
              for (const check of repo.checks) {
                const checkIcon = check.success ? '  ✓' : '  ✗';
                resultText += `${checkIcon} ${check.check}\n`;
                if (!check.success && check.error) {
                  resultText += `    Error: ${check.error}\n`;
                }
              }
            }
            
            if (repo.error) {
              resultText += `  Error: ${repo.error}\n`;
            }
            
            resultText += `\n`;
          }
        }
        
        return {
          content: [{
            type: "text",
            text: resultText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to run quality checks: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "workspace:CreateBranchFromIssue": {
      try {
        const result = await workspaceManager.createBranchFromIssue(args);
        
        if (result.success) {
          let successText = `✅ **Branch Created Successfully**\n\n`;
          successText += `🌿 **Branch**: \`${result.branchName}\`\n`;
          successText += `📁 **Repository**: ${result.repository}\n`;
          successText += `📝 **Issue**: ${result.issueFile}\n`;
          successText += `📋 **Title**: ${result.issueTitle}\n\n`;
          successText += `The feature branch has been created and checked out. You can now start working on the issue.`;
          
          return {
            content: [{
              type: "text",
              text: successText
            }]
          };
        } else {
          return {
            content: [{
              type: "text",
              text: `❌ **Failed to create branch**: ${result.error}`
            }]
          };
        }
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "workspace:RunIntegrationTests": {
      try {
        const result = await workspaceManager.runIntegrationTests(args);
        
        let resultText = `🧪 **Integration Tests Results**\n\n`;
        resultText += `📊 **Summary**: ${result.summary.successful}/${result.summary.totalTests} tests passed\n`;
        resultText += `🏢 **Repositories**: ${result.summary.successfulRepos}/${result.summary.repositoriesTested} successful\n`;
        resultText += `⏱️ **Duration**: ${result.summary.totalDuration}ms\n\n`;
        
        if (result.results.length > 0) {
          resultText += `**Repository Results**:\n`;
          for (const repo of result.results) {
            const statusIcon = repo.successful ? '✅' : '❌';
            const testInfo = repo.hasIntegrationTests ? `(${repo.tests.length} integration tests)` : '(standard tests)';
            resultText += `${statusIcon} **${repo.repository}** ${testInfo} (${repo.duration}ms)\n`;
            
            if (!repo.successful && repo.error) {
              resultText += `  Error: ${repo.error}\n`;
            }
            
            for (const test of repo.tests) {
              const testIcon = test.success ? '  ✓' : '  ✗';
              resultText += `${testIcon} ${test.type}\n`;
              if (!test.success && test.error) {
                resultText += `    ${test.error}\n`;
              }
            }
            resultText += `\n`;
          }
        }
        
        return {
          content: [{
            type: "text",
            text: resultText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to run integration tests: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "workspace:CreatePRFromIssue": {
      try {
        const result = await workspaceManager.createPullRequestFromIssue(args);
        
        if (result.success) {
          let successText = `✅ **Pull Request Created Successfully**\n\n`;
          successText += `🔗 **URL**: ${result.prUrl}\n`;
          successText += `🌿 **Branch**: \`${result.branchName}\` → \`${result.baseBranch}\`\n`;
          successText += `📁 **Repository**: ${result.repository}\n`;
          successText += `📝 **Issue**: ${result.issueFile}\n`;
          successText += `📋 **Title**: ${result.title}\n`;
          if (result.draft) {
            successText += `📝 **Status**: Draft PR\n`;
          }
          successText += `\n`;
          successText += `The pull request has been created and is ready for review.`;
          
          return {
            content: [{
              type: "text",
              text: successText
            }]
          };
        } else {
          return {
            content: [{
              type: "text",
              text: `❌ **Failed to create pull request**: ${result.error}`
            }]
          };
        }
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to create pull request: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "workspace:AnalyzeDependencyImpact": {
      try {
        const result = await workspaceManager.analyzeDependencyImpact(args);
        
        if (result.error) {
          return {
            content: [{
              type: "text",
              text: `❌ **Analysis failed**: ${result.error}`
            }]
          };
        }
        
        let analysisText = `🔍 **Dependency Impact Analysis**\n\n`;
        analysisText += `📊 **Summary**:\n`;
        analysisText += `- Changed files: ${result.analysis.changedFiles.length}\n`;
        analysisText += `- Affected repositories: ${result.summary.highImpactRepos}\n`;
        analysisText += `- Breaking changes: ${result.summary.breakingChanges}\n`;
        analysisText += `- Multi-repo changes: ${result.summary.coordinationRequired ? '⚠️ Yes' : '✅ No'}\n\n`;
        
        if (result.analysis.affectedRepositories.length > 0) {
          analysisText += `🏢 **Affected Repositories**:\n`;
          for (const repo of result.analysis.affectedRepositories) {
            analysisText += `- ${repo}\n`;
          }
          analysisText += `\n`;
        }
        
        if (result.analysis.breakingChanges.length > 0) {
          analysisText += `⚠️ **Breaking Changes**:\n`;
          for (const change of result.analysis.breakingChanges) {
            analysisText += `- ${change}\n`;
          }
          analysisText += `\n`;
        }
        
        const protocolChanges = result.analysis.protocolChanges;
        const hasProtocolChanges = protocolChanges.addedServices.length > 0 || 
                                  protocolChanges.removedServices.length > 0 ||
                                  protocolChanges.addedMethods.length > 0 ||
                                  protocolChanges.removedMethods.length > 0;
        
        if (hasProtocolChanges) {
          analysisText += `🔌 **Protocol Changes**:\n`;
          if (protocolChanges.addedServices.length > 0) {
            analysisText += `- Added services: ${protocolChanges.addedServices.join(', ')}\n`;
          }
          if (protocolChanges.removedServices.length > 0) {
            analysisText += `- Removed services: ${protocolChanges.removedServices.join(', ')}\n`;
          }
          if (protocolChanges.addedMethods.length > 0) {
            analysisText += `- Added methods: ${protocolChanges.addedMethods.join(', ')}\n`;
          }
          if (protocolChanges.removedMethods.length > 0) {
            analysisText += `- Removed methods: ${protocolChanges.removedMethods.join(', ')}\n`;
          }
          analysisText += `\n`;
        }
        
        if (result.analysis.recommendations.length > 0) {
          analysisText += `💡 **Recommendations**:\n`;
          for (const rec of result.analysis.recommendations) {
            analysisText += `- ${rec}\n`;
          }
        }
        
        return {
          content: [{
            type: "text",
            text: analysisText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to analyze dependency impact: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "workspace:IntelligentIssuePrioritization": {
      try {
        const result = await workspaceManager.intelligentIssuePrioritization(args);
        
        let priorityText = `🎯 **Intelligent Issue Prioritization**\n\n`;
        priorityText += `📊 **Analysis Summary**:\n`;
        priorityText += `- Total issues found: ${result.analysis.totalIssues}\n`;
        priorityText += `- Eligible issues: ${result.analysis.eligibleIssues}\n`;
        priorityText += `- Context: ${result.analysis.context.role} role, ${result.analysis.context.timeAvailable} time, ${result.analysis.context.repositoryFocus} repository focus\n\n`;
        
        if (result.recommendedIssue) {
          priorityText += `⭐ **Recommended Issue**:\n`;
          priorityText += `- **${result.recommendedIssue.title}** (${result.recommendedIssue.repository})\n`;
          priorityText += `- Priority: ${result.recommendedIssue.priority}\n`;
          priorityText += `- Status: ${result.recommendedIssue.status}\n`;
          priorityText += `- Score: ${result.recommendedIssue.score}/10\n\n`;
        }
        
        if (result.alternativeIssues.length > 0) {
          priorityText += `🔄 **Alternative Issues**:\n`;
          for (const issue of result.alternativeIssues) {
            priorityText += `- **${issue.title}** (${issue.repository}) - Score: ${issue.score}/10\n`;
          }
          priorityText += `\n`;
        }
        
        // AI-Enhanced Analysis Section
        if (result.aiAnalysis) {
          priorityText += `🧠 **Enhanced Analysis**:\n\n`;

          priorityText += `📈 **Work Focus**: ${result.aiAnalysis.workFocus}\n`;
          priorityText += `🏥 **Project Health**: ${result.aiAnalysis.projectHealth}\n`;
          priorityText += `⏰ **Timeline Insight**: ${result.aiAnalysis.timelineInsights}\n\n`;
          
          if (result.aiAnalysis.bottlenecks.length > 0) {
            priorityText += `🚧 **Identified Bottlenecks**:\n`;
            for (const bottleneck of result.aiAnalysis.bottlenecks) {
              priorityText += `• ${bottleneck}\n`;
            }
            priorityText += `\n`;
          }
          
          if (result.aiAnalysis.riskAssessment.length > 0) {
            priorityText += `⚠️ **Risk Assessment**:\n`;
            for (const risk of result.aiAnalysis.riskAssessment) {
              priorityText += `• ${risk}\n`;
            }
            priorityText += `\n`;
          }
          
          if (result.aiAnalysis.optimizationRecommendations.length > 0) {
            priorityText += `💡 **Optimization Recommendations**:\n`;
            for (const rec of result.aiAnalysis.optimizationRecommendations) {
              priorityText += `• ${rec}\n`;
            }
            priorityText += `\n`;
          }
          
          priorityText += `🚀 **Next Steps**:\n`;
          priorityText += `• Use natural language: "Create a feature branch for issue #[number]"\n`;
          priorityText += `• Or MCP tool: \`smart-git_branch(branchName: "feature/[issue-name]")\`\n`;
          priorityText += `• Run quality checks before committing\n\n`;
        }
        
        if (result.analysis.totalIssues === 0) {
          priorityText += `📝 **No issues found**. Consider:\n`;
          priorityText += `- Creating GitHub Issues in repositories\n`;
          priorityText += `- Creating issues: \`/add-todo "Issue title"\`\n`;
        }
        
        return {
          content: [{
            type: "text",
            text: priorityText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to get issue prioritization: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    default:
      throw new Error(`Unknown workspace tool: ${name}`);
  }
}