/**
 * Error Handler
 *
 * Centralized error handling and formatting for the MCP server.
 * Provides error response utilities, context-aware error messages, and logging integration.
 */

import { detectWorkspaceContext } from "../utils/context-detector.js";
import { getDefaultRepository } from "../config/repositories.js";

/**
 * Centralized error handler for MCP server operations
 */
export class ErrorHandler {
  /**
   * Handle tool call errors with enhanced context information
   */
  async handleToolCallError(error: unknown): Promise<any> {
    // Enhanced error messages with context information
    let errorMessage = `Error: ${
      error instanceof Error ? error.message : String(error)
    }`;

    try {
      const context = await detectWorkspaceContext();

      if (!context.isLoqaWorkspace) {
        errorMessage += this.generateContextualHelp(context);
      } else if (context.type === "unknown") {
        errorMessage += this.generateUnknownContextHelp(context);
      }
    } catch {
      // Context detection failed, don't add context info
    }

    return {
      content: [
        {
          type: "text",
          text: errorMessage,
        },
      ],
      isError: true,
    };
  }

  /**
   * Create an MCP-compatible error for server operations
   */
  createMCPError(message: string, originalError?: unknown): Error {
    const errorDetails = originalError instanceof Error
      ? ` - ${originalError.message}`
      : originalError
      ? ` - ${String(originalError)}`
      : "";

    return new Error(`${message}${errorDetails}`);
  }

  /**
   * Log error with appropriate level and context
   */
  logError(error: unknown, context?: string): void {
    const contextPrefix = context ? `[${context}] ` : "";

    if (error instanceof Error) {
      console.error(`${contextPrefix}Error: ${error.message}`);
      if (error.stack) {
        console.error(`${contextPrefix}Stack: ${error.stack}`);
      }
    } else {
      console.error(`${contextPrefix}Error: ${String(error)}`);
    }
  }

  /**
   * Generate contextual help for non-Loqa workspace environments
   */
  private generateContextualHelp(context: any): string {
    let help = "\n\n💡 **Context**: You don't appear to be in a Loqa workspace. Many MCP tools require being in a Loqa repository or the workspace root containing multiple Loqa repositories.";
    help += "\n\n**Suggestions**:";
    help += `\n• Navigate to a Loqa repository (e.g., \`cd ${getDefaultRepository(
      "development"
    )}\` for development or \`cd ${getDefaultRepository(
      "documentation"
    )}\` for docs)`;
    help +=
      "\n• Navigate to the workspace root containing Loqa repositories";
    help +=
      "\n• Use the `repository` parameter to specify which repo to operate on";

    return help;
  }

  /**
   * Generate help for unknown context situations
   */
  private generateUnknownContextHelp(context: any): string {
    let help = "\n\n💡 **Context**: Workspace context could not be determined.";
    help += `\n**Available repositories**: ${
      context.availableRepositories.join(", ") || "None found"
    }`;

    return help;
  }

  /**
   * Format error for user display
   */
  formatUserError(error: unknown, operation?: string): string {
    const operationPrefix = operation ? `${operation}: ` : "";

    if (error instanceof Error) {
      return `${operationPrefix}${error.message}`;
    }

    return `${operationPrefix}${String(error)}`;
  }

  /**
   * Check if error is a specific type
   */
  isErrorType(error: unknown, type: string): boolean {
    if (error instanceof Error) {
      return error.name === type || error.message.includes(type);
    }
    return false;
  }

  /**
   * Wrap async operations with error handling
   */
  async wrapAsync<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logError(error, context);
      throw this.createMCPError(
        context ? `${context} failed` : "Operation failed",
        error
      );
    }
  }
}