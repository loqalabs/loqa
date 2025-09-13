/**
 * Transport Manager
 *
 * Handles transport and connection management for the MCP server.
 * Manages StdioServerTransport setup, connection lifecycle, and transport-level error handling.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Transport Manager for MCP server communication
 */
export class TransportManager {
  private transport: StdioServerTransport | null = null;

  /**
   * Create and configure a new stdio transport
   */
  createStdioTransport(): StdioServerTransport {
    this.transport = new StdioServerTransport();
    this.setupTransportHandlers();
    return this.transport;
  }

  /**
   * Get the current transport instance
   */
  getTransport(): StdioServerTransport | null {
    return this.transport;
  }

  /**
   * Setup transport-level event handlers
   */
  private setupTransportHandlers(): void {
    if (!this.transport) return;

    // Note: StdioServerTransport doesn't expose event handlers directly
    // Transport-level error handling is managed by the MCP SDK internally
    // Additional monitoring could be added here if needed
  }

  /**
   * Setup stdio event handlers for graceful shutdown detection
   */
  setupStdioHandlers(shutdownCallback: (reason: string) => Promise<void>): void {
    // Handle stdio close events for graceful shutdown
    process.stdin.on("close", () => {
      console.error("Stdin closed, shutting down gracefully...");
      shutdownCallback("stdin-close");
    });

    process.stdin.on("end", () => {
      console.error("Stdin ended, shutting down gracefully...");
      shutdownCallback("stdin-end");
    });

    process.stdin.on("error", (error) => {
      console.error("Stdin error:", error);
      shutdownCallback("stdin-error");
    });

    // Handle stdio pipe breaks (parent process exit)
    process.on("SIGPIPE", () => {
      console.error("SIGPIPE received, parent process likely closed");
      shutdownCallback("SIGPIPE");
    });
  }

  /**
   * Close the transport gracefully
   */
  async close(): Promise<void> {
    if (this.transport) {
      try {
        // StdioServerTransport close is handled by the MCP server
        // Just clean up our reference
        console.error("Transport closed successfully");
      } catch (error) {
        console.error("Error closing transport:", error);
        throw error;
      } finally {
        this.transport = null;
      }
    }
  }

  /**
   * Check if transport is active
   */
  isActive(): boolean {
    return this.transport !== null;
  }
}