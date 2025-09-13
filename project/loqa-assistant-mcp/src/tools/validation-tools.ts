import { LoqaRulesValidator } from "../validators/index.js";

/**
 * Validation-related MCP tools
 * Handles commit validation, branch validation, quality gates, etc.
 */

export const validationTools = [
  {
    name: "validation:GetWorkflowRules",
    description:
      "Get workflow rules for current repository using embedded configuration (configuration-free approach)",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description: "Optional repository path (defaults to current directory)",
        },
      },
    },
  },
  {
    name: "validation:CommitMessage",
    description:
      "Validate commit message against Loqa rules and detect AI attribution",
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
    name: "validation:BranchName",
    description: "Validate branch name follows proper conventions",
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
    name: "validation:PreCommit",
    description:
      "Run comprehensive pre-commit validation including commit message and quality gates",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The commit message to validate",
        },
        repoPath: {
          type: "string",
          description:
            "Optional repository path (defaults to current directory)",
        },
      },
      required: ["message"],
    },
  },
  {
    name: "validation:RepositoryInfo",
    description:
      "Get comprehensive repository information including branch status and Loqa detection",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description:
            "Optional repository path (defaults to current directory)",
        },
      },
    },
  },
  {
    name: "validation:QualityGates",
    description: "Validate quality gates for the repository",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description:
            "Optional repository path (defaults to current directory)",
        },
      },
    },
  },
  {
    name: "validation:DiagnoseWorkspace",
    description:
      "Diagnose workspace context and provide detailed environment information",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

export async function handleValidationTool(
  name: string,
  args: any
): Promise<any> {
  const validator = new LoqaRulesValidator();

  switch (name) {
    case "validation:GetWorkflowRules": {
      const { repoPath } = args;
      const rules = await validator.getWorkflowRules(repoPath);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                blocking_rules: rules.blocking,
                quality_gates: rules.quality_gates,
                branch_protection: rules.branch_protection,
                ai_attribution_patterns: rules.ai_attribution_patterns,
                message: "📋 Workflow rules loaded from embedded configuration (configuration-free approach)",
                source: "MCP Server Embedded Rules"
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "validation:CommitMessage": {
      const { message } = args;
      const result = await validator.validateCommitMessage(message);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                valid: result.valid,
                violations: result.violations,
                warnings: result.warnings,
                message: result.valid
                  ? "✅ Commit message is valid"
                  : "❌ Commit message has violations",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "validation:BranchName": {
      const { branchName } = args;
      const result = await validator.validateBranchName(branchName);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                valid: result.valid,
                violations: result.violations,
                warnings: result.warnings,
                message: result.valid
                  ? "✅ Branch name is valid"
                  : "❌ Branch name has violations",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "validation:PreCommit": {
      const { message, repoPath } = args;
      const result = await validator.validatePreCommit(message, repoPath);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                valid: result.valid,
                violations: result.violations,
                warnings: result.warnings,
                message: result.valid
                  ? "✅ Pre-commit validation passed"
                  : "❌ Pre-commit validation failed",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "validation:RepositoryInfo": {
      const { repoPath } = args;
      const repoInfo = await validator.getRepositoryInfo(repoPath);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                repository: repoInfo,
                message: `📁 Repository: ${repoInfo.path} | Branch: ${
                  repoInfo.currentBranch
                } | Loqa: ${repoInfo.isLoqaRepository ? "✅" : "❌"}`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "validation:QualityGates": {
      const { repoPath } = args;
      const result = await validator.validateQualityGates(repoPath);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                valid: result.valid,
                violations: result.violations,
                warnings: result.warnings,
                message: result.valid
                  ? "✅ Quality gates validation passed"
                  : "❌ Quality gates have violations",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "validation:DiagnoseWorkspace": {
      try {
        const { detectWorkspaceContext } = await import(
          "../utils/context-detector.js"
        );
        const context = await detectWorkspaceContext();

        let diagnostic = `🔍 **Workspace Diagnostic Report**\n\n`;
        diagnostic += `📂 **Current Directory**: ${process.cwd()}\n`;
        diagnostic += `🏷️ **Context Type**: ${context.type}\n`;
        diagnostic += `🏢 **Is Loqa Workspace**: ${
          context.isLoqaWorkspace ? "✅" : "❌"
        }\n\n`;

        if (context.currentRepository) {
          diagnostic += `📦 **Current Repository**: ${context.currentRepository}\n`;
          diagnostic += `🌿 **Current Branch**: ${
            context.currentBranch || "Unknown"
          }\n`;
          diagnostic += `⚠️ **Uncommitted Changes**: ${
            context.hasUncommittedChanges ? "⚠️ Yes" : "✅ No"
          }\n\n`;
        }

        if (context.workspaceRoot) {
          diagnostic += `🏠 **Workspace Root**: ${context.workspaceRoot}\n\n`;
        }

        diagnostic += `📋 **Available Repositories** (${context.availableRepositories.length}):\n`;
        if (context.availableRepositories.length > 0) {
          for (const repo of context.availableRepositories) {
            const isCurrent =
              repo === context.currentRepository ? " (current)" : "";
            diagnostic += `• ${repo}${isCurrent}\n`;
          }
        } else {
          diagnostic += `❌ No Loqa repositories found\n`;
        }

        diagnostic += `\n**Recommendations**:\n`;
        if (!context.isLoqaWorkspace) {
          diagnostic += `• Navigate to a directory containing Loqa repositories\n`;
          diagnostic += `• Clone Loqa repositories if missing\n`;
        } else if (context.type === "workspace-root") {
          diagnostic += `• You're in the workspace root - good for multi-repo operations\n`;
          diagnostic += `• Navigate to specific repositories for repo-specific issues\n`;
        } else if (context.type === "individual-repo") {
          diagnostic += `• You're in a specific repository - good for focused work\n`;
          diagnostic += `• Use workspace tools from here for cross-repo operations\n`;
        }

        return {
          content: [
            {
              type: "text",
              text: diagnostic,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to diagnose workspace: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }

    default:
      throw new Error(`Unknown validation tool: ${name}`);
  }
}
