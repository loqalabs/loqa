#!/usr/bin/env node

/**
 * MCP Server Entry Point
 *
 * Minimal entry point that orchestrates the modular MCP server components.
 * This file coordinates server setup, transport management, signal handling,
 * and graceful shutdown procedures.
 */

import { MCPServer } from "./server/mcp-server.js";
import { TransportManager } from "./server/transport-manager.js";
import { SignalHandler } from "./server/signal-handler.js";

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  // Initialize core components
  const mcpServer = new MCPServer();
  const transportManager = new TransportManager();
  const signalHandler = new SignalHandler();

  try {
    // Create and configure transport
    const transport = transportManager.createStdioTransport();

    // Initialize signal handling for graceful shutdown
    signalHandler.initialize(mcpServer, transportManager);

    // Connect server to transport
    await mcpServer.connect(transport);

    // Server is now running and handling requests
    console.error("Loqa Assistant MCP server ready for connections");
  } catch (error) {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});