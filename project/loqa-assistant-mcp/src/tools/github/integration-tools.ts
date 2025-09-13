/**
 * GitHub Advanced Integration and Automation Tools
 *
 * Comprehensive integration tools for custom GitHub Apps, advanced webhooks,
 * and CI/CD pipeline enhancements. Enables deep integration with external
 * systems and advanced deployment automation.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const githubCustomAppIntegration: Tool = {
  name: 'github_custom_app_integration',
  description: 'Create and manage custom GitHub Apps for enhanced functionality',
  inputSchema: {
    type: 'object',
    properties: {
      appName: {
        type: 'string',
        description: 'Name of the custom GitHub App'
      },
      permissions: {
        type: 'object',
        properties: {
          issues: { type: 'string', enum: ['read', 'write', 'admin'] },
          pullRequests: { type: 'string', enum: ['read', 'write', 'admin'] },
          contents: { type: 'string', enum: ['read', 'write', 'admin'] },
          actions: { type: 'string', enum: ['read', 'write', 'admin'] },
          discussions: { type: 'string', enum: ['read', 'write', 'admin'] }
        }
      },
      webhookEvents: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['issues', 'pull_request', 'push', 'workflow_run', 'discussion']
        },
        description: 'GitHub events to subscribe to'
      },
      functionality: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['automated-reviews', 'issue-triage', 'deployment-automation', 'security-scanning', 'analytics']
        },
        description: 'Core functionality to implement'
      },
      deploymentConfig: {
        type: 'object',
        properties: {
          hosting: { type: 'string', enum: ['github-actions', 'aws-lambda', 'vercel', 'custom'] },
          environment: { type: 'string', enum: ['development', 'staging', 'production'] }
        }
      }
    },
    required: ['appName', 'permissions', 'functionality'],
    additionalProperties: false
  }
};

export const githubAdvancedWebhooks: Tool = {
  name: 'github_advanced_webhooks',
  description: 'Setup advanced webhook integrations with external systems',
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
      integrations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['slack', 'discord', 'teams', 'jira', 'linear', 'notion', 'custom']
            },
            events: {
              type: 'array',
              items: { type: 'string' }
            },
            config: {
              type: 'object',
              additionalProperties: true
            },
            filters: {
              type: 'object',
              properties: {
                branches: { type: 'array', items: { type: 'string' } },
                labels: { type: 'array', items: { type: 'string' } },
                authors: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          required: ['platform', 'events']
        }
      },
      realTimeUpdates: {
        type: 'boolean',
        description: 'Whether to enable real-time update streaming',
        default: true
      },
      batchProcessing: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: false },
          batchSize: { type: 'number', default: 10 },
          interval: { type: 'string', default: '5m' }
        }
      }
    },
    required: ['owner', 'repo', 'integrations'],
    additionalProperties: false
  }
};

export const githubCicdEnhancement: Tool = {
  name: 'github_cicd_enhancement',
  description: 'Advanced CI/CD integration with GitHub Actions and deployment automation',
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
      enhancements: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['smart-deployments', 'automated-rollbacks', 'performance-testing', 'security-gates', 'multi-environment']
        },
        description: 'CI/CD enhancements to implement'
      },
      deploymentStrategy: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['blue-green', 'canary', 'rolling', 'feature-flags']
          },
          environments: {
            type: 'array',
            items: { type: 'string' }
          },
          approvalProcess: {
            type: 'object',
            properties: {
              required: { type: 'boolean' },
              reviewers: { type: 'array', items: { type: 'string' } },
              timeout: { type: 'string' }
            }
          }
        }
      },
      monitoring: {
        type: 'object',
        properties: {
          healthChecks: { type: 'boolean', default: true },
          performanceMetrics: { type: 'boolean', default: true },
          errorTracking: { type: 'boolean', default: true },
          alerting: {
            type: 'object',
            properties: {
              channels: { type: 'array', items: { type: 'string' } },
              thresholds: { type: 'object', additionalProperties: true }
            }
          }
        }
      }
    },
    required: ['owner', 'repo', 'enhancements'],
    additionalProperties: false
  }
};

// Export integration tools collection
export const githubIntegrationTools: Tool[] = [
  githubCustomAppIntegration,
  githubAdvancedWebhooks,
  githubCicdEnhancement
];