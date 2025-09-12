#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server";
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
    aiAnalysis?: any;
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
    
    // AI-Powered Enhancement: Add strategic analysis
    let aiAnalysis = null;
    try {
      aiAnalysis = await this.performAIPoweredTaskAnalysis(scoredTasks, options);
    } catch (error) {
      console.warn('AI analysis failed for task prioritization:', error);
    }
    
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
      },
      aiAnalysis
    };
  }

  /**
   * AI-Powered strategic analysis of task prioritization results
   */
  private async performAIPoweredTaskAnalysis(scoredTasks: any[], options: any): Promise<any> {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');

    // Load project context
    const projectDocs: string[] = [];
    
    try {
      // Load main project documentation
      const claudeFile = await readFile(join(this.actualWorkspaceRoot, 'loqa', 'CLAUDE.md'), 'utf-8');
      projectDocs.push(claudeFile);
      
      // Load README files from key repositories
      const keyRepos = ['loqa-hub', 'loqa-commander', 'loqa-relay', 'loqa-skills'];
      for (const repo of keyRepos) {
        try {
          const readmePath = join(this.actualWorkspaceRoot, repo, 'README.md');
          const readme = await readFile(readmePath, 'utf-8');
          projectDocs.push(`# ${repo} README\n\n${readme}`);
        } catch {
          // README doesn't exist, skip
        }
      }
    } catch (error) {
      console.warn('Could not load project documentation for AI analysis');
    }

    // Prepare task summaries for analysis
    const taskSummaries = scoredTasks.slice(0, 10).map(task => ({
      title: task.title,
      repository: task.repository,
      priority: task.priority,
      score: task.score,
      contentPreview: task.content?.substring(0, 300) + (task.content?.length > 300 ? '...' : '')
    }));

    // Use the existing AI reasoning approach (similar to task matching and work selection)
    const analysisPrompt = `Based on the Loqa voice assistant project context and current task landscape, analyze the following task prioritization results and provide strategic insights.

**Project Context:**
${projectDocs.join('\n\n---\n\n').substring(0, 8000)}

**Current Context:**
- Role: ${options.roleContext || 'general developer'}
- Time Available: ${options.timeAvailable || 'flexible'}
- Repository Focus: ${options.repositoryFocus || 'all repositories'}
- Priority Filter: ${options.priority || 'all priorities'}

**Top Prioritized Tasks:**
${taskSummaries.map((task, i) => `${i + 1}. ${task.title} (${task.repository}) - Priority: ${task.priority}, Score: ${task.score}`).join('\n')}

Analyze this prioritization and provide:

1. **Strategic Alignment**: How well do the top tasks align with Loqa's current architecture goals?
2. **Project Health Assessment**: What does the task distribution tell us about project health?
3. **Bottleneck Analysis**: Identify any potential bottlenecks or dependencies
4. **Optimization Recommendations**: Suggest 2-3 specific improvements to task prioritization
5. **Risk Assessment**: Flag any high-risk tasks or missing critical work
6. **Timeline Insights**: Estimate realistic completion windows given the current context

Provide a structured analysis focusing on actionable insights.`;

    // Simple analysis result structure (in a real implementation, this would be sent to an LLM)
    // For now, provide intelligent heuristic-based analysis
    const analysis = {
      strategicAlignment: this.assessStrategicAlignment(taskSummaries),
      projectHealth: this.assessProjectHealth(scoredTasks, options),
      bottlenecks: this.identifyBottlenecks(taskSummaries),
      optimizationRecommendations: this.generateOptimizationRecommendations(scoredTasks, options),
      riskAssessment: this.assessTaskRisks(taskSummaries),
      timelineInsights: this.generateTimelineInsights(scoredTasks, options)
    };

    return analysis;
  }

  private assessStrategicAlignment(taskSummaries: any[]): string {
    const repoDistribution = taskSummaries.reduce((acc: any, task) => {
      acc[task.repository] = (acc[task.repository] || 0) + 1;
      return acc;
    }, {});
    
    const hasBackendWork = taskSummaries.some(t => ['loqa-hub', 'loqa-relay'].includes(t.repository));
    const hasFrontendWork = taskSummaries.some(t => ['loqa-commander'].includes(t.repository));
    const hasSkillsWork = taskSummaries.some(t => t.repository === 'loqa-skills');
    
    if (hasBackendWork && hasFrontendWork && hasSkillsWork) {
      return 'Excellent - balanced across core microservice architecture';
    } else if (hasBackendWork && hasFrontendWork) {
      return 'Good - covers core services, consider skills development';
    } else {
      return 'Moderate - focused on specific area, may benefit from broader scope';
    }
  }

  private assessProjectHealth(scoredTasks: any[], options: any): string {
    const highPriorityCount = scoredTasks.filter(t => t.priority === 'High').length;
    const totalTasks = scoredTasks.length;
    const avgScore = scoredTasks.reduce((sum, t) => sum + t.score, 0) / totalTasks;
    
    if (highPriorityCount > totalTasks * 0.5) {
      return 'Critical - high volume of urgent tasks indicates potential issues';
    } else if (avgScore > 4) {
      return 'Healthy - tasks are well-aligned with current priorities';
    } else {
      return 'Stable - normal task distribution with room for optimization';
    }
  }

  private identifyBottlenecks(taskSummaries: any[]): string[] {
    const bottlenecks: string[] = [];
    
    const hubTasks = taskSummaries.filter(t => t.repository === 'loqa-hub').length;
    const protoTasks = taskSummaries.filter(t => t.repository === 'loqa-proto').length;
    
    if (protoTasks > 2) {
      bottlenecks.push('Protocol changes may block other service development');
    }
    
    if (hubTasks > 5) {
      bottlenecks.push('Heavy focus on hub service may indicate architectural complexity');
    }
    
    const skillsImplementation = taskSummaries.some(t => 
      t.title.toLowerCase().includes('skill') && t.title.toLowerCase().includes('implement'));
    const skillsInfra = taskSummaries.some(t => 
      t.title.toLowerCase().includes('skill') && (t.title.toLowerCase().includes('system') || t.title.toLowerCase().includes('framework')));
    
    if (skillsImplementation && !skillsInfra) {
      bottlenecks.push('Skills implementation without framework may need infrastructure work');
    }
    
    return bottlenecks;
  }

  private generateOptimizationRecommendations(scoredTasks: any[], options: any): string[] {
    const recommendations: string[] = [];
    
    // Role-specific recommendations
    if (options.roleContext === 'developer') {
      const implTasks = scoredTasks.filter(t => 
        t.content?.toLowerCase().includes('implement') || 
        t.content?.toLowerCase().includes('feature')).length;
      if (implTasks < 3) {
        recommendations.push('Consider prioritizing implementation tasks to maintain development momentum');
      }
    }
    
    // Repository balance recommendations
    const repoDistribution = scoredTasks.reduce((acc: any, task) => {
      acc[task.repository] = (acc[task.repository] || 0) + 1;
      return acc;
    }, {});
    
    const maxRepoTasks = Math.max(...Object.values(repoDistribution) as number[]);
    const totalTasks = scoredTasks.length;
    
    if (maxRepoTasks > totalTasks * 0.7) {
      recommendations.push('Consider distributing tasks across repositories to avoid single-point bottlenecks');
    }
    
    // Priority balance
    const highPriorityTasks = scoredTasks.filter(t => t.priority === 'High').length;
    if (highPriorityTasks > 5) {
      recommendations.push('High volume of high-priority tasks - consider re-evaluating priorities or breaking down tasks');
    }
    
    return recommendations;
  }

  private assessTaskRisks(taskSummaries: any[]): string[] {
    const risks: string[] = [];
    
    // Protocol change risks
    const protoChanges = taskSummaries.filter(t => 
      t.repository === 'loqa-proto' || 
      t.title.toLowerCase().includes('protocol') ||
      t.title.toLowerCase().includes('grpc')).length;
    
    if (protoChanges > 0) {
      risks.push('Protocol changes require careful cross-service coordination');
    }
    
    // Infrastructure risks
    const infraTasks = taskSummaries.filter(t => 
      t.title.toLowerCase().includes('deploy') ||
      t.title.toLowerCase().includes('docker') ||
      t.title.toLowerCase().includes('infrastructure')).length;
    
    if (infraTasks > 2) {
      risks.push('Multiple infrastructure changes increase deployment complexity');
    }
    
    // Breaking change risks
    const breakingTasks = taskSummaries.filter(t => 
      t.title.toLowerCase().includes('breaking') ||
      t.title.toLowerCase().includes('migrate') ||
      t.title.toLowerCase().includes('refactor')).length;
      
    if (breakingTasks > 1) {
      risks.push('Multiple breaking changes may require careful sequencing');
    }
    
    return risks;
  }

  private generateTimelineInsights(scoredTasks: any[], options: any): string {
    const timeAvailable = options.timeAvailable || 'flexible';
    const taskCount = scoredTasks.length;
    
    if (timeAvailable.includes('hour')) {
      const hours = parseInt(timeAvailable.match(/\d+/)?.[0] || '2');
      const feasibleTasks = Math.min(hours, 2);
      return `With ${hours} hour(s), focus on ${feasibleTasks} high-impact task(s) from the top priorities`;
    } else if (timeAvailable.includes('day')) {
      const days = parseInt(timeAvailable.match(/\d+/)?.[0] || '1');
      const feasibleTasks = Math.min(days * 2, 5);
      return `${days} day(s) allows completion of ${feasibleTasks} tasks with proper testing and quality checks`;
    } else if (timeAvailable.includes('week')) {
      const weeks = parseInt(timeAvailable.match(/\d+/)?.[0] || '1');
      return `${weeks} week(s) enables comprehensive feature development across multiple repositories`;
    } else {
      return `Flexible timeline allows strategic selection based on complexity and dependencies`;
    }
  }

  /**
   * Phase 2: Advanced Cross-Repository Coordination Intelligence
   */
  async performIntelligentCrossRepoAnalysis(options: {
    changeType: 'protocol' | 'feature' | 'bugfix' | 'infrastructure' | 'breaking';
    targetRepository: string;
    changedFiles?: string[];
    description?: string;
  }): Promise<{
    coordinationPlan: {
      affectedRepositories: Array<{
        name: string;
        impactLevel: 'high' | 'medium' | 'low';
        requiredChanges: string[];
        estimatedEffort: string;
        blockedBy: string[];
        blocks: string[];
      }>;
      executionOrder: string[];
      riskAssessment: {
        level: 'low' | 'medium' | 'high' | 'critical';
        factors: string[];
        mitigations: string[];
      };
      timelineEstimate: {
        total: string;
        byPhase: { [phase: string]: string };
      };
      communicationPlan: {
        stakeholders: string[];
        checkpoints: string[];
        documentation: string[];
      };
    };
    intelligence: {
      dependencyGraph: { [repo: string]: string[] };
      criticalPath: string[];
      parallelizable: string[][];
      sequentialSteps: string[];
    };
  }> {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    
    // Load repository interdependencies and current state
    const repoStates = await this.analyzeRepositoryStates();
    const dependencyGraph = this.buildDependencyGraph(options.changeType);
    const impactAnalysis = await this.analyzeChangeImpact(options, repoStates);
    
    // Generate intelligent coordination plan
    const coordinationPlan = {
      affectedRepositories: impactAnalysis.affectedRepos,
      executionOrder: this.calculateOptimalExecutionOrder(dependencyGraph, impactAnalysis.affectedRepos),
      riskAssessment: this.assessCoordinationRisk(options, impactAnalysis),
      timelineEstimate: this.estimateCoordinationTimeline(impactAnalysis.affectedRepos, options.changeType),
      communicationPlan: this.generateCommunicationPlan(impactAnalysis.affectedRepos, options)
    };
    
    const intelligence = {
      dependencyGraph,
      criticalPath: this.identifyCriticalPath(dependencyGraph, impactAnalysis.affectedRepos),
      parallelizable: this.identifyParallelizableWork(dependencyGraph, impactAnalysis.affectedRepos),
      sequentialSteps: this.identifySequentialSteps(dependencyGraph, impactAnalysis.affectedRepos)
    };
    
    return { coordinationPlan, intelligence };
  }

  private async analyzeRepositoryStates(): Promise<{ [repo: string]: any }> {
    const repoStates: { [repo: string]: any } = {};
    
    for (const repoName of this.knownRepositories) {
      const repoPath = join(this.actualWorkspaceRoot, repoName);
      try {
        const taskManager = new LoqaTaskManager(repoPath);
        const taskList = await taskManager.listTasks();
        
        repoStates[repoName] = {
          activeTasks: taskList.tasks?.length || 0,
          hasBacklog: taskList.tasks?.length > 0,
          // Could extend with git status, branch info, etc.
        };
      } catch {
        repoStates[repoName] = {
          activeTasks: 0,
          hasBacklog: false
        };
      }
    }
    
    return repoStates;
  }

  private buildDependencyGraph(changeType: string): { [repo: string]: string[] } {
    // Loqa microservice architecture dependencies
    const baseDependencies = {
      'loqa-proto': [], // Foundation - no dependencies
      'loqa-skills': ['loqa-proto'], // Depends on protocol definitions
      'loqa-hub': ['loqa-proto', 'loqa-skills'], // Core service depends on proto and skills
      'loqa-relay': ['loqa-proto'], // Audio client depends on protocol
      'loqa-commander': ['loqa-hub'], // UI depends on hub API
      'www-loqalabs-com': [], // Marketing site is independent
      'loqa': [] // Main orchestration repo
    };
    
    // Adjust dependencies based on change type
    if (changeType === 'protocol') {
      // Protocol changes affect all services that use gRPC
      return {
        'loqa-proto': [],
        'loqa-skills': ['loqa-proto'],
        'loqa-hub': ['loqa-proto', 'loqa-skills'],
        'loqa-relay': ['loqa-proto'],
        'loqa-commander': ['loqa-hub'], // Indirectly affected through hub
        'www-loqalabs-com': [],
        'loqa': ['loqa-hub', 'loqa-relay']
      };
    } else if (changeType === 'infrastructure') {
      // Infrastructure changes affect deployment and orchestration
      return {
        'loqa': [], // Infrastructure changes start here
        'loqa-hub': ['loqa'],
        'loqa-commander': ['loqa'],
        'loqa-relay': ['loqa'],
        'loqa-skills': ['loqa'],
        'www-loqalabs-com': ['loqa'],
        'loqa-proto': []
      };
    }
    
    return baseDependencies;
  }

  private async analyzeChangeImpact(options: any, repoStates: any): Promise<{
    affectedRepos: Array<{
      name: string;
      impactLevel: 'high' | 'medium' | 'low';
      requiredChanges: string[];
      estimatedEffort: string;
      blockedBy: string[];
      blocks: string[];
    }>;
  }> {
    const affectedRepos = [];
    const dependencyGraph = this.buildDependencyGraph(options.changeType);
    
    for (const [repoName, dependencies] of Object.entries(dependencyGraph)) {
      const impactLevel = this.calculateRepositoryImpact(repoName, options);
      const effort = this.estimateRepositoryEffort(repoName, impactLevel, options.changeType);
      
      if (impactLevel !== 'low' || repoName === options.targetRepository) {
        affectedRepos.push({
          name: repoName,
          impactLevel,
          requiredChanges: this.identifyRequiredChanges(repoName, options),
          estimatedEffort: effort,
          blockedBy: dependencies,
          blocks: this.findRepositoriesBlockedBy(repoName, dependencyGraph)
        });
      }
    }
    
    return { affectedRepos };
  }

  private calculateRepositoryImpact(repoName: string, options: any): 'high' | 'medium' | 'low' {
    if (repoName === options.targetRepository) return 'high';
    
    const impactMatrix: { [changeType: string]: { [repo: string]: 'high' | 'medium' | 'low' } } = {
      protocol: {
        'loqa-hub': 'high',
        'loqa-relay': 'high', 
        'loqa-skills': 'medium',
        'loqa-commander': 'low',
        'loqa-proto': 'high',
        'www-loqalabs-com': 'low',
        'loqa': 'medium'
      },
      infrastructure: {
        'loqa-hub': 'high',
        'loqa-commander': 'medium',
        'loqa-relay': 'medium',
        'loqa-skills': 'low',
        'loqa-proto': 'low',
        'www-loqalabs-com': 'medium',
        'loqa': 'high'
      },
      breaking: {
        'loqa-hub': 'high',
        'loqa-relay': 'high',
        'loqa-commander': 'high',
        'loqa-skills': 'high',
        'loqa-proto': 'high',
        'www-loqalabs-com': 'low',
        'loqa': 'high'
      }
    };
    
    return impactMatrix[options.changeType]?.[repoName] || 'low';
  }

  private estimateRepositoryEffort(repoName: string, impactLevel: string, changeType: string): string {
    const effortMatrix: { [impact: string]: { [change: string]: string } } = {
      high: {
        protocol: '2-3 days',
        infrastructure: '1-2 days', 
        breaking: '3-5 days',
        feature: '2-4 days',
        bugfix: '4-8 hours'
      },
      medium: {
        protocol: '4-8 hours',
        infrastructure: '2-4 hours',
        breaking: '1-2 days', 
        feature: '1-2 days',
        bugfix: '2-4 hours'
      },
      low: {
        protocol: '1-2 hours',
        infrastructure: '1-2 hours',
        breaking: '2-4 hours',
        feature: '2-6 hours', 
        bugfix: '1-2 hours'
      }
    };
    
    return effortMatrix[impactLevel]?.[changeType] || '2-4 hours';
  }

  private identifyRequiredChanges(repoName: string, options: any): string[] {
    const changeTemplates: { [changeType: string]: { [repo: string]: string[] } } = {
      protocol: {
        'loqa-proto': ['Update .proto files', 'Regenerate bindings', 'Update documentation'],
        'loqa-hub': ['Update gRPC client/server code', 'Update tests', 'Validate compatibility'],
        'loqa-relay': ['Update gRPC client code', 'Update audio streaming', 'Test integration'],
        'loqa-skills': ['Update plugin interface', 'Update skill implementations', 'Test skill loading'],
        'loqa-commander': ['Update API calls if needed', 'Update UI if protocol affects exposed APIs'],
        'loqa': ['Update docker-compose', 'Update documentation', 'Test end-to-end']
      },
      infrastructure: {
        'loqa': ['Update docker-compose.yml', 'Update deployment scripts', 'Update documentation'],
        'loqa-hub': ['Update Dockerfile', 'Update configuration', 'Test deployment'],
        'loqa-commander': ['Update build process', 'Update Dockerfile', 'Test deployment'],
        'loqa-relay': ['Update build process', 'Update configuration', 'Test deployment']
      }
    };
    
    return changeTemplates[options.changeType]?.[repoName] || ['Review and update as needed'];
  }

  private findRepositoriesBlockedBy(repoName: string, dependencyGraph: { [repo: string]: string[] }): string[] {
    const blockedRepos = [];
    for (const [repo, dependencies] of Object.entries(dependencyGraph)) {
      if (dependencies.includes(repoName)) {
        blockedRepos.push(repo);
      }
    }
    return blockedRepos;
  }

  private calculateOptimalExecutionOrder(
    dependencyGraph: { [repo: string]: string[] },
    affectedRepos: Array<{ name: string }>
  ): string[] {
    const repoNames = affectedRepos.map(r => r.name);
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();
    
    // Initialize
    for (const repo of repoNames) {
      inDegree.set(repo, 0);
      adjList.set(repo, []);
    }
    
    // Build graph for affected repositories only
    for (const repo of repoNames) {
      const deps = dependencyGraph[repo] || [];
      for (const dep of deps) {
        if (repoNames.includes(dep)) {
          adjList.get(dep)!.push(repo);
          inDegree.set(repo, inDegree.get(repo)! + 1);
        }
      }
    }
    
    // Topological sort
    const result: string[] = [];
    const queue: string[] = [];
    
    for (const [repo, degree] of inDegree) {
      if (degree === 0) queue.push(repo);
    }
    
    while (queue.length > 0) {
      const repo: string = queue.shift()!;
      result.push(repo);
      
      for (const dependent of adjList.get(repo)!) {
        inDegree.set(dependent, inDegree.get(dependent)! - 1);
        if (inDegree.get(dependent) === 0) {
          queue.push(dependent);
        }
      }
    }
    
    return result;
  }

  private assessCoordinationRisk(options: any, impactAnalysis: any): {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    mitigations: string[];
  } {
    const factors = [];
    const mitigations = [];
    let riskScore = 0;
    
    // Analyze risk factors
    const highImpactRepos = impactAnalysis.affectedRepos.filter((r: any) => r.impactLevel === 'high');
    if (highImpactRepos.length > 3) {
      factors.push(`${highImpactRepos.length} repositories with high impact`);
      mitigations.push('Implement feature flags for gradual rollout');
      riskScore += 2;
    }
    
    if (options.changeType === 'protocol' || options.changeType === 'breaking') {
      factors.push('Breaking changes require careful coordination');
      mitigations.push('Create compatibility layer during transition');
      riskScore += 3;
    }
    
    const totalEstimatedDays = impactAnalysis.affectedRepos.reduce((total: number, repo: any) => {
      const days = parseFloat(repo.estimatedEffort.split('-')[0]) || 1;
      return total + days;
    }, 0);
    
    if (totalEstimatedDays > 10) {
      factors.push('Large time commitment across multiple repositories');
      mitigations.push('Break down into smaller phases');
      riskScore += 2;
    }
    
    // Determine risk level
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 6) level = 'critical';
    else if (riskScore >= 4) level = 'high';
    else if (riskScore >= 2) level = 'medium';
    else level = 'low';
    
    return { level, factors, mitigations };
  }

  private estimateCoordinationTimeline(affectedRepos: any[], changeType: string): {
    total: string;
    byPhase: { [phase: string]: string };
  } {
    const phases = {
      'Planning & Design': '1-2 days',
      'Implementation': '3-8 days', // Based on affected repos
      'Integration & Testing': '2-3 days',
      'Deployment': '1 day'
    };
    
    // Adjust based on complexity
    const highImpactCount = affectedRepos.filter(r => r.impactLevel === 'high').length;
    if (highImpactCount > 2 || changeType === 'breaking') {
      phases['Implementation'] = '5-12 days';
      phases['Integration & Testing'] = '3-5 days';
    }
    
    const totalDays = Object.values(phases).reduce((sum, range) => {
      const max = parseInt(range.split('-')[1]) || parseInt(range.split(' ')[0]);
      return sum + max;
    }, 0);
    
    return {
      total: `${totalDays} days`,
      byPhase: phases
    };
  }

  private generateCommunicationPlan(affectedRepos: any[], options: any): {
    stakeholders: string[];
    checkpoints: string[];
    documentation: string[];
  } {
    const stakeholders = ['Development Team'];
    const checkpoints = ['Planning Complete', 'Implementation Phase 1 Complete'];
    const documentation = ['Change Impact Analysis', 'Implementation Guide'];
    
    if (options.changeType === 'protocol' || options.changeType === 'breaking') {
      stakeholders.push('Architecture Team', 'QA Team');
      checkpoints.push('Protocol Review Complete', 'Backward Compatibility Verified');
      documentation.push('Protocol Migration Guide', 'Breaking Changes Changelog');
    }
    
    if (affectedRepos.some((r: any) => r.impactLevel === 'high')) {
      checkpoints.push('Integration Testing Complete', 'Pre-deployment Review');
    }
    
    return { stakeholders, checkpoints, documentation };
  }

  private identifyCriticalPath(dependencyGraph: { [repo: string]: string[] }, affectedRepos: any[]): string[] {
    // Find the longest dependency chain
    const repoNames = affectedRepos.map(r => r.name);
    let longestPath: string[] = [];
    
    for (const repo of repoNames) {
      const path = this.findLongestPathFrom(repo, dependencyGraph, repoNames, new Set());
      if (path.length > longestPath.length) {
        longestPath = path;
      }
    }
    
    return longestPath;
  }

  private findLongestPathFrom(
    repo: string, 
    dependencyGraph: { [repo: string]: string[] },
    validRepos: string[],
    visited: Set<string>
  ): string[] {
    if (visited.has(repo)) return [];
    visited.add(repo);
    
    let longestPath = [repo];
    const blockedRepos = this.findRepositoriesBlockedBy(repo, dependencyGraph)
      .filter(r => validRepos.includes(r));
    
    for (const blocked of blockedRepos) {
      const path = [repo, ...this.findLongestPathFrom(blocked, dependencyGraph, validRepos, new Set(visited))];
      if (path.length > longestPath.length) {
        longestPath = path;
      }
    }
    
    return longestPath;
  }

  private identifyParallelizableWork(dependencyGraph: { [repo: string]: string[] }, affectedRepos: any[]): string[][] {
    const repoNames = affectedRepos.map(r => r.name);
    const groups: string[][] = [];
    const processed = new Set<string>();
    
    // Group repositories that can be worked on in parallel (no dependencies between them)
    for (const repo of repoNames) {
      if (processed.has(repo)) continue;
      
      const group = [repo];
      processed.add(repo);
      
      for (const otherRepo of repoNames) {
        if (processed.has(otherRepo)) continue;
        
        const deps1 = dependencyGraph[repo] || [];
        const deps2 = dependencyGraph[otherRepo] || [];
        
        // Can work in parallel if neither depends on the other
        if (!deps1.includes(otherRepo) && !deps2.includes(repo)) {
          group.push(otherRepo);
          processed.add(otherRepo);
        }
      }
      
      if (group.length > 1) {
        groups.push(group);
      }
    }
    
    return groups;
  }

  private identifySequentialSteps(dependencyGraph: { [repo: string]: string[] }, affectedRepos: any[]): string[] {
    // Identify repositories that must be done in sequence (critical path)
    return this.identifyCriticalPath(dependencyGraph, affectedRepos);
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
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
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
  
  // Graceful shutdown function following MCP best practices
  const gracefulShutdown = async (signal: string) => {
    console.error(`Received ${signal}, shutting down gracefully...`);
    try {
      // Close transport first, then server (per MCP spec)
      if (transport) {
        await transport.close();
      }
      await server.close();
      console.error("MCP server closed successfully");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  };
  
  // Handle stdio close events for graceful shutdown
  process.stdin.on('close', () => {
    console.error("Stdin closed, shutting down gracefully...");
    gracefulShutdown('stdin-close');
  });
  
  process.stdin.on('end', () => {
    console.error("Stdin ended, shutting down gracefully...");
    gracefulShutdown('stdin-end');
  });
  
  process.stdin.on('error', (error) => {
    console.error("Stdin error:", error);
    gracefulShutdown('stdin-error');
  });
  
  await server.connect(transport);
  console.error("Loqa Assistant MCP server running on stdio");
  
  // Handle termination signals with graceful shutdown
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));
  
  // Handle stdio pipe breaks (parent process exit)
  process.on('SIGPIPE', () => {
    console.error("SIGPIPE received, parent process likely closed");
    gracefulShutdown('SIGPIPE');
  });
  
  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});