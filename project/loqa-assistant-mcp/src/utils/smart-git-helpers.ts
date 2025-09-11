#!/usr/bin/env node

import { detectGitRepo, executeGitCommand } from './git-repo-detector.js';

/**
 * Smart git workflow helpers that work from any subdirectory
 */
export class SmartGitHelpers {
  
  /**
   * Create a feature branch from any subdirectory within the repo
   */
  static async createFeatureBranch(branchName: string, startPath?: string): Promise<{
    success: boolean;
    repoRoot?: string;
    branchName?: string;
    error?: string;
  }> {
    const repoInfo = await detectGitRepo(startPath);
    
    if (!repoInfo.isGitRepo) {
      return {
        success: false,
        error: 'Not in a git repository'
      };
    }

    // Ensure we're on main and up to date
    const fetchResult = await executeGitCommand(['fetch', 'origin', 'main'], startPath);
    if (!fetchResult.success) {
      return {
        success: false,
        repoRoot: repoInfo.repoRoot,
        error: `Failed to fetch: ${fetchResult.stderr}`
      };
    }

    const checkoutMain = await executeGitCommand(['checkout', 'main'], startPath);
    if (!checkoutMain.success) {
      return {
        success: false,
        repoRoot: repoInfo.repoRoot,
        error: `Failed to checkout main: ${checkoutMain.stderr}`
      };
    }

    const pullResult = await executeGitCommand(['pull', 'origin', 'main'], startPath);
    if (!pullResult.success) {
      return {
        success: false,
        repoRoot: repoInfo.repoRoot,
        error: `Failed to pull: ${pullResult.stderr}`
      };
    }

    // Create and checkout new branch
    const branchResult = await executeGitCommand(['checkout', '-b', branchName], startPath);
    if (!branchResult.success) {
      return {
        success: false,
        repoRoot: repoInfo.repoRoot,
        error: `Failed to create branch: ${branchResult.stderr}`
      };
    }

    return {
      success: true,
      repoRoot: repoInfo.repoRoot,
      branchName
    };
  }

  /**
   * Smart git status that shows repository context
   */
  static async getSmartStatus(startPath?: string): Promise<{
    success: boolean;
    repoRoot?: string;
    relativePath?: string;
    currentBranch?: string;
    hasChanges?: boolean;
    status?: string;
    error?: string;
  }> {
    const repoInfo = await detectGitRepo(startPath);
    
    if (!repoInfo.isGitRepo) {
      return {
        success: false,
        error: 'Not in a git repository'
      };
    }

    const statusResult = await executeGitCommand(['status', '--porcelain'], startPath);
    const branchResult = await executeGitCommand(['branch', '--show-current'], startPath);
    
    if (!statusResult.success) {
      return {
        success: false,
        repoRoot: repoInfo.repoRoot,
        error: `Failed to get status: ${statusResult.stderr}`
      };
    }

    return {
      success: true,
      repoRoot: repoInfo.repoRoot,
      relativePath: repoInfo.relativePath,
      currentBranch: branchResult.stdout || 'unknown',
      hasChanges: statusResult.stdout !== '',
      status: statusResult.stdout
    };
  }

  /**
   * Smart commit that works from any subdirectory
   */
  static async smartCommit(
    message: string, 
    files?: string[], 
    startPath?: string
  ): Promise<{
    success: boolean;
    repoRoot?: string;
    commitHash?: string;
    error?: string;
  }> {
    const repoInfo = await detectGitRepo(startPath);
    
    if (!repoInfo.isGitRepo) {
      return {
        success: false,
        error: 'Not in a git repository'
      };
    }

    // Add files if specified
    if (files && files.length > 0) {
      const addResult = await executeGitCommand(['add', ...files], startPath);
      if (!addResult.success) {
        return {
          success: false,
          repoRoot: repoInfo.repoRoot,
          error: `Failed to add files: ${addResult.stderr}`
        };
      }
    }

    // Commit
    const commitResult = await executeGitCommand(['commit', '-m', message], startPath);
    if (!commitResult.success) {
      return {
        success: false,
        repoRoot: repoInfo.repoRoot,
        error: `Failed to commit: ${commitResult.stderr}`
      };
    }

    // Get commit hash
    const hashResult = await executeGitCommand(['rev-parse', 'HEAD'], startPath);
    
    return {
      success: true,
      repoRoot: repoInfo.repoRoot,
      commitHash: hashResult.stdout
    };
  }

  /**
   * Check if we're in a specific repository by name
   */
  static async isInRepository(repoName: string, startPath?: string): Promise<boolean> {
    const repoInfo = await detectGitRepo(startPath);
    
    if (!repoInfo.isGitRepo || !repoInfo.repoRoot) {
      return false;
    }

    const repoBasename = repoInfo.repoRoot.split('/').pop();
    return repoBasename === repoName;
  }

  /**
   * Get repository name from path
   */
  static async getRepositoryName(startPath?: string): Promise<string | null> {
    const repoInfo = await detectGitRepo(startPath);
    
    if (!repoInfo.isGitRepo || !repoInfo.repoRoot) {
      return null;
    }

    return repoInfo.repoRoot.split('/').pop() || null;
  }

  /**
   * Smart branch cleanup - only deletes branches that are safe to delete
   */
  static async smartBranchCleanup(startPath?: string): Promise<{
    success: boolean;
    repoRoot?: string;
    deleted: string[];
    kept: Array<{branch: string; reason: string}>;
    error?: string;
  }> {
    const repoInfo = await detectGitRepo(startPath);
    
    if (!repoInfo.isGitRepo) {
      return {
        success: false,
        error: 'Not in a git repository',
        deleted: [],
        kept: []
      };
    }

    try {
      // Get list of local branches (excluding current branch)
      const branchResult = await executeGitCommand(['branch', '--format=%(refname:short)'], startPath);
      if (!branchResult.success) {
        return {
          success: false,
          repoRoot: repoInfo.repoRoot,
          error: `Failed to get branches: ${branchResult.stderr}`,
          deleted: [],
          kept: []
        };
      }

      const currentBranchResult = await executeGitCommand(['branch', '--show-current'], startPath);
      const currentBranch = currentBranchResult.stdout || 'main';
      
      const allBranches = (branchResult.stdout || '').split('\n').filter(b => b.trim());
      const localBranches = allBranches.filter(branch => 
        branch.trim() && 
        branch !== currentBranch && 
        branch !== 'main' && 
        branch !== 'master'
      );

      const deleted: string[] = [];
      const kept: Array<{branch: string; reason: string}> = [];

      for (const branch of localBranches) {
        const cleanupResult = await this.shouldDeleteBranch(branch, startPath);
        
        if (cleanupResult.shouldDelete) {
          // Safe to delete
          const deleteResult = await executeGitCommand(['branch', '-D', branch], startPath);
          if (deleteResult.success) {
            deleted.push(branch);
          } else {
            kept.push({branch, reason: `Delete failed: ${deleteResult.stderr}`});
          }
        } else {
          kept.push({branch, reason: cleanupResult.reason});
        }
      }

      return {
        success: true,
        repoRoot: repoInfo.repoRoot,
        deleted,
        kept
      };
    } catch (error) {
      return {
        success: false,
        repoRoot: repoInfo.repoRoot,
        error: error instanceof Error ? error.message : 'Unknown error',
        deleted: [],
        kept: []
      };
    }
  }

  /**
   * Determine if a branch is safe to delete
   */
  private static async shouldDeleteBranch(branch: string, startPath?: string): Promise<{
    shouldDelete: boolean;
    reason: string;
  }> {
    // Check if branch has uncommitted changes by switching to it temporarily
    const statusResult = await executeGitCommand(['status', '--porcelain'], startPath);
    if (!statusResult.success) {
      return {shouldDelete: false, reason: 'Could not check status'};
    }

    // Check if remote tracking branch exists
    const remoteResult = await executeGitCommand(['ls-remote', '--exit-code', '--heads', 'origin', branch], startPath);
    const hasRemote = remoteResult.success;

    if (hasRemote) {
      // Remote still exists, don't delete
      return {shouldDelete: false, reason: 'remote branch still exists (not merged yet)'};
    }

    // Check if branch ever had a remote (look for tracking info)
    const trackingResult = await executeGitCommand(['config', `branch.${branch}.remote`], startPath);
    const hadRemote = trackingResult.success;

    if (!hadRemote) {
      // Never pushed to remote, keep it (local work)
      return {shouldDelete: false, reason: 'never pushed to remote (local work)'};
    }

    // Check for unpushed commits (compare with main since remote is gone)
    const unpushedResult = await executeGitCommand(['rev-list', `origin/main..${branch}`, '--count'], startPath);
    if (!unpushedResult.success) {
      return {shouldDelete: false, reason: 'could not check for unpushed commits'};
    }

    const unpushedCount = parseInt((unpushedResult.stdout || '').trim()) || 0;
    if (unpushedCount > 0) {
      return {shouldDelete: false, reason: `has ${unpushedCount} unpushed commits`};
    }

    // Check if the branch can be safely deleted (is it merged?)
    const mergedResult = await executeGitCommand(['branch', '--merged', 'origin/main'], startPath);
    if (mergedResult.success && (mergedResult.stdout || '').includes(branch)) {
      return {shouldDelete: true, reason: 'merged and no local changes'};
    }

    // Additional safety: check if commits exist between main and this branch
    const divergedResult = await executeGitCommand(['merge-base', '--is-ancestor', branch, 'origin/main'], startPath);
    if (divergedResult.success) {
      return {shouldDelete: true, reason: 'merged and no local changes'};
    }

    return {shouldDelete: false, reason: 'contains unmerged changes'};
  }

  /**
   * Check if main branch is behind origin/main
   */
  static async checkMainStatus(startPath?: string): Promise<{
    success: boolean;
    repoRoot?: string;
    isBehind: boolean;
    commitsBeind: number;
    error?: string;
  }> {
    const repoInfo = await detectGitRepo(startPath);
    
    if (!repoInfo.isGitRepo) {
      return {
        success: false,
        error: 'Not in a git repository',
        isBehind: false,
        commitsBeind: 0
      };
    }

    // Fetch latest info without changing working tree
    const fetchResult = await executeGitCommand(['fetch', 'origin', 'main'], startPath);
    if (!fetchResult.success) {
      return {
        success: false,
        repoRoot: repoInfo.repoRoot,
        error: `Failed to fetch: ${fetchResult.stderr}`,
        isBehind: false,
        commitsBeind: 0
      };
    }

    // Check how many commits behind
    const behindResult = await executeGitCommand(['rev-list', '--count', 'main..origin/main'], startPath);
    if (!behindResult.success) {
      return {
        success: false,
        repoRoot: repoInfo.repoRoot,
        error: `Failed to check status: ${behindResult.stderr}`,
        isBehind: false,
        commitsBeind: 0
      };
    }

    const commitsBeind = parseInt((behindResult.stdout || '').trim()) || 0;
    
    return {
      success: true,
      repoRoot: repoInfo.repoRoot,
      isBehind: commitsBeind > 0,
      commitsBeind
    };
  }

  /**
   * Smart sync - pull main and cleanup merged branches
   */
  static async smartSync(startPath?: string): Promise<{
    success: boolean;
    repoRoot?: string;
    pulledCommits: number;
    cleanupResult?: {
      deleted: string[];
      kept: Array<{branch: string; reason: string}>;
    };
    error?: string;
  }> {
    const repoInfo = await detectGitRepo(startPath);
    
    if (!repoInfo.isGitRepo) {
      return {
        success: false,
        error: 'Not in a git repository',
        pulledCommits: 0
      };
    }

    // Make sure we're on main
    const currentBranchResult = await executeGitCommand(['branch', '--show-current'], startPath);
    const currentBranch = currentBranchResult.stdout || '';
    
    if (currentBranch !== 'main') {
      const checkoutResult = await executeGitCommand(['checkout', 'main'], startPath);
      if (!checkoutResult.success) {
        return {
          success: false,
          repoRoot: repoInfo.repoRoot,
          error: `Failed to checkout main: ${checkoutResult.stderr}`,
          pulledCommits: 0
        };
      }
    }

    // Check how many commits we're behind before pulling
    const beforeResult = await executeGitCommand(['rev-list', '--count', 'main..origin/main'], startPath);
    const commitsBefore = parseInt(beforeResult.stdout || '0') || 0;

    // Pull updates
    const pullResult = await executeGitCommand(['pull', 'origin', 'main'], startPath);
    if (!pullResult.success) {
      return {
        success: false,
        repoRoot: repoInfo.repoRoot,
        error: `Failed to pull: ${pullResult.stderr}`,
        pulledCommits: 0
      };
    }

    // Run branch cleanup
    const cleanupResult = await this.smartBranchCleanup(startPath);
    
    return {
      success: true,
      repoRoot: repoInfo.repoRoot,
      pulledCommits: commitsBefore,
      cleanupResult: cleanupResult.success ? {
        deleted: cleanupResult.deleted,
        kept: cleanupResult.kept
      } : undefined
    };
  }
}

// CLI usage for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  async function main() {
    console.log('Testing smart git helpers...\n');
    
    const status = await SmartGitHelpers.getSmartStatus();
    console.log('Smart status:', status);
    
    const repoName = await SmartGitHelpers.getRepositoryName();
    console.log('Repository name:', repoName);
    
    const isLoqa = await SmartGitHelpers.isInRepository('loqa');
    console.log('Is in loqa repo:', isLoqa);
  }
  
  main().catch(console.error);
}