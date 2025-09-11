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