/**
 * Context Detection Utility
 * Helps MCP tools understand their current environment and make smart decisions
 */

import { promises as fs } from 'fs';
import { join, basename, dirname } from 'path';
import { simpleGit } from 'simple-git';

export interface WorkspaceContext {
  type: 'workspace-root' | 'individual-repo' | 'unknown';
  currentRepository?: string;
  workspaceRoot?: string;
  availableRepositories: string[];
  isLoqaWorkspace: boolean;
  currentBranch?: string;
  hasUncommittedChanges?: boolean;
}

const KNOWN_LOQA_REPOS = [
  'loqa',
  'loqa-hub', 
  'loqa-commander',
  'loqa-relay',
  'loqa-proto', 
  'loqa-skills',
  'www-loqalabs-com',
  'loqalabs-github-config'
];

/**
 * Detect the current workspace context
 */
export async function detectWorkspaceContext(): Promise<WorkspaceContext> {
  const currentDir = process.cwd();
  
  try {
    // First, check if we're in a git repository
    const git = simpleGit(currentDir);
    const isRepo = await git.checkIsRepo();
    
    if (isRepo) {
      const repoRoot = await git.revparse(['--show-toplevel']);
      const repoName = basename(repoRoot);
      
      if (KNOWN_LOQA_REPOS.includes(repoName)) {
        // We're inside a Loqa repository
        const status = await git.status();
        const workspaceRoot = dirname(repoRoot);
        const availableRepos = await findAvailableRepositories(workspaceRoot);
        
        return {
          type: 'individual-repo',
          currentRepository: repoName,
          workspaceRoot,
          availableRepositories: availableRepos,
          isLoqaWorkspace: true,
          currentBranch: status.current || undefined,
          hasUncommittedChanges: !status.isClean()
        };
      }
    }
    
    // Check if we're in a workspace root directory
    const availableRepos = await findAvailableRepositories(currentDir);
    if (availableRepos.length >= 2) {
      return {
        type: 'workspace-root',
        workspaceRoot: currentDir,
        availableRepositories: availableRepos,
        isLoqaWorkspace: true
      };
    }
    
    // Search upward for workspace root
    let searchDir = currentDir;
    for (let i = 0; i < 10; i++) {
      const parentDir = dirname(searchDir);
      if (parentDir === searchDir) break; // Reached filesystem root
      
      const availableRepos = await findAvailableRepositories(parentDir);
      if (availableRepos.length >= 2) {
        return {
          type: 'workspace-root',
          workspaceRoot: parentDir,
          availableRepositories: availableRepos,
          isLoqaWorkspace: true
        };
      }
      
      searchDir = parentDir;
    }
    
    // Unknown context
    return {
      type: 'unknown',
      availableRepositories: [],
      isLoqaWorkspace: false
    };
    
  } catch (error) {
    return {
      type: 'unknown',
      availableRepositories: [],
      isLoqaWorkspace: false
    };
  }
}

/**
 * Find available Loqa repositories in a directory
 */
async function findAvailableRepositories(directory: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(directory);
    const repos: string[] = [];
    
    for (const entry of entries) {
      if (KNOWN_LOQA_REPOS.includes(entry)) {
        try {
          const stats = await fs.stat(join(directory, entry));
          if (stats.isDirectory()) {
            await fs.access(join(directory, entry, '.git'));
            repos.push(entry);
          }
        } catch {
          // Not a git repo, skip
        }
      }
    }
    
    return repos;
  } catch {
    return [];
  }
}

/**
 * Get the best repository to use for operations based on context
 */
export function getBestRepository(context: WorkspaceContext, preference?: string): string | null {
  if (preference && context.availableRepositories.includes(preference)) {
    return preference;
  }
  
  if (context.currentRepository) {
    return context.currentRepository;
  }
  
  // Priority order for default repository selection
  const priority = ['loqa-hub', 'loqa', 'loqa-commander', 'loqa-relay', 'loqa-proto', 'loqa-skills'];
  
  for (const repo of priority) {
    if (context.availableRepositories.includes(repo)) {
      return repo;
    }
  }
  
  // Return first available repository
  return context.availableRepositories[0] || null;
}

/**
 * Get repository path based on context
 */
export function getRepositoryPath(context: WorkspaceContext, repository: string): string | null {
  if (context.currentRepository === repository) {
    // We're already in the target repository
    return process.cwd();
  }
  
  if (context.workspaceRoot && context.availableRepositories.includes(repository)) {
    return join(context.workspaceRoot, repository);
  }
  
  return null;
}

/**
 * Enhanced workspace resolution using context detection
 */
export async function resolveWorkspaceRootWithContext(args: any = {}): Promise<{
  path: string;
  context: WorkspaceContext;
}> {
  const context = await detectWorkspaceContext();
  const { repository, repoPath } = args;
  
  // If explicit repoPath is provided, use it
  if (repoPath) {
    try {
      await fs.access(join(repoPath, '.git'));
      return { path: repoPath, context };
    } catch {
      console.warn(`Explicit repoPath ${repoPath} is not valid`);
    }
  }
  
  // Special handling for backlog-related operations
  // If we're in workspace root and no specific repo is requested,
  // we should find a repository that actually has a backlog
  if (context.type === 'workspace-root' && !repository) {
    const repoWithBacklog = await findRepositoryWithBacklog(context.workspaceRoot!, context.availableRepositories);
    if (repoWithBacklog) {
      const repoPath = join(context.workspaceRoot!, repoWithBacklog);
      return { path: repoPath, context };
    }
  }
  
  // Use context to determine best path
  const bestRepo = getBestRepository(context, repository);
  if (bestRepo) {
    const repoPath = getRepositoryPath(context, bestRepo);
    if (repoPath) {
      return { path: repoPath, context };
    }
  }
  
  // Fallback to current directory with warning
  console.warn('Could not resolve workspace context, using current directory');
  return { path: process.cwd(), context };
}

/**
 * Find the first repository that has a backlog directory
 */
async function findRepositoryWithBacklog(workspaceRoot: string, repositories: string[]): Promise<string | null> {
  // Priority order for repositories with backlogs
  const priority = ['loqa-hub', 'loqa', 'loqa-commander', 'loqa-relay', 'loqa-proto', 'loqa-skills'];
  
  // Check priority repositories first
  for (const repo of priority) {
    if (repositories.includes(repo)) {
      try {
        await fs.access(join(workspaceRoot, repo, 'backlog'));
        return repo;
      } catch {
        // No backlog in this repo, continue
      }
    }
  }
  
  // Check all other repositories
  for (const repo of repositories) {
    if (!priority.includes(repo)) {
      try {
        await fs.access(join(workspaceRoot, repo, 'backlog'));
        return repo;
      } catch {
        // No backlog in this repo, continue
      }
    }
  }
  
  return null;
}