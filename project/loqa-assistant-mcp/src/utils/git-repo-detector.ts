#!/usr/bin/env node

import { promises as fs } from 'fs';
import { dirname, join } from 'path';

export interface GitRepoInfo {
  isGitRepo: boolean;
  repoRoot?: string;
  relativePath?: string;
  currentPath: string;
}

/**
 * Check if a directory looks like a workspace root (contains multiple repos)
 * 
 * This prevents the git detection from walking beyond reasonable project boundaries.
 * Workspace roots are identified by:
 * - Multiple Loqa repositories (loqa, loqa-hub, loqa-commander, etc.)
 * - Standard workspace configuration files (.workspace, workspace.json, etc.)
 * 
 * @param path Directory path to check
 * @returns true if this appears to be a workspace root boundary
 */
async function isWorkspaceRoot(path: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(path, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
    
    // Look for common Loqa repository patterns
    const loqaRepos = ['loqa', 'loqa-hub', 'loqa-commander', 'loqa-relay', 'loqa-proto', 'loqa-skills'];
    const foundLoqaRepos = directories.filter(dir => loqaRepos.includes(dir));
    
    // If we find multiple Loqa repos, this is likely the workspace root
    if (foundLoqaRepos.length >= 2) {
      return true;
    }
    
    // Also check for other workspace indicators
    const workspaceIndicators = ['.workspace', 'workspace.json', 'lerna.json', 'rush.json'];
    for (const indicator of workspaceIndicators) {
      try {
        await fs.access(join(path, indicator));
        return true;
      } catch {
        continue;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Smart git repository detection that walks up the directory tree
 * to find the nearest .git directory, with workspace boundary awareness
 * 
 * Features:
 * - Walks up from startPath looking for .git directories
 * - Stops at workspace boundaries (multiple repos, workspace config files)
 * - Returns repository root and relative path information
 * - Prevents searching beyond intended project scope
 * 
 * @param startPath Starting directory (defaults to process.cwd())
 * @returns GitRepoInfo with repository detection results
 */
export async function detectGitRepo(startPath: string = process.cwd()): Promise<GitRepoInfo> {
  let currentPath = startPath;
  const originalPath = startPath;
  
  // Walk up the directory tree looking for .git
  while (currentPath !== dirname(currentPath)) { // Stop at filesystem root
    try {
      const gitPath = join(currentPath, '.git');
      await fs.access(gitPath);
      
      // Found .git directory
      const relativePath = originalPath === currentPath ? '.' : 
        originalPath.replace(currentPath + '/', '');
      
      return {
        isGitRepo: true,
        repoRoot: currentPath,
        relativePath,
        currentPath: originalPath
      };
    } catch {
      // .git not found at this level
      
      // Check if current directory is a workspace root before going up
      if (await isWorkspaceRoot(currentPath)) {
        // Stop here - we've reached a workspace boundary
        return {
          isGitRepo: false,
          currentPath: originalPath
        };
      }
      
      // Go up one directory
      currentPath = dirname(currentPath);
    }
  }
  
  // No .git directory found
  return {
    isGitRepo: false,
    currentPath: originalPath
  };
}

/**
 * Get git status from the correct repository root, regardless of current directory
 */
export async function getGitStatus(startPath: string = process.cwd()): Promise<{
  success: boolean;
  repoRoot?: string;
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
  
  try {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const git = spawn('git', ['status', '--porcelain', '--branch'], {
        cwd: repoInfo.repoRoot,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      git.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      git.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      git.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            repoRoot: repoInfo.repoRoot,
            status: stdout.trim()
          });
        } else {
          resolve({
            success: false,
            repoRoot: repoInfo.repoRoot,
            error: stderr.trim()
          });
        }
      });
      
      git.on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        });
      });
    });
  } catch (error) {
    return {
      success: false,
      repoRoot: repoInfo.repoRoot,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Execute git commands from the correct repository root
 */
export async function executeGitCommand(
  args: string[], 
  startPath: string = process.cwd()
): Promise<{
  success: boolean;
  repoRoot?: string;
  stdout?: string;
  stderr?: string;
}> {
  const repoInfo = await detectGitRepo(startPath);
  
  if (!repoInfo.isGitRepo) {
    return {
      success: false,
      stderr: 'Not in a git repository'
    };
  }
  
  try {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const git = spawn('git', args, {
        cwd: repoInfo.repoRoot,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      git.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      git.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      git.on('close', (code) => {
        resolve({
          success: code === 0,
          repoRoot: repoInfo.repoRoot,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });
      
      git.on('error', (error) => {
        resolve({
          success: false,
          stderr: error.message
        });
      });
    });
  } catch (error) {
    return {
      success: false,
      repoRoot: repoInfo.repoRoot,
      stderr: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// CLI usage for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  async function main() {
    const testPath = process.argv[2] || process.cwd();
    console.log(`Testing git repo detection from: ${testPath}`);
    
    const repoInfo = await detectGitRepo(testPath);
    console.log('Repository info:', repoInfo);
    
    if (repoInfo.isGitRepo) {
      const status = await getGitStatus(testPath);
      console.log('Git status:', status);
      
      const branch = await executeGitCommand(['branch', '--show-current'], testPath);
      console.log('Current branch:', branch);
    }
  }
  
  main().catch(console.error);
}