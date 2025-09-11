import { LoqaRulesValidator } from '../validators/index.js';

/**
 * Validation-related MCP tools
 * Handles commit validation, branch validation, quality gates, etc.
 */

export const validationTools = [
  {
    name: "validate_commit_message",
    description: "Validate commit message against Loqa rules and detect AI attribution",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The commit message to validate"
        }
      },
      required: ["message"]
    }
  },
  {
    name: "validate_branch_name",
    description: "Validate branch name follows proper conventions",
    inputSchema: {
      type: "object",
      properties: {
        branchName: {
          type: "string",
          description: "The branch name to validate"
        }
      },
      required: ["branchName"]
    }
  },
  {
    name: "validate_pre_commit",
    description: "Run comprehensive pre-commit validation including commit message and quality gates",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The commit message to validate"
        },
        repoPath: {
          type: "string",
          description: "Optional repository path (defaults to current directory)"
        }
      },
      required: ["message"]
    }
  },
  {
    name: "get_repository_info",
    description: "Get comprehensive repository information including branch status and Loqa detection",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description: "Optional repository path (defaults to current directory)"
        }
      }
    }
  },
  {
    name: "validate_quality_gates",
    description: "Validate quality gates for the repository",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string", 
          description: "Optional repository path (defaults to current directory)"
        }
      }
    }
  }
];

export async function handleValidationTool(name: string, args: any): Promise<any> {
  const validator = new LoqaRulesValidator();

  switch (name) {
    case "validate_commit_message": {
      const { message } = args;
      const result = await validator.validateCommitMessage(message);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            valid: result.valid,
            violations: result.violations,
            warnings: result.warnings,
            message: result.valid ? "✅ Commit message is valid" : "❌ Commit message has violations"
          }, null, 2)
        }]
      };
    }

    case "validate_branch_name": {
      const { branchName } = args;
      const result = await validator.validateBranchName(branchName);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            valid: result.valid,
            violations: result.violations,
            warnings: result.warnings,
            message: result.valid ? "✅ Branch name is valid" : "❌ Branch name has violations"
          }, null, 2)
        }]
      };
    }

    case "validate_pre_commit": {
      const { message, repoPath } = args;
      const result = await validator.validatePreCommit(message, repoPath);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            valid: result.valid,
            violations: result.violations,
            warnings: result.warnings,
            message: result.valid ? "✅ Pre-commit validation passed" : "❌ Pre-commit validation failed"
          }, null, 2)
        }]
      };
    }

    case "get_repository_info": {
      const { repoPath } = args;
      const repoInfo = await validator.getRepositoryInfo(repoPath);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            repository: repoInfo,
            message: `📁 Repository: ${repoInfo.path} | Branch: ${repoInfo.currentBranch} | Loqa: ${repoInfo.isLoqaRepository ? '✅' : '❌'}`
          }, null, 2)
        }]
      };
    }

    case "validate_quality_gates": {
      const { repoPath } = args;
      const result = await validator.validateQualityGates(repoPath);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            valid: result.valid,
            violations: result.violations,
            warnings: result.warnings,
            message: result.valid ? "✅ Quality gates validation passed" : "❌ Quality gates have violations"
          }, null, 2)
        }]
      };
    }

    default:
      throw new Error(`Unknown validation tool: ${name}`);
  }
}