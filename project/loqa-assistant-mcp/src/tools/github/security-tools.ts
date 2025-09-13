/**
 * GitHub Advanced Security and Vulnerability Management Tools
 *
 * Comprehensive security scanning, vulnerability management, and security policy automation
 * for GitHub repositories. Includes AI-powered vulnerability triage and remediation.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const githubAdvancedSecurityScan: Tool = {
  name: 'github_advanced_security_scan',
  description: 'Perform comprehensive security scanning with AI-powered vulnerability analysis',
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
      scanTypes: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['code-scanning', 'secret-scanning', 'dependency-scanning', 'container-scanning', 'iac-scanning']
        },
        description: 'Types of security scans to perform'
      },
      severity: {
        type: 'string',
        enum: ['critical', 'high', 'medium', 'low', 'all'],
        description: 'Minimum severity level to include',
        default: 'medium'
      },
      includeAiRemediation: {
        type: 'boolean',
        description: 'Whether to include AI-powered remediation suggestions',
        default: true
      },
      generateReport: {
        type: 'boolean',
        description: 'Whether to generate a comprehensive security report',
        default: true
      }
    },
    required: ['owner', 'repo'],
    additionalProperties: false
  }
};

export const githubSecurityPolicyAutomation: Tool = {
  name: 'github_security_policy_automation',
  description: 'Automate security policy enforcement and compliance checking',
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
      policies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: {
              type: 'string',
              enum: ['branch-protection', 'required-reviews', 'status-checks', 'dependency-updates', 'security-scanning']
            },
            config: { type: 'object', additionalProperties: true }
          },
          required: ['name', 'type']
        },
        description: 'Security policies to enforce'
      },
      autoRemediate: {
        type: 'boolean',
        description: 'Whether to automatically remediate policy violations where possible',
        default: false
      },
      notificationSettings: {
        type: 'object',
        properties: {
          channels: {
            type: 'array',
            items: { type: 'string' }
          },
          severity: {
            type: 'string',
            enum: ['critical', 'high', 'medium', 'low']
          }
        }
      }
    },
    required: ['owner', 'repo', 'policies'],
    additionalProperties: false
  }
};

export const githubVulnerabilityTriage: Tool = {
  name: 'github_vulnerability_triage',
  description: 'AI-powered vulnerability triage and prioritization',
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
      alertTypes: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['dependabot', 'code-scanning', 'secret-scanning']
        },
        description: 'Types of security alerts to triage'
      },
      businessContext: {
        type: 'object',
        properties: {
          criticality: {
            type: 'string',
            enum: ['critical', 'high', 'medium', 'low']
          },
          dataClassification: {
            type: 'string',
            enum: ['public', 'internal', 'confidential', 'restricted']
          },
          exposureLevel: {
            type: 'string',
            enum: ['internet-facing', 'internal-network', 'isolated']
          }
        }
      },
      autoAssign: {
        type: 'boolean',
        description: 'Whether to automatically assign vulnerabilities to appropriate team members',
        default: false
      }
    },
    required: ['owner', 'repo'],
    additionalProperties: false
  }
};

// Export security tools collection
export const githubSecurityTools: Tool[] = [
  githubAdvancedSecurityScan,
  githubSecurityPolicyAutomation,
  githubVulnerabilityTriage
];