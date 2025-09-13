/**
 * Quality Gate Tools - Pragmatic workflow quality validation
 *
 * MCP tools for running and managing quality gates across repositories
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { qualityGateValidator } from '../utils/quality-gate-integration.js';
import { detectGitRepo } from '../utils/git-repo-detector.js';
import * as path from 'path';

export const qualityGateTools: Tool[] = [
  {
    name: 'qualityGate:RunChecks',
    description: 'Run quality checks for current repository',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: {
          type: 'string',
          description: 'Repository path (defaults to current directory)'
        },
        repoName: {
          type: 'string',
          description: 'Repository name (auto-detected if not provided)'
        },
        checkName: {
          type: 'string',
          description: 'Run specific check only (optional)'
        }
      }
    }
  },

  {
    name: 'qualityGate:RunAutofix',
    description: 'Run autofix commands for repository',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: {
          type: 'string',
          description: 'Repository path (defaults to current directory)'
        },
        repoName: {
          type: 'string',
          description: 'Repository name (auto-detected if not provided)'
        },
        checkName: {
          type: 'string',
          description: 'Run autofix for specific check only (optional)'
        }
      }
    }
  },

  {
    name: 'qualityGate:ListChecks',
    description: 'List available quality checks for repository',
    inputSchema: {
      type: 'object',
      properties: {
        repoName: {
          type: 'string',
          description: 'Repository name (auto-detected if not provided)'
        }
      }
    }
  },

  {
    name: 'qualityGate:ValidateConfig',
    description: 'Validate quality gates configuration',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },

  {
    name: 'qualityGate:ListRepositories',
    description: 'List all configured repositories and their quality checks',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

export async function handleQualityGateTools(name: string, args: any): Promise<any> {
  try {
    switch (name) {
      case 'qualityGate:RunChecks': {
        const repoPath = args.repoPath || process.cwd();
        let repoName = args.repoName;

        // Auto-detect repository if not provided
        if (!repoName) {
          const detected = await detectGitRepo(repoPath);
          repoName = detected.repoRoot ? path.basename(detected.repoRoot) : 'unknown';
        }

        const results = await qualityGateValidator.runQualityChecks(repoPath, repoName);

        // Format results for display
        const summary = {
          repository: repoName,
          path: repoPath,
          overall: results.success ? 'PASSED' : 'FAILED',
          totalChecks: results.results.length,
          passedChecks: results.results.filter(r => r.success).length,
          failedChecks: results.results.filter(r => !r.success).length
        };

        const details = results.results.map(result => ({
          check: result.name,
          status: result.success ? 'PASS' : 'FAIL',
          duration: `${result.duration}ms`,
          output: result.output ? result.output.slice(0, 500) : '',
          error: result.error ? result.error.slice(0, 500) : undefined
        }));

        return {
          success: results.success,
          summary,
          details,
          message: results.success
            ? `✅ All quality checks passed for ${repoName}`
            : `❌ ${summary.failedChecks} of ${summary.totalChecks} quality checks failed for ${repoName}`
        };
      }

      case 'qualityGate:RunAutofix': {
        const repoPath = args.repoPath || process.cwd();
        let repoName = args.repoName;

        if (!repoName) {
          const detected = await detectGitRepo(repoPath);
          repoName = detected.repoRoot ? path.basename(detected.repoRoot) : 'unknown';
        }

        const results = await qualityGateValidator.runAutofix(repoPath, repoName, args.checkName);

        return {
          success: results.success,
          repository: repoName,
          path: repoPath,
          results: results.results.map(result => ({
            check: result.name,
            status: result.success ? 'FIXED' : 'FAILED',
            output: result.output ? result.output.slice(0, 500) : '',
            error: result.error ? result.error.slice(0, 500) : undefined
          })),
          message: results.success
            ? `✅ Autofix completed successfully for ${repoName}`
            : `❌ Some autofix commands failed for ${repoName}`
        };
      }

      case 'qualityGate:ListChecks': {
        let repoName = args.repoName;

        if (!repoName) {
          const detected = await detectGitRepo(process.cwd());
          repoName = detected.repoRoot ? path.basename(detected.repoRoot) : 'unknown';
        }

        const checks = qualityGateValidator.getQualityChecks(repoName);
        const autofixes = qualityGateValidator.getAutofixCommands(repoName);

        const checkList = Object.entries(checks).map(([name, check]) => ({
          name,
          command: check.command,
          description: check.description || name,
          required: check.required !== false,
          hasAutofix: autofixes.some(fix => fix.name === name)
        }));

        return {
          repository: repoName,
          totalChecks: checkList.length,
          requiredChecks: checkList.filter(c => c.required).length,
          optionalChecks: checkList.filter(c => !c.required).length,
          autofixAvailable: autofixes.length,
          checks: checkList
        };
      }

      case 'qualityGate:ValidateConfig': {
        const validation = qualityGateValidator.validateConfig();

        return {
          valid: validation.valid,
          configPath: qualityGateValidator['configPath'],
          errors: validation.errors,
          warnings: validation.warnings,
          message: validation.valid
            ? '✅ Quality gates configuration is valid'
            : `❌ Quality gates configuration has ${validation.errors.length} errors`
        };
      }

      case 'qualityGate:ListRepositories': {
        const repos = qualityGateValidator.getConfiguredRepositories();

        return {
          totalRepositories: repos.length,
          repositories: repos.map(repo => ({
            name: repo.name,
            description: repo.description,
            qualityChecks: repo.checksCount
          })),
          message: `Found ${repos.length} configured repositories with quality gates`
        };
      }

      default:
        return {
          error: `Unknown quality gate tool: ${name}`,
          availableTools: qualityGateTools.map(tool => tool.name)
        };
    }
  } catch (error: any) {
    return {
      error: `Quality gate operation failed: ${error.message}`,
      tool: name,
      args
    };
  }
}