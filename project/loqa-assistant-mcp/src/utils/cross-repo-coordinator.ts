/**
 * Cross-Repository Coordinator - Pragmatic multi-repo workflow automation
 *
 * Manages dependencies, change detection, and coordinated workflows across
 * the 8-repository Loqa ecosystem with AI-powered impact analysis
 */

import * as path from 'path';
import * as fs from 'fs';
import { detectGitRepo, executeGitCommand } from './git-repo-detector.js';
import { qualityGateValidator } from './quality-gate-integration.js';

/**
 * Repository metadata and dependency information
 */
interface RepositoryInfo {
  name: string;
  path: string;
  type: 'core-service' | 'frontend' | 'protocol' | 'plugins' | 'orchestration' | 'config' | 'website';
  description: string;
  dependencies: string[];
  dependents: string[];
  primaryLanguage: string;
  buildCommand: string;
  testCommand: string;
  qualityCheckCommand: string;
}

/**
 * Change impact analysis result
 */
interface ChangeImpact {
  changedRepository: string;
  impactType: 'breaking' | 'feature' | 'bugfix' | 'internal';
  affectedRepositories: string[];
  requiredActions: RepositoryAction[];
  coordinationComplexity: 'simple' | 'moderate' | 'complex';
  estimatedEffort: string;
  automationRecommendations: string[];
}

/**
 * Action required in a repository due to cross-repo changes
 */
interface RepositoryAction {
  repository: string;
  actionType: 'update-types' | 'update-api-calls' | 'regenerate-bindings' | 'update-tests' | 'update-docs';
  description: string;
  priority: 'high' | 'medium' | 'low';
  automatable: boolean;
  estimatedEffort: string;
}

/**
 * Dependency graph and coordination workflows
 */
export class CrossRepoCoordinator {
  private repositories: Map<string, RepositoryInfo> = new Map();
  private workspaceRoot: string;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || this.findWorkspaceRoot();
    this.initializeRepositories();
  }

  /**
   * Find the workspace root containing all repositories
   */
  private findWorkspaceRoot(): string {
    // Look for common workspace indicators
    let currentPath = process.cwd();
    while (currentPath !== path.dirname(currentPath)) {
      const entries = fs.readdirSync(currentPath);
      const loqaRepos = entries.filter(entry =>
        ['loqa-hub', 'loqa-commander', 'loqa-proto', 'loqa-relay', 'loqa-skills'].includes(entry)
      );

      if (loqaRepos.length >= 3) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
    }
    return process.cwd(); // Fallback
  }

  /**
   * Initialize repository dependency graph
   */
  private initializeRepositories(): void {
    const repoConfigs: RepositoryInfo[] = [
      {
        name: 'loqa-proto',
        path: path.join(this.workspaceRoot, 'loqa-proto'),
        type: 'protocol',
        description: 'gRPC protocol definitions - foundation for all services',
        dependencies: [],
        dependents: ['loqa-hub', 'loqa-relay', 'loqa-skills'],
        primaryLanguage: 'protobuf',
        buildCommand: './generate.sh',
        testCommand: 'make test',
        qualityCheckCommand: 'make quality-check'
      },
      {
        name: 'loqa-skills',
        path: path.join(this.workspaceRoot, 'loqa-skills'),
        type: 'plugins',
        description: 'Skill plugin system - consumed by hub',
        dependencies: ['loqa-proto'],
        dependents: ['loqa-hub'],
        primaryLanguage: 'go',
        buildCommand: 'make build',
        testCommand: 'go test ./...',
        qualityCheckCommand: 'make quality-check'
      },
      {
        name: 'loqa-hub',
        path: path.join(this.workspaceRoot, 'loqa-hub'),
        type: 'core-service',
        description: 'Central service - depends on proto and skills',
        dependencies: ['loqa-proto', 'loqa-skills'],
        dependents: ['loqa-commander', 'loqa-relay'],
        primaryLanguage: 'go',
        buildCommand: 'go build ./cmd',
        testCommand: 'go test ./...',
        qualityCheckCommand: 'make quality-check'
      },
      {
        name: 'loqa-relay',
        path: path.join(this.workspaceRoot, 'loqa-relay'),
        type: 'core-service',
        description: 'Audio client - depends on proto and communicates with hub',
        dependencies: ['loqa-proto'],
        dependents: [],
        primaryLanguage: 'go',
        buildCommand: 'go build ./cmd',
        testCommand: 'go test ./...',
        qualityCheckCommand: 'make quality-check'
      },
      {
        name: 'loqa-commander',
        path: path.join(this.workspaceRoot, 'loqa-commander'),
        type: 'frontend',
        description: 'Vue.js dashboard - consumes hub API',
        dependencies: ['loqa-hub'], // Indirect: needs hub API types
        dependents: [],
        primaryLanguage: 'typescript',
        buildCommand: 'npm run build',
        testCommand: 'npm test',
        qualityCheckCommand: 'npm run quality-check'
      },
      {
        name: 'www-loqalabs-com',
        path: path.join(this.workspaceRoot, 'www-loqalabs-com'),
        type: 'website',
        description: 'Marketing website - independent',
        dependencies: [],
        dependents: [],
        primaryLanguage: 'typescript',
        buildCommand: 'npm run build',
        testCommand: 'npm test',
        qualityCheckCommand: 'npm run quality-check'
      },
      {
        name: 'loqalabs-github-config',
        path: path.join(this.workspaceRoot, 'loqalabs-github-config'),
        type: 'config',
        description: 'Shared GitHub configurations',
        dependencies: [],
        dependents: ['loqa-hub', 'loqa-commander', 'loqa-proto', 'loqa-relay', 'loqa-skills', 'www-loqalabs-com', 'loqa'],
        primaryLanguage: 'yaml',
        buildCommand: 'make validate',
        testCommand: 'make test',
        qualityCheckCommand: 'make quality-check'
      },
      {
        name: 'loqa',
        path: path.join(this.workspaceRoot, 'loqa'),
        type: 'orchestration',
        description: 'Docker Compose orchestration and documentation',
        dependencies: ['loqa-hub', 'loqa-commander', 'loqa-relay'],
        dependents: [],
        primaryLanguage: 'docker',
        buildCommand: 'docker-compose build',
        testCommand: 'make test',
        qualityCheckCommand: 'make quality-check'
      }
    ];

    repoConfigs.forEach(repo => {
      this.repositories.set(repo.name, repo);
    });
  }

  /**
   * Analyze the impact of changes in a repository
   */
  public async analyzeChangeImpact(
    repositoryName: string,
    changedFiles: string[],
    commitMessage?: string
  ): Promise<ChangeImpact> {
    const repository = this.repositories.get(repositoryName);
    if (!repository) {
      throw new Error(`Unknown repository: ${repositoryName}`);
    }

    // Determine impact type from files and commit message
    const impactType = this.determineImpactType(changedFiles, commitMessage, repository);

    // Find affected repositories based on dependency graph
    const affectedRepositories = this.findAffectedRepositories(repositoryName, impactType);

    // Generate required actions for each affected repository
    const requiredActions = this.generateRequiredActions(repositoryName, affectedRepositories, changedFiles, impactType);

    // Assess coordination complexity
    const coordinationComplexity = this.assessCoordinationComplexity(affectedRepositories, requiredActions);

    // Estimate effort
    const estimatedEffort = this.estimateCoordinationEffort(affectedRepositories, requiredActions);

    // Generate automation recommendations
    const automationRecommendations = this.generateAutomationRecommendations(requiredActions, impactType);

    return {
      changedRepository: repositoryName,
      impactType,
      affectedRepositories,
      requiredActions,
      coordinationComplexity,
      estimatedEffort,
      automationRecommendations
    };
  }

  /**
   * Get the proper dependency order for operations
   */
  public getDependencyOrder(repositoryNames?: string[]): string[] {
    const repos = repositoryNames || Array.from(this.repositories.keys());
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (repoName: string) => {
      if (visited.has(repoName)) return;
      if (visiting.has(repoName)) {
        throw new Error(`Circular dependency detected involving ${repoName}`);
      }

      visiting.add(repoName);
      const repo = this.repositories.get(repoName);
      if (repo) {
        // Visit dependencies first
        for (const dep of repo.dependencies) {
          if (repos.includes(dep)) {
            visit(dep);
          }
        }
      }
      visiting.delete(repoName);
      visited.add(repoName);
      result.push(repoName);
    };

    for (const repo of repos) {
      visit(repo);
    }

    return result;
  }

  /**
   * Create coordinated feature branches across multiple repositories
   */
  public async createCoordinatedBranches(
    branchName: string,
    repositories: string[],
    baseBranch: string = 'main'
  ): Promise<{
    success: boolean;
    results: Array<{
      repository: string;
      success: boolean;
      branchCreated: boolean;
      error?: string;
    }>;
  }> {
    const results = [];
    let overallSuccess = true;

    // Create branches in dependency order
    const orderedRepos = this.getDependencyOrder(repositories);

    for (const repoName of orderedRepos) {
      const repo = this.repositories.get(repoName);
      if (!repo || !fs.existsSync(repo.path)) {
        results.push({
          repository: repoName,
          success: false,
          branchCreated: false,
          error: `Repository not found: ${repo?.path}`
        });
        overallSuccess = false;
        continue;
      }

      try {
        // Check if we're in a git repository
        const gitInfo = await detectGitRepo(repo.path);
        if (!gitInfo.isGitRepo) {
          results.push({
            repository: repoName,
            success: false,
            branchCreated: false,
            error: 'Not a git repository'
          });
          overallSuccess = false;
          continue;
        }

        // Fetch latest changes
        await executeGitCommand(['fetch', 'origin', baseBranch], repo.path);

        // Checkout base branch and pull
        await executeGitCommand(['checkout', baseBranch], repo.path);
        await executeGitCommand(['pull', 'origin', baseBranch], repo.path);

        // Create feature branch
        const branchResult = await executeGitCommand(['checkout', '-b', branchName], repo.path);

        results.push({
          repository: repoName,
          success: branchResult.success,
          branchCreated: branchResult.success,
          error: branchResult.success ? undefined : branchResult.stderr
        });

        if (!branchResult.success) {
          overallSuccess = false;
        }

      } catch (error: any) {
        results.push({
          repository: repoName,
          success: false,
          branchCreated: false,
          error: error.message
        });
        overallSuccess = false;
      }
    }

    return {
      success: overallSuccess,
      results
    };
  }

  /**
   * Run quality gates across multiple repositories in dependency order
   */
  public async runCoordinatedQualityGates(
    repositories: string[]
  ): Promise<{
    success: boolean;
    results: Array<{
      repository: string;
      success: boolean;
      duration: number;
      failedChecks: string[];
      passedChecks: string[];
    }>;
    executionOrder: string[];
  }> {
    const executionOrder = this.getDependencyOrder(repositories);
    const results = [];
    let overallSuccess = true;

    for (const repoName of executionOrder) {
      const repo = this.repositories.get(repoName);
      if (!repo) continue;

      const startTime = Date.now();
      try {
        // Run quality checks for this repository
        const qualityResult = await qualityGateValidator.runQualityChecks(repo.path, repoName);
        const duration = Date.now() - startTime;

        const failedChecks = qualityResult.results.filter(r => !r.success).map(r => r.name);
        const passedChecks = qualityResult.results.filter(r => r.success).map(r => r.name);

        results.push({
          repository: repoName,
          success: qualityResult.success,
          duration,
          failedChecks,
          passedChecks
        });

        if (!qualityResult.success) {
          overallSuccess = false;
          // In strict mode, we could break here to prevent cascading failures
        }

      } catch (error: any) {
        results.push({
          repository: repoName,
          success: false,
          duration: Date.now() - startTime,
          failedChecks: ['execution-error'],
          passedChecks: []
        });
        overallSuccess = false;
      }
    }

    return {
      success: overallSuccess,
      results,
      executionOrder
    };
  }

  /**
   * Get repository information
   */
  public getRepositoryInfo(name: string): RepositoryInfo | undefined {
    return this.repositories.get(name);
  }

  /**
   * Get all repositories
   */
  public getAllRepositories(): RepositoryInfo[] {
    return Array.from(this.repositories.values());
  }

  /**
   * Private helper methods for impact analysis
   */

  private determineImpactType(
    changedFiles: string[],
    commitMessage: string = '',
    repository: RepositoryInfo
  ): 'breaking' | 'feature' | 'bugfix' | 'internal' {
    const message = commitMessage.toLowerCase();
    const files = changedFiles.join(' ').toLowerCase();

    // Breaking change indicators
    if (message.includes('breaking') || message.includes('major:')) {
      return 'breaking';
    }

    // Protocol changes are potentially breaking
    if (repository.name === 'loqa-proto' && files.includes('.proto')) {
      return 'breaking';
    }

    // API changes in hub
    if (repository.name === 'loqa-hub' && (files.includes('api/') || files.includes('internal/api'))) {
      return message.includes('feat') || message.includes('add') ? 'feature' : 'breaking';
    }

    // Feature indicators
    if (message.includes('feat') || message.includes('add') || message.includes('new')) {
      return 'feature';
    }

    // Bug fix indicators
    if (message.includes('fix') || message.includes('bug') || message.includes('patch')) {
      return 'bugfix';
    }

    return 'internal';
  }

  private findAffectedRepositories(repositoryName: string, impactType: string): string[] {
    const repository = this.repositories.get(repositoryName);
    if (!repository) return [];

    let affected: string[] = [];

    if (impactType === 'breaking' || impactType === 'feature') {
      // Include all dependents for breaking changes and features
      affected = [...repository.dependents];

      // For protocol changes, affect all protocol consumers
      if (repositoryName === 'loqa-proto') {
        affected = ['loqa-hub', 'loqa-relay', 'loqa-skills'];
      }

      // For hub changes, affect commander (API consumer)
      if (repositoryName === 'loqa-hub') {
        affected.push('loqa-commander');
      }
    } else if (impactType === 'bugfix') {
      // Only immediate dependents for bug fixes
      affected = repository.dependents.slice(0, 1);
    }

    return [...new Set(affected)]; // Remove duplicates
  }

  private generateRequiredActions(
    changedRepo: string,
    affectedRepos: string[],
    changedFiles: string[],
    impactType: string
  ): RepositoryAction[] {
    const actions: RepositoryAction[] = [];

    for (const repoName of affectedRepos) {
      const repo = this.repositories.get(repoName);
      if (!repo) continue;

      if (changedRepo === 'loqa-proto' && repo.primaryLanguage === 'go') {
        actions.push({
          repository: repoName,
          actionType: 'regenerate-bindings',
          description: 'Regenerate Go bindings from updated protocol definitions',
          priority: 'high',
          automatable: true,
          estimatedEffort: '15 minutes'
        });
      }

      if (changedRepo === 'loqa-hub' && repoName === 'loqa-commander') {
        actions.push({
          repository: repoName,
          actionType: 'update-api-calls',
          description: 'Update API client calls to match hub service changes',
          priority: impactType === 'breaking' ? 'high' : 'medium',
          automatable: false,
          estimatedEffort: impactType === 'breaking' ? '2-4 hours' : '30 minutes'
        });
      }

      // Always require tests for affected repositories
      actions.push({
        repository: repoName,
        actionType: 'update-tests',
        description: 'Update tests to reflect changes in dependencies',
        priority: 'medium',
        automatable: false,
        estimatedEffort: '1-2 hours'
      });
    }

    return actions;
  }

  private assessCoordinationComplexity(
    affectedRepos: string[],
    requiredActions: RepositoryAction[]
  ): 'simple' | 'moderate' | 'complex' {
    if (affectedRepos.length === 0) return 'simple';
    if (affectedRepos.length <= 2 && requiredActions.filter(a => !a.automatable).length <= 2) return 'moderate';
    return 'complex';
  }

  private estimateCoordinationEffort(
    affectedRepos: string[],
    requiredActions: RepositoryAction[]
  ): string {
    const manualActions = requiredActions.filter(a => !a.automatable);

    if (affectedRepos.length === 0) return '0 minutes';
    if (affectedRepos.length <= 2 && manualActions.length <= 2) return '1-2 hours';
    if (affectedRepos.length <= 4 && manualActions.length <= 4) return '0.5-1 day';
    return '1-3 days';
  }

  private generateAutomationRecommendations(
    requiredActions: RepositoryAction[],
    impactType: string
  ): string[] {
    const recommendations = [];

    const automatableActions = requiredActions.filter(a => a.automatable);
    if (automatableActions.length > 0) {
      recommendations.push(`Automate ${automatableActions.length} actions: ${automatableActions.map(a => a.actionType).join(', ')}`);
    }

    if (impactType === 'breaking') {
      recommendations.push('Create coordinated feature branches for breaking changes');
      recommendations.push('Run quality gates in dependency order before merging');
    }

    const protocolActions = requiredActions.filter(a => a.actionType === 'regenerate-bindings');
    if (protocolActions.length > 0) {
      recommendations.push('Set up automated protocol binding generation in CI/CD');
    }

    return recommendations;
  }
}

// Export singleton instance
export const crossRepoCoordinator = new CrossRepoCoordinator();