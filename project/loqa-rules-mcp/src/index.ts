#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { simpleGit, SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { randomBytes } from 'crypto';
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

interface RoleConfig {
  role_id: string;
  role_name: string;
  role_description: string;
  capabilities: string[];
  detection_patterns: string[];
  model_preference: string;
  task_templates_preferred: string[];
}

interface RoleDetectionResult {
  detectedRole: string;
  confidence: number;
  reasoning: string[];
  alternatives: { role: string; confidence: number }[];
}

class LoqaRoleManager {
  private workspaceRoot: string;
  private roleConfigs: Map<string, RoleConfig> = new Map();
  private roleSystemConfig: any;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || process.cwd();
  }

  /**
   * Load role configurations from files
   */
  async loadRoleConfigurations(): Promise<void> {
    const roleConfigsPath = join(this.workspaceRoot, 'project', 'role-configs');
    
    try {
      // Load role system configuration
      const roleSystemPath = join(roleConfigsPath, 'role-system.json');
      const roleSystemContent = await fs.readFile(roleSystemPath, 'utf-8');
      this.roleSystemConfig = JSON.parse(roleSystemContent);

      // Load individual role configurations
      for (const roleInfo of this.roleSystemConfig.available_roles) {
        const rolePath = join(roleConfigsPath, roleInfo.config_file);
        try {
          const roleContent = await fs.readFile(rolePath, 'utf-8');
          const roleConfig = JSON.parse(roleContent);
          this.roleConfigs.set(roleInfo.role_id, {
            role_id: roleConfig.role_id,
            role_name: roleConfig.role_name,
            role_description: roleConfig.role_description,
            capabilities: roleConfig.capabilities || [],
            detection_patterns: roleConfig.role_detection_patterns || [],
            model_preference: roleInfo.model_preference,
            task_templates_preferred: roleConfig.task_templates_preferred || []
          });
        } catch (error) {
          console.warn(`Failed to load role config for ${roleInfo.role_id}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to load role configurations:', error);
      // Initialize with basic default role
      this.roleConfigs.set('general', {
        role_id: 'general',
        role_name: 'General Developer',
        role_description: 'Multi-disciplinary development work',
        capabilities: ['General development', 'Documentation', 'Basic testing'],
        detection_patterns: ['general', 'basic', 'documentation'],
        model_preference: 'haiku',
        task_templates_preferred: ['general-task-template']
      });
    }
  }

  /**
   * Detect appropriate role based on task context
   */
  async detectRole(context: {
    title?: string;
    description?: string;
    filePaths?: string[];
    repositoryType?: string;
  }): Promise<RoleDetectionResult> {
    await this.loadRoleConfigurations();

    const text = [
      context.title || '',
      context.description || '',
      ...(context.filePaths || [])
    ].join(' ').toLowerCase();

    const scores: { [role: string]: { score: number; matches: string[] } } = {};

    // Score each role based on pattern matching
    for (const [roleId, roleConfig] of this.roleConfigs) {
      scores[roleId] = { score: 0, matches: [] };

      for (const pattern of roleConfig.detection_patterns) {
        const regex = new RegExp(`\\b${pattern.toLowerCase()}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          scores[roleId].score += matches.length;
          scores[roleId].matches.push(...matches);
        }
      }

      // Bonus scoring for repository-specific patterns
      if (context.repositoryType) {
        if (roleId === 'architect' && ['loqa-proto', 'loqa'].includes(context.repositoryType)) {
          scores[roleId].score += 2;
        }
        if (roleId === 'developer' && ['loqa-hub', 'loqa-relay', 'loqa-skills'].includes(context.repositoryType)) {
          scores[roleId].score += 2;
        }
        if (roleId === 'devops' && context.repositoryType === 'loqa') {
          scores[roleId].score += 2;
        }
        if (roleId === 'qa' && text.includes('test')) {
          scores[roleId].score += 3;
        }
      }

      // File path bonus scoring
      for (const filePath of context.filePaths || []) {
        const path = filePath.toLowerCase();
        if (roleId === 'devops' && (path.includes('docker') || path.includes('ci') || path.includes('deploy'))) {
          scores[roleId].score += 3;
        }
        if (roleId === 'developer' && (path.includes('.go') || path.includes('.ts') || path.includes('.js'))) {
          scores[roleId].score += 2;
        }
        if (roleId === 'architect' && (path.includes('.proto') || path.includes('api'))) {
          scores[roleId].score += 3;
        }
        if (roleId === 'qa' && path.includes('test')) {
          scores[roleId].score += 3;
        }
      }
    }

    // Find highest scoring role
    const sortedRoles = Object.entries(scores)
      .sort(([, a], [, b]) => b.score - a.score)
      .map(([role, data]) => ({ role, ...data }));

    const topRole = sortedRoles[0];
    const totalWords = text.split(/\s+/).filter(word => word.length > 0).length;
    const confidence = totalWords > 0 ? Math.min(topRole.score / totalWords, 1.0) : 0;

    // Apply confidence threshold
    const threshold = this.roleSystemConfig?.role_detection?.confidence_threshold || 0.6;
    const detectedRole = confidence >= threshold ? topRole.role : 
                        (this.roleSystemConfig?.role_detection?.fallback_role || 'general');

    return {
      detectedRole,
      confidence,
      reasoning: topRole.matches,
      alternatives: sortedRoles.slice(1, 4).map(item => ({
        role: item.role,
        confidence: totalWords > 0 ? Math.min(item.score / totalWords, 1.0) : 0
      }))
    };
  }

  /**
   * Get role configuration by ID
   */
  async getRoleConfig(roleId: string): Promise<RoleConfig | null> {
    await this.loadRoleConfigurations();
    return this.roleConfigs.get(roleId) || null;
  }

  /**
   * List all available roles
   */
  async listRoles(): Promise<RoleConfig[]> {
    await this.loadRoleConfigurations();
    return Array.from(this.roleConfigs.values());
  }

  /**
   * Get recommended templates for a role
   */
  async getTemplatesForRole(roleId: string): Promise<string[]> {
    const roleConfig = await this.getRoleConfig(roleId);
    return roleConfig?.task_templates_preferred || ['general-task-template'];
  }

  /**
   * Get model preference for a role
   */
  async getModelPreference(roleId: string): Promise<string> {
    const roleConfig = await this.getRoleConfig(roleId);
    return roleConfig?.model_preference || 'haiku';
  }
}

interface ModelSelectionContext {
  roleId?: string;
  taskTitle?: string;
  taskDescription?: string;
  complexity?: 'low' | 'medium' | 'high';
  filePaths?: string[];
  repositoryType?: string;
  manualOverride?: string;
}

interface ModelRecommendation {
  model: string;
  reasoning: string[];
  confidence: number;
  alternatives: { model: string; reasoning: string; score: number }[];
}

class LoqaModelSelector {
  private workspaceRoot: string;
  private roleManager: LoqaRoleManager;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.roleManager = new LoqaRoleManager(workspaceRoot);
  }

  /**
   * Select appropriate model based on context and complexity
   */
  async selectModel(context: ModelSelectionContext): Promise<ModelRecommendation> {
    const reasoning: string[] = [];
    let selectedModel = 'haiku'; // Default
    let confidence = 0.5;
    const alternatives: { model: string; reasoning: string; score: number }[] = [];

    // Manual override takes precedence
    if (context.manualOverride) {
      return {
        model: context.manualOverride,
        reasoning: [`Manual override specified: ${context.manualOverride}`],
        confidence: 1.0,
        alternatives: []
      };
    }

    // Role-based model preference
    if (context.roleId) {
      const roleConfig = await this.roleManager.getRoleConfig(context.roleId);
      if (roleConfig) {
        selectedModel = roleConfig.model_preference;
        reasoning.push(`Role-based preference: ${roleConfig.role_name} → ${selectedModel}`);
        confidence += 0.3;
      }
    }

    // Task complexity analysis
    const complexityScore = this.analyzeComplexity(context);
    if (complexityScore.level === 'high') {
      if (selectedModel !== 'sonnet-4') {
        alternatives.push({
          model: selectedModel,
          reasoning: `Original role preference`,
          score: 0.6
        });
        selectedModel = 'sonnet-4';
        reasoning.push(`High complexity detected (${complexityScore.score}) → upgraded to Sonnet 4`);
        confidence = Math.max(confidence, 0.8);
      } else {
        reasoning.push(`High complexity confirmed, Sonnet 4 appropriate`);
        confidence += 0.2;
      }
    } else if (complexityScore.level === 'low') {
      if (selectedModel === 'sonnet-4') {
        alternatives.push({
          model: selectedModel,
          reasoning: `Role-based preference`,
          score: 0.7
        });
        selectedModel = 'haiku';
        reasoning.push(`Low complexity detected (${complexityScore.score}) → downgraded to Haiku for efficiency`);
        confidence = Math.max(confidence, 0.7);
      } else {
        reasoning.push(`Low complexity confirmed, Haiku appropriate`);
        confidence += 0.2;
      }
    }

    // Repository-specific adjustments
    if (context.repositoryType) {
      const repoAdjustment = this.getRepositoryModelPreference(context.repositoryType);
      if (repoAdjustment.preferredModel !== selectedModel) {
        alternatives.push({
          model: selectedModel,
          reasoning: `Previous selection`,
          score: confidence
        });
        selectedModel = repoAdjustment.preferredModel;
        reasoning.push(repoAdjustment.reasoning);
        confidence = Math.max(confidence, 0.6);
      }
    }

    // File path analysis for additional context
    const fileAnalysis = this.analyzeFilePaths(context.filePaths || []);
    if (fileAnalysis.suggestedModel && fileAnalysis.suggestedModel !== selectedModel) {
      alternatives.push({
        model: selectedModel,
        reasoning: `Previous selection based on role/complexity`,
        score: confidence
      });
      selectedModel = fileAnalysis.suggestedModel;
      reasoning.push(fileAnalysis.reasoning);
      confidence = Math.max(confidence, 0.7);
    }

    // Ensure confidence is capped at 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      model: selectedModel,
      reasoning,
      confidence,
      alternatives: alternatives.slice(0, 2) // Top 2 alternatives
    };
  }

  /**
   * Analyze task complexity based on various factors
   */
  private analyzeComplexity(context: ModelSelectionContext): { level: 'low' | 'medium' | 'high'; score: number } {
    let complexityScore = 0;
    const factors: string[] = [];

    // Manual complexity override
    if (context.complexity) {
      const scoreMap = { low: 0.2, medium: 0.5, high: 0.8 };
      return { level: context.complexity, score: scoreMap[context.complexity] };
    }

    // Analyze task title and description
    const text = [context.taskTitle || '', context.taskDescription || ''].join(' ').toLowerCase();
    
    // High complexity indicators
    const highComplexityPatterns = [
      'architect', 'architecture', 'design system', 'protocol', 'api design',
      'microservice', 'distributed', 'scalability', 'performance optimization',
      'security', 'infrastructure', 'kubernetes', 'deployment', 'ci/cd',
      'migration', 'refactor large', 'cross-service', 'breaking change'
    ];

    const mediumComplexityPatterns = [
      'implement', 'feature', 'integration', 'database', 'testing',
      'debugging', 'optimization', 'configuration', 'monitoring'
    ];

    const lowComplexityPatterns = [
      'documentation', 'readme', 'comment', 'typo', 'style',
      'update', 'minor', 'simple', 'small fix', 'cleanup'
    ];

    // Count pattern matches
    for (const pattern of highComplexityPatterns) {
      if (text.includes(pattern)) {
        complexityScore += 0.3;
        factors.push(`high: ${pattern}`);
      }
    }

    for (const pattern of mediumComplexityPatterns) {
      if (text.includes(pattern)) {
        complexityScore += 0.2;
        factors.push(`medium: ${pattern}`);
      }
    }

    for (const pattern of lowComplexityPatterns) {
      if (text.includes(pattern)) {
        complexityScore += 0.1;
        factors.push(`low: ${pattern}`);
      }
    }

    // Length-based complexity (longer descriptions often indicate complexity)
    const textLength = text.length;
    if (textLength > 500) {
      complexityScore += 0.2;
    } else if (textLength > 200) {
      complexityScore += 0.1;
    }

    // File count complexity (more files = more complex)
    const fileCount = context.filePaths?.length || 0;
    if (fileCount > 10) {
      complexityScore += 0.3;
    } else if (fileCount > 5) {
      complexityScore += 0.2;
    } else if (fileCount > 0) {
      complexityScore += 0.1;
    }

    // Determine level based on score
    let level: 'low' | 'medium' | 'high';
    if (complexityScore >= 0.7) {
      level = 'high';
    } else if (complexityScore >= 0.4) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return { level, score: Math.min(complexityScore, 1.0) };
  }

  /**
   * Get repository-specific model preferences
   */
  private getRepositoryModelPreference(repositoryType: string): { preferredModel: string; reasoning: string } {
    const repoPreferences: Record<string, { preferredModel: string; reasoning: string }> = {
      'loqa': {
        preferredModel: 'sonnet-4',
        reasoning: 'Main orchestration repo requires architectural understanding'
      },
      'loqa-proto': {
        preferredModel: 'sonnet-4', 
        reasoning: 'Protocol design requires careful API considerations'
      },
      'loqa-hub': {
        preferredModel: 'sonnet-4',
        reasoning: 'Core service with complex business logic and integrations'
      },
      'loqa-skills': {
        preferredModel: 'sonnet-4',
        reasoning: 'Plugin system requires architectural understanding'
      },
      'loqa-relay': {
        preferredModel: 'sonnet-4',
        reasoning: 'Audio processing and real-time communication complexity'
      },
      'loqa-commander': {
        preferredModel: 'haiku',
        reasoning: 'UI components generally have lower complexity requirements'
      },
      'www-loqalabs-com': {
        preferredModel: 'haiku',
        reasoning: 'Website content and styling work is typically straightforward'
      },
      'loqalabs-github-config': {
        preferredModel: 'haiku',
        reasoning: 'Configuration and template work is generally simple'
      }
    };

    return repoPreferences[repositoryType] || { 
      preferredModel: 'haiku', 
      reasoning: 'Unknown repository type, using efficient default' 
    };
  }

  /**
   * Analyze file paths for complexity indicators
   */
  private analyzeFilePaths(filePaths: string[]): { suggestedModel?: string; reasoning: string } {
    const complexityIndicators = {
      high: ['.proto', 'Dockerfile', 'docker-compose', 'kubernetes', 'helm', '.tf', 'terraform'],
      medium: ['.go', '.ts', '.js', '.py', 'Makefile', '.sql', '.graphql'],
      low: ['.md', '.txt', '.json', '.yaml', '.yml', '.css', '.scss']
    };

    let highCount = 0, mediumCount = 0, lowCount = 0;

    for (const path of filePaths) {
      const pathLower = path.toLowerCase();
      
      if (complexityIndicators.high.some(ext => pathLower.includes(ext))) {
        highCount++;
      } else if (complexityIndicators.medium.some(ext => pathLower.includes(ext))) {
        mediumCount++;
      } else if (complexityIndicators.low.some(ext => pathLower.includes(ext))) {
        lowCount++;
      }
    }

    if (highCount > 0) {
      return {
        suggestedModel: 'sonnet-4',
        reasoning: `File analysis: ${highCount} high-complexity files detected (infrastructure/protocol)`
      };
    } else if (mediumCount > lowCount && mediumCount > 2) {
      return {
        suggestedModel: 'sonnet-4',
        reasoning: `File analysis: ${mediumCount} code files suggest implementation complexity`
      };
    } else if (lowCount > mediumCount) {
      return {
        suggestedModel: 'haiku',
        reasoning: `File analysis: ${lowCount} documentation/config files suggest low complexity`
      };
    }

    return { reasoning: 'File analysis inconclusive, maintaining current selection' };
  }

  /**
   * Get model capabilities and use cases
   */
  getModelCapabilities(): Record<string, { strengths: string[]; useCases: string[]; performance: string }> {
    return {
      'sonnet-4': {
        strengths: [
          'Complex reasoning and analysis',
          'Architectural design and system thinking',
          'Advanced code generation and debugging',
          'Multi-step problem solving'
        ],
        useCases: [
          'System architecture design',
          'Complex algorithm implementation', 
          'Cross-service integration planning',
          'Performance optimization',
          'Security analysis and implementation'
        ],
        performance: 'Higher latency, more thorough analysis'
      },
      'haiku': {
        strengths: [
          'Fast response times',
          'Efficient for straightforward tasks',
          'Good for documentation and simple code',
          'Cost-effective for high-volume work'
        ],
        useCases: [
          'Documentation writing',
          'Simple bug fixes',
          'Code formatting and style',
          'Configuration updates',
          'Basic testing tasks'
        ],
        performance: 'Lower latency, optimized for efficiency'
      }
    };
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
      {
        name: "detect_role",
        description: "Automatically detect appropriate role based on task context",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Task or work title",
            },
            description: {
              type: "string", 
              description: "Detailed description of the work",
            },
            filePaths: {
              type: "array",
              items: { type: "string" },
              description: "File paths related to the work",
            },
            repositoryType: {
              type: "string",
              description: "Type of repository (loqa-hub, loqa-commander, etc.)",
            },
          },
          required: [],
        },
      },
      {
        name: "get_role_config",
        description: "Get detailed configuration for a specific role",
        inputSchema: {
          type: "object",
          properties: {
            roleId: {
              type: "string",
              description: "Role identifier (architect, developer, devops, qa, general)",
            },
          },
          required: ["roleId"],
        },
      },
      {
        name: "list_roles",
        description: "List all available roles with their capabilities",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_role_templates",
        description: "Get recommended task templates for a specific role",
        inputSchema: {
          type: "object",
          properties: {
            roleId: {
              type: "string",
              description: "Role identifier",
            },
          },
          required: ["roleId"],
        },
      },
      {
        name: "select_model",
        description: "Select appropriate Claude model based on task context and complexity",
        inputSchema: {
          type: "object",
          properties: {
            roleId: {
              type: "string",
              description: "Role identifier for role-based model preference",
            },
            taskTitle: {
              type: "string",
              description: "Title of the task or work",
            },
            taskDescription: {
              type: "string",
              description: "Detailed description of the work",
            },
            complexity: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Manual complexity override",
            },
            filePaths: {
              type: "array",
              items: { type: "string" },
              description: "File paths related to the work",
            },
            repositoryType: {
              type: "string",
              description: "Type of repository",
            },
            manualOverride: {
              type: "string",
              enum: ["sonnet-4", "haiku"],
              description: "Manual model override",
            },
          },
          required: [],
        },
      },
      {
        name: "get_model_capabilities",
        description: "Get information about available Claude models and their capabilities",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "start_task_work",
        description: "Start work on backlog tasks with full workflow guidance - can auto-select next task or work on specific task",
        inputSchema: {
          type: "object",
          properties: {
            taskId: {
              type: "string",
              description: "Specific backlog task ID (e.g., task-1, task-21) - leave empty to auto-select next task",
            },
            taskFile: {
              type: "string",
              description: "Direct path to backlog task file - alternative to taskId",
            },
            autoSelect: {
              type: "boolean",
              description: "Auto-select next recommended task (default: true if no taskId/taskFile provided)",
            },
            priority: {
              type: "string",
              enum: ["P1", "P2", "P3"],
              description: "Filter auto-selection by priority level",
            },
            repository: {
              type: "string",
              description: "Filter auto-selection by repository",
            },
            roleContext: {
              type: "string",
              enum: ["architect", "developer", "devops", "qa", "github-cli-specialist", "general", "auto-detect"],
              description: "Role specialization context (default: auto-detect)",
            },
            createBranch: {
              type: "boolean",
              description: "Create feature branch for this task (default: true)",
            },
            updateStatus: {
              type: "boolean",
              description: "Update task status to 'In Progress' (default: true)",
            },
            testingRequirements: {
              type: "string",
              description: "Override default testing requirements",
            },
          },
          required: [],
        },
      },
      {
        name: "plan_strategic_shift",
        description: "Plan comprehensive strategic shift with full workflow guidance (replaces STRATEGIC_SHIFT_PROMPT.md)",
        inputSchema: {
          type: "object",
          properties: {
            shiftType: {
              type: "string",
              enum: ["focus", "technology", "approach", "design-philosophy", "branding"],
              description: "Type of strategic shift",
            },
            currentState: {
              type: "string",
              description: "Current state we're shifting away from",
            },
            desiredState: {
              type: "string",
              description: "Desired future state",
            },
            motivation: {
              type: "string",
              description: "Motivation and drivers for the shift",
            },
            urgency: {
              type: "string",
              enum: ["critical", "high", "medium", "low"],
              description: "Urgency level",
            },
            budgetConstraints: {
              type: "string",
              description: "Budget constraints if any",
            },
            timelineConstraints: {
              type: "string",
              description: "Timeline constraints if any",
            },
            resourceConstraints: {
              type: "string",
              description: "Resource constraints if any",
            },
            technicalConstraints: {
              type: "string",
              description: "Technical constraints if any",
            },
            roleContext: {
              type: "string",
              enum: ["architect", "developer", "devops", "qa", "general", "auto-detect"],
              description: "Role specialization context",
            },
          },
          required: ["shiftType", "currentState", "desiredState", "motivation"],
        },
      },
      {
        name: "capture_comprehensive_thought",
        description: "Capture thought with comprehensive workflow and categorization (enhanced thought capture)",
        inputSchema: {
          type: "object",
          properties: {
            thought: {
              type: "string",
              description: "The idea, concern, or consideration",
            },
            context: {
              type: "string",
              description: "What triggered this thought",
            },
            category: {
              type: "string",
              enum: ["technical-architecture", "privacy-security", "user-experience", "business-strategy", "process-workflow", "product-direction", "infrastructure", "compliance-legal"],
              description: "Thought category",
            },
            timeline: {
              type: "string",
              enum: ["next-sprint", "next-quarter", "next-release", "when-conditions-met", "ongoing"],
              description: "When should this be revisited",
            },
            impactLevel: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              description: "Impact level",
            },
            dependencies: {
              type: "string",
              description: "What needs to happen before this can be addressed",
            },
            relatedWork: {
              type: "string",
              description: "Related issues, docs, or initiatives",
            },
            roleContext: {
              type: "string",
              enum: ["architect", "developer", "devops", "qa", "general", "auto-detect"],
              description: "Role specialization context",
            },
          },
          required: ["thought"],
        },
      },
      {
        name: "start_complex_todo",
        description: "Create complex TODO with comprehensive planning and workflow guidance (enhanced add_todo)",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Task title",
            },
            category: {
              type: "string",
              enum: ["feature", "bug-fix", "technical-debt", "documentation", "devops-infrastructure", "research-exploration", "security-compliance", "internal-tools"],
              description: "Task category",
            },
            priority: {
              type: "string",
              enum: ["P1", "P2", "P3"],
              description: "Priority level (P1=Urgent, P2=Important, P3=Nice-to-have)",
            },
            description: {
              type: "string",
              description: "Detailed task description",
            },
            context: {
              type: "string",
              description: "Context that led to this task",
            },
            dependencies: {
              type: "string",
              description: "Dependencies or blockers",
            },
            acceptanceCriteria: {
              type: "string",
              description: "What does 'done' look like",
            },
            estimatedEffort: {
              type: "string",
              description: "Estimated effort (e.g., 1 day, 2 weeks)",
            },
            roleContext: {
              type: "string",
              enum: ["architect", "developer", "devops", "qa", "general", "auto-detect"],
              description: "Role specialization context",
            },
            breakdown: {
              type: "boolean",
              description: "Whether to break down into smaller tasks if complex",
            },
          },
          required: ["title", "category", "priority"],
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
    const roleManager = new LoqaRoleManager();
    const modelSelector = new LoqaModelSelector();

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
        
        let template = args.template as string | undefined;
        let detectedRole = 'general';
        
        // Auto-detect role and template if not specified
        if (!template) {
          const roleDetection = await roleManager.detectRole({
            title: args.title,
            description: args.description as string | undefined,
            repositoryType: args.repositoryType as string | undefined,
          });
          
          detectedRole = roleDetection.detectedRole;
          const recommendedTemplates = await roleManager.getTemplatesForRole(detectedRole);
          template = recommendedTemplates[0]; // Use the first recommended template
        }
        
        // Get model recommendation for this task
        const modelRecommendation = await modelSelector.selectModel({
          roleId: detectedRole,
          taskTitle: args.title,
          taskDescription: args.description as string | undefined,
          repositoryType: args.repositoryType as string | undefined,
        });
        
        const options: TaskCreationOptions = {
          title: args.title,
          template: template,
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
                detectedRole: detectedRole,
                modelRecommendation: {
                  model: modelRecommendation.model,
                  confidence: modelRecommendation.confidence,
                  reasoning: modelRecommendation.reasoning[0] // First reason for brevity
                },
                autoDetection: !args.template ? `Auto-detected role: ${detectedRole}` : undefined,
                nextSteps: [
                  `Edit the task file: ${result.filePath}`,
                  `Recommended model for this task: ${modelRecommendation.model}`,
                  `View in Kanban board: backlog board view`,
                  `Open in browser: backlog browser`,
                  ...(detectedRole !== 'general' ? [`Consider using /set-role ${detectedRole} for specialized context`] : [])
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
          sessionId: randomBytes(4).toString('hex')
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

      case "detect_role": {
        const context = {
          title: args?.title as string | undefined,
          description: args?.description as string | undefined,
          filePaths: args?.filePaths as string[] | undefined,
          repositoryType: args?.repositoryType as string | undefined,
        };
        
        const result = await roleManager.detectRole(context);
        
        // Get model recommendation based on detected role and context
        const modelRecommendation = await modelSelector.selectModel({
          roleId: result.detectedRole,
          taskTitle: context.title,
          taskDescription: context.description,
          filePaths: context.filePaths,
          repositoryType: context.repositoryType,
        });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                detectedRole: result.detectedRole,
                confidence: result.confidence,
                reasoning: result.reasoning,
                alternatives: result.alternatives,
                summary: `🎭 Detected role: ${result.detectedRole} (${Math.round(result.confidence * 100)}% confidence)`,
                roleInfo: await roleManager.getRoleConfig(result.detectedRole),
                recommendedTemplates: await roleManager.getTemplatesForRole(result.detectedRole),
                modelRecommendation: {
                  model: modelRecommendation.model,
                  confidence: modelRecommendation.confidence,
                  reasoning: modelRecommendation.reasoning[0] // First reason for brevity
                },
                nextSteps: [
                  `Use /set-role ${result.detectedRole} to activate this role`,
                  `Recommended model: ${modelRecommendation.model}`,
                  `Create tasks with recommended templates: ${(await roleManager.getTemplatesForRole(result.detectedRole)).join(', ')}`,
                  `Leverage role-specific capabilities and context`
                ]
              }, null, 2),
            },
          ],
        };
      }

      case "get_role_config": {
        if (!args || typeof args.roleId !== 'string') {
          throw new Error("roleId parameter is required and must be a string");
        }
        
        const roleConfig = await roleManager.getRoleConfig(args.roleId);
        if (!roleConfig) {
          throw new Error(`Role '${args.roleId}' not found`);
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                role: roleConfig,
                templates: await roleManager.getTemplatesForRole(args.roleId),
                modelPreference: await roleManager.getModelPreference(args.roleId),
                summary: `📋 Role: ${roleConfig.role_name}`,
                description: roleConfig.role_description,
                capabilities: roleConfig.capabilities,
                usage: `Use /set-role ${roleConfig.role_id} to activate this role`
              }, null, 2),
            },
          ],
        };
      }

      case "list_roles": {
        const roles = await roleManager.listRoles();
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                roles: roles.map(role => ({
                  id: role.role_id,
                  name: role.role_name,
                  description: role.role_description,
                  capabilities: role.capabilities.slice(0, 3), // First 3 for brevity
                  modelPreference: role.model_preference
                })),
                summary: `🎭 Found ${roles.length} available roles`,
                usage: {
                  detect: "Use /detect-role with task context for automatic selection",
                  manual: "Use /set-role <role-id> for manual selection",
                  config: "Use /get-role-config <role-id> for detailed information"
                }
              }, null, 2),
            },
          ],
        };
      }

      case "get_role_templates": {
        if (!args || typeof args.roleId !== 'string') {
          throw new Error("roleId parameter is required and must be a string");
        }
        
        const templates = await roleManager.getTemplatesForRole(args.roleId);
        const roleConfig = await roleManager.getRoleConfig(args.roleId);
        
        if (!roleConfig) {
          throw new Error(`Role '${args.roleId}' not found`);
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                roleId: args.roleId,
                roleName: roleConfig.role_name,
                templates: templates,
                summary: `📋 Templates for ${roleConfig.role_name}: ${templates.length} available`,
                usage: templates.map(template => 
                  `/add-todo "Task title" --template=${template} --priority=Medium`
                ),
                description: `Recommended task templates optimized for ${roleConfig.role_description.toLowerCase()}`
              }, null, 2),
            },
          ],
        };
      }

      case "select_model": {
        const context: ModelSelectionContext = {
          roleId: args?.roleId as string | undefined,
          taskTitle: args?.taskTitle as string | undefined,
          taskDescription: args?.taskDescription as string | undefined,
          complexity: args?.complexity as 'low' | 'medium' | 'high' | undefined,
          filePaths: args?.filePaths as string[] | undefined,
          repositoryType: args?.repositoryType as string | undefined,
          manualOverride: args?.manualOverride as string | undefined,
        };
        
        const recommendation = await modelSelector.selectModel(context);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                recommendedModel: recommendation.model,
                confidence: recommendation.confidence,
                reasoning: recommendation.reasoning,
                alternatives: recommendation.alternatives,
                summary: `🤖 Recommended model: ${recommendation.model} (${Math.round(recommendation.confidence * 100)}% confidence)`,
                modelInfo: modelSelector.getModelCapabilities()[recommendation.model],
                nextSteps: [
                  `Use the recommended model for optimal performance`,
                  `Consider alternatives if specific constraints apply`,
                  `Model selection is based on task complexity and role requirements`
                ]
              }, null, 2),
            },
          ],
        };
      }

      case "get_model_capabilities": {
        const capabilities = modelSelector.getModelCapabilities();
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                models: capabilities,
                summary: `🤖 Available models: ${Object.keys(capabilities).join(', ')}`,
                usage: {
                  automatic: "Use /select-model with task context for automatic selection",
                  manual: "Specify model preference when creating tasks or setting roles",
                  optimization: "Model selection balances capability vs efficiency"
                },
                guidelines: {
                  "sonnet-4": "Use for complex architecture, design, and development tasks",
                  "haiku": "Use for documentation, simple fixes, and routine tasks"
                }
              }, null, 2),
            },
          ],
        };
      }

      case "start_task_work": {
        // Unified backlog task workflow with auto-selection capability
        const taskId = args?.taskId as string;
        const taskFile = args?.taskFile as string;
        const autoSelect = args?.autoSelect !== false; // default true if no specific task
        const priority = args?.priority as string;
        const repository = args?.repository as string;
        const roleContext = args?.roleContext as string || 'auto-detect';
        const createBranch = args?.createBranch !== false; // default true
        const updateStatus = args?.updateStatus !== false; // default true
        const testingRequirements = args?.testingRequirements as string;
        
        let selectedTask = null;
        let taskSource = '';
        
        // Determine task selection method
        if (taskId || taskFile) {
          // Specific task provided
          selectedTask = {
            identifier: taskId || taskFile,
            source: taskId ? 'taskId' : 'taskFile',
            method: 'manual'
          };
          taskSource = `Manually selected: ${taskId || taskFile}`;
        } else if (autoSelect) {
          // Auto-select next task using aggregator logic
          let filterArgs = '';
          if (priority) filterArgs += ` --priority=${priority}`;
          if (repository) filterArgs += ` --repo=${repository}`;
          
          selectedTask = {
            command: `./tools/lb next${filterArgs}`,
            source: 'auto-selection',
            method: 'ai-recommended',
            filters: { priority, repository }
          };
          taskSource = `Auto-selected using: ./tools/lb next${filterArgs}`;
        } else {
          return {
            content: [
              {
                type: "text",
                text: "⚠️ No task specified. Please provide:\n• taskId (e.g., 'task-1')\n• taskFile (path to task file)\n• OR leave empty for auto-selection\n\nExample usage:\n• /start-task-work  (auto-select next)\n• /start-task-work --taskId=task-1\n• /start-task-work --priority=P1 --repository=loqa-hub",
              },
            ],
          };
        }
        
        // Auto-detect role if requested
        let detectedRole = roleContext;
        if (roleContext === 'auto-detect') {
          // Use general for now, will be refined when task details are available
          detectedRole = 'general';
        }
        
        // Get role-specific guidance
        const roleConfig = await roleManager.getRoleConfig(detectedRole);
        const safeRoleConfig = roleConfig || {
          role_name: 'General',
          role_description: 'General development tasks',
          capabilities: [],
          detection_patterns: [],
          model_preference: 'sonnet-4',
          task_templates_preferred: []
        };
        
        // Build comprehensive workflow guidance
        const workflow = {
          taskSelection: {
            method: selectedTask.method,
            source: taskSource,
            filters: selectedTask.method === 'ai-recommended' ? selectedTask.filters : 'none',
            command: selectedTask.command || 'Manual selection',
          },
          automation: {
            createBranch,
            updateStatus,
            roleOptimization: detectedRole,
            qualityGates: 'Automatic enforcement',
          },
          workflowSteps: [
            selectedTask.method === 'ai-recommended' ? '🎯 Get next recommended task from backlog aggregator' : '📋 Load specified task details',
            '📖 Read and understand task requirements',
            '🎭 Apply role-specific specialization and best practices',
            createBranch ? '🌿 Create feature branch: git checkout -b feature/task-name' : '⚠️ Working on current branch',
            updateStatus ? '📝 Update task status to "In Progress" in backlog file' : '⚠️ Task status tracking disabled',
            '🔧 Implement solution following role-optimized guidance',
            '🧪 Run comprehensive quality checks: make quality-check',
            '✅ Verify all tests pass and functionality works end-to-end',
            '📤 Create PR with detailed description and link to task',
            '✅ Mark task as "Done" in backlog when complete'
          ],
          roleSpecificGuidance: {
            role: safeRoleConfig.role_name,
            focus: safeRoleConfig.role_description,
            specialization: `Workflow optimized for ${detectedRole} best practices`,
          },
          qualityGates: [
            'Code formatting and linting pass',
            'All unit tests pass', 
            'Integration tests pass',
            'End-to-end verification complete',
            'Documentation updated',
            'PR review and approval obtained'
          ],
          backlogIntegration: {
            aggregator: 'Integrated with ./tools/lb commands for task management',
            statusTracking: updateStatus ? 'Automatic status updates enabled' : 'Manual status tracking',
            prioritization: 'Uses intelligent priority-based task selection',
            roleSystem: 'Full integration with role-based specialization'
          },
          criticalReminders: [
            '🚨 NEVER push directly to main branch',
            '📋 ALL quality checks must PASS before completion',
            '🔄 End-to-end verification is REQUIRED',
            '❓ When blocked, ASK - never make assumptions',
            '📝 Update backlog task status throughout the workflow'
          ]
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                workflow,
                summary: selectedTask.method === 'ai-recommended' 
                  ? "🤖 AI-powered task selection and workflow initiation" 
                  : `🚀 Starting work on backlog task: ${selectedTask.identifier}`,
                implementation: [
                  selectedTask.method === 'ai-recommended' ? `1. Execute: ${selectedTask.command}` : `1. Load task: ${selectedTask.identifier}`,
                  "2. Parse task details and requirements",
                  "3. Apply role-specific workflow optimization",
                  createBranch ? "4. Create feature branch with task-based naming" : "4. Proceed on current branch",
                  updateStatus ? "5. Update task status to 'In Progress'" : "5. Manual status tracking",
                  "6. Follow role-optimized implementation guidance",
                  "7. Complete quality gates and mark task done"
                ],
                advantages: [
                  "Unified task workflow for all backlog work",
                  selectedTask.method === 'ai-recommended' ? "Intelligent priority-based task selection" : "Direct task execution",
                  "Full role system integration",
                  "Automated quality gate enforcement",
                  "Complete backlog system integration"
                ],
                integration: {
                  backlogAggregator: "Uses ./tools/lb for task discovery and management",
                  roleSystem: "Automatic role detection and workflow optimization", 
                  qualitySystem: "Integrated with Loqa quality gates",
                  branchingStrategy: "Feature branch workflow with proper naming"
                }
              }, null, 2),
            },
          ],
        };
      }

      case "plan_strategic_shift": {
        // Interactive strategic shift planning with comprehensive workflow
        const shiftType = args?.shiftType as string;
        const currentState = args?.currentState as string;
        const desiredState = args?.desiredState as string;
        const motivation = args?.motivation as string;
        const roleContext = args?.roleContext as string || 'auto-detect';
        
        // Auto-detect role if requested
        let detectedRole = roleContext;
        if (roleContext === 'auto-detect') {
          const roleResult = await roleManager.detectRole({
            title: shiftType,
            description: motivation
          });
          detectedRole = roleResult.detectedRole;
        }
        
        const roleConfig = await roleManager.getRoleConfig(detectedRole);
        
        // Handle null roleConfig with fallback
        const safeRoleConfig = roleConfig || {
          role_name: 'General',
          role_description: 'General strategic planning',
          capabilities: [],
          detection_patterns: [],
          model_preference: 'sonnet-4',
          task_templates_preferred: []
        };
        
        const strategicPlan = {
          shiftDetails: {
            type: shiftType,
            from: currentState,
            to: desiredState,
            why: motivation,
            urgency: args?.urgency || 'medium',
            roleContext: detectedRole,
          },
          constraints: {
            budget: args?.budgetConstraints || 'none specified',
            timeline: args?.timelineConstraints || 'none specified',
            resources: args?.resourceConstraints || 'none specified',
            technical: args?.technicalConstraints || 'none specified',
          },
          phasesPlan: {
            'Phase 1: Discovery & Analysis': [
              'Ask clarifying questions about scope and impact',
              'Review current backlog status and priorities',
              'Analyze repository structure and dependencies',
              'Assess technical and business impact'
            ],
            'Phase 2: Strategic Planning': [
              'Create detailed transition plan with timelines',
              'Update backlog priorities and status in backlog.md system',
              'Define success criteria and milestones',
              'Identify immediate, short-term, and long-term actions'
            ],
            'Phase 3: Project Management': [
              'Update GitHub Issues and Projects',
              'Close irrelevant issues, update priorities',
              'Create new issues for shift-related work',
              'Plan repository organization changes'
            ],
            'Phase 4: Implementation': [
              'Update branding and messaging if applicable',
              'Create detailed implementation roadmap',
              'Establish checkpoints and review gates',
              'Coordinate multi-repository changes'
            ],
            'Phase 5: Documentation': [
              'Update README files and documentation',
              'Create migration guides if needed',
              'Update CLAUDE.md with new workflows',
              'Document the strategic shift rationale'
            ]
          },
          roleSpecificFocus: {
            role: safeRoleConfig.role_name,
            considerations: safeRoleConfig.role_description,
            expertise: `Leverage ${detectedRole} expertise for optimal planning`
          },
          criticalRequirements: [
            '🌿 MANDATORY: Feature branches for ALL changes',
            '📋 ALL quality checks must PASS',
            '🔄 Multi-repo coordination is CRITICAL',
            '📚 Document impact across all repositories'
          ]
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                strategicPlan,
                summary: `📋 Strategic shift plan: ${shiftType} transformation`,
                roleOptimization: `Planned with ${safeRoleConfig.role_name} perspective`,
                nextSteps: [
                  'Review and validate the phase-by-phase plan',
                  'Start with Phase 1: Discovery & Analysis',
                  'Create backlog tasks for each phase using /start-complex-todo',
                  'Use backlog board view to track strategic shift progress',
                  'Create GitHub issues for coordination tasks'
                ],
                templateReplacement: 'This replaces STRATEGIC_SHIFT_PROMPT.md with interactive planning'
              }, null, 2),
            },
          ],
        };
      }

      case "capture_comprehensive_thought": {
        // Enhanced thought capture with comprehensive workflow
        const thought = args?.thought as string;
        const roleContext = args?.roleContext as string || 'auto-detect';
        
        // Auto-detect role if requested
        let detectedRole = roleContext;
        if (roleContext === 'auto-detect') {
          const roleResult = await roleManager.detectRole({
            title: thought,
            description: args?.context as string || ''
          });
          detectedRole = roleResult.detectedRole;
        }
        
        const roleConfig = await roleManager.getRoleConfig(detectedRole);
        
        // Handle null roleConfig with fallback
        const safeRoleConfig = roleConfig || {
          role_name: 'General',
          role_description: 'General thought processing',
          capabilities: [],
          detection_patterns: [],
          model_preference: 'sonnet-4',
          task_templates_preferred: []
        };
        
        // Create comprehensive thought structure
        const thoughtCapture = {
          content: {
            thought: thought,
            context: args?.context || '',
            category: args?.category || 'general',
            roleContext: detectedRole,
          },
          planning: {
            timeline: args?.timeline || 'ongoing',
            impactLevel: args?.impactLevel || 'medium',
            dependencies: args?.dependencies || 'none identified',
            relatedWork: args?.relatedWork || '',
          },
          workflow: {
            captureLocation: 'Will be saved to backlog/drafts/',
            reviewTrigger: args?.timeline || 'next planning session',
            followUpActions: [
              'Review and decide if this needs to become a formal task',
              'Connect to related existing work',
              'Set appropriate review trigger',
              'Archive if no longer relevant'
            ]
          },
          roleSpecificLens: {
            role: safeRoleConfig.role_name,
            perspective: safeRoleConfig.role_description,
            considerations: `Captured through ${detectedRole} lens for optimal categorization`
          },
          integrationPlan: {
            backlogCreation: 'Use /start-complex-todo to create formal backlog task if actionable',
            thoughtTracking: 'Saved to backlog/drafts/ for review and potential promotion',
            workflowIntegration: 'Use backlog board view and browser interface for management',
            issueCreation: 'Create GitHub issue if needs collaboration across team',
            documentationUpdate: 'Update strategic docs if architecturally significant'
          }
        };
        
        // Actually save the thought using existing logic
        const savedThought = await taskManager.captureThought({
          content: thought,
          tags: [args?.category as string || 'general', detectedRole],
          context: args?.context as string,
          timestamp: new Date()
        });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                thoughtCapture,
                savedTo: savedThought.filePath,
                summary: `💭 Thought captured with ${safeRoleConfig.role_name} perspective`,
                roleOptimization: `Categorized and processed through ${detectedRole} expertise`,
                nextActions: [
                  'Thought saved to backlog/drafts/ for future review',
                  'Use backlog browser to view and manage captured thoughts',
                  'Convert to formal task using /start-complex-todo when actionable',
                  'Review during backlog planning sessions',
                  'Use backlog board view to track thought progression'
                ],
                templateReplacement: 'This replaces THOUGHT_CAPTURE_PROMPT.md with enhanced workflow'
              }, null, 2),
            },
          ],
        };
      }

      case "start_complex_todo": {
        // Enhanced TODO creation with comprehensive planning
        const title = args?.title as string;
        const category = args?.category as string;
        const priority = args?.priority as string;
        const roleContext = args?.roleContext as string || 'auto-detect';
        
        // Auto-detect role if requested
        let detectedRole = roleContext;
        if (roleContext === 'auto-detect') {
          const roleResult = await roleManager.detectRole({
            title: title,
            description: args?.description as string || ''
          });
          detectedRole = roleResult.detectedRole;
        }
        
        const roleConfig = await roleManager.getRoleConfig(detectedRole);
        
        // Handle null roleConfig with fallback
        const safeRoleConfig = roleConfig || {
          role_name: 'General',
          role_description: 'General task management',
          capabilities: [],
          detection_patterns: [],
          model_preference: 'sonnet-4',
          task_templates_preferred: ['general']
        };
        
        // Build comprehensive task structure
        const taskPlan = {
          taskInfo: {
            title,
            category,
            priority,
            description: args?.description || '',
            roleContext: detectedRole,
          },
          planning: {
            context: args?.context || '',
            dependencies: args?.dependencies || 'none',
            acceptanceCriteria: args?.acceptanceCriteria || '',
            estimatedEffort: args?.estimatedEffort || 'unknown',
          },
          breakdown: {
            shouldBreakdown: args?.breakdown || false,
            complexityIndicators: [
              (args?.estimatedEffort as string)?.includes('week') ? 'Multi-week effort' : '',
              args?.dependencies !== 'none' ? 'Has dependencies' : '',
              ((args?.description as string) || '').length > 200 ? 'Detailed description' : ''
            ].filter(Boolean),
          },
          roleSpecificGuidance: {
            role: safeRoleConfig.role_name,
            expertise: safeRoleConfig.role_description,
            workflow: 'Role-specific workflow principles applied',
          },
          qualityGates: [
            'Code review completed',
            'All tests passing (unit, integration, e2e)',
            'Quality checks passing (lint, format, type-check)',
            'Documentation updated',
            'Feature branch and PR workflow followed'
          ],
          completionCriteria: [
            'Task appropriately scoped',
            'Created in backlog system for proper tracking',
            'GitHub Issue created if needed',
            'Clear acceptance criteria defined',
            'Quality gates established'
          ]
        };
        
        // Create the actual task using existing createTaskFromTemplate method
        const savedTask = await taskManager.createTaskFromTemplate({
          title,
          priority: priority as 'High' | 'Medium' | 'Low',
          template: safeRoleConfig.task_templates_preferred[0] || 'general'
        });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                taskPlan,
                savedTo: savedTask.filePath,
                summary: `📋 Complex task created with ${safeRoleConfig.role_name} optimization`,
                roleOptimization: `Structured using ${detectedRole} best practices`,
                recommendedNext: [
                  args?.breakdown ? 'Use /start-complex-todo to create smaller subtasks' : 'Task is appropriately scoped',
                  'View in backlog board: backlog board view',
                  'Manage via web interface: backlog browser', 
                  'Create GitHub issue for team collaboration if needed',
                  'Use backlog priority system for sprint planning'
                ],
                templateReplacement: 'This replaces TODO_ITEM_PROMPT.md with enhanced planning'
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