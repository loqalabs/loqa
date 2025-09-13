/**
 * GitHub Copilot Integration Tools
 *
 * AI-powered tools that leverage GitHub Copilot for enhanced development workflows
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const githubCopilotCodeReview: Tool = {
  name: 'github_copilot_code_review',
  description: 'Request AI-powered code review from GitHub Copilot for a pull request',
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
      pullNumber: {
        type: 'number',
        description: 'Pull request number'
      },
      focusAreas: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['security', 'performance', 'maintainability', 'best-practices', 'documentation']
        },
        description: 'Specific areas to focus the review on'
      },
      includeTests: {
        type: 'boolean',
        description: 'Whether to include test coverage analysis',
        default: true
      }
    },
    required: ['owner', 'repo', 'pullNumber'],
    additionalProperties: false
  }
};

export const githubCopilotIssueAnalysis: Tool = {
  name: 'github_copilot_issue_analysis',
  description: 'Use GitHub Copilot to analyze and categorize issues with AI insights',
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
      issueNumber: {
        type: 'number',
        description: 'Issue number to analyze'
      },
      analysisType: {
        type: 'string',
        enum: ['categorization', 'priority-assessment', 'solution-suggestions', 'complexity-estimation'],
        description: 'Type of AI analysis to perform'
      },
      includeCodeContext: {
        type: 'boolean',
        description: 'Whether to include relevant code context in the analysis',
        default: true
      }
    },
    required: ['owner', 'repo', 'issueNumber', 'analysisType'],
    additionalProperties: false
  }
};

export const githubCopilotSmartIssueCreation: Tool = {
  name: 'github_copilot_smart_issue_creation',
  description: 'Create issues with AI-assisted content generation and automatic labeling',
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
      description: {
        type: 'string',
        description: 'High-level description of the issue or feature request'
      },
      context: {
        type: 'object',
        properties: {
          relatedFiles: {
            type: 'array',
            items: { type: 'string' },
            description: 'Related file paths for context'
          },
          existingIssues: {
            type: 'array',
            items: { type: 'number' },
            description: 'Related existing issue numbers'
          },
          userStory: {
            type: 'string',
            description: 'User story or requirements'
          }
        }
      },
      generateAcceptanceCriteria: {
        type: 'boolean',
        description: 'Whether to generate acceptance criteria using AI',
        default: true
      },
      suggestLabels: {
        type: 'boolean',
        description: 'Whether to suggest appropriate labels',
        default: true
      }
    },
    required: ['owner', 'repo', 'description'],
    additionalProperties: false
  }
};

export const githubCopilotCodeGeneration: Tool = {
  name: 'github_copilot_code_generation',
  description: 'Generate boilerplate code from issue descriptions using GitHub Copilot',
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
      issueNumber: {
        type: 'number',
        description: 'Issue number to generate code for'
      },
      language: {
        type: 'string',
        description: 'Programming language for code generation'
      },
      codeType: {
        type: 'string',
        enum: ['function', 'class', 'interface', 'test', 'component', 'module'],
        description: 'Type of code to generate'
      },
      framework: {
        type: 'string',
        description: 'Framework or library context (e.g., React, Vue, Express)'
      },
      includeTests: {
        type: 'boolean',
        description: 'Whether to generate corresponding tests',
        default: true
      }
    },
    required: ['owner', 'repo', 'issueNumber', 'language', 'codeType'],
    additionalProperties: false
  }
};

// Export copilot tools collection
export const githubCopilotTools: Tool[] = [
  githubCopilotCodeReview,
  githubCopilotIssueAnalysis,
  githubCopilotSmartIssueCreation,
  githubCopilotCodeGeneration
];