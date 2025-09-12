import { join } from 'path';
import { randomUUID } from 'crypto';
import { LoqaTaskManager } from '../managers/index.js';
import { TaskCreationOptions, TaskInterviewState, TaskBreakdownSuggestion } from '../types/index.js';
import { KNOWN_REPOSITORIES_LIST } from '../config/repositories.js';
import { TaskInterviewStorage } from '../utils/task-interview-storage.js';
import { InterviewContextManager } from '../utils/interview-context-manager.js';

/**
 * Assessment and Analysis Functions
 */

export function assessImplementationComplexity(
  content: string,
  category: string
): 'trivial' | 'simple' | 'moderate' | 'complex' | 'architectural' {
  const contentLower = content.toLowerCase();
  
  // Architectural complexity
  if (contentLower.includes('architecture') ||
      contentLower.includes('refactor entire') ||
      contentLower.includes('breaking change') ||
      category === 'architecture') {
    return 'architectural';
  }
  
  // Complex implementation
  if (contentLower.includes('integration') ||
      contentLower.includes('multiple services') ||
      contentLower.includes('database changes') ||
      contentLower.includes('protocol change')) {
    return 'complex';
  }
  
  // Moderate implementation
  if (contentLower.includes('new feature') ||
      contentLower.includes('api changes') ||
      contentLower.includes('performance optimization')) {
    return 'moderate';
  }
  
  // Simple implementation
  if (contentLower.includes('config') ||
      contentLower.includes('small change') ||
      contentLower.includes('ui tweak')) {
    return 'simple';
  }
  
  return 'trivial';
}

export function identifyCrossServiceImpact(content: string): string[] {
  const contentLower = content.toLowerCase();
  const impactedServices: string[] = [];
  
  if (contentLower.includes('hub') || contentLower.includes('core') || contentLower.includes('stt') || contentLower.includes('tts')) {
    impactedServices.push('loqa-hub');
  }
  if (contentLower.includes('ui') || contentLower.includes('dashboard') || contentLower.includes('commander')) {
    impactedServices.push('loqa-commander');
  }
  if (contentLower.includes('relay') || contentLower.includes('audio') || contentLower.includes('capture')) {
    impactedServices.push('loqa-relay');
  }
  if (contentLower.includes('skill') || contentLower.includes('plugin')) {
    impactedServices.push('loqa-skills');
  }
  if (contentLower.includes('protocol') || contentLower.includes('grpc') || contentLower.includes('api')) {
    impactedServices.push('loqa-proto');
  }
  
  return [...new Set(impactedServices)];
}

export function generateTimelineSuggestion(
  content: string,
  category: string,
  urgency: string
): string {
  const complexity = assessImplementationComplexity(content, category);
  
  const timelineMap: { [key: string]: string } = {
    'trivial': 'Can be completed in 1-2 hours',
    'simple': 'Estimated 2-4 hours of focused work',
    'moderate': 'Plan for 1-2 days of development',
    'complex': 'Requires 3-5 days with proper testing',
    'architectural': 'Major effort: 1-2 weeks with coordination'
  };
  
  let suggestion = timelineMap[complexity];
  
  if (urgency === 'immediate') {
    suggestion += ' - Consider prioritizing in current sprint';
  } else if (urgency === 'next-sprint') {
    suggestion += ' - Good candidate for next sprint planning';
  } else if (urgency === 'backlog') {
    suggestion += ' - Add to backlog for future consideration';
  }
  
  return suggestion;
}

export function generateContextualInsights(
  content: string,
  category: string,
  activeTasks: any[]
): string[] {
  const insights: string[] = [];
  const contentLower = content.toLowerCase();
  
  // Cross-task relationship insights
  const relatedTasks = activeTasks.filter(task => 
    contentLower.split(' ').some(word => 
      word.length > 4 && task.content?.toLowerCase().includes(word)
    )
  );
  
  if (relatedTasks.length > 0) {
    insights.push(`Relates to ${relatedTasks.length} active task(s) - consider coordination`);
  }
  
  // Architecture insights
  if (contentLower.includes('microservice') || contentLower.includes('distributed')) {
    insights.push('Microservice architecture consideration - may require cross-service coordination');
  }
  
  // Performance insights
  if (contentLower.includes('performance') || contentLower.includes('optimization')) {
    insights.push('Performance optimization - measure before/after impact');
  }
  
  // User experience insights
  if (contentLower.includes('user') || contentLower.includes('ux')) {
    insights.push('User-facing change - consider UX impact and testing');
  }
  
  // Technical debt insights
  if (category === 'technical-debt') {
    insights.push('Technical debt item - balance immediate value vs. long-term maintainability');
  }
  
  return insights;
}

export function determineActionRecommendation(
  content: string,
  category: string,
  urgency: string,
  activeTasks: any[]
): 'capture_only' | 'add_to_existing' | 'create_simple_task' | 'create_comprehensive_task' | 'schedule_discussion' {
  const complexity = assessImplementationComplexity(content, category);
  
  // Helper function to assess project impact (simplified version)
  const assessProjectImpact = (content: string, category: string): 'low' | 'medium' | 'high' | 'critical' => {
    if (category === 'architecture' || content.toLowerCase().includes('breaking')) return 'critical';
    if (content.toLowerCase().includes('multiple') || content.toLowerCase().includes('integration')) return 'high';
    if (category === 'feature-idea' || category === 'technical-debt') return 'medium';
    return 'low';
  };
  
  const impact = assessProjectImpact(content, category);
  
  // Schedule discussion for architectural or critical items
  if (complexity === 'architectural' || impact === 'critical') {
    return 'schedule_discussion';
  }
  
  // Add to existing task if high alignment
  const relatedTasks = activeTasks.filter(task => 
    content.toLowerCase().split(' ').some(word => 
      word.length > 4 && task.content?.toLowerCase().includes(word)
    )
  );
  
  if (relatedTasks.length >= 2 && urgency !== 'future') {
    return 'add_to_existing';
  }
  
  // Create comprehensive task for complex items with high impact
  if ((complexity === 'complex' || impact === 'high') && urgency !== 'future') {
    return 'create_comprehensive_task';
  }
  
  // Create simple task for moderate complexity with immediate urgency
  if (complexity === 'moderate' && urgency === 'immediate') {
    return 'create_simple_task';
  }
  
  // Just capture for future reference
  return 'capture_only';
}

/**
 * Thought Processing Functions
 */

export function detectThoughtCategory(content: string, tags: string[]): string {
  const contentLower = content.toLowerCase();
  
  // Check explicit category tags first
  const categoryTags = ['architecture', 'feature-idea', 'technical-debt', 'process-improvement', 'research-topic', 'bug-insight', 'optimization'];
  for (const tag of tags) {
    if (categoryTags.includes(tag)) return tag;
  }
  
  // Content-based detection
  if (contentLower.includes('architecture') || contentLower.includes('system design') || contentLower.includes('microservice')) {
    return 'architecture';
  }
  if (contentLower.includes('bug') || contentLower.includes('error') || contentLower.includes('issue')) {
    return 'bug-insight';
  }
  if (contentLower.includes('debt') || contentLower.includes('refactor') || contentLower.includes('cleanup')) {
    return 'technical-debt';
  }
  if (contentLower.includes('performance') || contentLower.includes('optimize') || contentLower.includes('faster')) {
    return 'optimization';
  }
  if (contentLower.includes('feature') || contentLower.includes('new') || contentLower.includes('add')) {
    return 'feature-idea';
  }
  if (contentLower.includes('process') || contentLower.includes('workflow') || contentLower.includes('improve')) {
    return 'process-improvement';
  }
  if (contentLower.includes('research') || contentLower.includes('investigate') || contentLower.includes('explore')) {
    return 'research-topic';
  }
  
  return 'feature-idea'; // Default category
}

export function estimateThoughtUrgency(content: string): string {
  const contentLower = content.toLowerCase();
  
  // Immediate urgency indicators
  if (contentLower.includes('urgent') || contentLower.includes('asap') || contentLower.includes('critical') || contentLower.includes('breaking')) {
    return 'immediate';
  }
  
  // Next sprint indicators
  if (contentLower.includes('soon') || contentLower.includes('next') || contentLower.includes('priority')) {
    return 'next-sprint';
  }
  
  // Future indicators
  if (contentLower.includes('someday') || contentLower.includes('eventually') || contentLower.includes('maybe')) {
    return 'future';
  }
  
  return 'backlog'; // Default urgency
}

export function determineCategory(analysis: any): string {
  if (analysis.hasArchitecturalImplications) return 'architecture';
  if (analysis.hasUrgencyIndicators) return 'urgent';
  if (analysis.hasImplementationDetails) return 'feature';
  return 'general';
}

export function mapCategoryToTemplate(category: string, isMultiRepo: boolean): string {
  if (isMultiRepo) return 'cross-repo';
  
  const categoryMap: { [key: string]: string } = {
    'architecture': 'feature',
    'feature-idea': 'feature',
    'bug-insight': 'bug-fix',
    'technical-debt': 'bug-fix',
    'process-improvement': 'general'
  };
  
  return categoryMap[category] || 'general';
}

export function estimateEffortFromScope(repositories: string[], category: string): string {
  if (repositories.length > 2) return 'weeks';
  if (repositories.length > 1) return 'days-weeks';
  if (category === 'architecture') return 'days';
  return 'hours-days';
}

/**
 * Task Creation Helper Functions
 */

export function deriveTaskTitle(thoughtContent: string): string {
  // Extract first sentence or first 60 characters
  const firstSentence = thoughtContent.split(/[.!?]/)[0].trim();
  let title = firstSentence.length > 0 ? firstSentence : thoughtContent;
  
  // Truncate if too long
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  return title;
}

export function mapCategoryToTaskType(category: string): "Feature" | "Bug Fix" | "Improvement" | "Documentation" {
  const categoryToTypeMap: { [key: string]: "Feature" | "Bug Fix" | "Improvement" | "Documentation" } = {
    'architecture': 'Improvement', // Map architecture to Improvement instead of Refactoring
    'feature': 'Feature', 
    'feature-idea': 'Feature',
    'urgent': 'Bug Fix',
    'bug-insight': 'Bug Fix',
    'technical-debt': 'Improvement', // Map technical debt to Improvement
    'process-improvement': 'Improvement',
    'optimization': 'Improvement',
    'research-topic': 'Documentation',
    'general': 'Improvement'
  };
  
  return categoryToTypeMap[category] || 'Improvement';
}

export async function appendContextToTask(filePath: string, additionalContext: string, originalThought: string): Promise<void> {
  try {
    const fs = await import('fs/promises');
    
    // Read current task file content
    const currentContent = await fs.readFile(filePath, 'utf-8');
    
    // Append the additional context section
    const appendContent = `\n\n## Original Thought\n\n${originalThought}\n\n## Additional Context\n\n${additionalContext}\n`;
    
    // Write back with appended content
    await fs.writeFile(filePath, currentContent + appendContent, 'utf-8');
  } catch (error) {
    console.warn(`Failed to append context to task file: ${error}`);
    // Non-critical error - task was created successfully
  }
}

/**
 * Interview Handler Functions
 */

export async function handleStartComprehensiveTaskCreation(args: any, workspaceRoot: string): Promise<any> {
  const { initialInput, skipInterview = false } = args;
  const storage = new TaskInterviewStorage(workspaceRoot);
  
  try {
    // Clean up old interviews/drafts
    await storage.cleanup();
    
    // If skip interview requested, try direct creation
    if (skipInterview) {
      const directResult = await attemptDirectTaskCreation(initialInput, workspaceRoot);
      if (directResult.success) {
        return {
          content: [{
            type: "text",
            text: directResult.message
          }]
        };
      }
    }
    
    // Start comprehensive interview process
    const interview = await TaskCreationInterviewer.startInterview(initialInput, workspaceRoot, storage);
    
    // Set active interview context for seamless conversation
    const contextManager = InterviewContextManager.getInstance();
    contextManager.setActiveInterview(interview.id, interview.currentQuestion);
    
    return {
      content: [{
        type: "text",
        text: `🎯 **Starting Comprehensive Task Creation**\n\n**Original Input**: "${initialInput}"\n\n**First Question**: ${interview.currentQuestion}\n\n*Just reply with your answer - no need for special commands.*`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to start task creation: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

export async function processInterviewAnswerSeamlessly(interviewId: string, answer: string, workspaceRoot: string): Promise<any> {
  const storage = new TaskInterviewStorage(workspaceRoot);
  const contextManager = InterviewContextManager.getInstance();
  
  try {
    const interview = await TaskCreationInterviewer.processAnswer(interviewId, answer, storage);
    
    if (!interview) {
      contextManager.clearActiveInterview();
      return {
        content: [{
          type: "text",
          text: `❌ Interview not found. It may have expired or been completed.`
        }]
      };
    }
    
    if (interview.interviewComplete) {
      // Create the final task(s)
      const creationResult = await createTasksFromInterview(interview, workspaceRoot);
      
      // Clean up completed interview
      await storage.deleteInterview(interviewId);
      contextManager.clearActiveInterview();
      
      return {
        content: [{
          type: "text",
          text: `✅ **Task Created Successfully!**\n\n${creationResult.message}`
        }]
      };
    } else {
      // Continue with next question seamlessly
      contextManager.updateLastQuestion(interview.currentQuestion);
      return {
        content: [{
          type: "text",
          text: `📝 **Answer recorded.**\n\n**Next Question**: ${interview.currentQuestion}`
        }]
      };
    }
  } catch (error) {
    contextManager.clearActiveInterview();
    return {
      content: [{
        type: "text",
        text: `❌ Failed to process answer: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

export async function handleAnswerInterviewQuestion(args: any, workspaceRoot: string): Promise<any> {
  const { interviewId, answer } = args;
  const storage = new TaskInterviewStorage(workspaceRoot);
  
  try {
    const interview = await TaskCreationInterviewer.processAnswer(interviewId, answer, storage);
    
    if (!interview) {
      return {
        content: [{
          type: "text",
          text: `❌ Interview not found. It may have expired or been completed. Use \`/continue-task-development\` to see available drafts.`
        }]
      };
    }
    
    if (interview.interviewComplete) {
      // Create the final task(s)
      const creationResult = await createTasksFromInterview(interview, workspaceRoot);
      
      // Clean up completed interview
      await storage.deleteInterview(interviewId);
      
      return {
        content: [{
          type: "text",
          text: creationResult.message
        }]
      };
    } else {
      // Continue with next question and update context
      const contextManager = InterviewContextManager.getInstance();
      contextManager.updateLastQuestion(interview.currentQuestion);
      
      return {
        content: [{
          type: "text",
          text: `📝 **Answer recorded.**\n\n**Next Question**: ${interview.currentQuestion}`
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to process answer: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

export async function handleContinueTaskDevelopment(args: any, workspaceRoot: string): Promise<any> {
  const { draftId } = args;
  const storage = new TaskInterviewStorage(workspaceRoot);
  
  try {
    if (draftId) {
      // Resume specific draft
      const resumedInterview = await storage.resumeDraftAsInterview(draftId);
      
      if (!resumedInterview) {
        return {
          content: [{
            type: "text",
            text: `❌ Draft not found: ${draftId}`
          }]
        };
      }
      
      return {
        content: [{
          type: "text",
          text: `🔄 **Resumed Draft Task**\n\n**Title**: ${resumedInterview.accumulatedInfo?.title || 'Untitled'}\n**Interview ID**: \`${resumedInterview.id}\`\n\n**Current Question**: ${resumedInterview.currentQuestion}\n\nPlease use \`/answer-task-interview-question ${resumedInterview.id} "your answer"\` to continue.`
        }]
      };
    } else {
      // List available drafts and active interviews
      const [drafts, activeInterviews] = await Promise.all([
        storage.listDrafts(),
        storage.listActiveInterviews()
      ]);
      
      let response = `📋 **Task Development Status**\n\n`;
      
      if (activeInterviews.length > 0) {
        response += `**🔄 Active Interviews (${activeInterviews.length}):**\n`;
        activeInterviews.forEach(interview => {
          response += `• **${interview.title}** (\`${interview.id}\`) - ${interview.currentQuestion.substring(0, 60)}...\n`;
        });
        response += `\nUse \`/answer-task-interview-question <id> "your answer"\` to continue.\n\n`;
      }
      
      if (drafts.length > 0) {
        response += `**📝 Available Drafts (${drafts.length}):**\n`;
        drafts.forEach(draft => {
          const timeAgo = formatTimeAgo(draft.timestamp);
          response += `• **${draft.title}** (\`${draft.id}\`) - ${draft.originalInput.substring(0, 40)}... (${timeAgo})\n`;
        });
        response += `\nUse \`/continue-task-development <draft-id>\` to resume.\n`;
      } else {
        response += `**No drafts or active interviews found.**\n\nUse \`/start-comprehensive-task-creation "your task idea"\` to begin.`;
      }
      
      return {
        content: [{
          type: "text",
          text: response
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to handle task development: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

export async function attemptDirectTaskCreation(input: string, workspaceRoot: string): Promise<{ success: boolean; message: string }> {
  // Simple heuristics to determine if we can create directly
  const complexity = analyzeInitialComplexity(input);
  const hasSpecificDetails = input.length > 100 && (input.includes('acceptance') || input.includes('criteria'));
  
  if (complexity === 'low' && hasSpecificDetails) {
    // Try to create directly
    const taskManager = new LoqaTaskManager(workspaceRoot);
    
    try {
      const options: TaskCreationOptions = {
        title: deriveTaskTitle(input),
        template: 'general',
        priority: 'Medium',
        type: 'Improvement'
      };
      
      const result = await taskManager.createTaskFromTemplate(options);
      
      return {
        success: true,
        message: `✅ **Task Created Directly**\n\n📋 **Task ID**: ${result.taskId}\n📁 **File**: ${result.filePath}\n\n**Next Steps**: Task is ready for work!`
      };
    } catch (error) {
      return { success: false, message: '' };
    }
  }
  
  return { success: false, message: '' };
}

export async function createTasksFromInterview(interview: TaskInterviewState, workspaceRoot: string): Promise<{ message: string }> {
  const taskManager = new LoqaTaskManager(workspaceRoot);
  const info = interview.accumulatedInfo;
  
  try {
    if (info.suggestedBreakdown && info.suggestedBreakdown.length > 1) {
      // Create multiple tasks from breakdown
      const createdTasks = [];
      
      for (const subtask of info.suggestedBreakdown) {
        const repoTaskManager = new LoqaTaskManager(join(workspaceRoot, '..', subtask.repository));
        
        const options: TaskCreationOptions = {
          title: subtask.title,
          template: determineTemplateFromBreakdown(subtask),
          priority: 'Medium', // TODO: derive from interview
          type: 'Feature' // TODO: derive from interview
        };
        
        const result = await repoTaskManager.createTaskFromTemplate(options);
        createdTasks.push({ ...result, repository: subtask.repository });
      }
      
      let message = `🎉 **Task Breakdown Complete!**\n\n**Created ${createdTasks.length} Tasks:**\n\n`;
      createdTasks.forEach(task => {
        message += `• **${task.repository}**: ${task.taskId}\n`;
      });
      message += `\n**Next Steps**: All tasks are ready for work!`;
      
      return { message };
    } else {
      // Create single comprehensive task
      const repos = info.repositories || ['loqa'];
      const primaryRepo = repos[0];
      const primaryTaskManager = new LoqaTaskManager(join(workspaceRoot, '..', primaryRepo));
      
      const options: TaskCreationOptions = {
        title: info.title || 'New Task',
        template: repos.length > 1 ? 'cross-repo' : 'feature',
        priority: 'Medium', // TODO: derive from complexity/urgency
        type: 'Feature'
      };
      
      const result = await primaryTaskManager.createTaskFromTemplate(options);
      
      // Append comprehensive details to task file
      const additionalContent = buildComprehensiveTaskContent(interview);
      if (additionalContent) {
        await appendContextToTask(result.filePath, additionalContent, interview.originalInput);
      }
      
      return {
        message: `🎉 **Comprehensive Task Created!**\n\n📋 **Task ID**: ${result.taskId}\n📁 **File**: ${result.filePath}\n🏢 **Repository**: ${primaryRepo}\n\n**Next Steps**: Task is fully scoped and ready for work!`
      };
    }
  } catch (error) {
    return {
      message: `❌ Failed to create final task(s): ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export function buildComprehensiveTaskContent(interview: TaskInterviewState): string {
  const info = interview.accumulatedInfo;
  let content = '';
  
  if (info.description) {
    content += `## Detailed Description\n\n${info.description}\n\n`;
  }
  
  if (info.acceptanceCriteria?.length) {
    content += `## Acceptance Criteria\n\n`;
    info.acceptanceCriteria.forEach((criteria, index) => {
      content += `${index + 1}. ${criteria}\n`;
    });
    content += '\n';
  }
  
  if (info.dependencies?.length) {
    content += `## Dependencies\n\n`;
    info.dependencies.forEach(dep => {
      content += `- ${dep}\n`;
    });
    content += '\n';
  }
  
  if (info.repositories?.length && info.repositories.length > 1) {
    content += `## Affected Repositories\n\n`;
    info.repositories.forEach(repo => {
      content += `- ${repo}\n`;
    });
    content += '\n';
  }
  
  return content;
}

export function determineTemplateFromBreakdown(subtask: TaskBreakdownSuggestion): string {
  if (subtask.title.toLowerCase().includes('design') || subtask.title.toLowerCase().includes('planning')) {
    return 'general';
  }
  if (subtask.title.toLowerCase().includes('test')) {
    return 'bug-fix';
  }
  return 'feature';
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return 'recently';
  }
}

/**
 * Enhanced Task Creation Interviewer with persistent storage
 */
export class TaskCreationInterviewer {
  private static readonly INTERVIEW_QUESTIONS = [
    {
      id: 'scope',
      question: "What specific problem does this task solve? Please describe the current state and desired end state.",
      followUp: "Are there any edge cases or special scenarios to consider?"
    },
    {
      id: 'acceptance',
      question: "How will we know this task is complete? What are the specific acceptance criteria?",
      followUp: "What should NOT be included in this task scope?"
    },
    {
      id: 'technical',
      question: "Are there any technical requirements, constraints, or architectural considerations?",
      followUp: "Which files, services, or components will need to be modified?"
    },
    {
      id: 'dependencies',
      question: "Does this task depend on other work being completed first? Any blockers or prerequisites?",
      followUp: "Will this task block or enable other planned work?"
    },
    {
      id: 'complexity',
      question: "How complex do you estimate this task to be? Does it need to be broken down into smaller tasks?",
      followUp: "What's the riskiest or most uncertain part of this work?"
    }
  ];

  static async startInterview(initialInput: string, workspaceRoot: string, storage: TaskInterviewStorage): Promise<TaskInterviewState> {
    const interviewId = randomUUID();
    
    // Analyze initial input for repository suggestions
    const suggestedRepos = await analyzeRepositoryRequirements(initialInput);
    const complexity = analyzeInitialComplexity(initialInput);
    
    const interview: TaskInterviewState = {
      id: interviewId,
      originalInput: initialInput,
      currentQuestion: this.INTERVIEW_QUESTIONS[0].question,
      questionsAsked: [this.INTERVIEW_QUESTIONS[0].question],
      answersReceived: [],
      accumulatedInfo: {
        title: deriveTaskTitle(initialInput),
        repositories: suggestedRepos,
        estimatedComplexity: complexity
      },
      interviewComplete: false,
      timestamp: new Date()
    };
    
    await storage.saveInterview(interview);
    return interview;
  }

  static async processAnswer(interviewId: string, answer: string, storage: TaskInterviewStorage): Promise<TaskInterviewState | null> {
    const interview = await storage.loadInterview(interviewId);
    if (!interview) return null;

    // Record the answer
    const currentQuestionIndex = interview.questionsAsked.length - 1;
    const currentQuestionId = this.INTERVIEW_QUESTIONS[currentQuestionIndex]?.id;
    
    interview.answersReceived.push({
      question: interview.currentQuestion,
      answer
    });

    // Process answer based on question type
    await this.processAnswerByType(interview, currentQuestionId, answer);

    // Determine next question or completion
    const nextQuestionIndex = interview.questionsAsked.length;
    
    if (nextQuestionIndex < this.INTERVIEW_QUESTIONS.length) {
      // Ask next question
      const nextQuestion = this.INTERVIEW_QUESTIONS[nextQuestionIndex];
      interview.currentQuestion = nextQuestion.question;
      interview.questionsAsked.push(nextQuestion.question);
    } else {
      // Interview complete, analyze and finalize
      interview.interviewComplete = true;
      await this.finalizeInterview(interview);
    }

    await storage.saveInterview(interview);
    return interview;
  }

  private static async processAnswerByType(interview: TaskInterviewState, questionId: string | undefined, answer: string): Promise<void> {
    switch (questionId) {
      case 'scope':
        interview.accumulatedInfo.description = answer;
        break;
      case 'acceptance':
        interview.accumulatedInfo.acceptanceCriteria = answer.split('\n').filter(line => line.trim());
        break;
      case 'technical':
        // Re-analyze repositories based on technical details
        const additionalRepos = await analyzeRepositoryRequirements(answer);
        interview.accumulatedInfo.repositories = [
          ...new Set([...(interview.accumulatedInfo.repositories || []), ...additionalRepos])
        ];
        break;
      case 'dependencies':
        interview.accumulatedInfo.dependencies = answer.split('\n').filter(line => line.trim());
        break;
      case 'complexity':
        // Re-assess complexity and suggest breakdown if needed
        const complexityAssessment = analyzeComplexityFromAnswer(answer);
        interview.accumulatedInfo.estimatedComplexity = complexityAssessment.complexity;
        if (complexityAssessment.needsBreakdown) {
          interview.accumulatedInfo.suggestedBreakdown = await suggestTaskBreakdown(interview);
        }
        break;
    }
  }

  private static async finalizeInterview(interview: TaskInterviewState): Promise<void> {
    // Final validation and optimization
    if (!interview.accumulatedInfo.repositories?.length) {
      interview.accumulatedInfo.repositories = ['loqa']; // Default to main repo
    }
    
    // Ensure we have minimum viable task definition
    if (!interview.accumulatedInfo.description || !interview.accumulatedInfo.acceptanceCriteria?.length) {
      // Mark as incomplete - should save as draft
      interview.interviewComplete = false;
      interview.currentQuestion = "This task needs more definition. Can you provide more details about what specifically needs to be accomplished and how we'll know it's done?";
      interview.questionsAsked.push(interview.currentQuestion);
    }
  }
}

export async function analyzeRepositoryRequirements(text: string): Promise<string[]> {
  const textLower = text.toLowerCase();
  const repos: string[] = [];
  
  // Direct mentions
  KNOWN_REPOSITORIES_LIST.forEach(repo => {
    if (textLower.includes(repo.toLowerCase())) {
      repos.push(repo);
    }
  });
  
  // Technology-based inference
  if (textLower.includes('ui') || textLower.includes('dashboard') || textLower.includes('vue')) {
    repos.push('loqa-commander');
  }
  if (textLower.includes('grpc') || textLower.includes('proto')) {
    repos.push('loqa-proto');
  }
  if (textLower.includes('skill') || textLower.includes('plugin')) {
    repos.push('loqa-skills');
  }
  if (textLower.includes('hub') || textLower.includes('stt') || textLower.includes('tts') || textLower.includes('llm')) {
    repos.push('loqa-hub');
  }
  
  return [...new Set(repos)];
}

export function analyzeInitialComplexity(text: string): 'low' | 'medium' | 'high' {
  const indicators = {
    high: ['system', 'architecture', 'refactor', 'migration', 'breaking', 'multiple', 'across'],
    medium: ['feature', 'implement', 'integration', 'api', 'database'],
    low: ['fix', 'update', 'small', 'simple', 'quick']
  };
  
  const textLower = text.toLowerCase();
  
  if (indicators.high.some(indicator => textLower.includes(indicator))) return 'high';
  if (indicators.medium.some(indicator => textLower.includes(indicator))) return 'medium';
  return 'low';
}

export function analyzeComplexityFromAnswer(answer: string): { complexity: 'low' | 'medium' | 'high', needsBreakdown: boolean } {
  const answerLower = answer.toLowerCase();
  
  const complexityKeywords = {
    high: ['very complex', 'multiple weeks', 'architectural', 'breaking changes', 'risky'],
    medium: ['moderately complex', 'few days', 'some risk', 'multiple files'],
    low: ['simple', 'straightforward', 'quick', 'few hours']
  };
  
  let complexity: 'low' | 'medium' | 'high' = 'medium';
  
  if (complexityKeywords.high.some(kw => answerLower.includes(kw))) {
    complexity = 'high';
  } else if (complexityKeywords.low.some(kw => answerLower.includes(kw))) {
    complexity = 'low';
  }
  
  const needsBreakdown = complexity === 'high' || 
                        answerLower.includes('break') || 
                        answerLower.includes('multiple') ||
                        answerLower.includes('phases');
  
  return { complexity, needsBreakdown };
}

export async function suggestTaskBreakdown(interview: TaskInterviewState): Promise<TaskBreakdownSuggestion[]> {
  const breakdown: TaskBreakdownSuggestion[] = [];
  const repos = interview.accumulatedInfo.repositories || ['loqa'];
  const description = interview.accumulatedInfo.description || '';
  
  // Simple breakdown logic - in practice this could be more sophisticated
  if (repos.length > 1) {
    // Multi-repo task - suggest one task per repo
    repos.forEach(repo => {
      breakdown.push({
        title: `${interview.accumulatedInfo.title} - ${repo} changes`,
        description: `Implement ${repo}-specific changes for: ${description}`,
        repository: repo,
        estimatedEffort: 'days'
      });
    });
  } else if (interview.accumulatedInfo.estimatedComplexity === 'high') {
    // Complex single-repo task - suggest phases
    breakdown.push(
      {
        title: `${interview.accumulatedInfo.title} - Planning & Design`,
        description: `Design and plan the implementation approach for: ${description}`,
        repository: repos[0],
        estimatedEffort: 'hours'
      },
      {
        title: `${interview.accumulatedInfo.title} - Core Implementation`,
        description: `Implement core functionality: ${description}`,
        repository: repos[0],
        estimatedEffort: 'days',
        dependencies: ['Planning & Design']
      },
      {
        title: `${interview.accumulatedInfo.title} - Testing & Validation`,
        description: `Test and validate implementation: ${description}`,
        repository: repos[0],
        estimatedEffort: 'hours',
        dependencies: ['Core Implementation']
      }
    );
  }
  
  return breakdown;
}