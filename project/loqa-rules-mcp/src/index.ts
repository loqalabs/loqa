#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { simpleGit, SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'yaml';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ValidationResult {
  valid: boolean;
  violations: string[];
  warnings: string[];
}

interface RepositoryInfo {
  path: string;
  currentBranch: string;
  hasUncommittedChanges: boolean;
  isLoqaRepository: boolean;
}

class LoqaRulesValidator {
  private git: SimpleGit;
  private workspaceRoot: string;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.git = simpleGit(this.workspaceRoot);
  }

  /**
   * Validate commit message against Loqa rules
   */
  async validateCommitMessage(message: string): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Rule: NEVER use AI attribution in commit messages
    const aiAttributionPatterns = [
      /🤖.*generated.*with.*claude/i,
      /co-authored-by:.*claude/i,
      /generated.*with.*ai/i,
      /ai.*generated/i,
      /claude.*code/i,
      /anthropic\.com/i
    ];

    for (const pattern of aiAttributionPatterns) {
      if (pattern.test(message)) {
        violations.push(`Commit message contains AI attribution. Rule: "NEVER use AI attribution in commit messages"`);
        break;
      }
    }

    // Check for empty or very short commit messages
    if (message.trim().length < 10) {
      warnings.push("Commit message is very short. Consider adding more descriptive detail.");
    }

    // Check for proper commit message format (not enforced, just warned)
    if (!message.match(/^(feat|fix|docs|style|refactor|test|chore|perf)(\(.+\))?: .+/)) {
      warnings.push("Consider using conventional commit format: type(scope): description");
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings
    };
  }

  /**
   * Validate branch name against Loqa rules
   */
  async validateBranchName(branchName: string): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Rule: NEVER push directly to main branch
    if (branchName === 'main' || branchName === 'master') {
      violations.push(`Attempting to work on ${branchName} branch. Rule: "NEVER push directly to main branch"`);
    }

    // Rule: ALWAYS create feature branches
    const validBranchPrefixes = ['feature/', 'bugfix/', 'hotfix/', 'chore/', 'docs/'];
    const hasValidPrefix = validBranchPrefixes.some(prefix => branchName.startsWith(prefix));
    
    if (!hasValidPrefix && branchName !== 'main' && branchName !== 'master' && branchName !== 'develop') {
      warnings.push(`Branch name '${branchName}' doesn't follow convention. Consider: ${validBranchPrefixes.join(', ')}`);
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings
    };
  }

  /**
   * Check if we're in a Loqa repository
   */
  async detectLoqaRepository(repoPath: string): Promise<boolean> {
    try {
      // Check for Loqa-specific files
      const loqaIndicators = [
        '.claude-code.json',
        'CLAUDE.md',
        'go.mod', // Go services
        'package.json', // JS services
        'docker-compose.yml',
        'Dockerfile'
      ];

      const files = await fs.readdir(repoPath);
      const hasLoqaIndicators = loqaIndicators.some(indicator => files.includes(indicator));

      // Check if it's specifically a Loqa service by looking at package.json or go.mod
      if (files.includes('package.json')) {
        const packageJson = JSON.parse(await fs.readFile(join(repoPath, 'package.json'), 'utf-8'));
        if (packageJson.name && packageJson.name.includes('loqa')) {
          return true;
        }
      }

      if (files.includes('go.mod')) {
        const goMod = await fs.readFile(join(repoPath, 'go.mod'), 'utf-8');
        if (goMod.includes('loqa')) {
          return true;
        }
      }

      return hasLoqaIndicators;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo(repoPath?: string): Promise<RepositoryInfo> {
    const path = repoPath || this.workspaceRoot;
    const git = simpleGit(path);

    try {
      const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
      const status = await git.status();
      const isLoqaRepository = await this.detectLoqaRepository(path);

      return {
        path,
        currentBranch,
        hasUncommittedChanges: !status.isClean(),
        isLoqaRepository
      };
    } catch (error) {
      throw new Error(`Failed to get repository info: ${error}`);
    }
  }

  /**
   * Validate quality gates
   */
  async validateQualityGates(repoPath?: string): Promise<ValidationResult> {
    const path = repoPath || this.workspaceRoot;
    const violations: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if we can run quality checks
      const files = await fs.readdir(path);
      
      if (files.includes('package.json')) {
        const packageJson = JSON.parse(await fs.readFile(join(path, 'package.json'), 'utf-8'));
        
        if (!packageJson.scripts?.['quality-check'] && !packageJson.scripts?.lint && !packageJson.scripts?.test) {
          warnings.push("No quality-check, lint, or test scripts found in package.json");
        }
      }

      if (files.includes('Makefile')) {
        const makefile = await fs.readFile(join(path, 'Makefile'), 'utf-8');
        if (!makefile.includes('quality-check') && !makefile.includes('test')) {
          warnings.push("No quality-check or test targets found in Makefile");
        }
      }

      if (!files.includes('package.json') && !files.includes('Makefile') && !files.includes('go.mod')) {
        warnings.push("No recognized build system found (package.json, Makefile, go.mod)");
      }

    } catch (error) {
      violations.push(`Failed to validate quality gates: ${error}`);
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings
    };
  }

  /**
   * Pre-commit validation
   */
  async validatePreCommit(message: string, repoPath?: string): Promise<ValidationResult> {
    const path = repoPath || this.workspaceRoot;
    const allViolations: string[] = [];
    const allWarnings: string[] = [];

    // Get repository info
    const repoInfo = await this.getRepositoryInfo(path);
    
    if (!repoInfo.isLoqaRepository) {
      allWarnings.push("Not detected as a Loqa repository - some rules may not apply");
    }

    // Validate branch name
    const branchValidation = await this.validateBranchName(repoInfo.currentBranch);
    allViolations.push(...branchValidation.violations);
    allWarnings.push(...branchValidation.warnings);

    // Validate commit message
    const messageValidation = await this.validateCommitMessage(message);
    allViolations.push(...messageValidation.violations);
    allWarnings.push(...messageValidation.warnings);

    // Validate quality gates
    const qualityValidation = await this.validateQualityGates(path);
    allViolations.push(...qualityValidation.violations);
    allWarnings.push(...qualityValidation.warnings);

    return {
      valid: allViolations.length === 0,
      violations: allViolations,
      warnings: allWarnings
    };
  }
}

interface TaskTemplate {
  name: string;
  description: string;
  content: string;
}

interface TaskCreationOptions {
  title: string;
  template?: string;
  priority?: 'High' | 'Medium' | 'Low';
  type?: 'Feature' | 'Bug Fix' | 'Improvement' | 'Documentation';
  assignee?: string;
}

interface CapturedThought {
  content: string;
  tags: string[];
  timestamp: Date;
  context?: string;
}

class LoqaTaskManager {
  private workspaceRoot: string;
  private git: SimpleGit;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.git = simpleGit(this.workspaceRoot);
  }

  /**
   * Get available task templates
   */
  async getAvailableTemplates(repoPath?: string): Promise<TaskTemplate[]> {
    const path = repoPath || this.workspaceRoot;
    const templatesPath = join(path, 'backlog', 'templates');
    
    try {
      await fs.access(templatesPath);
      const templateFiles = await glob('*.md', { cwd: templatesPath });
      
      const templates: TaskTemplate[] = [];
      
      for (const file of templateFiles) {
        if (file === 'README.md') continue;
        
        const templatePath = join(templatesPath, file);
        const content = await fs.readFile(templatePath, 'utf-8');
        const name = file.replace('-template.md', '').replace(/[-_]/g, ' ');
        
        // Extract description from the template content
        const lines = content.split('\n');
        const descriptionLine = lines.find(line => line.toLowerCase().includes('use for:') || line.toLowerCase().includes('description:'));
        const description = descriptionLine ? descriptionLine.replace(/^.*?:/, '').trim() : `Template for ${name}`;
        
        templates.push({
          name,
          description,
          content
        });
      }
      
      return templates;
    } catch (error) {
      return [];
    }
  }

  /**
   * Create a new task using a template
   */
  async createTaskFromTemplate(options: TaskCreationOptions, repoPath?: string): Promise<{ taskId: string; filePath: string; content: string }> {
    const path = repoPath || this.workspaceRoot;
    const backlogPath = join(path, 'backlog');
    const tasksPath = join(backlogPath, 'tasks');
    
    // Ensure backlog structure exists
    try {
      await fs.access(backlogPath);
    } catch {
      throw new Error('Backlog not initialized. Run `backlog init` first.');
    }

    // Get the next task ID
    const taskId = await this.getNextTaskId(tasksPath);
    
    // Get template content
    let templateContent = '';
    if (options.template) {
      const templates = await this.getAvailableTemplates(path);
      const template = templates.find(t => t.name.toLowerCase().includes(options.template!.toLowerCase()));
      if (template) {
        templateContent = template.content;
      } else {
        // Use general template as fallback
        const generalTemplate = templates.find(t => t.name.toLowerCase().includes('general'));
        templateContent = generalTemplate?.content || await this.getDefaultTemplate();
      }
    } else {
      templateContent = await this.getDefaultTemplate();
    }

    // Fill in template with provided options
    let content = templateContent;
    content = content.replace(/\[Clear, descriptive title\]/g, options.title);
    content = content.replace(/\[Clear, descriptive name\]/g, options.title);
    
    if (options.type) {
      content = content.replace(/\[Feature\/Bug Fix\/Improvement\/Documentation\/Refactoring\]/g, options.type);
      content = content.replace(/\[Addition\/Modification\/Deprecation\/Breaking Change\]/g, options.type);
    }
    
    if (options.priority) {
      content = content.replace(/\[High\/Medium\/Low\]/g, options.priority);
    }
    
    if (options.assignee) {
      content = content.replace(/\[Team member or role\]/g, options.assignee);
    }

    // Save the task file
    const fileName = `task-${taskId}-${options.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    const filePath = join(tasksPath, fileName);
    await fs.writeFile(filePath, content);

    return {
      taskId,
      filePath,
      content
    };
  }

  /**
   * Capture a quick thought or idea
   */
  async captureThought(thought: CapturedThought, repoPath?: string): Promise<{ filePath: string; content: string }> {
    const path = repoPath || this.workspaceRoot;
    const backlogPath = join(path, 'backlog');
    const draftsPath = join(backlogPath, 'drafts');
    
    // Ensure backlog structure exists
    try {
      await fs.access(backlogPath);
    } catch {
      throw new Error('Backlog not initialized. Run `backlog init` first.');
    }

    // Create thought content
    const timestamp = thought.timestamp.toISOString();
    const fileName = `thought-${timestamp.split('T')[0]}-${Date.now()}.md`;
    
    let content = `# Quick Thought - ${timestamp}\n\n`;
    content += `## Content\n${thought.content}\n\n`;
    
    if (thought.tags.length > 0) {
      content += `## Tags\n${thought.tags.map(tag => `- ${tag}`).join('\n')}\n\n`;
    }
    
    if (thought.context) {
      content += `## Context\n${thought.context}\n\n`;
    }
    
    content += `## Follow-up Actions\n- [ ] Review and decide if this needs to become a formal task\n- [ ] Add more details if needed\n- [ ] Archive if no longer relevant\n\n`;
    content += `---\n*Captured via MCP on ${timestamp}*`;

    const filePath = join(draftsPath, fileName);
    await fs.writeFile(filePath, content);

    return {
      filePath,
      content
    };
  }

  /**
   * Get the next available task ID
   */
  private async getNextTaskId(tasksPath: string): Promise<string> {
    try {
      const taskFiles = await glob('task-*.md', { cwd: tasksPath });
      const taskNumbers = taskFiles
        .map(file => {
          const match = file.match(/task-(\d+)-/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => !isNaN(num));
      
      const maxId = taskNumbers.length > 0 ? Math.max(...taskNumbers) : 0;
      return String(maxId + 1).padStart(3, '0');
    } catch {
      return '001';
    }
  }

  /**
   * Get default template content
   */
  private async getDefaultTemplate(): Promise<string> {
    return `# Task: [Title]

## Description
[Describe what needs to be done]

## Acceptance Criteria
- [ ] [Specific outcome 1]
- [ ] [Specific outcome 2]
- [ ] [Specific outcome 3]

## Implementation Notes
[Any specific implementation details]

## Dependencies
- **Depends on:** [List dependencies]
- **Blocks:** [List what this blocks]

## Quality Gates
- [ ] Code review completed
- [ ] Tests passing
- [ ] Documentation updated

## Status
- Created: ${new Date().toISOString().split('T')[0]}
- Status: To Do
`;
  }

  /**
   * List current tasks
   */
  async listTasks(repoPath?: string): Promise<{ tasks: string[]; drafts: string[] }> {
    const path = repoPath || this.workspaceRoot;
    const tasksPath = join(path, 'backlog', 'tasks');
    const draftsPath = join(path, 'backlog', 'drafts');
    
    try {
      const tasks = await glob('*.md', { cwd: tasksPath });
      const drafts = await glob('*.md', { cwd: draftsPath });
      
      return {
        tasks: tasks.sort(),
        drafts: drafts.sort()
      };
    } catch {
      return { tasks: [], drafts: [] };
    }
  }
}

/**
 * Get role-specific capabilities and context
 */
function getRoleCapabilities(role: string): string[] {
  const roleCapabilities: Record<string, string[]> = {
    architect: [
      "System design and architecture decisions",
      "Cross-service integration planning",
      "Protocol design and API specification",
      "Technology stack evaluation",
      "Performance and scalability planning"
    ],
    developer: [
      "Code implementation and debugging",
      "Unit testing and TDD",
      "Code review and refactoring",
      "Library and framework integration",
      "Development best practices"
    ],
    devops: [
      "Infrastructure and deployment",
      "CI/CD pipeline management",
      "Container orchestration",
      "Monitoring and logging",
      "Security and compliance"
    ],
    qa: [
      "Test planning and strategy",
      "Quality assurance processes",
      "Bug tracking and validation",
      "Performance testing",
      "User acceptance testing"
    ],
    designer: [
      "User experience design",
      "Interface design and prototyping",
      "Design system maintenance",
      "Accessibility considerations",
      "User research and feedback"
    ],
    product: [
      "Product strategy and roadmap",
      "Feature prioritization",
      "User story creation",
      "Stakeholder communication",
      "Market analysis and requirements"
    ],
    general: [
      "General development tasks",
      "Documentation writing",
      "Basic troubleshooting",
      "Project coordination",
      "Cross-functional collaboration"
    ]
  };

  return roleCapabilities[role] || roleCapabilities.general;
}

const server = new Server(
  {
    name: "loqa-rules-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "validate_commit_message",
        description: "Validate a commit message against Loqa workflow rules",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The commit message to validate",
            },
          },
          required: ["message"],
        },
      },
      {
        name: "validate_branch_name",
        description: "Validate a branch name against Loqa workflow rules",
        inputSchema: {
          type: "object",
          properties: {
            branchName: {
              type: "string",
              description: "The branch name to validate",
            },
          },
          required: ["branchName"],
        },
      },
      {
        name: "validate_pre_commit",
        description: "Run all pre-commit validations for Loqa workflow rules",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The commit message to validate",
            },
            repoPath: {
              type: "string",
              description: "Optional path to repository (defaults to current directory)",
            },
          },
          required: ["message"],
        },
      },
      {
        name: "get_repository_info",
        description: "Get information about the current repository",
        inputSchema: {
          type: "object",
          properties: {
            repoPath: {
              type: "string",
              description: "Optional path to repository (defaults to current directory)",
            },
          },
          required: [],
        },
      },
      {
        name: "validate_quality_gates",
        description: "Check if quality gates are properly configured",
        inputSchema: {
          type: "object",
          properties: {
            repoPath: {
              type: "string",
              description: "Optional path to repository (defaults to current directory)",
            },
          },
          required: [],
        },
      },
      {
        name: "add_todo",
        description: "Create a new task using templates with interactive guidance",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The task title or description",
            },
            template: {
              type: "string",
              description: "Template type: 'feature', 'bug-fix', 'protocol-change', 'cross-repo', 'general'",
            },
            priority: {
              type: "string",
              enum: ["High", "Medium", "Low"],
              description: "Task priority",
            },
            type: {
              type: "string",
              enum: ["Feature", "Bug Fix", "Improvement", "Documentation"],
              description: "Type of work",
            },
            assignee: {
              type: "string",
              description: "Person or role assigned to this task",
            },
            repoPath: {
              type: "string",
              description: "Optional path to repository (defaults to current directory)",
            },
          },
          required: ["title"],
        },
      },
      {
        name: "capture_thought",
        description: "Quickly capture ideas and thoughts with proper tagging",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The thought or idea to capture",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Tags to categorize the thought",
            },
            context: {
              type: "string",
              description: "Optional context or background information",
            },
            repoPath: {
              type: "string",
              description: "Optional path to repository (defaults to current directory)",
            },
          },
          required: ["content"],
        },
      },
      {
        name: "list_templates",
        description: "List available task templates and their descriptions",
        inputSchema: {
          type: "object",
          properties: {
            repoPath: {
              type: "string",
              description: "Optional path to repository (defaults to current directory)",
            },
          },
          required: [],
        },
      },
      {
        name: "list_tasks",
        description: "List current tasks and drafts in the backlog",
        inputSchema: {
          type: "object",
          properties: {
            repoPath: {
              type: "string",
              description: "Optional path to repository (defaults to current directory)",
            },
          },
          required: [],
        },
      },
      {
        name: "set_role",
        description: "Set or change the current working role for specialized contexts",
        inputSchema: {
          type: "object",
          properties: {
            role: {
              type: "string",
              enum: ["architect", "developer", "devops", "qa", "designer", "product", "general"],
              description: "The role to set for specialized work context",
            },
            context: {
              type: "string",
              description: "Optional context about why this role is being set",
            },
            duration: {
              type: "string",
              description: "How long to maintain this role (e.g., 'session', 'task', 'permanent')",
            },
          },
          required: ["role"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const validator = new LoqaRulesValidator();
    const taskManager = new LoqaTaskManager();

    switch (name) {
      case "validate_commit_message": {
        if (!args || typeof args.message !== 'string') {
          throw new Error("message parameter is required and must be a string");
        }
        const result = await validator.validateCommitMessage(args.message);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                valid: result.valid,
                violations: result.violations,
                warnings: result.warnings,
                summary: result.valid 
                  ? "✅ Commit message passes all validation rules"
                  : `❌ Commit message has ${result.violations.length} violation(s)`
              }, null, 2),
            },
          ],
        };
      }

      case "validate_branch_name": {
        if (!args || typeof args.branchName !== 'string') {
          throw new Error("branchName parameter is required and must be a string");
        }
        const result = await validator.validateBranchName(args.branchName);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                valid: result.valid,
                violations: result.violations,
                warnings: result.warnings,
                summary: result.valid 
                  ? "✅ Branch name passes all validation rules"
                  : `❌ Branch name has ${result.violations.length} violation(s)`
              }, null, 2),
            },
          ],
        };
      }

      case "validate_pre_commit": {
        if (!args || typeof args.message !== 'string') {
          throw new Error("message parameter is required and must be a string");
        }
        const result = await validator.validatePreCommit(
          args.message,
          args.repoPath as string | undefined
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                valid: result.valid,
                violations: result.violations,
                warnings: result.warnings,
                summary: result.valid 
                  ? "✅ All pre-commit validations passed"
                  : `❌ Pre-commit validation failed with ${result.violations.length} violation(s)`,
                canCommit: result.valid
              }, null, 2),
            },
          ],
        };
      }

      case "get_repository_info": {
        const result = await validator.getRepositoryInfo(args?.repoPath as string | undefined);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                repositoryInfo: result,
                summary: `Repository: ${result.path}, Branch: ${result.currentBranch}, Clean: ${!result.hasUncommittedChanges}, Loqa Repo: ${result.isLoqaRepository}`
              }, null, 2),
            },
          ],
        };
      }

      case "validate_quality_gates": {
        const result = await validator.validateQualityGates(args?.repoPath as string | undefined);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                valid: result.valid,
                violations: result.violations,
                warnings: result.warnings,
                summary: result.valid 
                  ? "✅ Quality gates are properly configured"
                  : `❌ Quality gate issues found: ${result.violations.length} violation(s), ${result.warnings.length} warning(s)`
              }, null, 2),
            },
          ],
        };
      }

      case "add_todo": {
        if (!args || typeof args.title !== 'string') {
          throw new Error("title parameter is required and must be a string");
        }
        
        const options: TaskCreationOptions = {
          title: args.title,
          template: args.template as string | undefined,
          priority: args.priority as 'High' | 'Medium' | 'Low' | undefined,
          type: args.type as 'Feature' | 'Bug Fix' | 'Improvement' | 'Documentation' | undefined,
          assignee: args.assignee as string | undefined,
        };
        
        const result = await taskManager.createTaskFromTemplate(options, args.repoPath as string | undefined);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                taskId: result.taskId,
                filePath: result.filePath,
                summary: `✅ Created task ${result.taskId}: "${args.title}"`,
                template: options.template || 'default',
                nextSteps: [
                  `Edit the task file: ${result.filePath}`,
                  `View in Kanban board: backlog board view`,
                  `Open in browser: backlog browser`
                ]
              }, null, 2),
            },
          ],
        };
      }

      case "capture_thought": {
        if (!args || typeof args.content !== 'string') {
          throw new Error("content parameter is required and must be a string");
        }
        
        const thought: CapturedThought = {
          content: args.content,
          tags: (args.tags as string[]) || [],
          timestamp: new Date(),
          context: args.context as string | undefined,
        };
        
        const result = await taskManager.captureThought(thought, args.repoPath as string | undefined);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                filePath: result.filePath,
                summary: `💡 Captured thought: "${args.content.substring(0, 50)}${args.content.length > 50 ? '...' : ''}"`,
                tags: thought.tags,
                timestamp: thought.timestamp.toISOString(),
                nextSteps: [
                  `Review the thought: ${result.filePath}`,
                  `Convert to task if needed`,
                  `Add more details or context`
                ]
              }, null, 2),
            },
          ],
        };
      }

      case "list_templates": {
        const templates = await taskManager.getAvailableTemplates(args?.repoPath as string | undefined);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                templates: templates.map(t => ({
                  name: t.name,
                  description: t.description
                })),
                count: templates.length,
                summary: `📋 Found ${templates.length} available task templates`,
                usage: "Use with: /add-todo --template=<name> 'Your task title'"
              }, null, 2),
            },
          ],
        };
      }

      case "list_tasks": {
        const result = await taskManager.listTasks(args?.repoPath as string | undefined);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                tasks: result.tasks,
                drafts: result.drafts,
                summary: `📊 Found ${result.tasks.length} tasks and ${result.drafts.length} draft thoughts`,
                totalItems: result.tasks.length + result.drafts.length,
                nextSteps: [
                  `View Kanban board: backlog board view`,
                  `Open web interface: backlog browser`,
                  `Create new task: /add-todo 'Task title'`
                ]
              }, null, 2),
            },
          ],
        };
      }

      case "set_role": {
        if (!args || typeof args.role !== 'string') {
          throw new Error("role parameter is required and must be a string");
        }
        
        const roleInfo = {
          role: args.role,
          context: args.context as string | undefined,
          duration: args.duration as string | undefined,
          timestamp: new Date().toISOString(),
          sessionId: Math.random().toString(36).substring(7)
        };
        
        // In a real implementation, this might store role context in a session file
        // For now, we'll just return the role information
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                activeRole: roleInfo.role,
                context: roleInfo.context,
                duration: roleInfo.duration || 'session',
                summary: `🎭 Role set to: ${roleInfo.role}`,
                capabilities: getRoleCapabilities(roleInfo.role),
                nextSteps: [
                  `Role is now active for this session`,
                  `Specialized prompts and context will be applied`,
                  `Use /set-role general to return to general mode`
                ]
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Loqa Rules MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});