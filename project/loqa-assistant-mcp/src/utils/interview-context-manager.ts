/**
 * Interview Context Manager
 *
 * Manages active interview state to enable seamless conversational flow
 * without requiring explicit MCP tool approvals for each answer.
 */

export class InterviewContextManager {
  private static instance: InterviewContextManager | null = null;
  private activeInterviewId: string | null = null;
  private lastQuestionAsked: string | null = null;
  private interviewStartTime: Date | null = null;

  private constructor() {}

  /**
   * Get singleton instance of the context manager
   */
  public static getInstance(): InterviewContextManager {
    if (!InterviewContextManager.instance) {
      InterviewContextManager.instance = new InterviewContextManager();
    }
    return InterviewContextManager.instance;
  }

  /**
   * Set the active interview ID when starting an interview
   */
  public setActiveInterview(id: string, initialQuestion?: string): void {
    this.activeInterviewId = id;
    this.lastQuestionAsked = initialQuestion || null;
    this.interviewStartTime = new Date();
  }

  /**
   * Check if there's an active interview in progress
   */
  public isInActiveInterview(): boolean {
    return this.activeInterviewId !== null;
  }

  /**
   * Get the current active interview ID
   */
  public getActiveInterviewId(): string | null {
    return this.activeInterviewId;
  }

  /**
   * Update the last question asked in the interview
   */
  public updateLastQuestion(question: string): void {
    this.lastQuestionAsked = question;
  }

  /**
   * Get the last question that was asked
   */
  public getLastQuestion(): string | null {
    return this.lastQuestionAsked;
  }

  /**
   * Clear the active interview context
   */
  public clearActiveInterview(): void {
    this.activeInterviewId = null;
    this.lastQuestionAsked = null;
    this.interviewStartTime = null;
  }

  /**
   * Get interview session information
   */
  public getInterviewInfo(): {
    isActive: boolean;
    interviewId: string | null;
    lastQuestion: string | null;
    duration: number | null;
  } {
    return {
      isActive: this.isInActiveInterview(),
      interviewId: this.activeInterviewId,
      lastQuestion: this.lastQuestionAsked,
      duration: this.interviewStartTime
        ? Date.now() - this.interviewStartTime.getTime()
        : null
    };
  }

  /**
   * Detect if a message is likely a conversational response to an interview question
   * rather than a command
   */
  public isLikelyInterviewResponse(message: string): boolean {
    if (!this.isInActiveInterview()) {
      return false;
    }

    // If message starts with /loqa, it's a command, not an answer
    if (message.trim().startsWith('/loqa')) {
      return false;
    }

    // If message is very short or looks like a command attempt, probably not an answer
    const trimmed = message.trim().toLowerCase();
    if (trimmed.length < 5) {
      return false;
    }

    // Common non-answer patterns
    const nonAnswerPatterns = [
      'help', 'what', 'how', 'why', 'when', 'where',
      'status', 'list', 'show', 'get', 'quit', 'exit'
    ];

    if (nonAnswerPatterns.some(pattern => trimmed === pattern || trimmed.startsWith(pattern + ' '))) {
      return false;
    }

    // Otherwise, if we're in an active interview, treat as an answer
    return true;
  }
}