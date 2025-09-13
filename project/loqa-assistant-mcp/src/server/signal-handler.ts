/**
 * Signal Handler
 *
 * Manages process signal handling, graceful shutdown logic, and cleanup procedures.
 * Ensures proper cleanup of resources when the MCP server receives termination signals.
 */

import { TransportManager } from "./transport-manager.js";
import { MCPServer } from "./mcp-server.js";

/**
 * Signal Handler for graceful shutdown management
 */
export class SignalHandler {
  private server: MCPServer | null = null;
  private transportManager: TransportManager | null = null;
  private isShuttingDown = false;

  /**
   * Initialize signal handler with server and transport manager
   */
  initialize(server: MCPServer, transportManager: TransportManager): void {
    this.server = server;
    this.transportManager = transportManager;
    this.setupSignalHandlers();
  }

  /**
   * Setup all signal handlers for graceful shutdown
   */
  private setupSignalHandlers(): void {
    // Handle termination signals
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
    process.on("SIGQUIT", () => this.gracefulShutdown("SIGQUIT"));

    // Handle uncaught exceptions and unhandled rejections
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      this.gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      this.gracefulShutdown("unhandledRejection");
    });

    // Setup stdio handlers through transport manager
    if (this.transportManager) {
      this.transportManager.setupStdioHandlers((reason: string) =>
        this.gracefulShutdown(reason)
      );
    }
  }

  /**
   * Perform graceful shutdown with proper cleanup order
   */
  async gracefulShutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      console.error(`Already shutting down, ignoring ${signal}`);
      return;
    }

    this.isShuttingDown = true;
    console.error(`Received ${signal}, shutting down gracefully...`);

    try {
      // Cleanup order is important: transport first, then server

      // 1. Close transport first (per MCP spec)
      if (this.transportManager && this.transportManager.isActive()) {
        await this.transportManager.close();
      }

      // 2. Close server after transport
      if (this.server) {
        await this.server.close();
      }

      console.error("Graceful shutdown completed successfully");
      process.exit(0);
    } catch (error) {
      console.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  }

  /**
   * Force immediate shutdown (emergency exit)
   */
  forceShutdown(reason: string, exitCode: number = 1): void {
    console.error(`Force shutdown: ${reason}`);
    process.exit(exitCode);
  }

  /**
   * Check if currently in shutdown process
   */
  isShuttingDownFlag(): boolean {
    return this.isShuttingDown;
  }
}