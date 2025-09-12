import { LoqaTaskManager, LoqaRoleManager, LoqaModelSelector } from '../managers/index.js';
import { TaskCreationOptions, CapturedThought } from '../types/index.js';
import { resolveWorkspaceRoot } from '../utils/workspace-resolver.js';
import { SmartGitHelpers } from '../utils/smart-git-helpers.js';

/**
 * Advanced Workflow MCP tools
 * Handles complex multi-step workflows and strategic operations
 */

export const workflowTools = [
  {
    name: "workflow:StartTaskWork",
    description: "Begin comprehensive task work with full context setup including role detection, model selection, and workflow optimization",
    inputSchema: {
      type: "object",
      properties: {
        taskTitle: {
          type: "string",
          description: "Clear, descriptive title of the task to work on"
        },
        taskDescription: {
          type: "string",
          description: "Detailed description of what needs to be accomplished"
        },
        filePaths: {
          type: "array",
          items: { type: "string" },
          description: "File paths that will be involved in this work"
        },
        repository: {
          type: "string",
          description: "Repository where this work will be done"
        },
        priority: {
          type: "string",
          enum: ["High", "Medium", "Low"],
          description: "Priority level for this task"
        },
        category: {
          type: "string",
          enum: ["feature", "bug-fix", "technical-debt", "documentation", "devops-infrastructure", "research-exploration", "security-compliance", "internal-tools"],
          description: "Task category"
        },
        updateStatus: {
          type: "boolean",
          description: "Whether to automatically update task status as work progresses"
        }
      },
      required: ["taskTitle"]
    }
  },
  {
    name: "workflow:PlanStrategicShift", 
    description: "Plan and coordinate strategic shifts across the workspace with comprehensive impact analysis",
    inputSchema: {
      type: "object",
      properties: {
        shiftTitle: {
          type: "string",
          description: "Title of the strategic shift"
        },
        description: {
          type: "string",
          description: "Detailed description of the strategic change"
        },
        scope: {
          type: "array", 
          items: { type: "string" },
          description: "Repositories or components affected by this shift"
        },
        timeline: {
          type: "string",
          description: "Expected timeline for implementing this shift"
        },
        stakeholders: {
          type: "array",
          items: { type: "string" },
          description: "Key stakeholders who need to be involved"
        },
        riskLevel: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
          description: "Risk level assessment"
        }
      },
      required: ["shiftTitle", "description"]
    }
  },
  {
    name: "workflow:CaptureComprehensiveThought",
    description: "Capture complex thoughts with full context, automatic categorization, and intelligent follow-up suggestions",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The detailed thought or idea content"
        },
        category: {
          type: "string",
          enum: ["architecture", "feature-idea", "technical-debt", "process-improvement", "research-topic", "bug-insight", "optimization"],
          description: "Category of the thought"
        },
        urgency: {
          type: "string",
          enum: ["immediate", "next-sprint", "backlog", "future"],
          description: "Urgency level for acting on this thought"
        },
        relatedRepositories: {
          type: "array",
          items: { type: "string" },
          description: "Repositories this thought relates to"
        },
        tags: {
          type: "array", 
          items: { type: "string" },
          description: "Custom tags for categorization"
        },
        context: {
          type: "string",
          description: "Context about where this thought originated"
        }
      },
      required: ["content", "category"]
    }
  },
  {
    name: "workflow:StartComplexTodo",
    description: "Create and begin work on complex, multi-step todos with automatic workflow setup",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Main title of the complex todo"
        },
        description: {
          type: "string",
          description: "Detailed description of all work involved"
        },
        subtasks: {
          type: "array",
          items: { type: "string" },
          description: "List of subtasks or steps involved"
        },
        repositories: {
          type: "array",
          items: { type: "string" },
          description: "Repositories involved in this work"
        },
        dependencies: {
          type: "array",
          items: { type: "string" },
          description: "External dependencies or blockers"
        },
        estimatedEffort: {
          type: "string",
          enum: ["hours", "days", "weeks", "months"],
          description: "Estimated effort level"
        },
        priority: {
          type: "string",
          enum: ["High", "Medium", "Low"],
          description: "Overall priority"
        }
      },
      required: ["title", "description"]
    }
  }
];

export async function handleWorkflowTool(name: string, args: any): Promise<any> {
  // Intelligently resolve the workspace root
  const workspaceRoot = await resolveWorkspaceRoot(args);
  
  const taskManager = new LoqaTaskManager(workspaceRoot);
  const roleManager = new LoqaRoleManager();
  const modelSelector = new LoqaModelSelector();

  switch (name) {
    case "workflow:StartTaskWork": {
      const { taskTitle, taskDescription, filePaths = [], repository, priority = "Medium", category = "feature", updateStatus = true } = args;
      
      try {
        // Step 0: Ensure we have the latest code state before starting work
        let syncMessage = '';
        try {
          const mainStatus = await SmartGitHelpers.checkMainStatus();
          if (mainStatus.success && mainStatus.isBehind) {
            syncMessage = `🔄 Syncing with latest changes (${mainStatus.commitsBeind} commits behind)...\n`;
            const syncResult = await SmartGitHelpers.smartSync();
            if (syncResult.success) {
              if (syncResult.pulledCommits > 0) {
                syncMessage += `✅ Pulled ${syncResult.pulledCommits} commits to main\n`;
              }
              if (syncResult.cleanupResult?.deleted.length) {
                syncMessage += `🧹 Cleaned up ${syncResult.cleanupResult.deleted.length} merged branches\n`;
              }
              syncMessage += '\n';
            } else {
              syncMessage += `⚠️ Sync failed: ${syncResult.error}\n\n`;
            }
          }
        } catch (error) {
          // Continue without sync if it fails - don't block the workflow
          syncMessage = `⚠️ Could not check for updates, continuing with current state\n\n`;
        }

        // Step 1: Detect appropriate role
        const roleDetection = await roleManager.detectRole({
          title: taskTitle,
          description: taskDescription,
          filePaths,
          repositoryType: repository
        });

        // Step 2: Get model recommendation
        const modelRecommendation = await modelSelector.selectModel({
          roleId: roleDetection.detectedRole,
          taskTitle,
          taskDescription,
          filePaths,
          repositoryType: repository
        });

        // Step 3: Create task using appropriate template
        const roleConfig = await roleManager.getRoleConfig(roleDetection.detectedRole);
        const preferredTemplate = roleConfig?.task_templates_preferred?.[0] || 'general';
        
        const taskOptions: TaskCreationOptions = {
          title: taskTitle,
          template: preferredTemplate,
          priority: priority as "High" | "Medium" | "Low",
          type: category.includes('bug') ? 'Bug Fix' : 'Feature'
        };

        const task = await taskManager.createTaskFromTemplate(taskOptions);

        let responseText = `${syncMessage}🚀 **Task Work Initiated**\n\n`;
        responseText += `📋 **Task**: ${taskTitle}\n`;
        responseText += `📁 **File**: ${task.filePath}\n`;
        responseText += `🎯 **Role**: ${roleConfig?.role_name || roleDetection.detectedRole} (${(roleDetection.confidence * 100).toFixed(0)}% confidence)\n`;
        responseText += `🤖 **Recommended Model**: ${modelRecommendation.model} (${(modelRecommendation.confidence * 100).toFixed(0)}% confidence)\n`;
        responseText += `📝 **Template**: ${preferredTemplate}\n`;
        responseText += `⭐ **Priority**: ${priority}\n`;
        responseText += `📂 **Repository**: ${repository || 'Current'}\n\n`;
        
        responseText += `**Workflow Context**:\n`;
        responseText += `• **Role Reasoning**: ${roleDetection.reasoning.join(', ')}\n`;
        responseText += `• **Model Reasoning**: ${modelRecommendation.reasoning.join(', ')}\n`;
        
        if (filePaths.length > 0) {
          responseText += `• **Files Involved**: ${filePaths.slice(0, 5).join(', ')}${filePaths.length > 5 ? `... (+${filePaths.length - 5} more)` : ''}\n`;
        }

        responseText += `\n**Next Steps**: Begin work with optimized role and model context. ${updateStatus ? 'Status will be tracked automatically.' : 'Update status manually as needed.'}`;

        return {
          content: [{
            type: "text",
            text: responseText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to start task work: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "workflow:PlanStrategicShift": {
      const { shiftTitle, description, scope = [], timeline, stakeholders = [], riskLevel = "medium" } = args;
      
      try {
        // Ensure we have the latest code state for accurate impact analysis
        let syncMessage = '';
        try {
          const mainStatus = await SmartGitHelpers.checkMainStatus();
          if (mainStatus.success && mainStatus.isBehind) {
            const syncResult = await SmartGitHelpers.smartSync();
            if (syncResult.success && syncResult.pulledCommits > 0) {
              syncMessage = `🔄 Updated to latest main (${syncResult.pulledCommits} commits) for accurate impact analysis\n\n`;
            }
          }
        } catch (error) {
          // Continue without sync if it fails
        }
        // Create a comprehensive thought for the strategic shift
        const thought: CapturedThought = {
          content: `Strategic Shift: ${shiftTitle}\n\nDescription: ${description}\n\nScope: ${scope.join(', ')}\nTimeline: ${timeline || 'TBD'}\nStakeholders: ${stakeholders.join(', ')}\nRisk Level: ${riskLevel}`,
          tags: ['strategic-shift', 'planning', riskLevel, ...scope],
          timestamp: new Date(),
          context: 'Strategic planning session'
        };

        const thoughtResult = await taskManager.captureThought(thought);
        
        let planText = `${syncMessage}📈 **Strategic Shift Plan Created**\n\n`;
        planText += `🎯 **Title**: ${shiftTitle}\n`;
        planText += `📝 **Description**: ${description}\n`;
        planText += `🔍 **Scope**: ${scope.join(', ') || 'To be defined'}\n`;
        planText += `⏰ **Timeline**: ${timeline || 'To be estimated'}\n`;
        planText += `👥 **Stakeholders**: ${stakeholders.join(', ') || 'To be identified'}\n`;
        planText += `⚠️ **Risk Level**: ${riskLevel.toUpperCase()}\n\n`;
        
        planText += `**Planning Document**: ${thoughtResult.filePath}\n\n`;
        
        planText += `**Recommended Next Steps**:\n`;
        planText += `1. Review and refine the scope with stakeholders\n`;
        planText += `2. Create detailed implementation tasks for each affected repository\n`;
        planText += `3. Assess cross-repository dependencies and coordination needs\n`;
        planText += `4. Establish checkpoints and success criteria\n`;
        planText += `5. Create communication plan for rollout\n\n`;
        
        planText += `**Risk Mitigation** (${riskLevel} risk):\n`;
        if (riskLevel === 'high' || riskLevel === 'critical') {
          planText += `• Consider phased rollout approach\n`;
          planText += `• Establish rollback procedures\n`;
          planText += `• Increase testing and validation rigor\n`;
        }
        planText += `• Monitor impact across all affected repositories\n`;
        planText += `• Maintain clear documentation of changes`;

        return {
          content: [{
            type: "text",
            text: planText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to plan strategic shift: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "workflow:CaptureComprehensiveThought": {
      const { content, category, urgency = "backlog", relatedRepositories = [], tags = [], context } = args;
      
      try {
        const enhancedTags = [category, urgency, ...relatedRepositories.map((r: any) => `repo:${r}`), ...tags];
        
        const thought: CapturedThought = {
          content: `[${category.toUpperCase()}] ${content}`,
          tags: enhancedTags,
          timestamp: new Date(),
          context: context || `Comprehensive thought capture - ${category}`
        };

        const result = await taskManager.captureThought(thought);
        
        let thoughtText = `💡 **Comprehensive Thought Captured**\n\n`;
        thoughtText += `📂 **Category**: ${category}\n`;
        thoughtText += `⚡ **Urgency**: ${urgency}\n`;
        thoughtText += `📁 **File**: ${result.filePath}\n`;
        thoughtText += `🏷️ **Tags**: ${enhancedTags.join(', ')}\n`;
        
        if (relatedRepositories.length > 0) {
          thoughtText += `📦 **Related Repos**: ${relatedRepositories.join(', ')}\n`;
        }
        
        thoughtText += `\n**Suggested Follow-up Actions**:\n`;
        
        switch (urgency) {
          case 'immediate':
            thoughtText += `• Create high-priority task immediately\n`;
            thoughtText += `• Notify relevant stakeholders\n`;
            thoughtText += `• Begin work within current sprint\n`;
            break;
          case 'next-sprint':
            thoughtText += `• Add to next sprint planning\n`;
            thoughtText += `• Estimate effort and dependencies\n`;
            thoughtText += `• Coordinate with team leads\n`;
            break;
          case 'backlog':
            thoughtText += `• Add to product backlog for prioritization\n`;
            thoughtText += `• Gather additional requirements when ready\n`;
            break;
          case 'future':
            thoughtText += `• Document for future reference\n`;
            thoughtText += `• Review quarterly during roadmap planning\n`;
            break;
        }

        return {
          content: [{
            type: "text",
            text: thoughtText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to capture comprehensive thought: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "workflow:StartComplexTodo": {
      const { title, description, subtasks = [], repositories = [], dependencies = [], estimatedEffort = "days", priority = "Medium" } = args;
      
      try {
        // Create the main task with comprehensive context
        let enhancedDescription = description;
        
        if (subtasks.length > 0) {
          enhancedDescription += `\n\n## Subtasks:\n${subtasks.map((task: any, i: any) => `${i + 1}. ${task}`).join('\n')}`;
        }
        
        if (repositories.length > 0) {
          enhancedDescription += `\n\n## Affected Repositories:\n${repositories.map((repo: any) => `- ${repo}`).join('\n')}`;
        }
        
        if (dependencies.length > 0) {
          enhancedDescription += `\n\n## Dependencies:\n${dependencies.map((dep: any) => `- ${dep}`).join('\n')}`;
        }
        
        enhancedDescription += `\n\n## Estimated Effort: ${estimatedEffort}`;
        
        const taskOptions: TaskCreationOptions = {
          title,
          template: 'general',
          priority: priority as "High" | "Medium" | "Low",
          type: 'Feature'
        };

        const mainTask = await taskManager.createTaskFromTemplate(taskOptions);
        
        // Create individual subtasks if provided
        const createdSubtasks = [];
        for (let i = 0; i < Math.min(subtasks.length, 5); i++) { // Limit to 5 subtasks
          const subtaskOptions: TaskCreationOptions = {
            title: `${title} - ${subtasks[i]}`,
            template: 'general',
            priority: priority as "High" | "Medium" | "Low",
            type: 'Feature'
          };
          
          try {
            const subtask = await taskManager.createTaskFromTemplate(subtaskOptions);
            createdSubtasks.push(subtasks[i]);
          } catch (error) {
            // Continue with other subtasks if one fails
          }
        }

        let responseText = `🎯 **Complex Todo Initiated**\n\n`;
        responseText += `📋 **Main Task**: ${title}\n`;
        responseText += `📁 **File**: ${mainTask.filePath}\n`;
        responseText += `⭐ **Priority**: ${priority}\n`;
        responseText += `⏱️ **Estimated Effort**: ${estimatedEffort}\n\n`;
        
        if (createdSubtasks.length > 0) {
          responseText += `**Subtasks Created** (${createdSubtasks.length}/${subtasks.length}):\n`;
          responseText += createdSubtasks.map((task, i) => `${i + 1}. ${task}`).join('\n');
          responseText += '\n\n';
        }
        
        if (repositories.length > 0) {
          responseText += `**Repositories Involved**: ${repositories.join(', ')}\n`;
        }
        
        if (dependencies.length > 0) {
          responseText += `**Dependencies**: ${dependencies.join(', ')}\n`;
        }
        
        responseText += `\n**Next Steps**:\n`;
        responseText += `1. Review and refine task breakdown\n`;
        responseText += `2. Coordinate across affected repositories\n`;
        responseText += `3. Address dependencies before starting work\n`;
        responseText += `4. Begin with highest-priority subtasks\n`;
        responseText += `5. Track progress and update status regularly`;

        return {
          content: [{
            type: "text",
            text: responseText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to start complex todo: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    default:
      throw new Error(`Unknown workflow tool: ${name}`);
  }
}