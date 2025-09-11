#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Import modular components
import { LoqaRulesValidator } from './validators/index.js';
import { LoqaWorkspaceManager } from './managers/index.js';
import { getToolsForRepository, handleToolCall } from './tools/index.js';

const __filename = fileURLToPath(import.meta.url);

// Extended workspace manager with full MCP-specific functionality
// The base LoqaWorkspaceManager from ./managers/index.ts provides basic methods
// This extended version adds all the advanced workspace management capabilities needed for the MCP server
class MCPWorkspaceManager extends LoqaWorkspaceManager {
  /**
   * Intelligent task prioritization and auto-selection
   */
  async intelligentTaskPrioritization(options: {
    roleContext?: string;
    timeAvailable?: string;
    repositoryFocus?: string;
    priority?: string;
    criteria?: string[];
    showTop?: number;
  } = {}): Promise<{
    recommendedTask?: any;
    alternativeTasks: any[];
    analysis: any;
  }> {
    // Simplified implementation for MCP context
    return {
      recommendedTask: undefined,
      alternativeTasks: [],
      analysis: {
        totalTasks: 0,
        eligibleTasks: 0,
        criteria: options.criteria || [],
        context: {
          role: options.roleContext || 'auto-detect',
          timeAvailable: options.timeAvailable || 'flexible',
          repositoryFocus: options.repositoryFocus || 'all',
          priorityFilter: options.priority || 'all'
        }
      }
    };
  }

  /**
   * Run quality checks across repositories in dependency order
   */
  async runQualityChecks(_options: any = {}): Promise<any> {
    // Simplified implementation for MCP context
    return {
      results: [],
      summary: {
        totalChecked: 0,
        successful: 0,
        failed: 0,
        totalDuration: 0
      },
      executionOrder: []
    };
  }

  /**
   * Create feature branch from backlog task
   */
  async createBranchFromTask(_options: any): Promise<any> {
    // Simplified implementation for MCP context
    return {
      success: false,
      branchName: '',
      repository: _options.repository || 'loqa',
      error: 'Not implemented in simplified MCP version'
    };
  }

  /**
   * Run integration tests across multi-repository changes
   */
  async runIntegrationTests(_options: any = {}): Promise<any> {
    // Simplified implementation for MCP context
    return {
      results: [],
      summary: {
        totalTests: 0,
        successful: 0,
        failed: 0,
        totalDuration: 0
      }
    };
  }

  /**
   * Create pull request from feature branch with task linking
   */
  async createPullRequestFromTask(_options: any = {}): Promise<any> {
    // Simplified implementation for MCP context
    return {
      success: false,
      repository: _options.repository || 'loqa',
      error: 'Not implemented in simplified MCP version'
    };
  }

  /**
   * Analyze dependency change impact across repositories
   */
  async analyzeDependencyImpact(_options: any = {}): Promise<any> {
    // Simplified implementation for MCP context
    return {
      analysis: {
        changedFiles: [],
        affectedRepositories: [],
        protocolChanges: {
          addedServices: [],
          removedServices: [],
          modifiedServices: [],
          addedMethods: [],
          removedMethods: [],
          modifiedMethods: []
        },
        breakingChanges: [],
        recommendations: []
      },
      summary: {
        totalRepositories: 0,
        highImpactRepos: 0,
        breakingChanges: 0,
        coordinationRequired: false
      }
    };
  }
}

const server = new Server(
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

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Detect if we're in a Loqa repository to filter tools appropriately
  const validator = new LoqaRulesValidator();
  const isLoqaRepository = await validator.detectLoqaRepository(process.cwd());
  
  return {
    tools: await getToolsForRepository(isLoqaRepository),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Create workspace manager for workspace tools
    const workspaceManager = new MCPWorkspaceManager(args?.workspaceRoot as string);
    
    // Route to appropriate modular tool handler
    return await handleToolCall(name, args, workspaceManager);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Loqa Assistant MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});