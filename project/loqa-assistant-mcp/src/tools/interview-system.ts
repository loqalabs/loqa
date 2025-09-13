import { randomUUID } from 'crypto';
import { join } from 'path';
import { TaskInterviewState, TaskBreakdownSuggestion, TaskCreationOptions } from '../types/index.js';
import { TaskInterviewStorage } from '../utils/task-interview-storage.js';
import { LoqaTaskManager } from '../managers/index.js';
import { KNOWN_REPOSITORIES_LIST } from '../config/repositories.js';

/**
 * Task Creation Interview System
 * 
 * Handles structured task creation through guided interviews to ensure
 * comprehensive task definition with proper scoping and requirements.
 */

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

/**
 * Create tasks from completed interview
 */
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

/**
 * Build comprehensive task content from interview data
 */
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

/**
 * Analyze repository requirements from text
 */
export async function analyzeRepositoryRequirements(text: string): Promise<string[]> {
  const textLower = text.toLowerCase();
  const repos: string[] = [];
  
  // Only use exact repository name matches (with word boundaries) to avoid false positives
  KNOWN_REPOSITORIES_LIST.forEach(repo => {
    const repoPattern = new RegExp(`\\b${repo.toLowerCase()}\\b`);
    if (repoPattern.test(textLower)) {
      repos.push(repo);
    }
  });
  
  // Technology-based inference (more precise)
  if ((textLower.includes('ui') || textLower.includes('dashboard') || textLower.includes('vue')) 
      && !repos.includes('loqa-commander')) {
    repos.push('loqa-commander');
  }
  if ((textLower.includes('grpc') || textLower.includes('protocol') || textLower.includes('proto')) 
      && !repos.includes('loqa-proto')) {
    repos.push('loqa-proto');
  }
  if ((textLower.includes('skill') || textLower.includes('plugin')) 
      && !repos.includes('loqa-skills')) {
    repos.push('loqa-skills');
  }
  if ((textLower.includes('stt') || textLower.includes('tts') || textLower.includes('llm')) 
      && !repos.includes('loqa-hub')) {
    repos.push('loqa-hub');
  }
  
  // Default to loqa (main repo) for MCP tools and system-level changes if no specific repos found
  if (repos.length === 0) {
    repos.push('loqa');
  }
  
  return [...new Set(repos)];
}

/**
 * Analyze initial complexity from input text
 */
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

/**
 * Analyze complexity from interview answer
 */
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

/**
 * Suggest task breakdown based on interview data
 */
export async function suggestTaskBreakdown(interview: TaskInterviewState): Promise<TaskBreakdownSuggestion[]> {
  const breakdown: TaskBreakdownSuggestion[] = [];
  const repos = interview.accumulatedInfo.repositories || ['loqa'];
  const description = interview.accumulatedInfo.description || '';
  
  // Simple breakdown logic - in practice this could be more sophisticated
  if (repos.length > 1) {
    // Multi-repo task - suggest one task per repo with clean titles
    repos.forEach(repo => {
      // Create clean titles without problematic characters
      const cleanTitle = `${interview.accumulatedInfo.title} (${repo})`;
      breakdown.push({
        title: cleanTitle,
        description: `Implement ${repo}-specific changes for: ${description}`,
        repository: repo,
        estimatedEffort: 'days'
      });
    });
  } else if (interview.accumulatedInfo.estimatedComplexity === 'high') {
    // Complex single-repo task - suggest phases with clean titles
    breakdown.push(
      {
        title: `${interview.accumulatedInfo.title} (Planning)`,
        description: `Design and plan the implementation approach for: ${description}`,
        repository: repos[0],
        estimatedEffort: 'hours'
      },
      {
        title: `${interview.accumulatedInfo.title} (Implementation)`,
        description: `Implement core functionality: ${description}`,
        repository: repos[0],
        estimatedEffort: 'days',
        dependencies: ['Planning']
      },
      {
        title: `${interview.accumulatedInfo.title} (Testing)`,
        description: `Test and validate implementation: ${description}`,
        repository: repos[0],
        estimatedEffort: 'hours',
        dependencies: ['Implementation']
      }
    );
  }
  
  return breakdown;
}

/**
 * Determine appropriate template from breakdown suggestion
 */
export function determineTemplateFromBreakdown(subtask: TaskBreakdownSuggestion): string {
  if (subtask.title.toLowerCase().includes('design') || subtask.title.toLowerCase().includes('planning')) {
    return 'general';
  }
  if (subtask.title.toLowerCase().includes('test')) {
    return 'bug-fix';
  }
  return 'feature';
}

/**
 * Utility functions
 */

/**
 * Derives a concise task title from thought content
 */
export function deriveTaskTitle(thoughtContent: string): string {
  // Extract first sentence, but allow reasonable length for task titles
  const firstSentence = thoughtContent.split(/[.!?]/)[0].trim();
  let title = firstSentence.length > 0 ? firstSentence : thoughtContent;
  
  // Clean up common prefixes first
  title = title.replace(/^(i think|we should|maybe|what if|idea:|thought:)/i, '').trim();
  
  // Only truncate if extremely long (filesystem-safe limit), preserve more context
  if (title.length > 150) {
    title = title.substring(0, 147) + '...';
  }
  
  return title || 'New Task';
}

/**
 * Appends additional context and original thought to task file
 */
export async function appendContextToTask(filePath: string, additionalContext: string, originalThought: string): Promise<void> {
  try {
    const fs = await import('fs/promises');
    
    let appendContent = '\n## Additional Context\n\n';
    appendContent += additionalContext;
    appendContent += '\n\n## Original Input\n\n';
    appendContent += `> ${originalThought}\n`;
    
    await fs.appendFile(filePath, appendContent, 'utf-8');
  } catch (error) {
    console.warn(`Failed to append context to task file: ${error}`);
  }
}