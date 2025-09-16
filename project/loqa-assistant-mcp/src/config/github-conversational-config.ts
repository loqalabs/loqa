/**
 * GitHub Conversational Feature Configuration
 *
 * Controls whether conversational GitHub operations are enabled or disabled.
 * When disabled, the system will redirect users to reliable GitHub CLI commands.
 */

export interface GitHubConversationalConfig {
  enabled: boolean;
  disabledReason?: string;
  redirectToGitHubCLI: boolean;
  allowedOperations: string[];
  disabledOperations: string[];
}

/**
 * Default configuration - DISABLED due to multi-repo context issues
 */
export const DEFAULT_GITHUB_CONVERSATIONAL_CONFIG: GitHubConversationalConfig = {
  enabled: false,
  disabledReason: "Multi-repository workspace context detection issues. Use GitHub CLI for reliable operations.",
  redirectToGitHubCLI: true,
  allowedOperations: [
    'list_issues',
    'view_issue',
    'get_issue',
    'view_pr',
    'get_pr'
  ],
  disabledOperations: [
    'create_pr',
    'create_issue',
    'update_issue',
    'add_comment',
    'update_pr'
  ]
};

/**
 * Environment variable override
 */
function getEnvConfig(): Partial<GitHubConversationalConfig> {
  const config: Partial<GitHubConversationalConfig> = {};

  if (process.env.GITHUB_CONVERSATIONAL_ENABLED !== undefined) {
    config.enabled = process.env.GITHUB_CONVERSATIONAL_ENABLED === 'true';
  }

  if (process.env.GITHUB_CONVERSATIONAL_REASON) {
    config.disabledReason = process.env.GITHUB_CONVERSATIONAL_REASON;
  }

  return config;
}

/**
 * Get the current GitHub conversational configuration
 */
export function getGitHubConversationalConfig(): GitHubConversationalConfig {
  const envConfig = getEnvConfig();
  return {
    ...DEFAULT_GITHUB_CONVERSATIONAL_CONFIG,
    ...envConfig
  };
}

/**
 * Check if a specific GitHub operation is allowed via conversational interface
 */
export function isGitHubOperationAllowed(operation: string): boolean {
  const config = getGitHubConversationalConfig();

  if (!config.enabled) {
    return false;
  }

  if (config.disabledOperations.includes(operation)) {
    return false;
  }

  return config.allowedOperations.includes(operation);
}

/**
 * Generate a helpful redirect message for disabled operations
 */
export function generateRedirectMessage(operation: string, context?: any): string {
  const config = getGitHubConversationalConfig();

  const baseMessage = `🚫 **GitHub Conversational Operations Disabled**\n\n**Reason**: ${config.disabledReason}\n\n`;

  const gitHubCliCommands = getGitHubCLICommand(operation, context);

  return baseMessage + `**Use GitHub CLI instead:**\n\`\`\`bash\n${gitHubCliCommands}\n\`\`\`\n\n**Why GitHub CLI?**\n✅ Reliable repository detection\n✅ Proper branch context\n✅ No multi-repo confusion\n✅ Direct GitHub integration`;
}

/**
 * Generate appropriate GitHub CLI command for the operation
 */
function getGitHubCLICommand(operation: string, context?: any): string {
  switch (operation) {
    case 'create_pr':
      const prTitle = context?.title || 'Pull Request Title';
      return `gh pr create --title "${prTitle}" --body "Description of changes"`;

    case 'create_issue':
      const issueTitle = context?.title || 'Issue Title';
      return `gh issue create --title "${issueTitle}" --body "Issue description" --label "feature"`;

    case 'add_comment':
      const issueNumber = context?.issueNumber || '123';
      return `gh issue comment ${issueNumber} --body "Your comment here"`;

    case 'update_issue':
      return `gh issue edit 123 --title "New Title" --add-label "priority-high"`;

    case 'update_pr':
      return `gh pr edit 123 --title "New Title" --body "Updated description"`;

    default:
      return `gh ${operation.replace('_', ' ')} --help  # See available options`;
  }
}

/**
 * Check if we're in a multi-repository workspace (heuristic)
 */
export function isMultiRepoWorkspace(workspaceRoot?: string): boolean {
  // Simple heuristic: if we can find multiple *-repo or service directories
  try {
    const fs = require('fs');
    const path = require('path');

    const root = workspaceRoot || process.cwd();
    const entries = fs.readdirSync(root, { withFileTypes: true });

    const repoDirs = entries.filter((entry: any) =>
      entry.isDirectory() &&
      (entry.name.startsWith('loqa-') || entry.name.includes('-service') || entry.name.includes('-repo'))
    );

    return repoDirs.length > 1;
  } catch {
    return false; // Assume single repo if we can't detect
  }
}