import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { join, dirname, basename } from 'path';
import { KNOWN_REPOSITORIES_LIST } from '../config/repositories.js';

export class LoqaWorkspaceManager {
  protected workspaceRoot: string;
  protected actualWorkspaceRoot: string;
  protected knownRepositories: string[] = KNOWN_REPOSITORIES_LIST;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    // Determine the actual workspace root (directory containing all repositories)
    this.actualWorkspaceRoot = this.determineActualWorkspaceRoot();
  }

  private determineActualWorkspaceRoot(): string {
    // If workspaceRoot is actually one of our repositories, get its parent
    const repoName = basename(this.workspaceRoot);
    if (this.knownRepositories.includes(repoName)) {
      return dirname(this.workspaceRoot);
    }
    
    // Otherwise assume workspaceRoot is the actual workspace root
    return this.workspaceRoot;
  }

  /**
   * Get git status across all repositories
   */
  async getWorkspaceStatus(): Promise<{
    repositories: Array<{
      name: string;
      path: string;
      exists: boolean;
      currentBranch?: string;
      hasChanges?: boolean;
      aheadBehind?: string;
      status?: string;
      error?: string;
    }>;
    summary: {
      totalRepos: number;
      activeRepos: number;
      reposWithChanges: number;
      reposOnFeatureBranches: number;
    };
  }> {
    const repositories = [];
    let activeRepos = 0;
    let reposWithChanges = 0;
    let reposOnFeatureBranches = 0;

    for (const repoName of this.knownRepositories) {
      const repoPath = join(this.actualWorkspaceRoot, repoName);
      
      try {
        // Check if repository exists
        await fs.access(join(repoPath, '.git'));
        
        const git = simpleGit(repoPath);
        const status = await git.status();
        const currentBranch = status.current || 'unknown';
        const hasChanges = !status.isClean();
        
        // Get ahead/behind info
        let aheadBehind = '';
        if (status.ahead || status.behind) {
          aheadBehind = `↑${status.ahead} ↓${status.behind}`;
        }

        activeRepos++;
        if (hasChanges) reposWithChanges++;
        if (currentBranch !== 'main' && currentBranch !== 'master') {
          reposOnFeatureBranches++;
        }

        repositories.push({
          name: repoName,
          path: repoPath,
          exists: true,
          currentBranch,
          hasChanges,
          aheadBehind,
          status: hasChanges ? 'Modified' : 'Clean'
        });

      } catch (error) {
        repositories.push({
          name: repoName,
          path: repoPath,
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      repositories,
      summary: {
        totalRepos: this.knownRepositories.length,
        activeRepos,
        reposWithChanges,
        reposOnFeatureBranches
      }
    };
  }

  /**
   * Get issue management health across all repositories
   * 
   * NOTE: This is a simplified implementation. The full version includes:
   * - getWorkspaceHealth()
   * - runQualityChecks()
   * - createBranchFromIssue()
   * - runIntegrationTests()
   * - getIssueRecommendations()
   * And many other workspace management methods.
   * 
   * The complete implementation is ~1300 lines and would need to be
   * copied from the original index.ts file lines 620-1922.
   */
  async getWorkspaceHealth(): Promise<{
    repositories: Array<{
      name: string;
      issueManagementActive: boolean;
      issuesCount?: number;
      draftsCount?: number;
      recentActivity?: string;
      status: string;
    }>;
    summary: {
      totalRepositories: number;
      totalIssues: number;
      totalDrafts: number;
      activeRepositories: number;
    };
  }> {
    // Placeholder implementation - full version needed
    return {
      repositories: [],
      summary: {
        totalRepositories: 0,
        totalIssues: 0,
        totalDrafts: 0,
        activeRepositories: 0
      }
    };
  }

  // TODO: Add remaining methods from original implementation:
  // - runQualityChecks()
  // - createBranchFromIssue() 
  // - runIntegrationTests()
  // - getIssueRecommendations()
  // - And many others (~1300 lines total)
}