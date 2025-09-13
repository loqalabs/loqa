/**
 * GitHub Advanced Project Management Tools
 *
 * Comprehensive project management features including community engagement,
 * epic management, roadmap visualization, and resource planning across
 * multiple repositories and teams.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const githubDiscussionsIntegration: Tool = {
  name: 'github_discussions_integration',
  description: 'Integrate GitHub Discussions with issues and project management',
  inputSchema: {
    type: 'object',
    properties: {
      owner: {
        type: 'string',
        description: 'Repository owner'
      },
      repo: {
        type: 'string',
        description: 'Repository name'
      },
      action: {
        type: 'string',
        enum: ['create-from-issue', 'link-to-issue', 'convert-to-issue', 'create-knowledge-base-entry'],
        description: 'Action to perform with discussions'
      },
      issueNumber: {
        type: 'number',
        description: 'Issue number (when linking or converting)'
      },
      discussionData: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body: { type: 'string' },
          category: { type: 'string' },
          labels: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      knowledgeBase: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' }
          },
          searchable: { type: 'boolean', default: true },
          pinned: { type: 'boolean', default: false }
        }
      }
    },
    required: ['owner', 'repo', 'action'],
    additionalProperties: false
  }
};

export const githubCommunityHealthMetrics: Tool = {
  name: 'github_community_health_metrics',
  description: 'Track and analyze community engagement and health metrics',
  inputSchema: {
    type: 'object',
    properties: {
      owner: {
        type: 'string',
        description: 'Repository owner'
      },
      repo: {
        type: 'string',
        description: 'Repository name'
      },
      timeframe: {
        type: 'string',
        enum: ['week', 'month', 'quarter', 'year'],
        description: 'Time period for metrics analysis',
        default: 'month'
      },
      metrics: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['contributors', 'issues', 'pull-requests', 'discussions', 'code-frequency', 'community-activity']
        },
        description: 'Specific metrics to analyze'
      },
      generateReport: {
        type: 'boolean',
        description: 'Whether to generate a comprehensive health report',
        default: true
      },
      includeRecommendations: {
        type: 'boolean',
        description: 'Whether to include AI-powered improvement recommendations',
        default: true
      }
    },
    required: ['owner', 'repo'],
    additionalProperties: false
  }
};

export const githubContributorOnboarding: Tool = {
  name: 'github_contributor_onboarding',
  description: 'Automated workflows for new contributor onboarding',
  inputSchema: {
    type: 'object',
    properties: {
      owner: {
        type: 'string',
        description: 'Repository owner'
      },
      repo: {
        type: 'string',
        description: 'Repository name'
      },
      contributorType: {
        type: 'string',
        enum: ['first-time', 'experienced', 'maintainer', 'external'],
        description: 'Type of contributor'
      },
      onboardingFlow: {
        type: 'object',
        properties: {
          welcomeMessage: { type: 'string' },
          assignMentor: { type: 'boolean', default: false },
          suggestFirstIssues: { type: 'boolean', default: true },
          setupGuidance: { type: 'boolean', default: true },
          communityGuidelines: { type: 'boolean', default: true }
        }
      },
      automations: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['label-assignment', 'issue-recommendation', 'mentor-assignment', 'access-provisioning']
        },
        description: 'Automated actions to perform'
      }
    },
    required: ['owner', 'repo', 'contributorType'],
    additionalProperties: false
  }
};

export const githubEpicManagement: Tool = {
  name: 'github_epic_management',
  description: 'Advanced epic tracking across multiple repositories with dependency management',
  inputSchema: {
    type: 'object',
    properties: {
      epicTitle: {
        type: 'string',
        description: 'Title of the epic'
      },
      repositories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            owner: { type: 'string' },
            repo: { type: 'string' },
            issues: { type: 'array', items: { type: 'number' } }
          },
          required: ['owner', 'repo']
        },
        description: 'Repositories and issues involved in the epic'
      },
      dependencies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            from: {
              type: 'object',
              properties: {
                owner: { type: 'string' },
                repo: { type: 'string' },
                issue: { type: 'number' }
              }
            },
            to: {
              type: 'object',
              properties: {
                owner: { type: 'string' },
                repo: { type: 'string' },
                issue: { type: 'number' }
              }
            },
            type: {
              type: 'string',
              enum: ['blocks', 'depends_on', 'relates_to']
            }
          },
          required: ['from', 'to', 'type']
        }
      },
      timeline: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          targetDate: { type: 'string', format: 'date' },
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                date: { type: 'string', format: 'date' },
                description: { type: 'string' }
              }
            }
          }
        }
      },
      trackingConfig: {
        type: 'object',
        properties: {
          autoUpdateProgress: { type: 'boolean', default: true },
          generateReports: { type: 'boolean', default: true },
          notifyStakeholders: { type: 'boolean', default: true }
        }
      }
    },
    required: ['epicTitle', 'repositories'],
    additionalProperties: false
  }
};

export const githubRoadmapVisualization: Tool = {
  name: 'github_roadmap_visualization',
  description: 'Create timeline-based roadmaps with dependency visualization',
  inputSchema: {
    type: 'object',
    properties: {
      organization: {
        type: 'string',
        description: 'GitHub organization or user'
      },
      repositories: {
        type: 'array',
        items: { type: 'string' },
        description: 'Repositories to include in roadmap'
      },
      timeframe: {
        type: 'object',
        properties: {
          start: { type: 'string', format: 'date' },
          end: { type: 'string', format: 'date' },
          granularity: {
            type: 'string',
            enum: ['week', 'month', 'quarter'],
            default: 'month'
          }
        }
      },
      includeFeatures: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['milestones', 'issues', 'pull-requests', 'releases', 'dependencies']
        },
        description: 'Features to include in the roadmap'
      },
      visualizationOptions: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['gantt', 'timeline', 'kanban', 'calendar'],
            default: 'timeline'
          },
          groupBy: {
            type: 'string',
            enum: ['repository', 'milestone', 'assignee', 'label'],
            default: 'repository'
          },
          showDependencies: { type: 'boolean', default: true },
          showProgress: { type: 'boolean', default: true }
        }
      }
    },
    required: ['organization', 'repositories'],
    additionalProperties: false
  }
};

export const githubResourcePlanning: Tool = {
  name: 'github_resource_planning',
  description: 'Team capacity and workload management with predictive analytics',
  inputSchema: {
    type: 'object',
    properties: {
      organization: {
        type: 'string',
        description: 'GitHub organization'
      },
      teams: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            members: { type: 'array', items: { type: 'string' } },
            capacity: { type: 'number' },
            specializations: { type: 'array', items: { type: 'string' } }
          },
          required: ['name', 'members']
        }
      },
      planningPeriod: {
        type: 'object',
        properties: {
          start: { type: 'string', format: 'date' },
          end: { type: 'string', format: 'date' },
          sprintLength: { type: 'number', default: 14 }
        }
      },
      workloadAnalysis: {
        type: 'object',
        properties: {
          includeIssues: { type: 'boolean', default: true },
          includeEstimates: { type: 'boolean', default: true },
          includeDependencies: { type: 'boolean', default: true },
          riskAssessment: { type: 'boolean', default: true }
        }
      },
      optimizationGoals: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['load-balancing', 'skill-development', 'delivery-speed', 'quality-focus']
        }
      }
    },
    required: ['organization', 'teams'],
    additionalProperties: false
  }
};

// Export project management tools collection
export const githubProjectTools: Tool[] = [
  githubDiscussionsIntegration,
  githubCommunityHealthMetrics,
  githubContributorOnboarding,
  githubEpicManagement,
  githubRoadmapVisualization,
  githubResourcePlanning
];