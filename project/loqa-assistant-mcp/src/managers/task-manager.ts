import { simpleGit, SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { join } from 'path';
import { glob } from 'glob';
import { TaskTemplate, TaskCreationOptions, CapturedThought } from '../types/index.js';

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
   * Create a new task using a template
   */
  async createTaskFromTemplate(options: TaskCreationOptions, repoPath?: string): Promise<{ taskId: string; filePath: string; content: string }> {
    const path = repoPath || this.workspaceRoot;
    const backlogPath = join(path, 'backlog');
    const tasksPath = join(backlogPath, 'tasks');
    
    // Ensure backlog structure exists
    try {
      await fs.access(backlogPath);
    } catch {
      // Provide more specific error information
      const repoName = path.split('/').pop() || path;
      throw new Error(`Backlog not found in ${repoName} (${path}). Expected backlog directory at: ${backlogPath}. Run 'backlog init' in the repository or check if you're in the correct directory.`);
    }

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
        // Use general template as fallback
        const generalTemplate = templates.find(t => t.name.toLowerCase().includes('general'));
        templateContent = generalTemplate?.content || await this.getDefaultTemplate();
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
      content = content.replace(/\[Addition\/Modification\/Deprecation\/Breaking Change\]/g, options.type);
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
   * List current tasks
   */
  async listTasks(repoPath?: string): Promise<{ tasks: string[]; drafts: string[] }> {
    const path = repoPath || this.workspaceRoot;
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