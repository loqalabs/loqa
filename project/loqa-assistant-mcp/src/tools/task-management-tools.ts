import { LoqaTaskManager } from '../managers/index.js';
import { basename, dirname, join } from 'path';
import { TaskCreationOptions, CapturedThought, TaskInterviewState, TaskBreakdownSuggestion, ComprehensiveTaskCreationOptions } from '../types/index.js';
import { resolveWorkspaceRoot } from '../utils/workspace-resolver.js';
import { KNOWN_REPOSITORIES_LIST } from '../config/repositories.js';
import { TaskInterviewStorage } from '../utils/task-interview-storage.js';
import { randomUUID } from 'crypto';

interface ThoughtEvaluation {
  shouldSuggestTask: boolean;
  reasoning: string;
  suggestedTemplate: string;
  suggestedPriority: string;
  category: string;
  scope?: string;
  estimatedEffort?: string;
}

/**
 * Dynamically evaluates a thought/idea against current project state
 * Analyzes existing tasks, recent activity, and project context to determine priority
 */
async function evaluateThoughtPriority(
  content: string, 
  tags: string[] = [], 
  context?: string,
  workspaceRoot?: string
): Promise<ThoughtEvaluation> {
  try {
    // Get current project state
    const projectState = await analyzeCurrentProjectState(workspaceRoot);
    
    // Analyze thought content for patterns and keywords
    const thoughtAnalysis = analyzeThoughtContent(content, tags, context);
    
    // Cross-reference with current priorities and gaps
    const priorityAssessment = assessPriorityAgainstCurrentState(thoughtAnalysis, projectState);
    
    return priorityAssessment;
  } catch (error) {
    // Fallback to basic evaluation if dynamic analysis fails
    return {
      shouldSuggestTask: false,
      reasoning: 'Unable to analyze against current project state. Captured for later review.',
      suggestedTemplate: 'general',
      suggestedPriority: 'Medium',
      category: 'general'
    };
  }
}

/**
 * Enhanced evaluation for comprehensive thoughts with full context
 */
async function evaluateComprehensiveThought(
  content: string,
  category: string,
  urgency: string,
  relatedRepositories: string[],
  workspaceRoot?: string
): Promise<ThoughtEvaluation> {
  try {
    const projectState = await analyzeCurrentProjectState(workspaceRoot);
    const thoughtAnalysis = {
      ...analyzeThoughtContent(content, [category, urgency], ''),
      category,
      urgency,
      relatedRepositories
    };
    
    const assessment = assessPriorityAgainstCurrentState(thoughtAnalysis, projectState);
    
    // Enhanced reasoning for comprehensive thoughts
    assessment.scope = relatedRepositories.length > 1 ? 'Multi-repository' : `Single repository (${relatedRepositories.join(', ')})`;
    assessment.estimatedEffort = estimateEffortFromScope(relatedRepositories, category);
    
    return assessment;
  } catch (error) {
    return {
      shouldSuggestTask: urgency === 'immediate' || urgency === 'next-sprint',
      reasoning: `${category} with ${urgency} urgency. Dynamic analysis unavailable, using category-based assessment.`,
      suggestedTemplate: mapCategoryToTemplate(category, relatedRepositories.length > 1),
      suggestedPriority: urgency === 'immediate' ? 'High' : 'Medium',
      category
    };
  }
}

/**
 * Analyzes current project state by examining tasks, activity, and priorities
 */
async function analyzeCurrentProjectState(workspaceRoot?: string) {
  const actualWorkspaceRoot = workspaceRoot || process.cwd();
  const state = {
    activeTasks: [] as any[],
    recentActivity: [] as string[],
    priorityAreas: [] as string[],
    gaps: [] as string[],
    overloadedAreas: [] as string[]
  };
  
  try {
    // Analyze each repository's backlog
    for (const repoName of KNOWN_REPOSITORIES_LIST) {
      try {
        const repoPath = join(actualWorkspaceRoot, repoName);
        const taskManager = new LoqaTaskManager(repoPath);
        const result = await taskManager.listTasks();
        
        // Collect active tasks and identify patterns
        state.activeTasks.push(...result.tasks.map(task => ({ task, repo: repoName })));
        
        // Identify priority areas from task titles and patterns
        result.tasks.forEach(task => {
          const taskLower = task.toLowerCase();
          if (taskLower.includes('critical') || taskLower.includes('urgent')) {
            state.priorityAreas.push(...extractKeywords(task));
          }
        });
        
        // Identify overloaded areas (too many tasks)
        if (result.tasks.length > 8) {
          state.overloadedAreas.push(repoName);
        }
        
        // Identify gaps (repositories with few or no tasks)
        if (result.tasks.length < 2) {
          state.gaps.push(repoName);
        }
      } catch (error) {
        // Repository might not exist or have backlog - continue
        continue;
      }
    }
  } catch (error) {
    console.warn('Failed to analyze project state:', error);
  }
  
  return state;
}

/**
 * Extracts key information from thought content
 */
function analyzeThoughtContent(content: string, tags: string[], context?: string) {
  const allText = `${content} ${tags.join(' ')} ${context || ''}`.toLowerCase();
  
  return {
    keywords: extractKeywords(allText),
    hasUrgencyIndicators: /\b(urgent|critical|asap|immediately|broken|failing|blocker)\b/.test(allText),
    hasImplementationDetails: /\b(implement|code|develop|build|create|add)\b/.test(allText),
    hasArchitecturalImplications: /\b(architecture|design|structure|system|refactor)\b/.test(allText),
    mentionsSpecificTech: extractTechMentions(allText),
    complexity: estimateComplexity(allText)
  };
}

/**
 * Assesses priority by comparing thought against current project state
 */
function assessPriorityAgainstCurrentState(thoughtAnalysis: any, projectState: any): ThoughtEvaluation {
  let score = 0;
  let reasoning = [];
  let suggestedTemplate = 'general';
  let suggestedPriority = 'Low';
  
  // Check if thought addresses current priority areas
  const addressesPriorities = thoughtAnalysis.keywords.some((keyword: string) => 
    projectState.priorityAreas.some((priority: string) => priority.includes(keyword))
  );
  
  if (addressesPriorities) {
    score += 3;
    reasoning.push('addresses current priority areas');
    suggestedPriority = 'High';
  }
  
  // Check if thought fills identified gaps
  const fillsGaps = projectState.gaps.some((gap: string) => 
    thoughtAnalysis.keywords.some((keyword: string) => gap.toLowerCase().includes(keyword))
  );
  
  if (fillsGaps) {
    score += 2;
    reasoning.push('addresses underserved areas');
    suggestedTemplate = 'feature';
  }
  
  // Avoid overloaded areas unless urgent
  const targetsOverloadedArea = projectState.overloadedAreas.some((area: string) =>
    thoughtAnalysis.keywords.some((keyword: string) => area.toLowerCase().includes(keyword))
  );
  
  if (targetsOverloadedArea && !thoughtAnalysis.hasUrgencyIndicators) {
    score -= 1;
    reasoning.push('targets already busy area - consider timing');
  }
  
  // Urgency indicators
  if (thoughtAnalysis.hasUrgencyIndicators) {
    score += 2;
    reasoning.push('contains urgency indicators');
    suggestedPriority = 'High';
    suggestedTemplate = 'bug-fix';
  }
  
  // Implementation readiness
  if (thoughtAnalysis.hasImplementationDetails) {
    score += 1;
    reasoning.push('includes implementation details');
    suggestedTemplate = 'feature';
  }
  
  // Architectural implications
  if (thoughtAnalysis.hasArchitecturalImplications) {
    score += 1;
    reasoning.push('has architectural implications');
    if (thoughtAnalysis.complexity === 'high') {
      suggestedTemplate = 'cross-repo';
    }
  }
  
  // Determine final recommendation
  const shouldSuggestTask = score >= 2;
  
  if (suggestedPriority === 'Low' && score >= 2) {
    suggestedPriority = 'Medium';
  }
  
  return {
    shouldSuggestTask,
    reasoning: reasoning.length > 0 ? reasoning.join(', ') : 'general idea captured',
    suggestedTemplate,
    suggestedPriority,
    category: determineCategory(thoughtAnalysis)
  };
}

/**
 * Helper functions
 */
function extractKeywords(text: string): string[] {
  // Extract meaningful keywords, avoiding common words
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']);
  return text.match(/\b\w{3,}\b/g)?.filter(word => !stopWords.has(word)) || [];
}

function extractTechMentions(text: string): string[] {
  const techTerms = ['go', 'vue', 'docker', 'grpc', 'protobuf', 'sqlite', 'nats', 'ollama', 'stt', 'tts', 'llm'];
  return techTerms.filter(term => text.includes(term));
}

function estimateComplexity(text: string): 'low' | 'medium' | 'high' {
  const complexityIndicators = ['system', 'architecture', 'refactor', 'migration', 'breaking'];
  const matches = complexityIndicators.filter(indicator => text.includes(indicator));
  
  if (matches.length >= 2) return 'high';
  if (matches.length >= 1) return 'medium';
  return 'low';
}

function determineCategory(analysis: any): string {
  if (analysis.hasArchitecturalImplications) return 'architecture';
  if (analysis.hasUrgencyIndicators) return 'urgent';
  if (analysis.hasImplementationDetails) return 'feature';
  return 'general';
}

function mapCategoryToTemplate(category: string, isMultiRepo: boolean): string {
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

function estimateEffortFromScope(repositories: string[], category: string): string {
  if (repositories.length > 2) return 'weeks';
  if (repositories.length > 1) return 'days-weeks';
  if (category === 'architecture') return 'days';
  return 'hours-days';
}

/**
 * Derives a concise task title from thought content
 */
function deriveTaskTitle(thoughtContent: string): string {
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

/**
 * Maps AI-determined category to task type
 */
function mapCategoryToTaskType(category: string): "Feature" | "Bug Fix" | "Improvement" | "Documentation" {
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

/**
 * Appends additional context and original thought to task file
 */
async function appendContextToTask(filePath: string, additionalContext: string, originalThought: string): Promise<void> {
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
 * Handler functions for comprehensive task creation
 */

async function handleStartComprehensiveTaskCreation(args: any, workspaceRoot: string): Promise<any> {
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
    
    return {
      content: [{
        type: "text",
        text: `🎯 **Starting Comprehensive Task Creation**\n\n**Original Input**: "${initialInput}"\n\n**Interview ID**: \`${interview.id}\`\n\n**Question 1**: ${interview.currentQuestion}\n\nPlease answer this question to help me create a fully-fleshed out task. Use \`/answer-task-interview-question ${interview.id} "your answer"\` to respond.`
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

async function handleAnswerInterviewQuestion(args: any, workspaceRoot: string): Promise<any> {
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
      // Continue with next question
      return {
        content: [{
          type: "text",
          text: `📝 **Answer Recorded**\n\n**Next Question**: ${interview.currentQuestion}\n\nPlease use \`/answer-task-interview-question ${interviewId} "your answer"\` to continue.`
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

async function handleContinueTaskDevelopment(args: any, workspaceRoot: string): Promise<any> {
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

async function attemptDirectTaskCreation(input: string, workspaceRoot: string): Promise<{ success: boolean; message: string }> {
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

async function createTasksFromInterview(interview: TaskInterviewState, workspaceRoot: string): Promise<{ message: string }> {
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

function buildComprehensiveTaskContent(interview: TaskInterviewState): string {
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

function determineTemplateFromBreakdown(subtask: TaskBreakdownSuggestion): string {
  if (subtask.title.toLowerCase().includes('design') || subtask.title.toLowerCase().includes('planning')) {
    return 'general';
  }
  if (subtask.title.toLowerCase().includes('test')) {
    return 'bug-fix';
  }
  return 'feature';
}

function formatTimeAgo(date: Date): string {
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
class TaskCreationInterviewer {
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

async function analyzeRepositoryRequirements(text: string): Promise<string[]> {
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

function analyzeInitialComplexity(text: string): 'low' | 'medium' | 'high' {
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

function analyzeComplexityFromAnswer(answer: string): { complexity: 'low' | 'medium' | 'high', needsBreakdown: boolean } {
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

async function suggestTaskBreakdown(interview: TaskInterviewState): Promise<TaskBreakdownSuggestion[]> {
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
    name: "capture_comprehensive_thought",
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
          description: "Category of the thought",
          enum: ["architecture", "feature-idea", "technical-debt", "process-improvement", "research-topic", "bug-insight", "optimization"]
        },
        context: {
          type: "string",
          description: "Context about where this thought originated"
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
        urgency: {
          type: "string",
          description: "Urgency level for acting on this thought",
          enum: ["immediate", "next-sprint", "backlog", "future"]
        }
      },
      required: ["content", "category"]
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
  },
  {
    name: "create_task_from_thought",
    description: "Create a structured task from an evaluated thought/idea with pre-filled template suggestions",
    inputSchema: {
      type: "object",
      properties: {
        thoughtContent: {
          type: "string",
          description: "The original thought/idea content"
        },
        suggestedTemplate: {
          type: "string", 
          description: "AI-suggested template based on evaluation",
          enum: ["feature", "bug-fix", "protocol-change", "cross-repo", "general"]
        },
        suggestedPriority: {
          type: "string",
          description: "AI-suggested priority based on evaluation", 
          enum: ["High", "Medium", "Low"]
        },
        category: {
          type: "string",
          description: "AI-determined category"
        },
        customTitle: {
          type: "string",
          description: "Custom title for the task (optional, will derive from thought if not provided)"
        },
        additionalContext: {
          type: "string", 
          description: "Additional context or requirements to include in the task"
        }
      },
      required: ["thoughtContent", "suggestedTemplate", "suggestedPriority", "category"]
    }
  },
  {
    name: "start_comprehensive_task_creation",
    description: "Begin structured interview process to create fully-fleshed out, actionable tasks with proper scoping",
    inputSchema: {
      type: "object",
      properties: {
        initialInput: {
          type: "string",
          description: "The initial task idea, description, or thought"
        },
        skipInterview: {
          type: "boolean",
          description: "If true, attempt to create task directly without interview (for simple, well-defined tasks)"
        }
      },
      required: ["initialInput"]
    }
  },
  {
    name: "answer_task_interview_question",
    description: "Provide an answer to a task creation interview question",
    inputSchema: {
      type: "object",
      properties: {
        interviewId: {
          type: "string",
          description: "The ID of the active task interview"
        },
        answer: {
          type: "string",
          description: "The answer to the current interview question"
        }
      },
      required: ["interviewId", "answer"]
    }
  },
  {
    name: "continue_task_development",
    description: "Resume development of draft tasks, showing available drafts and continuing where left off",
    inputSchema: {
      type: "object",
      properties: {
        draftId: {
          type: "string",
          description: "Optional specific draft ID to resume. If not provided, shows available drafts."
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
      
      // For complex tasks or high priority, use comprehensive creation
      if (priority === "High" || template === "cross-repo" || !title || title.length < 10) {
        return await handleStartComprehensiveTaskCreation({
          initialInput: title,
          skipInterview: false
        }, workspaceRoot);
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

    case "capture_thought": {
      const { content, tags = [], context } = args;
      
      const thought: CapturedThought = {
        content,
        tags,
        timestamp: new Date(),
        context
      };

      try {
        // Evaluate thought priority and suggest task creation if warranted
        const evaluation = await evaluateThoughtPriority(content, tags, context, workspaceRoot);
        const result = await taskManager.captureThought(thought);
        
        let responseText = `💡 Thought captured successfully!\n\n📁 **File**: ${result.filePath}\n🏷️ **Tags**: ${tags.join(', ') || 'None'}\n⏰ **Captured**: ${thought.timestamp.toISOString()}`;
        
        if (evaluation.shouldSuggestTask) {
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

    case "capture_comprehensive_thought": {
      const { content, category, context, relatedRepositories = [], tags = [], urgency = "backlog" } = args;
      
      const thought: CapturedThought = {
        content,
        tags: [...tags, category, urgency],
        timestamp: new Date(),
        context: context || `Category: ${category}, Urgency: ${urgency}, Repositories: ${relatedRepositories.join(', ')}`
      };

      try {
        // Enhanced evaluation for comprehensive thoughts
        const evaluation = await evaluateComprehensiveThought(content, category, urgency, relatedRepositories, workspaceRoot);
        const result = await taskManager.captureThought(thought);
        
        let responseText = `💡 **Comprehensive Thought Captured!**\n\n📁 **File**: ${result.filePath}\n📂 **Category**: ${category}\n⚡ **Urgency**: ${urgency}\n🏷️ **Tags**: ${tags.join(', ') || 'None'}\n🗂️ **Related Repos**: ${relatedRepositories.join(', ') || 'None'}\n⏰ **Captured**: ${thought.timestamp.toISOString()}`;
        
        if (evaluation.shouldSuggestTask) {
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

    case "create_task_from_thought": {
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

    case "start_comprehensive_task_creation": {
      return await handleStartComprehensiveTaskCreation(args, workspaceRoot);
    }

    case "answer_task_interview_question": {
      return await handleAnswerInterviewQuestion(args, workspaceRoot);
    }

    case "continue_task_development": {
      return await handleContinueTaskDevelopment(args, workspaceRoot);
    }

    default:
      throw new Error(`Unknown task management tool: ${name}`);
  }
}