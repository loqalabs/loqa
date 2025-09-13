/**
 * GitHub Issue Templates - Pragmatic minimal templates with AI enhancement
 *
 * Implements minimal 10-line templates per PRAGMATIC_WORKFLOW_DESIGN.md
 * with AI-powered enhancement during Claude Code interactions
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { detectGitRepo } from '../utils/git-repo-detector.js';
import { qualityGateValidator } from '../utils/quality-gate-integration.js';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Repository-specific template configurations
 */
interface RepositoryTemplateConfig {
  name: string;
  description: string;
  components: string[];
  commonIssues: string[];
  qualityRequirements: string[];
}

const REPOSITORY_CONFIGS: Record<string, RepositoryTemplateConfig> = {
  'loqa-hub': {
    name: 'Loqa Hub (Core Service)',
    description: 'Central Go service with gRPC API, STT/TTS, LLM pipeline',
    components: ['gRPC Audio Service', 'STT Integration', 'LLM Command Parser', 'NATS Messaging', 'HTTP API', 'Skills System', 'Event Storage'],
    commonIssues: ['Audio processing pipeline', 'Command parsing accuracy', 'Performance optimization', 'Skills management', 'gRPC connectivity'],
    qualityRequirements: ['go-fmt', 'go-vet', 'golangci-lint', 'unit tests', 'integration tests']
  },

  'loqa-commander': {
    name: 'Loqa Commander (Dashboard)',
    description: 'Vue.js administrative dashboard for monitoring and management',
    components: ['Timeline View', 'Skills Management', 'System Status', 'Configuration UI', 'Real-time Updates'],
    commonIssues: ['UI responsiveness', 'Data visualization', 'Real-time sync', 'Mobile compatibility', 'Performance optimization'],
    qualityRequirements: ['TypeScript', 'ESLint', 'Prettier', 'Vue composition API', 'type checking']
  },

  'loqa-relay': {
    name: 'Loqa Relay (Audio Client)',
    description: 'Audio capture client for embedded devices and testing',
    components: ['Audio Capture', 'gRPC Client', 'Wake Word Detection', 'Audio Preprocessing', 'Device Integration'],
    commonIssues: ['Audio quality', 'Network connectivity', 'Wake word accuracy', 'Device compatibility', 'Battery optimization'],
    qualityRequirements: ['go-fmt', 'go-vet', 'cross-compilation', 'embedded testing']
  },

  'loqa-proto': {
    name: 'Loqa Proto (gRPC Definitions)',
    description: 'Protocol Buffer definitions and generated bindings',
    components: ['Audio Streaming', 'Command Protocol', 'Event Messages', 'Service Definitions', 'Go Bindings'],
    commonIssues: ['Breaking changes', 'Backward compatibility', 'Message optimization', 'Cross-platform support'],
    qualityRequirements: ['protolint', 'breaking-change-check', 'generation verification', 'documentation']
  },

  'loqa-skills': {
    name: 'Loqa Skills (Plugin System)',
    description: 'Modular skill plugins with manifest-driven architecture',
    components: ['Plugin Interface', 'Skill Manifests', 'Home Assistant Integration', 'Skill Templates', 'Plugin Validation'],
    commonIssues: ['Plugin compatibility', 'Skill development', 'Integration testing', 'Performance isolation'],
    qualityRequirements: ['plugin validation', 'go-fmt', 'go-vet', 'manifest schema', 'integration tests']
  },

  'www-loqalabs-com': {
    name: 'Loqa Website',
    description: 'Marketing website and documentation',
    components: ['Landing Page', 'Documentation', 'Blog', 'Download Links', 'Community Pages'],
    commonIssues: ['Content updates', 'SEO optimization', 'Performance', 'Mobile responsiveness', 'Accessibility'],
    qualityRequirements: ['TypeScript', 'ESLint', 'Prettier', 'accessibility', 'performance audit']
  },

  'loqalabs-github-config': {
    name: 'GitHub Configuration',
    description: 'Shared GitHub workflows, templates, and configurations',
    components: ['CI/CD Workflows', 'Issue Templates', 'PR Templates', 'Branch Protection', 'Security Policies'],
    commonIssues: ['Workflow optimization', 'Security policies', 'Template improvements', 'Automation enhancement'],
    qualityRequirements: ['YAML validation', 'workflow testing', 'security scanning']
  },

  'loqa': {
    name: 'Loqa Orchestration',
    description: 'Main documentation and Docker Compose orchestration',
    components: ['Docker Compose', 'Documentation', 'Setup Scripts', 'Development Tools', 'Makefile'],
    commonIssues: ['Service orchestration', 'Documentation updates', 'Development experience', 'Deployment automation'],
    qualityRequirements: ['docker-compose validation', 'documentation', 'script testing']
  }
};

export const githubIssueTemplateTools: Tool[] = [
  {
    name: 'githubTemplate:GenerateMinimal',
    description: 'Generate minimal GitHub issue template for current repository',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: {
          type: 'string',
          description: 'Repository path (defaults to current directory)'
        },
        templateType: {
          type: 'string',
          description: 'Template type: issue, bug, feature, enhancement',
          enum: ['issue', 'bug', 'feature', 'enhancement']
        }
      }
    }
  },

  {
    name: 'githubTemplate:EnhanceWithAI',
    description: 'AI-enhance issue description with repository context',
    inputSchema: {
      type: 'object',
      properties: {
        issueDescription: {
          type: 'string',
          description: 'Initial issue description to enhance'
        },
        repoName: {
          type: 'string',
          description: 'Repository name for context'
        },
        complexity: {
          type: 'string',
          description: 'Issue complexity level',
          enum: ['simple', 'moderate', 'complex']
        }
      },
      required: ['issueDescription']
    }
  },

  {
    name: 'githubTemplate:GetRepositoryContext',
    description: 'Get repository-specific context for issue creation',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: {
          type: 'string',
          description: 'Repository path (defaults to current directory)'
        }
      }
    }
  },

  {
    name: 'githubTemplate:CreateMissingTemplates',
    description: 'Create minimal templates for repositories that lack them',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: {
          type: 'string',
          description: 'Repository path (defaults to current directory)'
        },
        force: {
          type: 'boolean',
          description: 'Force recreation of existing templates'
        }
      }
    }
  }
];

export async function handleGitHubIssueTemplateTools(name: string, args: any): Promise<any> {
  try {
    switch (name) {
      case 'githubTemplate:GenerateMinimal': {
        const repoPath = args.repoPath || process.cwd();
        const templateType = args.templateType || 'issue';

        // Detect repository
        const detected = await detectGitRepo(repoPath);
        const repoName = detected.repoRoot ? path.basename(detected.repoRoot) : 'unknown';
        const config = REPOSITORY_CONFIGS[repoName];

        if (!config) {
          return {
            error: `Unknown repository: ${repoName}`,
            suggestion: 'Add repository configuration to REPOSITORY_CONFIGS'
          };
        }

        // Generate minimal template
        const template = generateMinimalTemplate(templateType, config);

        return {
          repository: repoName,
          templateType,
          config: config.name,
          template: template,
          filename: `${templateType}.yml`,
          path: `${repoPath}/.github/ISSUE_TEMPLATE/${templateType}.yml`
        };
      }

      case 'githubTemplate:EnhanceWithAI': {
        const { issueDescription, repoName = 'unknown', complexity = 'moderate' } = args;
        const config = REPOSITORY_CONFIGS[repoName];

        // Get quality requirements for this repository
        const qualityChecks = qualityGateValidator.getQualityChecks(repoName);
        const qualityRequirements = Object.keys(qualityChecks);

        const enhancement = {
          originalDescription: issueDescription,
          repository: repoName,
          complexity,
          suggestedEnhancements: {
            acceptanceCriteria: generateAcceptanceCriteria(issueDescription, config, complexity),
            qualityRequirements: qualityRequirements,
            testingGuidelines: generateTestingGuidelines(issueDescription, config),
            relatedComponents: suggestRelatedComponents(issueDescription, config)
          },
          aiRecommendations: {
            complexity: assessComplexity(issueDescription, config),
            estimatedEffort: estimateEffort(issueDescription, config),
            crossRepoImpact: assessCrossRepoImpact(issueDescription, repoName)
          }
        };

        return enhancement;
      }

      case 'githubTemplate:GetRepositoryContext': {
        const repoPath = args.repoPath || process.cwd();
        const detected = await detectGitRepo(repoPath);
        const repoName = detected.repoRoot ? path.basename(detected.repoRoot) : 'unknown';
        const config = REPOSITORY_CONFIGS[repoName];

        if (!config) {
          return {
            repository: repoName,
            error: 'Repository not configured',
            availableRepositories: Object.keys(REPOSITORY_CONFIGS)
          };
        }

        // Get quality gate requirements
        const qualityChecks = qualityGateValidator.getQualityChecks(repoName);

        return {
          repository: repoName,
          config: config,
          qualityGates: {
            totalChecks: Object.keys(qualityChecks).length,
            requiredChecks: Object.values(qualityChecks).filter((c: any) => c.required !== false).length,
            checkNames: Object.keys(qualityChecks)
          },
          templateSuggestions: {
            commonIssues: config.commonIssues,
            components: config.components,
            qualityRequirements: config.qualityRequirements
          }
        };
      }

      case 'githubTemplate:CreateMissingTemplates': {
        const repoPath = args.repoPath || process.cwd();
        const force = args.force || false;

        const detected = await detectGitRepo(repoPath);
        if (!detected.repoRoot) {
          return { error: 'Not in a git repository' };
        }

        const repoName = path.basename(detected.repoRoot);
        const config = REPOSITORY_CONFIGS[repoName];

        if (!config) {
          return {
            error: `No template configuration for repository: ${repoName}`,
            availableRepositories: Object.keys(REPOSITORY_CONFIGS)
          };
        }

        const templateDir = path.join(detected.repoRoot, '.github', 'ISSUE_TEMPLATE');
        const results = [];

        // Ensure template directory exists
        try {
          await fs.promises.mkdir(templateDir, { recursive: true });
        } catch (error) {
          return { error: `Failed to create template directory: ${error}` };
        }

        // Create minimal templates
        const templates = [
          { name: 'issue', type: 'issue' },
          { name: 'bug', type: 'bug' },
          { name: 'feature', type: 'feature' }
        ];

        for (const template of templates) {
          const templatePath = path.join(templateDir, `${template.name}.yml`);
          const templateExists = fs.existsSync(templatePath);

          if (!templateExists || force) {
            const templateContent = generateMinimalTemplate(template.type, config);

            try {
              await fs.promises.writeFile(templatePath, templateContent, 'utf8');
              results.push({
                template: template.name,
                path: templatePath,
                status: templateExists ? 'updated' : 'created'
              });
            } catch (error: any) {
              results.push({
                template: template.name,
                path: templatePath,
                status: 'failed',
                error: error.message
              });
            }
          } else {
            results.push({
              template: template.name,
              path: templatePath,
              status: 'exists'
            });
          }
        }

        return {
          repository: repoName,
          templateDirectory: templateDir,
          results: results,
          summary: {
            created: results.filter(r => r.status === 'created').length,
            updated: results.filter(r => r.status === 'updated').length,
            existing: results.filter(r => r.status === 'exists').length,
            failed: results.filter(r => r.status === 'failed').length
          }
        };
      }

      default:
        return {
          error: `Unknown GitHub template tool: ${name}`,
          availableTools: githubIssueTemplateTools.map(tool => tool.name)
        };
    }
  } catch (error: any) {
    return {
      error: `GitHub template operation failed: ${error.message}`,
      tool: name,
      args
    };
  }
}

/**
 * Generate minimal issue template (10 lines as per pragmatic design)
 */
function generateMinimalTemplate(templateType: string, config: RepositoryTemplateConfig): string {
  const templates = {
    issue: `name: Issue
description: ${config.description}
body:
  - type: textarea
    id: description
    attributes:
      label: What needs to be done?
      description: Brief description of the issue
    validations:
      required: true`,

    bug: `name: Bug Report
description: Report a bug in ${config.name}
body:
  - type: textarea
    id: bug_description
    attributes:
      label: What's broken?
      description: Brief description of the bug
    validations:
      required: true`,

    feature: `name: Feature Request
description: Suggest a feature for ${config.name}
body:
  - type: textarea
    id: feature_description
    attributes:
      label: What should be added?
      description: Brief description of the feature
    validations:
      required: true`
  };

  return templates[templateType as keyof typeof templates] || templates.issue;
}

/**
 * AI-powered enhancement functions
 */
function generateAcceptanceCriteria(description: string, config: RepositoryTemplateConfig | undefined, complexity: string): string[] {
  // Simple keyword-based acceptance criteria generation
  const criteria = [];

  if (description.toLowerCase().includes('test')) {
    criteria.push('All tests pass');
  }

  if (description.toLowerCase().includes('api') || description.toLowerCase().includes('endpoint')) {
    criteria.push('API endpoints respond correctly');
    criteria.push('Error handling works as expected');
  }

  if (description.toLowerCase().includes('ui') || description.toLowerCase().includes('interface')) {
    criteria.push('UI displays correctly');
    criteria.push('User interactions work properly');
  }

  if (config?.qualityRequirements) {
    criteria.push(`Quality checks pass: ${config.qualityRequirements.slice(0, 2).join(', ')}`);
  }

  if (complexity === 'complex') {
    criteria.push('Documentation updated');
    criteria.push('Integration tests included');
  }

  return criteria.length > 0 ? criteria : ['Implementation works as described', 'Tests pass', 'Code review approved'];
}

function generateTestingGuidelines(description: string, config: RepositoryTemplateConfig | undefined): string[] {
  const guidelines = [];

  if (config?.name.includes('Go') || config?.qualityRequirements.includes('go-fmt')) {
    guidelines.push('Unit tests with `go test ./...`');
  }

  if (config?.name.includes('Vue') || config?.qualityRequirements.includes('TypeScript')) {
    guidelines.push('Component tests with Jest/Vitest');
  }

  if (description.toLowerCase().includes('api')) {
    guidelines.push('API integration tests');
  }

  if (description.toLowerCase().includes('docker') || description.toLowerCase().includes('service')) {
    guidelines.push('End-to-end service tests');
  }

  return guidelines.length > 0 ? guidelines : ['Add appropriate tests for changes'];
}

function suggestRelatedComponents(description: string, config: RepositoryTemplateConfig | undefined): string[] {
  if (!config) return [];

  // Simple keyword matching to suggest relevant components
  return config.components.filter(component =>
    description.toLowerCase().includes(component.toLowerCase()) ||
    component.toLowerCase().includes(description.split(' ').find(word => word.length > 4) || '')
  ).slice(0, 3);
}

function assessComplexity(description: string, config: RepositoryTemplateConfig | undefined): 'simple' | 'moderate' | 'complex' {
  let score = 0;

  // Complexity indicators
  if (description.includes('integration') || description.includes('multiple')) score += 2;
  if (description.includes('breaking') || description.includes('architecture')) score += 3;
  if (description.includes('performance') || description.includes('optimization')) score += 1;
  if (description.includes('security') || description.includes('authentication')) score += 2;
  if (description.length > 500) score += 1;
  if ((description.match(/\band\b/g) || []).length > 3) score += 1;

  if (score >= 5) return 'complex';
  if (score >= 2) return 'moderate';
  return 'simple';
}

function estimateEffort(description: string, config: RepositoryTemplateConfig | undefined): string {
  const complexity = assessComplexity(description, config);

  const estimates = {
    simple: '1-2 hours',
    moderate: '0.5-1 day',
    complex: '2-5 days'
  };

  return estimates[complexity];
}

function assessCrossRepoImpact(description: string, repoName: string): string[] {
  const impacts = [];

  if (description.toLowerCase().includes('protocol') || description.toLowerCase().includes('grpc')) {
    impacts.push('loqa-proto');
    if (repoName !== 'loqa-hub') impacts.push('loqa-hub');
    if (repoName !== 'loqa-relay') impacts.push('loqa-relay');
  }

  if (description.toLowerCase().includes('skill') || description.toLowerCase().includes('plugin')) {
    if (repoName !== 'loqa-skills') impacts.push('loqa-skills');
    if (repoName !== 'loqa-hub') impacts.push('loqa-hub');
  }

  if (description.toLowerCase().includes('api') || description.toLowerCase().includes('endpoint')) {
    if (repoName !== 'loqa-hub') impacts.push('loqa-hub');
    if (repoName !== 'loqa-commander') impacts.push('loqa-commander');
  }

  if (description.toLowerCase().includes('docker') || description.toLowerCase().includes('compose')) {
    if (repoName !== 'loqa') impacts.push('loqa');
  }

  return impacts.filter(repo => repo !== repoName);
}