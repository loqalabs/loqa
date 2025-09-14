/**
 * Task Interview Storage
 *
 * Manages persistent storage of interview sessions for creating GitHub issues.
 * Stores interview state in JSON files to survive MCP server restarts.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { getWorkspaceRoot } from './context-detector.js';

export interface TaskInterviewState {
  id: string;
  originalInput: string;
  currentQuestion: string;
  questionIndex: number;
  answers: Record<string, any>;
  interviewComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  repository?: string;
  issueType: 'feature' | 'bug-fix' | 'protocol-change' | 'cross-repo' | 'general';
  priority: 'High' | 'Medium' | 'Low';
  category?: string;
  metadata?: {
    workspaceRoot?: string;
    currentRepository?: string;
    repositoryContext?: string;
    userContext?: any;
  };
}

export class TaskInterviewStorage {
  private workspaceRoot: string;
  private storageDir: string;
  private interviewsFile: string;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.storageDir = path.join(this.workspaceRoot, '.loqa-assistant', 'interviews');
    this.interviewsFile = path.join(this.storageDir, 'interviews.json');
  }

  /**
   * Initialize storage directory
   */
  private async ensureStorageExists(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }

  /**
   * Load all interviews from storage
   */
  private async loadInterviews(): Promise<TaskInterviewState[]> {
    try {
      await this.ensureStorageExists();
      const data = await fs.readFile(this.interviewsFile, 'utf-8');
      const interviews = JSON.parse(data);

      // Convert date strings back to Date objects
      return interviews.map((interview: any) => ({
        ...interview,
        createdAt: new Date(interview.createdAt),
        updatedAt: new Date(interview.updatedAt)
      }));
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return []; // File doesn't exist yet
      }
      throw error;
    }
  }

  /**
   * Save all interviews to storage
   */
  private async saveInterviews(interviews: TaskInterviewState[]): Promise<void> {
    await this.ensureStorageExists();
    await fs.writeFile(this.interviewsFile, JSON.stringify(interviews, null, 2));
  }

  /**
   * Save interview state
   */
  async saveInterview(interview: TaskInterviewState): Promise<void> {
    const interviews = await this.loadInterviews();
    const existingIndex = interviews.findIndex(i => i.id === interview.id);

    const updatedInterview = {
      ...interview,
      updatedAt: new Date()
    };

    if (existingIndex >= 0) {
      interviews[existingIndex] = updatedInterview;
    } else {
      interviews.push(updatedInterview);
    }

    await this.saveInterviews(interviews);
  }

  /**
   * Load interview by ID
   */
  async loadInterview(id: string): Promise<TaskInterviewState | null> {
    const interviews = await this.loadInterviews();
    return interviews.find(i => i.id === id) || null;
  }

  /**
   * Delete interview by ID
   */
  async deleteInterview(id: string): Promise<boolean> {
    const interviews = await this.loadInterviews();
    const filteredInterviews = interviews.filter(i => i.id !== id);

    if (filteredInterviews.length === interviews.length) {
      return false; // Interview not found
    }

    await this.saveInterviews(filteredInterviews);
    return true;
  }

  /**
   * List all active interviews
   */
  async listActiveInterviews(): Promise<TaskInterviewState[]> {
    const interviews = await this.loadInterviews();
    return interviews.filter(i => !i.interviewComplete);
  }

  /**
   * Clean up old completed interviews (older than 7 days)
   */
  async cleanupOldInterviews(): Promise<number> {
    const interviews = await this.loadInterviews();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeInterviews = interviews.filter(i => {
      return !i.interviewComplete || i.updatedAt > sevenDaysAgo;
    });

    const removedCount = interviews.length - activeInterviews.length;

    if (removedCount > 0) {
      await this.saveInterviews(activeInterviews);
    }

    return removedCount;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalInterviews: number;
    activeInterviews: number;
    completedInterviews: number;
    oldestInterview: Date | null;
  }> {
    const interviews = await this.loadInterviews();

    return {
      totalInterviews: interviews.length,
      activeInterviews: interviews.filter(i => !i.interviewComplete).length,
      completedInterviews: interviews.filter(i => i.interviewComplete).length,
      oldestInterview: interviews.length > 0
        ? new Date(Math.min(...interviews.map(i => i.createdAt.getTime())))
        : null
    };
  }
}