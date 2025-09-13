/**
 * Legacy Issue Manager
 *
 * Provides backward compatibility wrapper around the new IssueProviderManager
 * while maintaining the existing LoqaIssueManager interface that's used throughout the codebase.
 *
 * This class maintains compatibility with GitHub Issues management while the codebase
 * transitions to the new issue provider architecture.
 */

import { basename } from "path";

// GitHub-style issue interface to match existing codebase expectations
export interface GitHubStyleIssue {
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  html_url: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
  };
  labels: Array<{
    name: string;
  }>;
  assignee?: {
    login: string;
  };
}

export interface LegacyIssueListResult {
  issues: GitHubStyleIssue[];
  totalCount: number;
  hasMore: boolean;
  drafts?: any[]; // Placeholder for compatibility with legacy code expecting drafts
}

export interface LegacyIssueCreationOptions {
  title: string;
  description?: string;
  priority?: string;
  assignee?: string;
  labels?: string[];
  template?: string;
  acceptanceCriteria?: string[];
  repository?: string;
}

export interface LegacyIssueOperationResult {
  success: boolean;
  issue?: GitHubStyleIssue;
  error?: string;
  warnings?: string[];
}

/**
 * Legacy LoqaIssueManager - Simplified implementation for backward compatibility
 *
 * This class provides the interface expected by the existing codebase.
 * For now, it returns empty results since the codebase is transitioning
 * from local Backlog.md files to GitHub Issues.
 */
export class LoqaIssueManager {
  private repoPath: string;
  private repoName: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.repoName = basename(repoPath);
  }

  /**
   * List issues - Returns empty for now as the codebase transitions to GitHub Issues
   */
  async listIssues(_filters?: any): Promise<LegacyIssueListResult> {
    // For now, return empty issues since the system is transitioning from
    // local issue files to GitHub Issues. This prevents errors while maintaining compatibility.
    return {
      issues: [],
      totalCount: 0,
      hasMore: false,
      drafts: [], // Empty drafts for compatibility
    };
  }

  /**
   * Create issue from template - Placeholder implementation
   */
  async createIssueFromTemplate(
    _options: LegacyIssueCreationOptions
  ): Promise<LegacyIssueOperationResult> {
    console.warn(
      `createIssueFromTemplate called for ${this.repoName}, but implementation is pending GitHub Issues migration`
    );
    return {
      success: false,
      error: "GitHub Issues integration not yet implemented",
      warnings: ["Using legacy LoqaIssueManager placeholder"],
    };
  }

  /**
   * Get issue by ID - Placeholder implementation
   */
  async getIssue(issueId: string): Promise<GitHubStyleIssue | null> {
    console.warn(
      `getIssue(${issueId}) called for ${this.repoName}, but implementation is pending GitHub Issues migration`
    );
    return null;
  }

  /**
   * Update issue - Placeholder implementation
   */
  async updateIssue(
    issueId: string,
    _updates: Partial<LegacyIssueCreationOptions>
  ): Promise<LegacyIssueOperationResult> {
    console.warn(
      `updateIssue(${issueId}) called for ${this.repoName}, but implementation is pending GitHub Issues migration`
    );
    return {
      success: false,
      error: "GitHub Issues integration not yet implemented",
    };
  }

  /**
   * Close issue - Placeholder implementation
   */
  async closeIssue(issueId: string): Promise<LegacyIssueOperationResult> {
    console.warn(
      `closeIssue(${issueId}) called for ${this.repoName}, but implementation is pending GitHub Issues migration`
    );
    return {
      success: false,
      error: "GitHub Issues integration not yet implemented",
    };
  }

  /**
   * Get repository name
   */
  getRepositoryName(): string {
    return this.repoName;
  }

  /**
   * Get repository path
   */
  getRepositoryPath(): string {
    return this.repoPath;
  }

  /**
   * Check if repository has GitHub Issues enabled
   */
  async hasGitHubIssuesEnabled(): Promise<boolean> {
    // For now, return false since GitHub Issues integration is not complete
    return false;
  }

  /**
   * Capture thought - Placeholder implementation for compatibility
   */
  async captureThought(_thought: any): Promise<LegacyIssueOperationResult> {
    console.warn(
      `captureThought called for ${this.repoName}, but implementation is pending GitHub Issues migration`
    );
    return {
      success: false,
      error: "GitHub Issues integration not yet implemented",
      warnings: ["Using legacy LoqaIssueManager placeholder for thought capture"],
    };
  }

  /**
   * Cleanup resources - No-op for now
   */
  destroy(): void {
    // No resources to clean up in the placeholder implementation
  }
}
