import { simpleGit, SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { join, isAbsolute } from 'path';
import { glob } from 'glob';
import { spawn, execSync } from 'child_process';
import { TaskTemplate, TaskCreationOptions, CapturedThought } from '../types/index.js';
import { executeGitCommand } from '../utils/git-repo-detector.js';
import { resolveWorkspaceRootWithContext } from '../utils/context-detector.js';
import { getDefaultRepository } from '../config/repositories.js';

export class LoqaTaskManager {
  private workspaceRoot: string;
  private git: SimpleGit;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.git = simpleGit(this.workspaceRoot);
  }

  /**
   * Get available task templates
   */
  async getAvailableTemplates(repoPath?: string): Promise<TaskTemplate[]> {
    const path = repoPath || this.workspaceRoot;
    const templatesPath = join(path, 'backlog', 'templates');
    
    try {
      await fs.access(templatesPath);
      const templateFiles = await glob('*.md', { cwd: templatesPath });
      
      const templates: TaskTemplate[] = [];
      
      for (const file of templateFiles) {
        if (file === 'README.md') continue;
        
        const templatePath = join(templatesPath, file);
        const content = await fs.readFile(templatePath, 'utf-8');
        const name = file.replace('-template.md', '').replace(/[-_]/g, ' ');
        
        // Extract description from the template content
        const lines = content.split('\n');
        const descriptionLine = lines.find(line => line.toLowerCase().includes('use for:') || line.toLowerCase().includes('description:'));
        const description = descriptionLine ? descriptionLine.replace(/^.*?:/, '').trim() : `Template for ${name}`;
        
        templates.push({
          name,
          description,
          content
        });
      }
      
      return templates;
    } catch (error) {
      return [];
    }
  }

  /**
   * Create a new task using the official backlog CLI (CLI-FIRST APPROACH)
   */
  async createTaskFromTemplate(options: TaskCreationOptions, repoPath?: string): Promise<{ taskId: string; filePath: string; content: string }> {
    // Determine the correct repository path using existing utilities
    const path = await this.resolveRepositoryPath(repoPath);
    
    // Ensure we're in a valid backlog repository
    const backlogPath = join(path, 'backlog');
    try {
      await fs.access(backlogPath);
    } catch {
      const repoName = path.split('/').pop() || path;
      throw new Error(`Backlog not found in ${repoName} (${path}). Expected backlog directory at: ${backlogPath}. Run 'backlog init' in the repository or check if you're in the correct directory.`);
    }

    // Build backlog CLI command arguments with proper quoting for the title
    const cliArgs = ['task', 'create', `"${options.title}"`];

    // Execute backlog CLI command from the REPOSITORY ROOT (not workspace root)
    try {
      const result = await this.executeBacklogCliCommand(cliArgs, path);
      
      if (!result.success) {
        throw new Error(`Backlog CLI failed: ${result.stderr}`);
      }
      
      // Parse CLI output to extract task information
      const taskInfo = this.parseBacklogCliOutput(result.stdout, path);
      
      return {
        taskId: taskInfo.taskId,
        filePath: taskInfo.filePath,
        content: taskInfo.content || result.stdout
      };
      
    } catch (error) {
      // Never fall back to manual creation - always use backlog CLI
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `❌ Backlog CLI execution failed: ${errorMessage}\n\n` +
        `🔧 **Fix Required**:\n` +
        `1. Ensure backlog CLI is installed: \`npm install -g backlog.md\`\n` +
        `2. Verify you're in a repository with initialized backlog: \`backlog init\`\n` +
        `3. Check repository path: ${path}\n\n` +
        `💡 **Note**: MCP system requires working backlog CLI - no manual fallback provided.`
      );
    }
  }

  /**
   * Resolve the correct repository path using existing workspace detection utilities
   */
  private async resolveRepositoryPath(repoPath?: string): Promise<string> {
    if (repoPath) {
      return repoPath;
    }
    
    try {
      // Use existing workspace resolution with context awareness
      const contextResult = await resolveWorkspaceRootWithContext();
      
      if (contextResult.context.type === 'individual-repo') {
        // We're already in a repository
        return contextResult.path;
      } else if (contextResult.context.type === 'workspace-root') {
        // We're in workspace root, pick a default repository for task management
        // Default to 'loqa' repository for general tasks
        const defaultRepo = getDefaultRepository('configuration'); // 'loqa' for general config/docs
        return join(contextResult.path, defaultRepo);
      } else {
        // Unknown context, fallback to workspace root or current path
        return contextResult.path;
      }
    } catch (error) {
      // Fallback to the original workspaceRoot if context detection fails
      console.warn(`Repository path resolution failed: ${error}, using workspaceRoot`);
      return this.workspaceRoot;
    }
  }


  /**
   * Execute backlog CLI command
   */
  private async executeBacklogCliCommand(args: string[], workingDir: string): Promise<{ success: boolean; stdout: string; stderr: string }> {
    try {
      const fullCommand = `backlog ${args.join(' ')}`;
      
      const result = execSync(fullCommand, {
        cwd: workingDir,
        encoding: 'utf-8'
      });
      
      return {
        success: true,
        stdout: result.toString().trim(),
        stderr: ''
      };
    } catch (error: any) {
      return {
        success: false,
        stdout: '',
        stderr: error.message || error.toString()
      };
    }
  }

  /**
   * Parse backlog CLI output to extract task information
   */
  private parseBacklogCliOutput(output: string, repositoryPath: string): { taskId: string; filePath: string; content?: string } {
    // Look for task ID pattern in output (e.g., "Created task-042")
    const taskIdMatch = output.match(/(?:Created|Task)\s+task-(\d+)/i);
    const taskId = taskIdMatch ? taskIdMatch[1] : '000';
    
    // Look for file path in output
    const filePathMatch = output.match(/File:\s*(.+\.md)/i);
    let filePath = '';
    
    if (filePathMatch) {
      filePath = filePathMatch[1];
      // Make absolute if relative
      if (!isAbsolute(filePath)) {
        filePath = join(repositoryPath, filePath);
      }
    } else {
      // Construct expected file path using the repository path
      const tasksDir = join(repositoryPath, 'backlog', 'tasks');
      const taskFiles = glob.sync(`task-${taskId}-*.md`, { cwd: tasksDir });
      if (taskFiles.length > 0) {
        filePath = join(tasksDir, taskFiles[0]);
      }
    }
    
    return { taskId, filePath };
  }


  /**
   * Capture a quick thought or idea
   */
  async captureThought(thought: CapturedThought, repoPath?: string): Promise<{ filePath: string; content: string }> {
    const path = repoPath || this.workspaceRoot;
    const backlogPath = join(path, 'backlog');
    const draftsPath = join(backlogPath, 'drafts');
    
    // Ensure backlog structure exists
    try {
      await fs.access(backlogPath);
    } catch {
      // Provide more specific error information
      const repoName = path.split('/').pop() || path;
      throw new Error(`Backlog not found in ${repoName} (${path}). Expected backlog directory at: ${backlogPath}. Run 'backlog init' in the repository or check if you're in the correct directory.`);
    }

    // Create thought content
    const timestamp = thought.timestamp.toISOString();
    const fileName = `thought-${timestamp.split('T')[0]}-${Date.now()}.md`;
    
    let content = `# Quick Thought - ${timestamp}\n\n`;
    content += `## Content\n${thought.content}\n\n`;
    
    if (thought.tags.length > 0) {
      content += `## Tags\n${thought.tags.map(tag => `- ${tag}`).join('\n')}\n\n`;
    }
    
    if (thought.context) {
      content += `## Context\n${thought.context}\n\n`;
    }
    
    content += `## Follow-up Actions\n- [ ] Review and decide if this needs to become a formal task\n- [ ] Add more details if needed\n- [ ] Archive if no longer relevant\n\n`;
    content += `---\n*Captured via MCP on ${timestamp}*`;

    const filePath = join(draftsPath, fileName);
    await fs.writeFile(filePath, content);

    // Auto-commit the captured thought
    const thoughtSummary = thought.content.substring(0, 50).replace(/\n/g, ' ') + (thought.content.length > 50 ? '...' : '');
    await this.autoCommitBacklogChange(filePath, 'capture', thoughtSummary, path);

    return {
      filePath,
      content
    };
  }

  /**
   * Auto-commit backlog changes to git using smart git helpers
   */
  private async autoCommitBacklogChange(filePath: string, action: 'add' | 'capture' | 'update', description: string, repoPath?: string): Promise<void> {
    const path = repoPath || this.workspaceRoot;
    
    try {
      // Convert absolute path to relative path from repository root
      const relativePath = filePath.startsWith(path) 
        ? filePath.substring(path.length + 1) 
        : filePath;
      
      // Create standardized commit message
      let commitMessage = '';
      switch (action) {
        case 'add':
          commitMessage = `feat(backlog): add task - ${description}`;
          break;
        case 'capture':
          commitMessage = `feat(backlog): capture thought - ${description}`;
          break;
        case 'update':
          commitMessage = `feat(backlog): update - ${description}`;
          break;
      }
      
      // Stage the specific file using smart git helpers
      const addResult = await executeGitCommand(['add', relativePath], path);
      if (!addResult.success) {
        console.warn(`Auto-commit: Failed to stage ${relativePath}:`, addResult.stderr);
        return;
      }
      
      // Commit using smart git helpers
      const commitResult = await executeGitCommand(['commit', '-m', commitMessage], path);
      if (!commitResult.success) {
        console.warn(`Auto-commit: Failed to commit ${relativePath}:`, commitResult.stderr);
        return;
      }
      
      console.log(`Auto-committed backlog change: ${commitMessage}`);
    } catch (error) {
      console.warn(`Auto-commit failed for ${filePath}:`, error);
      // Don't throw error - backlog operation should still succeed even if commit fails
    }
  }

  /**
   * List current tasks using backlog CLI (CLI-FIRST APPROACH)
   */
  async listTasks(repoPath?: string): Promise<{ tasks: string[]; drafts: string[] }> {
    // Use the same repository resolution logic
    const path = await this.resolveRepositoryPath(repoPath);
    
    try {
      // Try CLI approach first
      const cliResult = await this.executeBacklogCliCommand(['task', 'list', '--plain'], path);
      
      if (cliResult.success) {
        // Parse CLI output to extract task files
        const taskFiles = this.parseTaskListOutput(cliResult.stdout);
        return {
          tasks: taskFiles,
          drafts: [] // CLI doesn't distinguish drafts yet, use fallback for drafts
        };
      } else {
        console.warn('Backlog CLI list failed, falling back to file system scan');
        return this.listTasksManuallyAsFallback(path);
      }
    } catch (error) {
      console.warn(`Backlog CLI error: ${error}, falling back to manual approach`);
      return this.listTasksManuallyAsFallback(path);
    }
  }

  /**
   * Parse task list CLI output to extract filenames
   */
  private parseTaskListOutput(output: string): string[] {
    const tasks: string[] = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Look for task file patterns in output
      const taskMatch = line.match(/task-\d+-[^.]+\.md/);
      if (taskMatch) {
        tasks.push(taskMatch[0]);
      }
    }
    
    return tasks.sort();
  }

  /**
   * Fallback manual task listing (ONLY when CLI fails)
   */
  private async listTasksManuallyAsFallback(path: string): Promise<{ tasks: string[]; drafts: string[] }> {
    console.warn('⚠️  Using manual task listing as fallback - CLI method preferred');
    
    const tasksPath = join(path, 'backlog', 'tasks');
    const draftsPath = join(path, 'backlog', 'drafts');
    
    try {
      const tasks = await glob('*.md', { cwd: tasksPath });
      const drafts = await glob('*.md', { cwd: draftsPath });
      
      return {
        tasks: tasks.sort(),
        drafts: drafts.sort()
      };
    } catch {
      return { tasks: [], drafts: [] };
    }
  }
}