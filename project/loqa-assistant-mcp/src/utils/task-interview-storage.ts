import { promises as fs } from 'fs';
import { join } from 'path';
import { TaskInterviewState } from '../types/index.js';

/**
 * File-based persistent storage for task interviews and draft tasks
 * Stores interview states in the workspace's .loqa-assistant directory
 */
export class TaskInterviewStorage {
  private workspaceRoot: string;
  private storageDir: string;
  private interviewsDir: string;
  private draftsDir: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.storageDir = join(workspaceRoot, '.loqa-assistant');
    this.interviewsDir = join(this.storageDir, 'interviews');
    this.draftsDir = join(this.storageDir, 'drafts');
  }

  /**
   * Initialize storage directories
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      await fs.mkdir(this.interviewsDir, { recursive: true });
      await fs.mkdir(this.draftsDir, { recursive: true });

      // Create .gitignore to exclude these files from version control
      const gitignorePath = join(this.storageDir, '.gitignore');
      try {
        await fs.access(gitignorePath);
      } catch {
        await fs.writeFile(gitignorePath, '*\n# Loqa Assistant temporary files\n');
      }
    } catch (error) {
      console.warn(`Failed to initialize storage directories: ${error}`);
    }
  }

  /**
   * Save active interview state
   */
  async saveInterview(interview: TaskInterviewState): Promise<void> {
    await this.initialize();
    const filePath = join(this.interviewsDir, `${interview.id}.json`);
    
    const serializedInterview = {
      ...interview,
      timestamp: interview.timestamp.toISOString()
    };
    
    await fs.writeFile(filePath, JSON.stringify(serializedInterview, null, 2), 'utf-8');
  }

  /**
   * Load active interview state
   */
  async loadInterview(interviewId: string): Promise<TaskInterviewState | null> {
    try {
      const filePath = join(this.interviewsDir, `${interviewId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      return {
        ...data,
        timestamp: new Date(data.timestamp)
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Move interview to drafts (when incomplete but paused)
   */
  async moveInterviewToDraft(interviewId: string): Promise<void> {
    try {
      const interview = await this.loadInterview(interviewId);
      if (interview) {
        await this.saveDraft(interview);
        await this.deleteInterview(interviewId);
      }
    } catch (error) {
      console.warn(`Failed to move interview to draft: ${error}`);
    }
  }

  /**
   * Save draft task
   */
  async saveDraft(interview: TaskInterviewState): Promise<void> {
    await this.initialize();
    const filePath = join(this.draftsDir, `${interview.id}.json`);
    
    const draftData = {
      ...interview,
      timestamp: interview.timestamp.toISOString(),
      savedAsDraft: new Date().toISOString()
    };
    
    await fs.writeFile(filePath, JSON.stringify(draftData, null, 2), 'utf-8');
  }

  /**
   * Load draft task
   */
  async loadDraft(draftId: string): Promise<TaskInterviewState | null> {
    try {
      const filePath = join(this.draftsDir, `${draftId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      return {
        ...data,
        timestamp: new Date(data.timestamp)
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * List all draft tasks
   */
  async listDrafts(): Promise<Array<{ id: string; title: string; timestamp: Date; originalInput: string }>> {
    try {
      await this.initialize();
      const files = await fs.readdir(this.draftsDir);
      const drafts = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = await fs.readFile(join(this.draftsDir, file), 'utf-8');
            const data = JSON.parse(content);
            drafts.push({
              id: data.id,
              title: data.accumulatedInfo?.title || 'Untitled Draft',
              timestamp: new Date(data.timestamp),
              originalInput: data.originalInput
            });
          } catch (error) {
            console.warn(`Failed to read draft file ${file}: ${error}`);
          }
        }
      }

      // Sort by timestamp, newest first
      return drafts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.warn(`Failed to list drafts: ${error}`);
      return [];
    }
  }

  /**
   * List all active interviews
   */
  async listActiveInterviews(): Promise<Array<{ id: string; title: string; timestamp: Date; currentQuestion: string }>> {
    try {
      await this.initialize();
      const files = await fs.readdir(this.interviewsDir);
      const interviews = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = await fs.readFile(join(this.interviewsDir, file), 'utf-8');
            const data = JSON.parse(content);
            interviews.push({
              id: data.id,
              title: data.accumulatedInfo?.title || 'New Task',
              timestamp: new Date(data.timestamp),
              currentQuestion: data.currentQuestion
            });
          } catch (error) {
            console.warn(`Failed to read interview file ${file}: ${error}`);
          }
        }
      }

      return interviews.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.warn(`Failed to list active interviews: ${error}`);
      return [];
    }
  }

  /**
   * Delete interview
   */
  async deleteInterview(interviewId: string): Promise<void> {
    try {
      const filePath = join(this.interviewsDir, `${interviewId}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore
    }
  }

  /**
   * Delete draft
   */
  async deleteDraft(draftId: string): Promise<void> {
    try {
      const filePath = join(this.draftsDir, `${draftId}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore
    }
  }

  /**
   * Move draft back to active interview
   */
  async resumeDraftAsInterview(draftId: string): Promise<TaskInterviewState | null> {
    try {
      const draft = await this.loadDraft(draftId);
      if (draft) {
        // Reset interview state for continuation
        draft.interviewComplete = false;
        await this.saveInterview(draft);
        await this.deleteDraft(draftId);
        return draft;
      }
      return null;
    } catch (error) {
      console.warn(`Failed to resume draft as interview: ${error}`);
      return null;
    }
  }

  /**
   * Clean up old interviews and drafts (older than 7 days for interviews, 30 days for drafts)
   */
  async cleanup(): Promise<void> {
    const now = new Date();
    const interviewCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days
    const draftCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days

    try {
      // Clean up old interviews
      const activeInterviews = await this.listActiveInterviews();
      for (const interview of activeInterviews) {
        if (interview.timestamp < interviewCutoff) {
          await this.moveInterviewToDraft(interview.id);
        }
      }

      // Clean up very old drafts
      const drafts = await this.listDrafts();
      for (const draft of drafts) {
        if (draft.timestamp < draftCutoff) {
          await this.deleteDraft(draft.id);
        }
      }
    } catch (error) {
      console.warn(`Failed to cleanup old files: ${error}`);
    }
  }
}