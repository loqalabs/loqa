/**
 * Preview State Manager - Handles pending GitHub operations awaiting user confirmation
 */

export interface PendingOperation {
  id: string;
  type: 'create_issue' | 'update_issue' | 'add_comment' | 'create_pr' | 'update_pr';
  toolName: string;
  originalArgs: any;
  previewText: string;
  timestamp: Date;
}

export class PreviewStateManager {
  private static instance: PreviewStateManager;
  private pendingOperations: Map<string, PendingOperation> = new Map();

  static getInstance(): PreviewStateManager {
    if (!PreviewStateManager.instance) {
      PreviewStateManager.instance = new PreviewStateManager();
    }
    return PreviewStateManager.instance;
  }

  /**
   * Store a pending operation and return its ID
   */
  storePendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp'>): string {
    const id = this.generateOperationId();
    const pendingOp: PendingOperation = {
      ...operation,
      id,
      timestamp: new Date(),
    };

    this.pendingOperations.set(id, pendingOp);

    // Clean up old operations (older than 1 hour)
    this.cleanupOldOperations();

    return id;
  }

  /**
   * Retrieve a pending operation by ID
   */
  getPendingOperation(id: string): PendingOperation | undefined {
    return this.pendingOperations.get(id);
  }

  /**
   * Remove a pending operation (after execution or cancellation)
   */
  removePendingOperation(id: string): boolean {
    return this.pendingOperations.delete(id);
  }

  /**
   * Get all pending operations
   */
  getAllPendingOperations(): PendingOperation[] {
    return Array.from(this.pendingOperations.values());
  }

  /**
   * Update the arguments of a pending operation (for revisions)
   */
  updatePendingOperation(id: string, newArgs: any, newPreviewText: string): boolean {
    const operation = this.pendingOperations.get(id);
    if (!operation) {
      return false;
    }

    operation.originalArgs = newArgs;
    operation.previewText = newPreviewText;
    operation.timestamp = new Date(); // Update timestamp

    return true;
  }

  private generateOperationId(): string {
    return `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupOldOperations(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const [id, operation] of this.pendingOperations.entries()) {
      if (operation.timestamp < oneHourAgo) {
        this.pendingOperations.delete(id);
      }
    }
  }
}