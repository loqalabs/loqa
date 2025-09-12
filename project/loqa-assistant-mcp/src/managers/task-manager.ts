import { simpleGit, SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { join } from 'path';
import { glob } from 'glob';
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

    // Build backlog CLI command arguments
    const cliArgs = ['task', 'create', options.title];
    
    if (options.description) {
      cliArgs.push('--description', options.description);
    }
    
    if (options.priority) {
      cliArgs.push('--priority', options.priority.toLowerCase());
    }
    
    if (options.type) {
      // Map type to appropriate labels
      const typeLabels = this.mapTypeToLabels(options.type, options.template);
      cliArgs.push('--labels', typeLabels);
    } else if (options.template) {
      // Use template as label
      cliArgs.push('--labels', options.template);
    }
    
    if (options.assignee) {
      cliArgs.push('--assignee', options.assignee);
    }

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
      // Fallback to manual creation only if CLI is not available
      console.warn(`Backlog CLI failed, falling back to manual creation: ${error}`);
      return this.createTaskManuallyAsFallback(options, path);
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
   * Map task type to appropriate labels for backlog CLI
   */
  private mapTypeToLabels(type: string, template?: string): string {
    const labels = [];
    
    // Add template as primary label
    if (template) {
      labels.push(template);
    }
    
    // Add type-specific labels
    switch (type.toLowerCase()) {
      case 'feature':
        labels.push('feature', 'enhancement');
        break;
      case 'bug fix':
        labels.push('bug-fix', 'priority-high');
        break;
      case 'improvement':
        labels.push('improvement', 'enhancement');
        break;
      case 'documentation':
        labels.push('documentation', 'docs');
        break;
      case 'refactoring':
        labels.push('refactoring', 'code-quality');
        break;
      default:
        labels.push('general');
    }
    
    return labels.join(',');
  }

  /**
   * Execute backlog CLI command
   */
  private async executeBacklogCliCommand(args: string[], workingDir: string): Promise<{ success: boolean; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const { spawn } = require('child_process');
      const child = spawn('backlog', args, { 
        cwd: workingDir, 
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true 
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
      
      child.on('close', (code: number) => {
        resolve({
          success: code === 0,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });
      
      child.on('error', (error: Error) => {
        resolve({
          success: false,
          stdout: '',
          stderr: error.message
        });
      });
    });
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
      if (!require('path').isAbsolute(filePath)) {
        filePath = join(repositoryPath, filePath);
      }
    } else {
      // Construct expected file path using the repository path
      const tasksDir = join(repositoryPath, 'backlog', 'tasks');
      const taskFiles = require('glob').sync(`task-${taskId}-*.md`, { cwd: tasksDir });
      if (taskFiles.length > 0) {
        filePath = join(tasksDir, taskFiles[0]);
      }
    }
    
    return { taskId, filePath };
  }

  /**
   * Fallback manual task creation (ONLY when CLI fails)
   */
  private async createTaskManuallyAsFallback(options: TaskCreationOptions, path: string): Promise<{ taskId: string; filePath: string; content: string }> {
    console.warn('⚠️  Using manual task creation as fallback - CLI method preferred');
    
    const tasksPath = join(path, 'backlog', 'tasks');
    
    // Get the next task ID
    const taskId = await this.getNextTaskId(tasksPath);
    
    // Get template content
    let templateContent = '';
    if (options.template) {
      const templates = await this.getAvailableTemplates(path);
      const template = templates.find(t => t.name.toLowerCase().includes(options.template!.toLowerCase()));
      if (template) {
        templateContent = template.content;
      } else {
        templateContent = await this.getDefaultTemplate();
      }
    } else {
      templateContent = await this.getDefaultTemplate();
    }

    // Fill in template with provided options
    let content = templateContent;
    content = content.replace(/\[Clear, descriptive title\]/g, options.title);
    content = content.replace(/\[Clear, descriptive name\]/g, options.title);
    
    if (options.type) {
      content = content.replace(/\[Feature\/Bug Fix\/Improvement\/Documentation\/Refactoring\]/g, options.type);
    }
    
    if (options.priority) {
      content = content.replace(/\[High\/Medium\/Low\]/g, options.priority);
    }
    
    if (options.assignee) {
      content = content.replace(/\[Team member or role\]/g, options.assignee);
    }

    // Save the task file
    const fileName = `task-${taskId}-${options.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    const filePath = join(tasksPath, fileName);
    await fs.writeFile(filePath, content);

    // Auto-commit the new task
    await this.autoCommitBacklogChange(filePath, 'add', options.title, path);

    return {
      taskId,
      filePath,
      content
    };
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
   * Get the next available task ID
   */
  private async getNextTaskId(tasksPath: string): Promise<string> {
    try {
      const taskFiles = await glob('task-*.md', { cwd: tasksPath });
      const taskNumbers = taskFiles
        .map(file => {
          const match = file.match(/task-(\d+)-/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => !isNaN(num));
      
      const maxId = taskNumbers.length > 0 ? Math.max(...taskNumbers) : 0;
      return String(maxId + 1).padStart(3, '0');
    } catch {
      return '001';
    }
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
   * Get default template content
   */
  private async getDefaultTemplate(): Promise<string> {
    return `# Task: [Title]

## Description
[Describe what needs to be done]

## Acceptance Criteria
- [ ] [Specific outcome 1]
- [ ] [Specific outcome 2]
- [ ] [Specific outcome 3]

## Implementation Notes
[Any specific implementation details]

## Dependencies
- **Depends on:** [List dependencies]
- **Blocks:** [List what this blocks]

## Quality Gates
- [ ] Code review completed
- [ ] Tests passing
- [ ] Documentation updated

## Status
- Created: ${new Date().toISOString().split('T')[0]}
- Status: To Do
`;
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