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
import { ThoughtStorage } from "../storage/thought-storage.js";
import { CapturedThought } from "../types/index.js";

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
  private thoughtStorage: ThoughtStorage;

  constructor(workspaceRoot: string) {
    this.repoPath = workspaceRoot;
    this.repoName = basename(workspaceRoot);

    // Initialize persistent thought storage using the workspace root directly
    this.thoughtStorage = new ThoughtStorage({
      workspaceRoot: workspaceRoot,
      storageDir: '.loqa-assistant/thoughts'
    });
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
   * Capture thought - Now uses persistent file-based storage
   */
  async captureThought(thought: CapturedThought): Promise<LegacyIssueOperationResult> {
    try {
      const storedThought = await this.thoughtStorage.storeThought(thought);

      return {
        success: true,
        warnings: [`Thought "${storedThought.id}" stored persistently in ${this.repoName}/.loqa-assistant/thoughts/`],
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to store thought: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get stored thoughts - New functionality for accessing persistent thoughts
   */
  async getStoredThoughts(options?: {
    tags?: string[];
    content?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      const criteria = {
        tags: options?.tags,
        content: options?.content,
        limit: options?.limit || 50,
      };
      return await this.thoughtStorage.findThoughts(criteria);
    } catch (error) {
      console.warn(`Failed to retrieve thoughts for ${this.repoName}:`, error);
      return [];
    }
  }

  /**
   * Get thought storage statistics
   */
  async getThoughtStats(): Promise<any> {
    try {
      return await this.thoughtStorage.getStats();
    } catch (error) {
      console.warn(`Failed to get thought stats for ${this.repoName}:`, error);
      return {
        totalThoughts: 0,
        recentThoughts: 0,
        topTags: [],
        storageSize: '0 KB',
        lastUpdated: 'Never',
      };
    }
  }

  /**
   * Find similar thoughts for potential merging
   */
  async findSimilarThoughts(thought: CapturedThought): Promise<any[]> {
    try {
      return await this.thoughtStorage.findSimilarThoughts(thought);
    } catch (error) {
      console.warn(`Failed to find similar thoughts for ${this.repoName}:`, error);
      return [];
    }
  }

  /**
   * Update an existing thought with additional content
   */
  async updateThought(thoughtId: string, additionalContent: string, newTags: string[] = []): Promise<LegacyIssueOperationResult> {
    try {
      const updatedThought = await this.thoughtStorage.updateThought(thoughtId, additionalContent, newTags);
      return {
        success: true,
        warnings: [`Thought "${updatedThought.id}" updated successfully`],
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update thought: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Delete a thought by ID
   */
  async deleteThought(thoughtId: string): Promise<LegacyIssueOperationResult> {
    try {
      const deleted = await this.thoughtStorage.deleteThought(thoughtId);
      if (deleted) {
        return {
          success: true,
          warnings: [`Thought "${thoughtId}" deleted successfully`],
        };
      } else {
        return {
          success: false,
          error: `Thought with ID "${thoughtId}" not found`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete thought: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get aging thoughts that need attention
   */
  async getAgingThoughts(daysOld: number = 7): Promise<any> {
    try {
      return await this.thoughtStorage.getAgingThoughts(daysOld);
    } catch (error) {
      console.warn(`Failed to get aging thoughts for ${this.repoName}:`, error);
      return {
        aging: [],
        stale: [],
        stats: { totalThoughts: 0, agingCount: 0, staleCount: 0, averageAge: 0 },
      };
    }
  }

  /**
   * Cleanup resources - No-op for now
   */
  destroy(): void {
    // No resources to clean up in the placeholder implementation
  }
}
