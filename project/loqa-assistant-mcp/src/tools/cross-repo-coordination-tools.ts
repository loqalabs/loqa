/**
 * Cross-Repository Coordination Tools - Pragmatic multi-repo workflow automation
 *
 * MCP tools for coordinating workflows across the 8-repository Loqa ecosystem
 * with dependency-aware operations and AI-powered impact analysis
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { crossRepoCoordinator } from '../utils/cross-repo-coordinator.js';
import { detectGitRepo, executeGitCommand } from '../utils/git-repo-detector.js';
import * as path from 'path';

export const crossRepoCoordinationTools: Tool[] = [
  {
    name: 'crossRepo:AnalyzeImpact',
    description: 'Analyze the impact of changes on other repositories',
    inputSchema: {
      type: 'object',
      properties: {
        repositoryName: {
          type: 'string',
          description: 'Name of the repository with changes'
        },
        changedFiles: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of changed file paths'
        },
        commitMessage: {
          type: 'string',
          description: 'Commit message or description of changes'
        },
        repoPath: {
          type: 'string',
          description: 'Repository path (optional, auto-detected if not provided)'
        }
      }
    }
  },

  {
    name: 'crossRepo:CreateCoordinatedBranches',
    description: 'Create matching feature branches across multiple repositories',
    inputSchema: {
      type: 'object',
      properties: {
        branchName: {
          type: 'string',
          description: 'Name of the feature branch to create'
        },
        repositories: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of repository names (optional, auto-detected from impact analysis)'
        },
        baseBranch: {
          type: 'string',
          description: 'Base branch to create from (defaults to main)'
        },
        issueNumber: {
          type: 'string',
          description: 'GitHub issue number to associate with branches'
        }
      },
      required: ['branchName']
    }
  },

  {
    name: 'crossRepo:RunCoordinatedQualityGates',
    description: 'Run quality gates across multiple repositories in dependency order',
    inputSchema: {
      type: 'object',
      properties: {
        repositories: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of repository names (optional, defaults to all)'
        },
        stopOnFirstFailure: {
          type: 'boolean',
          description: 'Stop execution if any repository fails quality checks'
        }
      }
    }
  },

  {
    name: 'crossRepo:GetDependencyOrder',
    description: 'Get the proper dependency order for operations across repositories',
    inputSchema: {
      type: 'object',
      properties: {
        repositories: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of repository names (optional, defaults to all)'
        },
        operation: {
          type: 'string',
          description: 'Type of operation (build, test, deploy, etc.)'
        }
      }
    }
  },

  {
    name: 'crossRepo:DetectCurrentChanges',
    description: 'Analyze current working directory changes for cross-repo impact',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: {
          type: 'string',
          description: 'Repository path (defaults to current directory)'
        },
        includeUncommitted: {
          type: 'boolean',
          description: 'Include uncommitted changes in analysis'
        }
      }
    }
  },

  {
    name: 'crossRepo:GenerateCoordinationPlan',
    description: 'Generate a comprehensive coordination plan for complex changes',
    inputSchema: {
      type: 'object',
      properties: {
        changeDescription: {
          type: 'string',
          description: 'Description of the planned changes'
        },
        primaryRepository: {
          type: 'string',
          description: 'Repository where changes will start'
        },
        changeType: {
          type: 'string',
          enum: ['breaking', 'feature', 'bugfix', 'internal'],
          description: 'Type of change being made'
        }
      },
      required: ['changeDescription', 'primaryRepository']
    }
  }
];

export async function handleCrossRepoCoordinationTools(name: string, args: any): Promise<any> {
  try {
    switch (name) {
      case 'crossRepo:AnalyzeImpact': {
        let repositoryName = args.repositoryName;
        const changedFiles = args.changedFiles || [];
        const commitMessage = args.commitMessage || '';
        const repoPath = args.repoPath || process.cwd();

        // Auto-detect repository name if not provided
        if (!repositoryName) {
          const detected = await detectGitRepo(repoPath);
          repositoryName = detected.repoRoot ? path.basename(detected.repoRoot) : 'unknown';
        }

        const impact = await crossRepoCoordinator.analyzeChangeImpact(
          repositoryName,
          changedFiles,
          commitMessage
        );

        return {
          repository: repositoryName,
          impact: {
            type: impact.impactType,
            complexity: impact.coordinationComplexity,
            estimatedEffort: impact.estimatedEffort,
            affectedRepositories: impact.affectedRepositories,
            totalAffected: impact.affectedRepositories.length
          },
          requiredActions: impact.requiredActions.map(action => ({
            repository: action.repository,
            action: action.actionType,
            description: action.description,
            priority: action.priority,
            automatable: action.automatable,
            effort: action.estimatedEffort
          })),
          automation: {
            recommendations: impact.automationRecommendations,
            automatableActions: impact.requiredActions.filter(a => a.automatable).length,
            manualActions: impact.requiredActions.filter(a => !a.automatable).length
          },
          summary: `${impact.impactType.toUpperCase()} change in ${repositoryName} affects ${impact.affectedRepositories.length} repositories with ${impact.coordinationComplexity} coordination complexity`
        };
      }

      case 'crossRepo:CreateCoordinatedBranches': {
        const branchName = args.branchName;
        const repositories = args.repositories || crossRepoCoordinator.getAllRepositories().map(r => r.name);
        const baseBranch = args.baseBranch || 'main';

        const result = await crossRepoCoordinator.createCoordinatedBranches(
          branchName,
          repositories,
          baseBranch
        );

        const summary = {
          branchName,
          baseBranch,
          totalRepositories: repositories.length,
          successful: result.results.filter(r => r.success).length,
          failed: result.results.filter(r => !r.success).length,
          overallSuccess: result.success
        };

        return {
          success: result.success,
          summary,
          details: result.results.map(r => ({
            repository: r.repository,
            status: r.success ? 'SUCCESS' : 'FAILED',
            branchCreated: r.branchCreated,
            error: r.error
          })),
          nextSteps: result.success ? [
            `All ${summary.successful} branches created successfully`,
            `Ready to make coordinated changes across repositories`,
            `Use 'crossRepo:RunCoordinatedQualityGates' before merging`
          ] : [
            `${summary.failed} repositories failed branch creation`,
            'Review errors and retry failed repositories',
            'Consider manual branch creation for failed repos'
          ]
        };
      }

      case 'crossRepo:RunCoordinatedQualityGates': {
        const repositories = args.repositories || crossRepoCoordinator.getAllRepositories().map(r => r.name);
        const stopOnFirstFailure = args.stopOnFirstFailure || false;

        const result = await crossRepoCoordinator.runCoordinatedQualityGates(repositories);

        const summary = {
          executionOrder: result.executionOrder,
          totalRepositories: repositories.length,
          passed: result.results.filter(r => r.success).length,
          failed: result.results.filter(r => !r.success).length,
          totalDuration: result.results.reduce((sum, r) => sum + r.duration, 0),
          overallSuccess: result.success
        };

        return {
          success: result.success,
          summary,
          executionOrder: result.executionOrder,
          results: result.results.map(r => ({
            repository: r.repository,
            status: r.success ? 'PASSED' : 'FAILED',
            duration: `${r.duration}ms`,
            passedChecks: r.passedChecks.length,
            failedChecks: r.failedChecks.length,
            failures: r.failedChecks
          })),
          recommendations: generateQualityRecommendations(result.results, summary),
          message: result.success
            ? `✅ All quality gates passed across ${summary.passed} repositories`
            : `❌ Quality gates failed in ${summary.failed} of ${summary.totalRepositories} repositories`
        };
      }

      case 'crossRepo:GetDependencyOrder': {
        const repositories = args.repositories;
        const operation = args.operation || 'general';

        const dependencyOrder = crossRepoCoordinator.getDependencyOrder(repositories);
        const allRepos = crossRepoCoordinator.getAllRepositories();

        const orderWithInfo = dependencyOrder.map((repoName, index) => {
          const repo = allRepos.find(r => r.name === repoName);
          return {
            order: index + 1,
            repository: repoName,
            type: repo?.type,
            dependencies: repo?.dependencies || [],
            dependents: repo?.dependents || []
          };
        });

        return {
          operation,
          totalRepositories: dependencyOrder.length,
          executionOrder: dependencyOrder,
          details: orderWithInfo,
          explanation: generateOrderExplanation(orderWithInfo),
          usageExamples: [
            'Building: Execute in this order to respect dependencies',
            'Testing: Run integration tests after dependencies are built',
            'Deploying: Deploy foundation services before dependent services',
            'Quality Gates: Check dependencies before dependents'
          ]
        };
      }

      case 'crossRepo:DetectCurrentChanges': {
        const repoPath = args.repoPath || process.cwd();
        const includeUncommitted = args.includeUncommitted || true;

        const detected = await detectGitRepo(repoPath);
        if (!detected.isGitRepo) {
          return { error: 'Not in a git repository' };
        }

        const repositoryName = path.basename(detected.repoRoot!);

        // Get changed files
        let changedFiles: string[] = [];
        let commitMessage = '';

        try {
          if (includeUncommitted) {
            // Get uncommitted changes
            const statusResult = await executeGitCommand(['status', '--porcelain'], repoPath);
            if (statusResult.success) {
              changedFiles = statusResult.stdout!
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.substring(3)); // Remove git status prefix
            }
          }

          // If no uncommitted changes, get last commit changes
          if (changedFiles.length === 0) {
            const lastCommitFiles = await executeGitCommand(['diff', '--name-only', 'HEAD~1', 'HEAD'], repoPath);
            if (lastCommitFiles.success) {
              changedFiles = lastCommitFiles.stdout!.split('\n').filter(line => line.trim());
            }

            // Get last commit message
            const lastCommitMsg = await executeGitCommand(['log', '-1', '--pretty=%s'], repoPath);
            if (lastCommitMsg.success) {
              commitMessage = lastCommitMsg.stdout!.trim();
            }
          }
        } catch (error) {
          console.warn('Could not detect changes:', error);
        }

        if (changedFiles.length === 0) {
          return {
            repository: repositoryName,
            changedFiles: [],
            message: 'No changes detected',
            impact: null
          };
        }

        // Analyze impact
        const impact = await crossRepoCoordinator.analyzeChangeImpact(
          repositoryName,
          changedFiles,
          commitMessage
        );

        return {
          repository: repositoryName,
          changedFiles,
          commitMessage: commitMessage || 'Uncommitted changes',
          impact: {
            type: impact.impactType,
            complexity: impact.coordinationComplexity,
            affectedRepositories: impact.affectedRepositories,
            requiredActions: impact.requiredActions.length,
            automationRecommendations: impact.automationRecommendations
          },
          nextSteps: generateNextSteps(impact)
        };
      }

      case 'crossRepo:GenerateCoordinationPlan': {
        const changeDescription = args.changeDescription;
        const primaryRepository = args.primaryRepository;
        const changeType = args.changeType || 'feature';

        // Analyze potential impact
        const impact = await crossRepoCoordinator.analyzeChangeImpact(
          primaryRepository,
          [], // No specific files yet
          changeDescription
        );

        // Generate comprehensive plan
        const dependencyOrder = crossRepoCoordinator.getDependencyOrder();
        const affectedOrder = dependencyOrder.filter(repo =>
          [primaryRepository, ...impact.affectedRepositories].includes(repo)
        );

        const plan = {
          overview: {
            changeDescription,
            primaryRepository,
            changeType: impact.impactType,
            complexity: impact.coordinationComplexity,
            estimatedEffort: impact.estimatedEffort,
            affectedRepositories: impact.affectedRepositories.length
          },
          executionPhases: generateExecutionPhases(affectedOrder, impact),
          qualityGateStrategy: {
            order: affectedOrder,
            parallelizable: affectedOrder.filter(repo => {
              const repoInfo = crossRepoCoordinator.getRepositoryInfo(repo);
              return repoInfo && repoInfo.dependencies.length === 0;
            }),
            sequential: affectedOrder.filter(repo => {
              const repoInfo = crossRepoCoordinator.getRepositoryInfo(repo);
              return repoInfo && repoInfo.dependencies.length > 0;
            })
          },
          automationOpportunities: impact.automationRecommendations,
          riskMitigation: generateRiskMitigation(impact),
          timeline: generateTimeline(impact, affectedOrder)
        };

        return {
          success: true,
          plan,
          summary: `${impact.coordinationComplexity.toUpperCase()} coordination plan for ${changeType} in ${primaryRepository} affecting ${impact.affectedRepositories.length} repositories`,
          recommendations: [
            'Review the execution phases carefully',
            'Create coordinated feature branches before starting',
            'Run quality gates in the specified order',
            'Consider automation opportunities to reduce manual effort'
          ]
        };
      }

      default:
        return {
          error: `Unknown cross-repository coordination tool: ${name}`,
          availableTools: crossRepoCoordinationTools.map(tool => tool.name)
        };
    }
  } catch (error: any) {
    return {
      error: `Cross-repository coordination failed: ${error.message}`,
      tool: name,
      args
    };
  }
}

/**
 * Helper functions for generating responses
 */

function generateQualityRecommendations(results: any[], summary: any): string[] {
  const recommendations = [];

  if (summary.failed > 0) {
    const failedRepos = results.filter(r => !r.success).map(r => r.repository);
    recommendations.push(`Fix quality issues in: ${failedRepos.join(', ')}`);
  }

  if (summary.totalDuration > 300000) { // > 5 minutes
    recommendations.push('Consider running quality checks in parallel for faster feedback');
  }

  const commonFailures = results
    .flatMap(r => r.failedChecks)
    .reduce((acc: any, check: string) => {
      acc[check] = (acc[check] || 0) + 1;
      return acc;
    }, {});

  const mostCommonFailure = Object.entries(commonFailures)
    .sort(([,a]: any, [,b]: any) => (b as number) - (a as number))[0];

  if (mostCommonFailure && (mostCommonFailure[1] as number) > 1) {
    recommendations.push(`Common failure across repositories: ${mostCommonFailure[0]} - consider workspace-wide fix`);
  }

  return recommendations;
}

function generateOrderExplanation(orderWithInfo: any[]): string {
  const explanation = [];

  const foundations = orderWithInfo.filter(r => r.dependencies.length === 0);
  if (foundations.length > 0) {
    explanation.push(`Foundation repositories (no dependencies): ${foundations.map(r => r.repository).join(', ')}`);
  }

  const dependents = orderWithInfo.filter(r => r.dependencies.length > 0);
  if (dependents.length > 0) {
    explanation.push(`Dependent repositories execute after their dependencies are ready`);
  }

  return explanation.join('. ');
}

function generateNextSteps(impact: any): string[] {
  const steps = [];

  if (impact.impactType === 'breaking') {
    steps.push('Create coordinated feature branches for breaking changes');
    steps.push(`Affected repositories: ${impact.affectedRepositories.join(', ')}`);
  }

  if (impact.requiredActions.length > 0) {
    steps.push(`Execute ${impact.requiredActions.length} required actions across affected repositories`);
  }

  if (impact.automationRecommendations.length > 0) {
    steps.push('Consider automation opportunities to reduce manual effort');
  }

  steps.push('Run coordinated quality gates before merging changes');

  return steps;
}

function generateExecutionPhases(affectedOrder: string[], impact: any): any[] {
  const phases = [];

  // Phase 1: Preparation
  phases.push({
    phase: 1,
    name: 'Preparation',
    description: 'Set up coordinated branches and prepare repositories',
    repositories: affectedOrder,
    actions: [
      'Create feature branches in dependency order',
      'Ensure all repositories are on latest main branch',
      'Verify CI/CD pipelines are healthy'
    ],
    estimatedTime: '15-30 minutes'
  });

  // Phase 2: Implementation
  phases.push({
    phase: 2,
    name: 'Implementation',
    description: 'Make changes in dependency order',
    repositories: affectedOrder,
    actions: impact.requiredActions.map((action: any) =>
      `${action.repository}: ${action.description}`
    ),
    estimatedTime: impact.estimatedEffort
  });

  // Phase 3: Quality Assurance
  phases.push({
    phase: 3,
    name: 'Quality Assurance',
    description: 'Run quality gates and integration tests',
    repositories: affectedOrder,
    actions: [
      'Run quality gates in dependency order',
      'Execute integration tests across service boundaries',
      'Verify no regressions in dependent services'
    ],
    estimatedTime: '30-60 minutes'
  });

  // Phase 4: Integration
  phases.push({
    phase: 4,
    name: 'Integration',
    description: 'Create coordinated PRs and merge',
    repositories: affectedOrder,
    actions: [
      'Create pull requests with cross-references',
      'Request reviews from appropriate teams',
      'Merge in dependency order after approval'
    ],
    estimatedTime: '1-2 days (including review time)'
  });

  return phases;
}

function generateRiskMitigation(impact: any): string[] {
  const mitigations = [];

  if (impact.impactType === 'breaking') {
    mitigations.push('Use feature flags to control rollout of breaking changes');
    mitigations.push('Maintain backward compatibility during transition period');
  }

  if (impact.affectedRepositories.length > 3) {
    mitigations.push('Stage rollout across repositories to limit blast radius');
    mitigations.push('Prepare rollback plan for each affected repository');
  }

  if (impact.coordinationComplexity === 'complex') {
    mitigations.push('Assign dedicated coordination lead for this change');
    mitigations.push('Set up monitoring for all affected services');
  }

  mitigations.push('Test integration points thoroughly before production deployment');

  return mitigations;
}

function generateTimeline(impact: any, affectedOrder: string[]): any {
  const timeline = {
    preparation: '30 minutes - 1 hour',
    implementation: impact.estimatedEffort,
    qualityAssurance: '1-2 hours',
    review: '1-2 days',
    deployment: '2-4 hours',
    total: 'Depends on review time and complexity'
  };

  if (impact.coordinationComplexity === 'complex') {
    timeline.total = '3-7 days including reviews and staged deployment';
  } else if (impact.coordinationComplexity === 'moderate') {
    timeline.total = '1-3 days including reviews';
  } else {
    timeline.total = '4-8 hours same day';
  }

  return timeline;
}