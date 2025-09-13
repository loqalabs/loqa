/**
 * MCP Server Core
 *
 * Provides the core MCP server setup, configuration, and tool registration.
 * This module handles the fundamental server initialization and capabilities.
 */

import { Server } from "@modelcontextprotocol/sdk/server";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { LoqaRulesValidator } from "../validators/index.js";
import { getToolsForRepository, handleToolCall } from "../tools/index.js";
import { MCPWorkspaceManager } from "../workspace/mcp-workspace-manager.js";
import { detectWorkspaceContext } from "../utils/context-detector.js";
import { getDefaultRepository } from "../config/repositories.js";
import { ErrorHandler } from "./error-handler.js";

/**
 * MCP Server configuration and setup
 */
export class MCPServer {
  private server: Server;
  private errorHandler: ErrorHandler;

  constructor() {
    this.server = new Server(
      {
        name: "loqa-assistant-mcp",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.errorHandler = new ErrorHandler();
    this.setupRequestHandlers();
  }

  /**
   * Get the underlying server instance
   */
  getServer(): Server {
    return this.server;
  }

  /**
   * Setup MCP request handlers for tools and tool calls
   */
  private setupRequestHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        return await this.handleListTools();
      } catch (error) {
        throw this.errorHandler.createMCPError("Failed to list tools", error);
      }
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      try {
        return await this.handleToolCall(request);
      } catch (error) {
        return this.errorHandler.handleToolCallError(error);
      }
    });
  }

  /**
   * Handle listing available tools based on repository context
   */
  private async handleListTools(): Promise<{ tools: any[] }> {
    // Detect if we're in a Loqa repository to filter tools appropriately
    const validator = new LoqaRulesValidator();
    const isLoqaRepository = await validator.detectLoqaRepository(process.cwd());

    return {
      tools: await getToolsForRepository(isLoqaRepository),
    };
  }

  /**
   * Handle tool call execution with context detection and error handling
   */
  private async handleToolCall(request: any): Promise<any> {
    const { name, arguments: args } = request.params;

    // Detect workspace context
    const context = await detectWorkspaceContext();

    // Determine workspace root
    let workspaceRoot: string;
    if (context.type === "individual-repo" && context.workspaceRoot) {
      workspaceRoot = context.workspaceRoot;
    } else if (context.type === "workspace-root") {
      workspaceRoot = context.workspaceRoot!;
    } else {
      workspaceRoot = process.cwd();
    }

    // Create workspace manager with proper context
    const workspaceManager = new MCPWorkspaceManager(workspaceRoot);

    // Route to appropriate modular tool handler
    return await handleToolCall(name, args, workspaceManager);
  }

  /**
   * Close the server gracefully
   */
  async close(): Promise<void> {
    try {
      await this.server.close();
      console.error("MCP server closed successfully");
    } catch (error) {
      console.error("Error closing MCP server:", error);
      throw error;
    }
  }

  /**
   * Connect the server to a transport
   */
  async connect(transport: any): Promise<void> {
    try {
      await this.server.connect(transport);
      console.error("Loqa Assistant MCP server running on stdio");
    } catch (error) {
      console.error("Error connecting MCP server to transport:", error);
      throw error;
    }
  }
}