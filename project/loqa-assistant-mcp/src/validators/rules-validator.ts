import { simpleGit, SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ValidationResult, RepositoryInfo } from '../types/index.js';

export class LoqaRulesValidator {
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