import { LoqaTaskManager } from '../managers/index.js';
import { basename, dirname, join } from 'path';
import { TaskCreationOptions, CapturedThought } from '../types/index.js';
import { resolveWorkspaceRoot } from '../utils/workspace-resolver.js';
import { KNOWN_REPOSITORIES_LIST } from '../config/repositories.js';
import { InterviewContextManager } from '../utils/interview-context-manager.js';

// Import from split modules
import { 
  evaluateThoughtPriority, 
  analyzeThoughtContent, 
  ThoughtEvaluation,
  evaluateComprehensiveThought,
  analyzeCurrentProjectState,
  findRelatedExistingTasks,
  performAdvancedThoughtAnalysis
} from './thought-analysis.js';
import { 
  TaskCreationInterviewer
} from './interview-system.js';
import {
  calculateStringSimilarity,
  findSemanticRelationships,
  extractKeywords,
  estimateComplexity,
  mapCategoryToTaskType,
  estimateThoughtUrgency
} from './utilities.js';
import {
  detectThoughtCategory,
  deriveTaskTitle,
  appendContextToTask
} from './handlers.js';

// All functions now imported from split modules

// Missing function that needs to be implemented
async function shouldUseComprehensiveTaskCreation(
  title: string,
  template: string,
  priority: string,
  type?: string,
  workspaceRoot?: string
): Promise<{
  decision: boolean;
  reasoning: string;
  complexityIndicators: string[];
  estimatedEffort: string;
}> {
  const complexityIndicators = [];
  let complexityScore = 0;
  
  // Strong indicators - these really suggest comprehensive creation
  if (title.toLowerCase().includes('comprehensive') || 
      title.toLowerCase().includes('complex') ||
      title.toLowerCase().includes('architecture') ||
      title.toLowerCase().includes('system') ||
      title.toLowerCase().includes('framework') ||
      title.toLowerCase().includes('infrastructure')) {
    complexityIndicators.push('Complex system design keywords');
    complexityScore += 3;
  }
  
  // Multi-repo work is inherently complex
  if (title.toLowerCase().includes('multi') ||
      title.toLowerCase().includes('cross-repo') ||
      template === 'cross-repo') {
    complexityIndicators.push('Cross-repository coordination required');
    complexityScore += 3;
  }
  
  // Protocol changes are complex and need careful planning
  if (template === 'protocol-change' ||
      title.toLowerCase().includes('protocol') ||
      title.toLowerCase().includes('breaking change')) {
    complexityIndicators.push('Protocol or breaking changes involved');
    complexityScore += 3;
  }
  
  // Medium indicators - suggest complexity but not automatically
  if (title.length > 80) {
    complexityIndicators.push('Long, detailed title suggests complexity');
    complexityScore += 1;
  }
  
  // Enterprise/large-scale indicators
  if (title.toLowerCase().includes('enterprise') ||
      title.toLowerCase().includes('scalability') ||
      title.toLowerCase().includes('performance optimization')) {
    complexityIndicators.push('Enterprise-scale requirements');
    complexityScore += 2;
  }
  
  // Only trigger comprehensive creation for truly complex tasks (score >= 3)
  const decision = complexityScore >= 3;
  
  return {
    decision,
    reasoning: decision 
      ? `High complexity detected (score: ${complexityScore}): ${complexityIndicators.join(', ')}`
      : `Simple task creation appropriate (score: ${complexityScore})`,
    complexityIndicators,
    estimatedEffort: complexityScore >= 3 ? 'High' : complexityScore >= 2 ? 'Medium' : 'Low'
  };
}

async function handleStartComprehensiveTaskCreation(args: any, workspaceRoot: string): Promise<any> {
  // Import the actual handler from handlers.ts
  const { handleStartComprehensiveTaskCreation: actualHandler } = await import('./handlers.js');
  return await actualHandler(args, workspaceRoot);
}

async function handleAnswerInterviewQuestion(args: any, workspaceRoot: string): Promise<any> {
  // Import the actual handler from handlers.ts
  const { handleAnswerInterviewQuestion: actualHandler } = await import('./handlers.js');
  return await actualHandler(args, workspaceRoot);
}

async function handleContinueTaskDevelopment(args: any, workspaceRoot: string): Promise<any> {
  // Import the actual handler from handlers.ts
  const { handleContinueTaskDevelopment: actualHandler } = await import('./handlers.js');
  return await actualHandler(args, workspaceRoot);
}

async function processInterviewAnswerSeamlessly(interviewId: string, message: string, workspaceRoot: string): Promise<any> {
  // Import the actual handler from handlers.ts
  const { processInterviewAnswerSeamlessly: actualHandler } = await import('./handlers.js');
  return await actualHandler(interviewId, message, workspaceRoot);
}

export const taskManagementTools = [
  {
    name: "task:AddTodo",
    description: "Add a new task to the backlog using templates and priority. IMPORTANT: Use this MCP tool directly - do not invoke project-manager-backlog agent or use Bash commands.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Clear, descriptive task title" },
        template: { type: "string", description: "Template to use", enum: ["feature", "bug-fix", "protocol-change", "cross-repo", "general"] },
        priority: { type: "string", description: "Task priority level", enum: ["High", "Medium", "Low"] },
        type: { type: "string", description: "Type of work being done", enum: ["Feature", "Bug Fix", "Improvement", "Documentation", "Refactoring"] },
        assignee: { type: "string", description: "Who will work on this task" }
      },
      required: ["title"]
    }
  },
  {
    name: "task:CaptureThought",
    description: "Capture a quick thought or idea for later processing",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "The thought or idea content" },
        tags: { type: "array", items: { type: "string" }, description: "Optional tags to categorize the thought" },
        context: { type: "string", description: "Optional context about where this thought came from" }
      },
      required: ["content"]
    }
  },
  {
    name: "task:CaptureComprehensiveThought",
    description: "Capture complex thoughts with full context, automatic categorization, and intelligent follow-up suggestions",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "The detailed thought or idea content" },
        category: { type: "string", description: "Category of the thought", enum: ["architecture", "feature-idea", "technical-debt", "process-improvement", "research-topic", "bug-insight", "optimization"] },
        context: { type: "string", description: "Context about where this thought originated" },
        relatedRepositories: { type: "array", items: { type: "string" }, description: "Repositories this thought relates to" },
        tags: { type: "array", items: { type: "string" }, description: "Custom tags for categorization" },
        urgency: { type: "string", description: "Urgency level for acting on this thought", enum: ["immediate", "next-sprint", "backlog", "future"] }
      },
      required: ["content", "category"]
    }
  },
  {
    name: "task:ListTemplates",
    description: "List all available task templates",
    inputSchema: {
      type: "object",
      properties: { repoPath: { type: "string", description: "Optional repository path (defaults to current directory)" } }
    }
  },
  {
    name: "task:ListTasks",
    description: "List current tasks and drafts in the backlog",
    inputSchema: {
      type: "object",
      properties: { repoPath: { type: "string", description: "Optional repository path (defaults to current directory)" } }
    }
  },
  {
    name: "task:CreateFromThought",
    description: "Create a structured task from an evaluated thought/idea with pre-filled template suggestions",
    inputSchema: {
      type: "object",
      properties: {
        thoughtContent: { type: "string", description: "The original thought/idea content" },
        suggestedTemplate: { type: "string", description: "AI-suggested template based on evaluation", enum: ["feature", "bug-fix", "protocol-change", "cross-repo", "general"] },
        suggestedPriority: { type: "string", description: "AI-suggested priority based on evaluation", enum: ["High", "Medium", "Low"] },
        category: { type: "string", description: "AI-determined category" },
        customTitle: { type: "string", description: "Custom title for the task (optional, will derive from thought if not provided)" },
        additionalContext: { type: "string", description: "Additional context or requirements to include in the task" }
      },
      required: ["thoughtContent", "suggestedTemplate", "suggestedPriority", "category"]
    }
  },
  {
    name: "task:StartComprehensiveCreation", 
    description: "Begin structured interview process to create fully-fleshed out, actionable tasks with proper scoping. IMPORTANT: This MCP tool handles all backlog CLI operations internally - do not use agents or Bash commands.",
    inputSchema: {
      type: "object",
      properties: {
        initialInput: { type: "string", description: "The initial task idea, description, or thought" },
        skipInterview: { type: "boolean", description: "If true, attempt to create task directly without interview (for simple, well-defined tasks)" }
      },
      required: ["initialInput"]
    }
  },
  {
    name: "task:AnswerInterviewQuestion",
    description: "Provide an answer to a task creation interview question",
    inputSchema: {
      type: "object",
      properties: {
        interviewId: { type: "string", description: "The ID of the active task interview" },
        answer: { type: "string", description: "The answer to the current interview question" }
      },
      required: ["interviewId", "answer"]
    }
  },
  {
    name: "task:ContinueDevelopment",
    description: "Resume development of draft tasks, showing available drafts and continuing where left off",
    inputSchema: {
      type: "object",
      properties: { draftId: { type: "string", description: "Optional specific draft ID to resume. If not provided, shows available drafts." } }
    }
  },
  {
    name: "task:AppendToExistingTask",
    description: "Append a thought or additional content to an existing task file",
    inputSchema: {
      type: "object",
      properties: {
        taskFile: { type: "string", description: "The task filename to append to (e.g., 'task-001-feature-name.md')" },
        repository: { type: "string", description: "The repository containing the task (e.g., 'loqa-hub', 'loqa-commander')" },
        content: { type: "string", description: "The content to append to the task" },
        sectionTitle: { type: "string", description: "Optional section title for the appended content (defaults to 'Additional Thoughts')" }
      },
      required: ["taskFile", "repository", "content"]
    }
  },
  {
    name: "task:ProcessConversationalResponse",
    description: "Process a conversational response from the user, automatically handling active interviews seamlessly",
    inputSchema: {
      type: "object",
      properties: {
        message: { type: "string", description: "The user's conversational message to process" },
        contextHint: { type: "string", description: "Optional context hint (e.g., 'interview-response', 'general-message')" }
      },
      required: ["message"]
    }
  }
];

/**
 * Main handler for task management tool calls
 */
export async function handleTaskManagementTool(name: string, args: any): Promise<any> {
  // Intelligently resolve the workspace root
  const workspaceRoot = await resolveWorkspaceRoot(args);
  
  const taskManager = new LoqaTaskManager(workspaceRoot);

  switch (name) {
    case "task:AddTodo": {
      const { title, template = "general", priority = "Medium", type, assignee } = args;
      
      // AI-powered decision on whether to use comprehensive creation
      const shouldUseComprehensive = await shouldUseComprehensiveTaskCreation(
        title, 
        template, 
        priority, 
        type, 
        workspaceRoot
      );
      
      if (shouldUseComprehensive.decision) {
        return {
          content: [{
            type: "text",
            text: `🎯 **Comprehensive Task Creation Recommended**\n\n**Reasoning**: ${shouldUseComprehensive.reasoning}\n\n**Complexity Indicators**: ${shouldUseComprehensive.complexityIndicators.join(', ')}\n\n**Estimated Effort**: ${shouldUseComprehensive.estimatedEffort}\n\nStarting comprehensive task creation process...\n\n---\n\n`
          }]
        };
        // Note: Removing the automatic redirect to comprehensive creation for now
        // User can manually use /start-comprehensive-task-creation if they want the full flow
      }
      
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
            text: `✅ Task created successfully!\n\n📋 **Task ID**: ${result.taskId}\n📁 **File**: ${result.filePath}\n📝 **Template**: ${template}\n⭐ **Priority**: ${priority}\n\n**Next Steps**: The task has been added to your backlog and is ready for work.\n\n💡 **Tip**: For more complex tasks, try \`/start-comprehensive-task-creation\` for guided setup.`
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

    case "task:CaptureThought": {
      const { content, tags = [], context } = args;
      
      const thought: CapturedThought = {
        content,
        tags,
        timestamp: new Date(),
        context
      };

      try {
        // Phase 2: Intelligent category detection for simple thoughts
        const detectedCategory = detectThoughtCategory(content, tags);
        const estimatedUrgency = estimateThoughtUrgency(content);
        
        // Phase 2: Advanced analysis for simple thoughts too
        const advancedAnalysis = await performAdvancedThoughtAnalysis(
          content, 
          [...tags, detectedCategory], 
          context, 
          detectedCategory, 
          estimatedUrgency, 
          workspaceRoot
        );
        
        // Legacy analysis for compatibility
        const projectState = await analyzeCurrentProjectState(workspaceRoot);
        const relatedTasks = await findRelatedExistingTasks(content, tags, context, projectState);
        
        // Evaluate thought priority and suggest task creation if warranted
        const evaluation = await evaluateThoughtPriority(content, tags, context, workspaceRoot);
        const result = await taskManager.captureThought(thought);
        
        let responseText = `🧠 **Smart Thought Analysis**\n📁 ${result.filePath}\n🏷️ **Tags**: ${tags.join(', ') || 'None'} | **Category**: ${detectedCategory} | **Urgency**: ${estimatedUrgency}\n\n🔍 **Analysis**: Impact: ${advancedAnalysis.projectImpact} | Complexity: ${advancedAnalysis.implementationComplexity} | Value: ${advancedAnalysis.strategicValue}/100${advancedAnalysis.crossServiceImpact.length > 0 ? ` | Affects: ${advancedAnalysis.crossServiceImpact.join(', ')}` : ''}\n`;
        
        // Prioritize suggesting addition to existing tasks over creating new ones
        if (relatedTasks.length > 0) {
          const bestMatch = relatedTasks[0];
          responseText += `\n\n🎯 **Related Task Found!** This thought might relate to an existing task:\n\n`;
          responseText += `**📋 Task**: ${bestMatch.task.title} (${bestMatch.task.repo})\n`;
          responseText += `**🔗 Match Reason**: ${bestMatch.reason}\n`;
          responseText += `**📊 Similarity Score**: ${bestMatch.similarity}\n\n`;
          
          if (bestMatch.similarity > 25) {
            responseText += `**🎯 Recommendation**: Consider adding this thought to the existing task instead of creating a new one.\n\n`;
            responseText += `**Task Location**: \`${bestMatch.task.repo}/backlog/tasks/${bestMatch.task.taskFile}\`\n\n`;
            responseText += `**Quick Actions**:\n`;
            responseText += `• **Add to existing**: Use \`/append-to-task "${bestMatch.task.taskFile}" "${bestMatch.task.repo}" "${content}"\`\n`;
            responseText += `• **Create new task**: Use \`/start-comprehensive-task-creation "${content}"\``;
          } else {
            responseText += `**💡 Note**: There's a potential connection, but your thought might warrant a separate task.\n\n`;
            if (evaluation.shouldSuggestTask) {
              responseText += `**🚀 Priority Assessment**: This thought appears to align with current project goals!\n\n`;
              responseText += `**Why it matters**: ${evaluation.reasoning}\n\n`;
              responseText += `**💪 Suggested Action**: Create a new task with:\n`;
              responseText += `• Template: \`${evaluation.suggestedTemplate}\`\n`;
              responseText += `• Priority: \`${evaluation.suggestedPriority}\`\n`;
              responseText += `• Category: ${evaluation.category}\n\n`;
              responseText += `**Ready to create?** Use \`/start-comprehensive-task-creation "${content}"\``;
            }
          }
        } else if (evaluation.shouldSuggestTask) {
          responseText += `\n\n🚀 **Priority Assessment**: This thought appears to align with current project goals!\n\n**Why it matters**: ${evaluation.reasoning}\n\n**💪 Suggested Action**: Create a comprehensive task with:\n• Template: \`${evaluation.suggestedTemplate}\`\n• Priority: \`${evaluation.suggestedPriority}\`\n• Category: ${evaluation.category}\n\n**Ready to create a fully-scoped task?** Use:\n\`/start-comprehensive-task-creation "${content}"\`\n\nOr for quick task: \`/create-task-from-thought\` with the evaluation above.`;
        } else {
          responseText += `\n\n**Next Steps**: Review the thought later and convert to a formal task if needed.`;
        }
        
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
            text: `❌ Failed to capture thought: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "task:CaptureComprehensiveThought": {
      const { content, category, context, relatedRepositories = [], tags = [], urgency = "backlog" } = args;
      
      const thought: CapturedThought = {
        content,
        tags: [...tags, category, urgency],
        timestamp: new Date(),
        context: context || `Category: ${category}, Urgency: ${urgency}, Repositories: ${relatedRepositories.join(', ')}`
      };

      try {
        // Phase 2: Advanced Thought Analysis with Sprint Alignment
        const advancedAnalysis = await performAdvancedThoughtAnalysis(
          content, 
          [...tags, category, urgency], 
          context, 
          category, 
          urgency, 
          workspaceRoot
        );
        
        // Legacy analysis for compatibility
        const projectState = await analyzeCurrentProjectState(workspaceRoot);
        const relatedTasks = await findRelatedExistingTasks(content, [...tags, category, urgency], context, projectState);
        const evaluation = await evaluateComprehensiveThought(content, category, urgency, relatedRepositories, workspaceRoot);
        
        const result = await taskManager.captureThought(thought);
        
        let responseText = `🧠 **Advanced Analysis**\n📁 ${result.filePath}\n📂 ${category} | ⚡ ${urgency} | 🏷️ ${tags.join(', ') || 'None'} | 🗂️ ${relatedRepositories.join(', ') || 'None'}\n\n🔍 **Results**: Impact: ${advancedAnalysis.projectImpact.toUpperCase()} | Sprint: ${advancedAnalysis.sprintAlignment} | Value: ${advancedAnalysis.strategicValue}/100 | Complexity: ${advancedAnalysis.implementationComplexity} | Timeline: ${advancedAnalysis.timelineSuggestion}${advancedAnalysis.crossServiceImpact.length > 0 ? `\n🔗 **Cross-Service Impact**: ${advancedAnalysis.crossServiceImpact.join(', ')}` : ''}${advancedAnalysis.contextualInsights.length > 0 ? `\n💡 **Insights**: ${advancedAnalysis.contextualInsights.join(' • ')}` : ''}\n`;
        
        // Action Recommendation based on AI Analysis
        const actionMap = {
          'schedule_discussion': `**Schedule Team Discussion** - ${advancedAnalysis.implementationComplexity} complexity requires planning`,
          'add_to_existing': '**Add to Existing Task** - High alignment with current work',
          'create_comprehensive_task': `**Create Comprehensive Task** - Use: \`/loqa task create "${content.substring(0, 50)}..."\``,
          'create_simple_task': `**Create Simple Task** - Use: \`/add-todo "${content.substring(0, 50)}..." --priority=High\``,
          'capture_only': '**Captured for Future Reference** - Available for future planning sessions'
        };
        responseText += `🎯 **Action**: ${actionMap[advancedAnalysis.actionRecommendation as keyof typeof actionMap] || actionMap['capture_only']}\n`;
        
        // Check for existing task matches first, especially for comprehensive thoughts
        if (relatedTasks.length > 0) {
          const bestMatch = relatedTasks[0];
          responseText += `\n\n🎯 **Existing Task Analysis**:\n\n`;
          responseText += `**📋 Best Match**: ${bestMatch.task.title} (${bestMatch.task.repo})\n`;
          responseText += `**🔗 Match Strength**: ${bestMatch.reason}\n`;
          responseText += `**📊 Similarity**: ${bestMatch.similarity}\n\n`;
          
          // For comprehensive thoughts, we're more conservative about recommending merging
          if (bestMatch.similarity > 35) {
            responseText += `**🎯 Strong Match Detected**: This ${category} thought appears to significantly overlap with an existing task.\n\n`;
            responseText += `**💡 Recommendation**: Consider enhancing the existing task with your comprehensive insights rather than creating a duplicate.\n\n`;
            responseText += `**Task Location**: \`${bestMatch.task.repo}/backlog/tasks/${bestMatch.task.taskFile}\`\n\n`;
            responseText += `**Quick Actions**:\n`;
            responseText += `• **Enhance existing**: \`/append-to-task "${bestMatch.task.taskFile}" "${bestMatch.task.repo}" "${content}" --section="Enhanced Analysis"\`\n`;
            responseText += `• **Create related**: Use \`/start-comprehensive-task-creation\` for a complementary task\n`;
            responseText += `• **Create independent**: If truly different, create new task anyway`;
          } else {
            responseText += `**💡 Potential Connection**: Found related work, but your ${category} thought may warrant separate attention.\n\n`;
            if (evaluation.shouldSuggestTask) {
              responseText += `**🎯 Intelligent Assessment**: This ${category} thought has high strategic value!\n\n`;
              responseText += `**Impact Analysis**: ${evaluation.reasoning}\n\n`;
              responseText += `**🚀 Recommended Action**: Create a new comprehensive task with:\n`;
              responseText += `• Template: \`${evaluation.suggestedTemplate}\`\n`;
              responseText += `• Priority: \`${evaluation.suggestedPriority}\`\n`;
              responseText += `• Scope: ${evaluation.scope}\n`;
              responseText += `• Estimated Effort: ${evaluation.estimatedEffort}\n\n`;
              responseText += `**Create task?** Use \`/start-comprehensive-task-creation "${content}"\``;
            }
          }
          
          // Show additional related tasks if they exist
          if (relatedTasks.length > 1) {
            responseText += `\n\n**📋 Other Related Tasks (${relatedTasks.length - 1}):**\n`;
            relatedTasks.slice(1, 4).forEach((task: any, index: number) => {
              responseText += `${index + 2}. ${task.task.title} (${task.task.repo}) - Score: ${task.similarity}\n`;
            });
            if (relatedTasks.length > 4) {
              responseText += `... and ${relatedTasks.length - 4} more`;
            }
          }
        } else if (evaluation.shouldSuggestTask) {
          responseText += `\n\n🎯 **Intelligent Assessment**: This ${category} thought has high strategic value!\n\n**Impact Analysis**: ${evaluation.reasoning}\n\n**🚀 Recommended Action**: Create an active task with:\n• Template: \`${evaluation.suggestedTemplate}\`\n• Priority: \`${evaluation.suggestedPriority}\`\n• Scope: ${evaluation.scope}\n• Estimated Effort: ${evaluation.estimatedEffort}\n\n**Would you like me to create a structured task for this? Reply 'yes' to proceed.**`;
        } else {
          responseText += `\n\n📋 **Status**: Captured as ${urgency} priority. ${evaluation.reasoning}`;
        }
        
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
            text: `❌ Failed to capture comprehensive thought: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "task:ListTemplates": {
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

    case "task:ListTasks": {
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

    case "task:CreateFromThought": {
      const { thoughtContent, suggestedTemplate, suggestedPriority, category, customTitle, additionalContext } = args;
      
      // Use comprehensive creation for complex tasks
      if (suggestedTemplate === 'cross-repo' || suggestedPriority === 'High') {
        return await handleStartComprehensiveTaskCreation({
          initialInput: thoughtContent,
          skipInterview: false
        }, workspaceRoot);
      }
      
      // Simple task creation for straightforward cases
      const title = customTitle || deriveTaskTitle(thoughtContent);
      
      const options: TaskCreationOptions = {
        title,
        template: suggestedTemplate,
        priority: suggestedPriority as "High" | "Medium" | "Low",
        type: mapCategoryToTaskType(category),
        assignee: undefined // Let template handle default assignee
      };

      try {
        const result = await taskManager.createTaskFromTemplate(options);
        
        // If additional context provided, append it to the task file
        if (additionalContext) {
          await appendContextToTask(result.filePath, additionalContext, thoughtContent);
        }
        
        return {
          content: [{
            type: "text",
            text: `🚀 **Task Created from Thought!**\n\n📋 **Task ID**: ${result.taskId}\n📁 **File**: ${result.filePath}\n📝 **Template**: ${suggestedTemplate}\n⭐ **Priority**: ${suggestedPriority}\n📂 **Category**: ${category}\n\n**Original Thought**: "${thoughtContent}"\n\n**Next Steps**: The task is now ready for work and has been added to your active backlog.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `❌ Failed to create task from thought: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "task:StartComprehensiveCreation": {
      return await handleStartComprehensiveTaskCreation(args, workspaceRoot);
    }

    case "task:AnswerInterviewQuestion": {
      return await handleAnswerInterviewQuestion(args, workspaceRoot);
    }

    case "task:ContinueDevelopment": {
      return await handleContinueTaskDevelopment(args, workspaceRoot);
    }

    case "task:AppendToExistingTask": {
      const { taskFile, repository, content, sectionTitle = "Additional Thoughts" } = args;
      
      try {
        // Determine workspace root and task path
        const actualWorkspaceRoot = KNOWN_REPOSITORIES_LIST.includes(basename(workspaceRoot)) 
          ? dirname(workspaceRoot) 
          : workspaceRoot;
        
        const repoPath = join(actualWorkspaceRoot, repository);
        const taskPath = join(repoPath, 'backlog', 'tasks', taskFile);
        
        // Check if task file exists
        const fs = await import('fs/promises');
        await fs.access(taskPath);
        
        // Read current task content
        const currentContent = await fs.readFile(taskPath, 'utf-8');
        
        // Prepare content to append
        const timestamp = new Date().toISOString().split('T')[0];
        const appendContent = `\n\n## ${sectionTitle}\n*Added on ${timestamp}*\n\n${content}\n`;
        
        // Append to task file
        await fs.writeFile(taskPath, currentContent + appendContent, 'utf-8');
        
        // Auto-commit the change
        const taskManager = new LoqaTaskManager(repoPath);
        await taskManager['autoCommitBacklogChange'](taskPath, 'update', `Add ${sectionTitle.toLowerCase()}`, repoPath);
        
        return {
          content: [{
            type: "text",
            text: `✅ **Content Added to Existing Task!**\n\n📋 **Task**: ${taskFile}\n📁 **Repository**: ${repository}\n📝 **Section**: ${sectionTitle}\n📍 **Location**: \`${repository}/backlog/tasks/${taskFile}\`\n\n**Added Content**:\n${content}\n\n**Next Steps**: The task has been updated with your additional thoughts and automatically committed.`
          }]
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes('ENOENT')) {
          return {
            content: [{
              type: "text",
              text: `❌ Task file not found: \`${taskFile}\` in repository \`${repository}\`\n\nPlease check:\n• Task filename is correct\n• Repository name is correct\n• Task exists in \`${repository}/backlog/tasks/\``
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: `❌ Failed to append to task: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "task:ProcessConversationalResponse": {
      const { message, contextHint } = args;
      const contextManager = InterviewContextManager.getInstance();
      
      // Check if there's an active interview
      if (contextManager.isInActiveInterview()) {
        const interviewId = contextManager.getActiveInterviewId()!;
        
        // Detect if this message is likely an interview response
        if (contextManager.isLikelyInterviewResponse(message)) {
          // Process the response seamlessly
          return await processInterviewAnswerSeamlessly(interviewId, message, workspaceRoot);
        }
      }
      
      // Not an interview response, return helpful message
      return {
        content: [{
          type: "text",
          text: `📝 **Message received**: "${message}"\n\n${contextManager.isInActiveInterview() 
            ? `💡 **Active Interview**: You're in an interview but your message doesn't look like an answer. The current question is:\n\n"${contextManager.getLastQuestion()}"\n\nPlease provide your answer, or use \`/loqa task resume\` to see available interviews.`
            : '💡 **No Active Interview**: Your message was received but there\'s no active interview. Use \`/loqa task create "description"\` to start a new task creation process.'}`
        }]
      };
    }

    default:
      throw new Error(`Unknown task management tool: ${name}`);
  }
}

/**
 * Export for seamless interview processing
 */
export { processInterviewAnswerSeamlessly, InterviewContextManager };