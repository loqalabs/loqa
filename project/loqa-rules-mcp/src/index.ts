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
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const validator = new LoqaRulesValidator();

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