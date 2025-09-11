/**
 * Intelligent workspace root resolution utility
 * Handles auto-detection of git repositories and workspace context
 */

import { resolveWorkspaceRootWithContext } from './context-detector.js';

export async function resolveWorkspaceRoot(args: any = {}): Promise<string> {
  // Use the new context-aware resolver
  const result = await resolveWorkspaceRootWithContext(args);
  return result.path;
}

// Legacy implementation kept for reference but deprecated
export async function resolveWorkspaceRootLegacy(args: any = {}): Promise<string> {
  const { simpleGit } = await import('simple-git');
  const { promises: fs } = await import('fs');
  const { join, dirname, basename } = await import('path');
  
  let currentDir = process.cwd();
  const { repository, repoPath } = args;
  
  // Step 1: If explicit repoPath is provided, use it directly
  if (repoPath) {
    try {
      await fs.access(join(repoPath, '.git'));
      console.log(`Using explicit repository path: ${repoPath}`);
      return repoPath;
    } catch {
      console.warn(`Explicit repoPath ${repoPath} is not a valid git repository`);
    }
  }
  
  // Step 2: Check if we're currently inside a Loqa git repository
  try {
    const git = simpleGit(currentDir);
    const isRepo = await git.checkIsRepo();
    
    if (isRepo) {
      const repoRoot = await git.revparse(['--show-toplevel']);
      const repoName = basename(repoRoot);
      
      const knownRepos = ['loqa', 'loqa-hub', 'loqa-commander', 'loqa-relay', 'loqa-proto', 'loqa-skills', 'www-loqalabs-com', 'loqalabs-github-config'];
      
      if (knownRepos.includes(repoName)) {
        console.log(`Currently in Loqa repository: ${repoName}`);
        return repoRoot.trim();
      }
    }
  } catch (error) {
    // Not in a git repo or git command failed, continue
  }
  
  // Step 3: Look for workspace root that contains multiple Loqa repositories
  let searchDir = currentDir;
  let workspaceRoot: string | null = null;
  
  for (let i = 0; i < 10; i++) {
    try {
      const entries = await fs.readdir(searchDir);
      const loqaRepos = [];
      
      // Check which Loqa repositories exist in this directory
      for (const entry of entries) {
        if (entry.startsWith('loqa') || entry === 'www-loqalabs-com') {
          try {
            const stats = await fs.stat(join(searchDir, entry));
            if (stats.isDirectory()) {
              // Check if it's a git repository
              await fs.access(join(searchDir, entry, '.git'));
              loqaRepos.push(entry);
            }
          } catch {
            // Not a git repo or not accessible, skip
          }
        }
      }
      
      if (loqaRepos.length >= 2) { // Found workspace root with multiple repos
        workspaceRoot = searchDir;
        console.log(`Found workspace root with repositories: ${loqaRepos.join(', ')}`);
        break;
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
    
    const parentDir = dirname(searchDir);
    if (parentDir === searchDir) break; // Reached filesystem root
    searchDir = parentDir;
  }
  
  // Step 4: If we have a specific repository request and found workspace
  if (workspaceRoot && repository) {
    const targetPath = join(workspaceRoot, repository);
    try {
      await fs.access(join(targetPath, '.git'));
      console.log(`Using specified repository: ${repository} at ${targetPath}`);
      return targetPath;
    } catch {
      console.warn(`Specified repository ${repository} not found in workspace`);
    }
  }
  
  // Step 5: If we found workspace, select best default repository
  if (workspaceRoot) {
    const entries = await fs.readdir(workspaceRoot);
    
    // Priority order for default repository selection
    const repoPreference = ['loqa-hub', 'loqa', 'loqa-commander', 'loqa-relay', 'loqa-proto', 'loqa-skills'];
    
    for (const prefRepo of repoPreference) {
      if (entries.includes(prefRepo)) {
        const prefPath = join(workspaceRoot, prefRepo);
        try {
          await fs.access(join(prefPath, '.git'));
          console.log(`Using preferred repository: ${prefRepo}`);
          return prefPath;
        } catch {
          continue;
        }
      }
    }
    
    // Fallback: use any Loqa repository found
    for (const entry of entries) {
      if (entry.startsWith('loqa') || entry === 'www-loqalabs-com') {
        try {
          const entryPath = join(workspaceRoot, entry);
          await fs.access(join(entryPath, '.git'));
          console.log(`Using fallback repository: ${entry}`);
          return entryPath;
        } catch {
          continue;
        }
      }
    }
  }
  
  // Step 6: Special handling if we're in the MCP server directory
  if (currentDir.includes('loqa-assistant-mcp')) {
    // Try to navigate back to workspace
    const parts = currentDir.split('/');
    const loqalabsIndex = parts.findIndex(part => part === 'loqalabs');
    
    if (loqalabsIndex !== -1) {
      const potentialWorkspace = parts.slice(0, loqalabsIndex + 1).join('/');
      try {
        const entries = await fs.readdir(potentialWorkspace);
        const targetRepo = repository || 'loqa-hub';
        
        if (entries.includes(targetRepo)) {
          const targetPath = join(potentialWorkspace, targetRepo);
          await fs.access(join(targetPath, '.git'));
          console.log(`MCP server detected, using: ${targetRepo}`);
          return targetPath;
        }
      } catch {
        // Failed, continue to final fallback
      }
    }
  }
  
  // Step 7: Final fallback - return current directory but warn
  console.warn(`Could not detect Loqa workspace. Using current directory: ${currentDir}`);
  console.warn('This may cause issues with repository-specific operations.');
  return currentDir;
}