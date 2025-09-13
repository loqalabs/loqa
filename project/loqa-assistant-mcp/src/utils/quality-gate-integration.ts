/**
 * Quality Gate Integration - Pragmatic quality validation
 *
 * Integrates with quality-gates.json for repository-specific validation
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface QualityCheck {
  command: string;
  description?: string;
  required?: boolean;
  autofix?: string;
}

interface QualityGateConfig {
  default: {
    checks: Record<string, QualityCheck>;
  };
  repositoryOverrides: Record<string, {
    description?: string;
    inherit?: string | boolean;
    checks: Record<string, QualityCheck>;
  }>;
  globalSettings: {
    parallel?: boolean;
    stopOnFirstFailure?: boolean;
    timeout?: number;
    retries?: number;
  };
}

export class QualityGateValidator {
  private config: QualityGateConfig | null = null;
  private configPath: string;

  constructor(configPath?: string) {
    // Default to the MCP server config location, using multiple fallback strategies
    if (configPath) {
      this.configPath = configPath;
    } else {
      // Try multiple paths to find the config file
      const candidates = [
        path.resolve(__dirname, '../../config/quality-gates.json'),
        path.resolve(process.cwd(), 'config/quality-gates.json'),
        path.resolve(process.cwd(), 'project/loqa-assistant-mcp/config/quality-gates.json')
      ];

      this.configPath = candidates.find(candidate => {
        try {
          fs.accessSync(candidate);
          return true;
        } catch {
          return false;
        }
      }) || candidates[0]; // Fallback to first candidate if none found
    }
  }

  private loadConfig(): QualityGateConfig {
    if (this.config) return this.config;

    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configContent);
      return this.config!;
    } catch (error) {
      console.warn(`Failed to load quality gates config from ${this.configPath}, using defaults`);
      return this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): QualityGateConfig {
    return {
      default: {
        checks: {
          lint: { command: 'make lint', required: true },
          test: { command: 'make test', required: true },
          build: { command: 'make build', required: true }
        }
      },
      repositoryOverrides: {},
      globalSettings: { parallel: true, timeout: 300 }
    };
  }

  /**
   * Get quality checks for a repository
   */
  public getQualityChecks(repoName: string): Record<string, QualityCheck> {
    const config = this.loadConfig();
    const defaults = config.default?.checks || {};
    const override = config.repositoryOverrides?.[repoName];

    if (!override) {
      return defaults;
    }

    // Start with defaults if inheritance enabled
    let checks = override.inherit === 'default' ? { ...defaults } : {};

    // Apply repository-specific overrides
    if (override.checks) {
      Object.assign(checks, override.checks);
    }

    return checks;
  }

  /**
   * Run quality checks for a repository
   */
  public async runQualityChecks(repoPath: string, repoName?: string): Promise<{
    success: boolean;
    results: Array<{
      name: string;
      success: boolean;
      output: string;
      error?: string;
      duration: number;
    }>;
  }> {
    // Detect repo name if not provided
    if (!repoName) {
      repoName = path.basename(repoPath);
    }

    const checks = this.getQualityChecks(repoName);
    const config = this.loadConfig();
    const globalSettings = config.globalSettings;

    const results = [];
    let allSucceeded = true;

    for (const [checkName, check] of Object.entries(checks)) {
      if (check.required === false) continue; // Skip optional checks

      const startTime = Date.now();
      try {
        const output = execSync(check.command, {
          cwd: repoPath,
          encoding: 'utf8',
          timeout: (globalSettings.timeout || 300) * 1000,
          stdio: 'pipe'
        });

        results.push({
          name: checkName,
          success: true,
          output: output.toString(),
          duration: Date.now() - startTime
        });
      } catch (error: any) {
        allSucceeded = false;
        results.push({
          name: checkName,
          success: false,
          output: error.stdout?.toString() || '',
          error: error.stderr?.toString() || error.message,
          duration: Date.now() - startTime
        });

        // Stop on first failure if configured
        if (globalSettings.stopOnFirstFailure) {
          break;
        }
      }
    }

    return {
      success: allSucceeded,
      results
    };
  }

  /**
   * Get available autofix commands for a repository
   */
  public getAutofixCommands(repoName: string): Array<{
    name: string;
    command: string;
    description: string;
  }> {
    const checks = this.getQualityChecks(repoName);
    const autofixes = [];

    for (const [checkName, check] of Object.entries(checks)) {
      if (check.autofix) {
        autofixes.push({
          name: checkName,
          command: check.autofix,
          description: check.description || `Auto-fix ${checkName}`
        });
      }
    }

    return autofixes;
  }

  /**
   * Run autofix commands for a repository
   */
  public async runAutofix(repoPath: string, repoName?: string, checkName?: string): Promise<{
    success: boolean;
    results: Array<{
      name: string;
      success: boolean;
      output: string;
      error?: string;
    }>;
  }> {
    if (!repoName) {
      repoName = path.basename(repoPath);
    }

    const autofixes = this.getAutofixCommands(repoName);
    const targetFixes = checkName
      ? autofixes.filter(fix => fix.name === checkName)
      : autofixes;

    const results = [];
    let allSucceeded = true;

    for (const fix of targetFixes) {
      try {
        const output = execSync(fix.command, {
          cwd: repoPath,
          encoding: 'utf8',
          stdio: 'pipe'
        });

        results.push({
          name: fix.name,
          success: true,
          output: output.toString()
        });
      } catch (error: any) {
        allSucceeded = false;
        results.push({
          name: fix.name,
          success: false,
          output: error.stdout?.toString() || '',
          error: error.stderr?.toString() || error.message
        });
      }
    }

    return {
      success: allSucceeded,
      results
    };
  }

  /**
   * Validate quality gates configuration
   */
  public validateConfig(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const config = this.loadConfig();
    const results = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Check required structure
    if (!config.default || !config.default.checks) {
      results.valid = false;
      results.errors.push('Missing default.checks configuration');
    }

    // Validate repository overrides
    for (const [repoName, override] of Object.entries(config.repositoryOverrides || {})) {
      if (!override.checks || Object.keys(override.checks).length === 0) {
        results.warnings.push(`Repository '${repoName}' has no quality checks defined`);
      }

      // Check for commands that might not exist
      for (const [checkName, check] of Object.entries(override.checks || {})) {
        if (!check.command) {
          results.valid = false;
          results.errors.push(`Quality check '${checkName}' in '${repoName}' missing command`);
        }
      }
    }

    return results;
  }

  /**
   * Get configured repositories
   */
  public getConfiguredRepositories(): Array<{
    name: string;
    description: string;
    checksCount: number;
  }> {
    const config = this.loadConfig();
    const repos = [];

    for (const [repoName, override] of Object.entries(config.repositoryOverrides || {})) {
      const checks = this.getQualityChecks(repoName);
      repos.push({
        name: repoName,
        description: override.description || 'No description available',
        checksCount: Object.keys(checks).length
      });
    }

    return repos;
  }
}

// Export singleton instance for easy use
export const qualityGateValidator = new QualityGateValidator();