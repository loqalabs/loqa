/**
 * Intelligent workspace root resolution utility
 * Handles auto-detection of git repositories and workspace context
 */

export async function resolveWorkspaceRoot(args: any): Promise<string> {
  const { simpleGit } = await import('simple-git');
  const { promises: fs } = await import('fs');
  const { join, dirname } = await import('path');
  
  let currentDir = process.cwd();
  
  // Step 1: Check if we're currently inside a git repository
  try {
    const git = simpleGit(currentDir);
    const isRepo = await git.checkIsRepo();
    
    if (isRepo) {
      // We're in a git repo, check if it's one of the known Loqa repositories
      const repoRoot = await git.revparse(['--show-toplevel']);
      const repoName = repoRoot.split('/').pop();
      
      const knownRepos = ['loqa', 'loqa-hub', 'loqa-commander', 'loqa-relay', 'loqa-proto', 'loqa-skills', 'www-loqalabs-com'];
      
      if (knownRepos.includes(repoName || '')) {
        console.log(`Auto-detected repository: ${repoName}`);
        return repoRoot.trim();
      }
    }
  } catch (error) {
    // Not in a git repo or git command failed, continue with other logic
  }
  
  // Step 2: If we have an explicit repository parameter, use it
  const { repository } = args;
  if (repository) {
    // Find the workspace root by looking for the loqalabs directory structure
    let searchDir = currentDir;
    for (let i = 0; i < 10; i++) { // Limit search depth
      try {
        const potentialRepoPath = join(searchDir, repository);
        await fs.access(join(potentialRepoPath, '.git'));
        console.log(`Found specified repository: ${repository} at ${potentialRepoPath}`);
        return potentialRepoPath;
      } catch {
        // Try parent directory
        const parentDir = dirname(searchDir);
        if (parentDir === searchDir) break; // Reached filesystem root
        searchDir = parentDir;
      }
    }
  }
  
  // Step 3: Look for the loqalabs workspace root
  let searchDir = currentDir;
  for (let i = 0; i < 10; i++) {
    try {
      // Check if this directory contains multiple Loqa repositories
      const entries = await fs.readdir(searchDir);
      const loqaRepos = entries.filter(entry => 
        entry.startsWith('loqa') || entry === 'www-loqalabs-com'
      );
      
      if (loqaRepos.length >= 3) { // Likely the workspace root
        // Default to loqa repository if it exists, otherwise loqa-hub
        const defaultRepo = entries.includes('loqa') ? 'loqa' : 'loqa-hub';
        const defaultPath = join(searchDir, defaultRepo);
        
        try {
          await fs.access(join(defaultPath, '.git'));
          console.log(`Auto-detected workspace, using default repository: ${defaultRepo}`);
          return defaultPath;
        } catch {
          // Default repo doesn't exist, try loqa-hub
          const fallbackPath = join(searchDir, 'loqa-hub');
          await fs.access(join(fallbackPath, '.git'));
          console.log(`Using fallback repository: loqa-hub`);
          return fallbackPath;
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
    
    const parentDir = dirname(searchDir);
    if (parentDir === searchDir) break; // Reached filesystem root
    searchDir = parentDir;
  }
  
  // Step 4: Fallback - if we're in the MCP server, use the original logic
  if (currentDir.includes('loqa-assistant-mcp')) {
    const loqalabsRoot = currentDir.replace(/\/loqa\/project\/loqa-assistant-mcp.*$/, '');
    const targetRepo = repository || 'loqa-hub';
    const targetPath = `${loqalabsRoot}/${targetRepo}`;
    console.log(`MCP server fallback, using: ${targetRepo}`);
    return targetPath;
  }
  
  // Step 5: Final fallback - use current directory
  console.log(`Using current directory as fallback: ${currentDir}`);
  return currentDir;
}