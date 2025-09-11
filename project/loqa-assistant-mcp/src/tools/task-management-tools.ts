import { LoqaTaskManager } from '../managers/index.js';
import { basename, dirname, join } from 'path';
import { TaskCreationOptions, CapturedThought } from '../types/index.js';
import { resolveWorkspaceRoot } from '../utils/workspace-resolver.js';
import { KNOWN_REPOSITORIES_LIST } from '../config/repositories.js';

/**
 * Task Management MCP tools
 * Handles todo creation, thought capture, template management, etc.
 */

export const taskManagementTools = [
  {
    name: "add_todo",
    description: "Add a new task to the backlog using templates and priority",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Clear, descriptive task title"
        },
        template: {
          type: "string",
          description: "Template to use (feature, bug-fix, protocol-change, cross-repo, general)",
          enum: ["feature", "bug-fix", "protocol-change", "cross-repo", "general"]
        },
        priority: {
          type: "string",
          description: "Task priority level",
          enum: ["High", "Medium", "Low"]
        },
        type: {
          type: "string",
          description: "Type of work being done",
          enum: ["Feature", "Bug Fix", "Improvement", "Documentation", "Refactoring"]
        },
        assignee: {
          type: "string",
          description: "Who will work on this task"
        }
      },
      required: ["title"]
    }
  },
  {
    name: "capture_thought",
    description: "Capture a quick thought or idea for later processing",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The thought or idea content"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Optional tags to categorize the thought"
        },
        context: {
          type: "string",
          description: "Optional context about where this thought came from"
        }
      },
      required: ["content"]
    }
  },
  {
    name: "list_templates",
    description: "List all available task templates",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description: "Optional repository path (defaults to current directory)"
        }
      }
    }
  },
  {
    name: "list_tasks",
    description: "List current tasks and drafts in the backlog",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description: "Optional repository path (defaults to current directory)"
        }
      }
    }
  }
];

export async function handleTaskManagementTool(name: string, args: any): Promise<any> {
  // Intelligently resolve the workspace root
  const workspaceRoot = await resolveWorkspaceRoot(args);
  
  const taskManager = new LoqaTaskManager(workspaceRoot);

  switch (name) {
    case "add_todo": {
      const { title, template = "general", priority = "Medium", type, assignee } = args;
      
      const options: TaskCreationOptions = {
        title,
        template,
        priority: priority as "High" | "Medium" | "Low",
        type: type as "Feature" | "Bug Fix" | "Improvement" | "Documentation",
        assignee
      };

      try {
        const result = await taskManager.createTaskFromTemplate(options);
        return {
          content: [{
            type: "text",
            text: `✅ Task created successfully!\n\n📋 **Task ID**: ${result.taskId}\n📁 **File**: ${result.filePath}\n📝 **Template**: ${template}\n⭐ **Priority**: ${priority}\n\n**Next Steps**: The task has been added to your backlog and is ready for work.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `❌ Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "capture_thought": {
      const { content, tags = [], context } = args;
      
      const thought: CapturedThought = {
        content,
        tags,
        timestamp: new Date(),
        context
      };

      try {
        const result = await taskManager.captureThought(thought);
        return {
          content: [{
            type: "text",
            text: `💡 Thought captured successfully!\n\n📁 **File**: ${result.filePath}\n🏷️ **Tags**: ${tags.join(', ') || 'None'}\n⏰ **Captured**: ${thought.timestamp.toISOString()}\n\n**Next Steps**: Review the thought later and convert to a formal task if needed.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to capture thought: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "list_templates": {
      const { repoPath } = args;
      
      try {
        const templates = await taskManager.getAvailableTemplates(repoPath);
        const templateList = templates.map(t => `• **${t.name}**: ${t.description}`).join('\n');
        
        return {
          content: [{
            type: "text",
            text: `📋 **Available Task Templates** (${templates.length} found)\n\n${templateList || 'No templates found. Initialize backlog with `backlog init` first.'}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to list templates: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "list_tasks": {
      const { repoPath } = args;
      
      try {
        // If specific repo specified, use single repo mode
        if (repoPath) {
          const result = await taskManager.listTasks(repoPath);
          const tasksList = result.tasks.map(t => `• ${t}`).join('\n');
          const draftsList = result.drafts.map(d => `• ${d}`).join('\n');
          
          return {
            content: [{
              type: "text",
              text: `📋 **Current Backlog Status** (${repoPath})\n\n**📝 Tasks (${result.tasks.length}):**\n${tasksList || 'No tasks found'}\n\n**💭 Drafts (${result.drafts.length}):**\n${draftsList || 'No drafts found'}`
            }]
          };
        }
        
        // Multi-repository mode: scan all repositories
        const knownRepositories = KNOWN_REPOSITORIES_LIST;
        
        // Determine actual workspace root
        const actualWorkspaceRoot = knownRepositories.includes(basename(workspaceRoot)) 
          ? dirname(workspaceRoot) 
          : workspaceRoot;
        
        let allTasks: string[] = [];
        let allDrafts: string[] = [];
        let repoSummaries: string[] = [];
        
        for (const repoName of knownRepositories) {
          try {
            const repoPath = join(actualWorkspaceRoot, repoName);
            const repoTaskManager = new LoqaTaskManager(repoPath);
            const result = await repoTaskManager.listTasks();
            
            if (result.tasks.length > 0 || result.drafts.length > 0) {
              repoSummaries.push(`**${repoName}**: ${result.tasks.length} tasks, ${result.drafts.length} drafts`);
              
              // Add repo prefix to tasks and drafts
              allTasks.push(...result.tasks.map(task => `${task} (${repoName})`));
              allDrafts.push(...result.drafts.map(draft => `${draft} (${repoName})`));
            }
          } catch (error) {
            // Repository doesn't exist or no backlog - skip silently
            continue;
          }
        }
        
        const tasksList = allTasks.map(t => `• ${t}`).join('\n');
        const draftsList = allDrafts.map(d => `• ${d}`).join('\n');
        const repoSummary = repoSummaries.join('\n');
        
        return {
          content: [{
            type: "text",
            text: `📋 **Workspace-Wide Backlog Status**\n\n${repoSummary}\n\n**📝 All Tasks (${allTasks.length}):**\n${tasksList || 'No tasks found'}\n\n**💭 All Drafts (${allDrafts.length}):**\n${draftsList || 'No drafts found'}`
          }]
        };
        
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to list tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    default:
      throw new Error(`Unknown task management tool: ${name}`);
  }
}