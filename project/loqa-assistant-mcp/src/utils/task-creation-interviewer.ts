/**
 * Task Creation Interviewer
 *
 * Intelligent interview system for creating fully-fleshed GitHub issues.
 * Uses existing GitHub MCP tools instead of direct API calls.
 */

import { randomUUID } from 'crypto';
import { TaskInterviewState, TaskInterviewStorage } from './task-interview-storage.js';
import { detectWorkspaceContext } from './context-detector.js';
import { KNOWN_REPOSITORIES_LIST } from '../config/repositories.js';

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'multi-choice';
  choices?: string[];
  required: boolean;
  followUp?: (answer: any) => InterviewQuestion[];
}

export interface GitHubIssueData {
  title: string;
  body: string;
  labels: string[];
  assignees?: string[];
  repository: string;
  owner: string;
}

export class TaskCreationInterviewer {
  private static readonly INTERVIEW_QUESTIONS: InterviewQuestion[] = [
    {
      id: 'title',
      question: 'What is the title of this task? (Be concise and descriptive)',
      type: 'text',
      required: true
    },
    {
      id: 'description',
      question: 'Describe what needs to be done in detail:',
      type: 'text',
      required: true
    },
    {
      id: 'issue_type',
      question: 'What type of work is this?',
      type: 'choice',
      choices: ['feature', 'bug-fix', 'protocol-change', 'cross-repo', 'general'],
      required: true,
      followUp: (answer) => {
        const questions: InterviewQuestion[] = [];

        if (answer === 'protocol-change') {
          questions.push({
            id: 'breaking_change',
            question: 'Is this a breaking change that affects other services?',
            type: 'choice',
            choices: ['yes', 'no'],
            required: true
          });
        }

        if (answer === 'cross-repo') {
          questions.push({
            id: 'affected_repos',
            question: 'Which repositories will be affected? (comma-separated)',
            type: 'text',
            required: true
          });
        }

        return questions;
      }
    },
    {
      id: 'priority',
      question: 'What is the priority of this task?',
      type: 'choice',
      choices: ['High', 'Medium', 'Low'],
      required: true
    },
    {
      id: 'repository',
      question: `Which repository is this for? Available: ${KNOWN_REPOSITORIES_LIST.join(', ')}`,
      type: 'choice',
      choices: KNOWN_REPOSITORIES_LIST,
      required: true
    },
    {
      id: 'acceptance_criteria',
      question: 'What are the acceptance criteria? (What defines "done" for this task?)',
      type: 'text',
      required: true
    },
    {
      id: 'technical_notes',
      question: 'Any technical considerations, dependencies, or implementation notes?',
      type: 'text',
      required: false
    }
  ];

  /**
   * Start a new interview process
   */
  static async startInterview(
    originalInput: string,
    workspaceRoot: string,
    storage: TaskInterviewStorage
  ): Promise<TaskInterviewState> {
    const interviewId = randomUUID();

    // Analyze the original input to suggest defaults and skip questions if possible
    const analysis = await this.analyzeOriginalInput(originalInput);

    const interview: TaskInterviewState = {
      id: interviewId,
      originalInput,
      currentQuestion: this.INTERVIEW_QUESTIONS[0].question,
      questionIndex: 0,
      answers: analysis.suggestedAnswers || {},
      interviewComplete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      issueType: analysis.suggestedType || 'general',
      priority: analysis.suggestedPriority || 'Medium'
    };

    await storage.saveInterview(interview);
    return interview;
  }

  /**
   * Process an answer and move to the next question
   */
  static async processAnswer(
    interviewId: string,
    answer: string,
    storage: TaskInterviewStorage
  ): Promise<TaskInterviewState | null> {
    const interview = await storage.loadInterview(interviewId);
    if (!interview) return null;

    // Store the answer for the current question
    const currentQuestion = this.INTERVIEW_QUESTIONS[interview.questionIndex];
    interview.answers[currentQuestion.id] = answer;

    // Check for follow-up questions
    const followUps = currentQuestion.followUp ? currentQuestion.followUp(answer) : [];

    // Add follow-up questions to the queue if they don't already exist
    if (followUps.length > 0) {
      for (const followUp of followUps) {
        if (!interview.answers.hasOwnProperty(followUp.id)) {
          interview.currentQuestion = followUp.question;
          await storage.saveInterview(interview);
          return interview;
        }
      }
    }

    // Move to next main question
    interview.questionIndex++;

    if (interview.questionIndex >= this.INTERVIEW_QUESTIONS.length) {
      interview.interviewComplete = true;
      interview.currentQuestion = '';
    } else {
      const nextQuestion = this.INTERVIEW_QUESTIONS[interview.questionIndex];
      interview.currentQuestion = nextQuestion.question;
    }

    await storage.saveInterview(interview);
    return interview;
  }

  /**
   * Create GitHub issue from completed interview using MCP tools
   */
  static async createGitHubIssueFromInterview(
    interview: TaskInterviewState,
    mcpToolCallback: (toolName: string, params: any) => Promise<any>
  ): Promise<{ success: boolean; issue?: any; error?: string }> {
    try {
      const issueData = await this.buildGitHubIssueData(interview);

      const createdIssue = await mcpToolCallback('mcp__github__create_issue', {
        owner: issueData.owner,
        repo: issueData.repository,
        title: issueData.title,
        body: issueData.body,
        labels: issueData.labels,
        assignees: issueData.assignees
      });

      return { success: true, issue: createdIssue };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build GitHub issue data from interview answers
   */
  private static async buildGitHubIssueData(interview: TaskInterviewState): Promise<GitHubIssueData> {
    const answers = interview.answers;

    // Determine repository owner (assuming GitHub organization is 'loqalabs')
    const owner = 'loqalabs';
    const repository = answers.repository || 'loqa-hub';

    // Build comprehensive issue body
    const body = this.formatIssueBody(interview);

    // Generate appropriate labels
    const labels = this.generateLabels(interview);

    return {
      title: answers.title || 'Untitled Task',
      body,
      labels,
      repository,
      owner
    };
  }

  /**
   * Format comprehensive issue body from interview answers
   */
  private static formatIssueBody(interview: TaskInterviewState): string {
    const answers = interview.answers;

    let body = `## Description\n\n${answers.description || 'No description provided.'}\n\n`;

    if (answers.acceptance_criteria) {
      body += `## Acceptance Criteria\n\n${answers.acceptance_criteria}\n\n`;
    }

    if (answers.technical_notes) {
      body += `## Technical Notes\n\n${answers.technical_notes}\n\n`;
    }

    if (answers.affected_repos) {
      body += `## Affected Repositories\n\n${answers.affected_repos}\n\n`;
    }

    if (answers.breaking_change === 'yes') {
      body += `## ⚠️ Breaking Change\n\nThis change will affect other services and requires coordinated deployment.\n\n`;
    }

    body += `## Metadata\n\n`;
    body += `- **Type**: ${interview.issueType}\n`;
    body += `- **Priority**: ${interview.priority}\n`;
    body += `- **Created from**: ${interview.originalInput}\n`;
    body += `- **Interview ID**: ${interview.id}\n`;

    return body;
  }

  /**
   * Generate appropriate labels based on interview answers
   */
  private static generateLabels(interview: TaskInterviewState): string[] {
    const labels: string[] = [];
    const answers = interview.answers;

    // Priority labels
    if (interview.priority) {
      labels.push(`priority: ${interview.priority.toLowerCase()}`);
    }

    // Type labels
    if (interview.issueType) {
      switch (interview.issueType) {
        case 'feature':
          labels.push('type: feature');
          break;
        case 'bug-fix':
          labels.push('type: bug');
          break;
        case 'protocol-change':
          labels.push('type: protocol-change');
          if (answers.breaking_change === 'yes') {
            labels.push('type: breaking-change');
          }
          break;
        case 'cross-repo':
          labels.push('scope: cross-repo');
          break;
      }
    }

    // Additional context labels
    if (answers.technical_notes) {
      labels.push('needs-technical-review');
    }

    return labels;
  }

  /**
   * Analyze original input to suggest answers and skip obvious questions
   */
  private static async analyzeOriginalInput(input: string): Promise<{
    suggestedType?: TaskInterviewState['issueType'];
    suggestedPriority?: TaskInterviewState['priority'];
    suggestedAnswers?: Record<string, any>;
  }> {
    const inputLower = input.toLowerCase();

    // Analyze for issue type
    let suggestedType: TaskInterviewState['issueType'] = 'general';
    if (inputLower.includes('bug') || inputLower.includes('fix') || inputLower.includes('error')) {
      suggestedType = 'bug-fix';
    } else if (inputLower.includes('feature') || inputLower.includes('add') || inputLower.includes('implement')) {
      suggestedType = 'feature';
    } else if (inputLower.includes('protocol') || inputLower.includes('api') || inputLower.includes('grpc')) {
      suggestedType = 'protocol-change';
    }

    // Analyze for priority
    let suggestedPriority: TaskInterviewState['priority'] = 'Medium';
    if (inputLower.includes('urgent') || inputLower.includes('critical') || inputLower.includes('asap')) {
      suggestedPriority = 'High';
    } else if (inputLower.includes('minor') || inputLower.includes('when time')) {
      suggestedPriority = 'Low';
    }

    // Try to extract a title from the input
    const suggestedAnswers: Record<string, any> = {};
    if (input.length < 100 && !input.includes('\n')) {
      // Short input might be a good title candidate
      suggestedAnswers.title = input.trim();
    }

    return {
      suggestedType,
      suggestedPriority,
      suggestedAnswers
    };
  }
}