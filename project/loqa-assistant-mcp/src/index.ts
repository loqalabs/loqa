#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { simpleGit } from 'simple-git';
import { glob } from 'glob';
import { spawn } from 'child_process';

// Import modular components
import { LoqaRulesValidator } from './validators/index.js';
import { LoqaWorkspaceManager } from './managers/index.js';
import { LoqaTaskManager } from './managers/task-manager.js';
import { getToolsForRepository, handleToolCall } from './tools/index.js';
import { DEPENDENCY_ORDER, TESTABLE_REPOSITORIES, getDefaultRepository } from './config/repositories.js';

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
    const taskManager = new LoqaTaskManager(this.actualWorkspaceRoot);
    const showTop = options.showTop || 3;
    const allTasks: any[] = [];
    const repositoriesToCheck = options.repositoryFocus ? [options.repositoryFocus] : this.knownRepositories;
    
    // Collect tasks from repositories
    for (const repoName of repositoriesToCheck) {
      const repoPath = join(this.actualWorkspaceRoot, repoName);
      try {
        await fs.access(join(repoPath, '.git'));
        // Create a task manager for this specific repository
        const repoTaskManager = new LoqaTaskManager(repoPath);
        const taskList = await repoTaskManager.listTasks();
        
        // Parse task files to get metadata
        for (const taskFile of taskList.tasks) {
          try {
            const taskPath = join(repoPath, 'backlog', 'tasks', taskFile);
            const content = await fs.readFile(taskPath, 'utf-8');
            
            // Parse YAML frontmatter
            let task: any = {};
            if (content.startsWith('---')) {
              const frontmatterEnd = content.indexOf('---', 3);
              if (frontmatterEnd !== -1) {
                const frontmatter = content.slice(4, frontmatterEnd);
                // Simple YAML parsing for basic fields
                const lines = frontmatter.split('\n');
                for (const line of lines) {
                  const colonIndex = line.indexOf(':');
                  if (colonIndex > 0) {
                    const key = line.slice(0, colonIndex).trim();
                    const value = line.slice(colonIndex + 1).trim().replace(/'/g, '');
                    
                    if (key === 'id') task.id = value;
                    else if (key === 'title') task.title = value;
                    else if (key === 'status') task.status = value;
                    else if (key === 'priority') task.priority = value;
                  }
                }
              }
            }
            
            // Fill in defaults and normalize
            task = {
              id: task.id || taskFile.replace('.md', ''),
              title: task.title || taskFile,
              priority: task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium',
              status: task.status || 'To Do',
              type: 'Task',
              repository: repoName,
              path: taskPath,
              content: content
            };
            
            // Apply filters
            if (options.priority && !task.priority.toLowerCase().includes(options.priority.toLowerCase())) {
              continue;
            }
            
            if (task.status.toLowerCase().includes('done') || task.status.toLowerCase().includes('completed')) {
              continue;
            }
            
            allTasks.push(task);
          } catch (error) {
            // Skip malformed tasks
            continue;
          }
        }
      } catch (error) {
        // Repository doesn't exist or no backlog
        continue;
      }
    }
    
    // Score tasks based on various criteria
    const scoredTasks = allTasks.map(task => {
      let score = 0;
      
      // Priority scoring
      if (task.priority.toLowerCase() === 'high') score += 3;
      else if (task.priority.toLowerCase() === 'medium') score += 2;
      else score += 1;
      
      // Role context scoring
      if (options.roleContext) {
        const role = options.roleContext.toLowerCase();
        if (role === 'developer' && task.content.toLowerCase().includes('implement')) score += 2;
        if (role === 'qa' && task.content.toLowerCase().includes('test')) score += 2;
        if (role === 'devops' && task.content.toLowerCase().includes('deploy')) score += 2;
        if (role === 'architect' && task.content.toLowerCase().includes('design')) score += 2;
      }
      
      // Type scoring
      if (task.type.toLowerCase().includes('bug')) score += 1;
      if (task.type.toLowerCase().includes('feature')) score += 1;
      
      // Repository focus
      if (options.repositoryFocus === task.repository) score += 2;
      
      return { ...task, score };
    });
    
    // Sort by score descending
    scoredTasks.sort((a, b) => b.score - a.score);
    
    const recommendedTask = scoredTasks.length > 0 ? scoredTasks[0] : undefined;
    const alternativeTasks = scoredTasks.slice(1, showTop);
    
    return {
      recommendedTask,
      alternativeTasks,
      analysis: {
        totalTasks: allTasks.length,
        eligibleTasks: scoredTasks.length,
        criteria: options.criteria || ['priority', 'role_context', 'repository_focus'],
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
  async runQualityChecks(options: { repository?: string } = {}): Promise<any> {
    const startTime = Date.now();
    const results: any[] = [];
    const repositoriesToCheck = options.repository ? [options.repository] : this.knownRepositories;
    
    // Use centralized dependency order for Loqa repositories
    const dependencyOrder = DEPENDENCY_ORDER;
    const orderedRepos = dependencyOrder.filter(repo => repositoriesToCheck.includes(repo))
      .concat(repositoriesToCheck.filter(repo => !dependencyOrder.includes(repo)));
    
    for (const repoName of orderedRepos) {
      const repoPath = join(this.actualWorkspaceRoot, repoName);
      
      try {
        await fs.access(join(repoPath, '.git'));
        
        const repoStartTime = Date.now();
        const checkResults: { check: string; success: boolean; output?: string; error?: string }[] = [];
        
        // Check for quality-check command
        const packageJsonPath = join(repoPath, 'package.json');
        const makefilePath = join(repoPath, 'Makefile');
        
        if (await this.fileExists(packageJsonPath)) {
          // Node.js project - run npm run quality-check
          try {
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
            if (packageJson.scripts && packageJson.scripts['quality-check']) {
              const result = await this.runCommand('npm', ['run', 'quality-check'], repoPath);
              checkResults.push({
                check: 'npm run quality-check',
                success: result.success,
                output: result.stdout,
                error: result.stderr
              });
            } else {
              // Try individual checks
              if (packageJson.scripts.lint) {
                const result = await this.runCommand('npm', ['run', 'lint'], repoPath);
                checkResults.push({
                  check: 'npm run lint',
                  success: result.success,
                  output: result.stdout,
                  error: result.stderr
                });
              }
              
              if (packageJson.scripts.test) {
                const result = await this.runCommand('npm', ['test'], repoPath);
                checkResults.push({
                  check: 'npm test',
                  success: result.success,
                  output: result.stdout,
                  error: result.stderr
                });
              }
            }
          } catch (error) {
            checkResults.push({
              check: 'package.json parse',
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        } else if (await this.fileExists(makefilePath)) {
          // Go project - run make quality-check
          const result = await this.runCommand('make', ['quality-check'], repoPath);
          checkResults.push({
            check: 'make quality-check',
            success: result.success,
            output: result.stdout,
            error: result.stderr
          });
        } else {
          // Try basic checks
          const goModPath = join(repoPath, 'go.mod');
          if (await this.fileExists(goModPath)) {
            // Go project
            const testResult = await this.runCommand('go', ['test', './...'], repoPath);
            checkResults.push({
              check: 'go test',
              success: testResult.success,
              output: testResult.stdout,
              error: testResult.stderr
            });
            
            const vetResult = await this.runCommand('go', ['vet', './...'], repoPath);
            checkResults.push({
              check: 'go vet',
              success: vetResult.success,
              output: vetResult.stdout,
              error: vetResult.stderr
            });
          }
        }
        
        const duration = Date.now() - repoStartTime;
        const successful = checkResults.every(r => r.success);
        
        results.push({
          repository: repoName,
          path: repoPath,
          successful,
          duration,
          checks: checkResults
        });
        
      } catch (error) {
        results.push({
          repository: repoName,
          path: repoPath,
          successful: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: 0,
          checks: []
        });
      }
    }
    
    const totalDuration = Date.now() - startTime;
    const successful = results.filter(r => r.successful).length;
    const failed = results.length - successful;
    
    return {
      results,
      summary: {
        totalChecked: results.length,
        successful,
        failed,
        totalDuration
      },
      executionOrder: orderedRepos
    };
  }

  /**
   * Create feature branch from backlog task
   */
  async createBranchFromTask(options: { taskId: string; repository?: string }): Promise<any> {
    const repository = options.repository || 'loqa';
    const repoPath = join(this.workspaceRoot, '..', repository);
    
    try {
      // Check if repository exists
      await fs.access(join(repoPath, '.git'));
      
      // Find the task file
      const taskManager = new LoqaTaskManager(repoPath);
      const taskList = await taskManager.listTasks(repoPath);
      const taskFile = taskList.tasks.find(f => f.includes(options.taskId));
      
      if (!taskFile) {
        return {
          success: false,
          repository,
          error: `Task ${options.taskId} not found in ${repository}`
        };
      }
      
      // Read task content to extract title
      const taskPath = join(repoPath, 'backlog', 'tasks', taskFile);
      const content = await fs.readFile(taskPath, 'utf-8');
      const titleMatch = content.match(/# Task: (.+)/);
      const title = titleMatch?.[1] || `task-${options.taskId}`;
      
      // Generate branch name
      const branchName = `feature/${title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')}`;
      
      const git = simpleGit(repoPath);
      
      // Ensure we're on main and up to date
      await git.checkout('main');
      await git.pull('origin', 'main');
      
      // Create and checkout new branch
      await git.checkoutLocalBranch(branchName);
      
      return {
        success: true,
        branchName,
        repository,
        taskFile,
        taskTitle: title
      };
      
    } catch (error) {
      return {
        success: false,
        repository,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Run integration tests across multi-repository changes
   */
  async runIntegrationTests(options: { scope?: 'all' | 'affected' | 'current' } = {}): Promise<any> {
    const startTime = Date.now();
    const scope = options.scope || 'current';
    const results: any[] = [];
    
    // Define repositories that have integration tests
    const testableRepos = TESTABLE_REPOSITORIES;
    
    for (const repoName of testableRepos) {
      const repoPath = join(this.workspaceRoot, '..', repoName);
      
      try {
        await fs.access(join(repoPath, '.git'));
        
        const repoStartTime = Date.now();
        const testResults: any[] = [];
        
        // Check for integration test directories
        const integrationPaths = [
          join(repoPath, 'tests', 'integration'),
          join(repoPath, 'tests', 'e2e'),
          join(repoPath, 'test', 'integration'),
          join(repoPath, 'test', 'e2e')
        ];
        
        let hasIntegrationTests = false;
        
        for (const testPath of integrationPaths) {
          try {
            await fs.access(testPath);
            hasIntegrationTests = true;
            
            // Run Go integration tests
            if (await this.fileExists(join(repoPath, 'go.mod'))) {
              const result = await this.runCommand('go', ['test', '-v', testPath], repoPath);
              testResults.push({
                type: 'go-integration',
                path: testPath,
                success: result.success,
                output: result.stdout,
                error: result.stderr
              });
            }
            
            // Run Node.js integration tests
            const packageJsonPath = join(repoPath, 'package.json');
            if (await this.fileExists(packageJsonPath)) {
              const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
              if (packageJson.scripts && packageJson.scripts['test:integration']) {
                const result = await this.runCommand('npm', ['run', 'test:integration'], repoPath);
                testResults.push({
                  type: 'npm-integration',
                  path: testPath,
                  success: result.success,
                  output: result.stdout,
                  error: result.stderr
                });
              }
            }
          } catch {
            // Path doesn't exist, continue
          }
        }
        
        if (!hasIntegrationTests) {
          // Check for standard test commands that might include integration tests
          if (await this.fileExists(join(repoPath, 'go.mod'))) {
            const result = await this.runCommand('go', ['test', './...'], repoPath);
            testResults.push({
              type: 'go-test-all',
              success: result.success,
              output: result.stdout,
              error: result.stderr
            });
          }
        }
        
        const duration = Date.now() - repoStartTime;
        const successful = testResults.length > 0 && testResults.every(r => r.success);
        
        results.push({
          repository: repoName,
          path: repoPath,
          successful,
          duration,
          hasIntegrationTests,
          tests: testResults
        });
        
      } catch (error) {
        results.push({
          repository: repoName,
          path: repoPath,
          successful: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: 0,
          tests: []
        });
      }
    }
    
    const totalDuration = Date.now() - startTime;
    const successfulRepos = results.filter(r => r.successful).length;
    const failedRepos = results.length - successfulRepos;
    const totalTests = results.reduce((sum, r) => sum + r.tests.length, 0);
    const successfulTests = results.reduce((sum, r) => sum + r.tests.filter((t: any) => t.success).length, 0);
    
    return {
      results,
      summary: {
        totalTests,
        successful: successfulTests,
        failed: totalTests - successfulTests,
        totalDuration,
        repositoriesTested: results.length,
        successfulRepos,
        failedRepos
      }
    };
  }

  /**
   * Create pull request from feature branch with task linking
   */
  async createPullRequestFromTask(options: {
    taskId: string;
    repository?: string;
    baseBranch?: string;
    draft?: boolean;
    autoMerge?: boolean;
  } = { taskId: '' }): Promise<any> {
    const repository = options.repository || 'loqa';
    const baseBranch = options.baseBranch || 'main';
    const repoPath = join(this.workspaceRoot, '..', repository);
    
    try {
      // Check if repository exists
      await fs.access(join(repoPath, '.git'));
      
      const git = simpleGit(repoPath);
      const status = await git.status();
      const currentBranch = status.current;
      
      if (!currentBranch || currentBranch === baseBranch) {
        return {
          success: false,
          repository,
          error: `Must be on a feature branch, currently on: ${currentBranch}`
        };
      }
      
      // Find and read the task file
      const taskManager = new LoqaTaskManager(repoPath);
      const taskList = await taskManager.listTasks(repoPath);
      const taskFile = taskList.tasks.find(f => f.includes(options.taskId));
      
      if (!taskFile) {
        return {
          success: false,
          repository,
          error: `Task ${options.taskId} not found in ${repository}`
        };
      }
      
      const taskPath = join(repoPath, 'backlog', 'tasks', taskFile);
      const taskContent = await fs.readFile(taskPath, 'utf-8');
      
      // Extract task information
      const titleMatch = taskContent.match(/# Task: (.+)/);
      const title = titleMatch?.[1] || `Task ${options.taskId}`;
      
      const descriptionMatch = taskContent.match(/## Description\n([^#]+)/);
      const description = descriptionMatch?.[1]?.trim() || 'No description provided';
      
      const acceptanceCriteriaMatch = taskContent.match(/## Acceptance Criteria\n([^#]+)/);
      const acceptanceCriteria = acceptanceCriteriaMatch?.[1]?.trim() || '';
      
      // Generate PR body
      let prBody = `## Summary\n${description}\n\n`;
      
      if (acceptanceCriteria) {
        prBody += `## Acceptance Criteria\n${acceptanceCriteria}\n\n`;
      }
      
      prBody += `## Test Plan\n- [ ] Unit tests pass\n- [ ] Integration tests pass\n- [ ] Manual testing completed\n\n`;
      prBody += `## Related Task\nImplements: ${taskFile}\n\n`;
      prBody += `🤖 Generated with [Claude Code](https://claude.ai/code)`;
      
      // Push current branch
      await git.push('origin', currentBranch, ['--set-upstream']);
      
      // Create PR using gh CLI
      const ghArgs = [
        'pr', 'create',
        '--title', title,
        '--body', prBody,
        '--base', baseBranch
      ];
      
      if (options.draft) {
        ghArgs.push('--draft');
      }
      
      const result = await this.runCommand('gh', ghArgs, repoPath);
      
      if (result.success) {
        // Extract PR URL from output
        const urlMatch = result.stdout.match(/https:\/\/github\.com\/[^\s]+/);
        const prUrl = urlMatch?.[0];
        
        return {
          success: true,
          repository,
          branchName: currentBranch,
          baseBranch,
          taskId: options.taskId,
          taskFile,
          prUrl,
          title,
          draft: options.draft || false
        };
      } else {
        return {
          success: false,
          repository,
          error: result.stderr || 'Failed to create PR'
        };
      }
      
    } catch (error) {
      return {
        success: false,
        repository,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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
  
  // Helper methods
  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
  
  private async runCommand(command: string, args: string[], cwd: string): Promise<{ success: boolean; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const child = spawn(command, args, { 
        cwd, 
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true 
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({
          success: code === 0,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });
      
      child.on('error', (error) => {
        resolve({
          success: false,
          stdout: '',
          stderr: error.message
        });
      });
    });
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
    // Import context detection
    const { detectWorkspaceContext } = await import('./utils/context-detector.js');
    const context = await detectWorkspaceContext();
    
    // Create workspace manager for workspace tools with proper context
    let workspaceRoot: string;
    if (context.type === 'individual-repo' && context.workspaceRoot) {
      workspaceRoot = context.workspaceRoot;
    } else if (context.type === 'workspace-root') {
      workspaceRoot = context.workspaceRoot!;
    } else {
      workspaceRoot = process.cwd();
    }
    
    const workspaceManager = new MCPWorkspaceManager(workspaceRoot);
    
    // Route to appropriate modular tool handler
    return await handleToolCall(name, args, workspaceManager);
  } catch (error) {
    // Enhanced error messages with context information
    let errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
    
    try {
      const { detectWorkspaceContext } = await import('./utils/context-detector.js');
      const context = await detectWorkspaceContext();
      
      if (!context.isLoqaWorkspace) {
        errorMessage += '\n\n💡 **Context**: You don\'t appear to be in a Loqa workspace. Many MCP tools require being in a Loqa repository or the workspace root containing multiple Loqa repositories.';
        errorMessage += '\n\n**Suggestions**:';
        errorMessage += `\n• Navigate to a Loqa repository (e.g., \`cd ${getDefaultRepository('development')}\` for development or \`cd ${getDefaultRepository('documentation')}\` for docs)`;
        errorMessage += '\n• Navigate to the workspace root containing Loqa repositories';
        errorMessage += '\n• Use the `repository` parameter to specify which repo to operate on';
      } else if (context.type === 'unknown') {
        errorMessage += '\n\n💡 **Context**: Workspace context could not be determined.';
        errorMessage += `\n**Available repositories**: ${context.availableRepositories.join(', ') || 'None found'}`;
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