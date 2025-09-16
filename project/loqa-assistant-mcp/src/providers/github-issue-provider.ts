/**
 * GitHub Issue Provider Implementation
 * 
 * Primary issue provider using GitHub Issues via MCP tools with gh CLI fallback
 */

import { spawn } from 'child_process';
import {
  IssueProviderBase,
  IssueProvider,
  Issue,
  IssueStatus,
  IssuePriority,
  IssueCreationOptions,
  IssueFilters,
  IssueOperationResult,
  ProviderHealthStatus,
  ProviderCapabilities,
  GitHubIssueData
} from '../types/issue-provider.js';

// Simple label mapping for GitHub integration
const GITHUB_LABEL_MAPPING = {
  priorityLabels: {
    [IssuePriority.LOW]: 'priority: low',
    [IssuePriority.MEDIUM]: 'priority: medium',
    [IssuePriority.HIGH]: 'priority: high',
    [IssuePriority.CRITICAL]: 'priority: critical'
  },
  typeLabels: {
    'Feature': 'type: feature',
    'Bug Fix': 'type: bug',
    'Improvement': 'type: enhancement',
    'Documentation': 'type: documentation',
    'Refactoring': 'type: refactoring'
  } as Record<string, string>,
  customMappings: {
    'cross-repo': 'scope: cross-repo',
    'protocol-change': 'scope: protocol',
    'breaking-change': 'type: breaking-change'
  } as Record<string, string>
};

export class GitHubIssueProvider extends IssueProviderBase {
  readonly providerType = IssueProvider.GITHUB;
  readonly name = 'GitHub Issues';
  
  private defaultOwner: string;
  private defaultRepo: string;
  private mcpToolCallback?: (toolName: string, params: any) => Promise<any>;
  
  constructor(
    defaultOwner: string = 'loqalabs', 
    defaultRepo: string = 'loqa',
    mcpToolCallback?: (toolName: string, params: any) => Promise<any>
  ) {
    super();
    this.defaultOwner = defaultOwner;
    this.defaultRepo = defaultRepo;
    this.mcpToolCallback = mcpToolCallback;
  }
  
  /**
   * Set the MCP tool callback for real tool integration
   */
  setMcpToolCallback(callback: (toolName: string, params: any) => Promise<any>) {
    this.mcpToolCallback = callback;
  }
  
  /**
   * Create a new GitHub issue using MCP tools or gh CLI fallback
   */
  async createIssue(options: IssueCreationOptions): Promise<IssueOperationResult> {
    try {
      // Determine repository from options or use default
      const [owner, repo] = this.parseRepository(options.repository);
      
      // Map Loqa concepts to GitHub labels
      const labels = this.mapToGitHubLabels(options);
      
      // Try MCP tools first if available
      if (this.mcpToolCallback) {
        return await this.createIssueViaMcp(owner, repo, options, labels);
      }
      
      // Fallback to gh CLI
      return await this.createIssueViaGhCli(owner, repo, options, labels);
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to create GitHub issue: ${error instanceof Error ? error.message : error}`,
        providerUsed: IssueProvider.GITHUB
      };
    }
  }
  
  /**
   * Create issue via MCP GitHub tools
   */
  private async createIssueViaMcp(
    owner: string, 
    repo: string, 
    options: IssueCreationOptions,
    labels: string[]
  ): Promise<IssueOperationResult> {
    try {
      const issueData = {
        owner,
        repo,
        title: options.title,
        body: this.formatIssueDescription(options),
        labels,
        assignees: options.assignee ? [options.assignee] : undefined
      };
      
      const issue = await this.mcpToolCallback!('mcp__github__create_issue', issueData);
      
      return {
        success: true,
        issue: this.convertToUnifiedIssue(issue),
        providerUsed: IssueProvider.GITHUB
      };
      
    } catch (error) {
      throw new Error(`MCP GitHub creation failed: ${error instanceof Error ? error.message : error}`);
    }
  }
  
  /**
   * Create issue via gh CLI as fallback
   */
  private async createIssueViaGhCli(
    owner: string,
    repo: string, 
    options: IssueCreationOptions,
    labels: string[]
  ): Promise<IssueOperationResult> {
    try {
      const args = [
        'issue', 'create',
        '--repo', `${owner}/${repo}`,
        '--title', options.title,
        '--body', this.formatIssueDescription(options)
      ];
      
      if (labels.length > 0) {
        args.push('--label', labels.join(','));
      }
      
      if (options.assignee) {
        args.push('--assignee', options.assignee);
      }
      
      const result = await this.executeGhCommand(args);
      
      if (!result.success) {
        throw new Error(`gh CLI failed: ${result.stderr}`);
      }
      
      // Parse issue URL from output
      const issueUrlMatch = result.stdout.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/issues\/(\d+)/);
      const issueNumber = issueUrlMatch ? parseInt(issueUrlMatch[1]) : 0;
      
      // Create unified issue object from CLI result
      const issue: Issue = {
        id: issueNumber.toString(),
        title: options.title,
        description: options.description,
        status: IssueStatus.PENDING,
        priority: options.priority || IssuePriority.MEDIUM,
        assignee: options.assignee,
        labels: labels,
        createdAt: new Date(),
        updatedAt: new Date(),
        repository: `${owner}/${repo}`,
        url: issueUrlMatch ? issueUrlMatch[0] : undefined,
        provider: IssueProvider.GITHUB,
        providerData: {
          issueNumber,
          state: 'open',
          htmlUrl: issueUrlMatch ? issueUrlMatch[0] : '',
          apiUrl: `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
          commentsCount: 0
        }
      };
      
      return {
        success: true,
        issue,
        providerUsed: IssueProvider.GITHUB,
        fallbackUsed: true
      };
      
    } catch (error) {
      throw new Error(`gh CLI creation failed: ${error instanceof Error ? error.message : error}`);
    }
  }
  
  /**
   * Update an existing GitHub issue
   */
  async updateIssue(issueId: string, updates: Partial<IssueCreationOptions>): Promise<IssueOperationResult> {
    try {
      const [owner, repo] = this.parseRepository(updates.repository);
      
      if (this.mcpToolCallback) {
        return await this.updateIssueViaMcp(owner, repo, issueId, updates);
      }
      
      return await this.updateIssueViaGhCli(owner, repo, issueId, updates);
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to update GitHub issue: ${error instanceof Error ? error.message : error}`,
        providerUsed: IssueProvider.GITHUB
      };
    }
  }
  
  private async updateIssueViaMcp(
    owner: string,
    repo: string, 
    issueId: string,
    updates: Partial<IssueCreationOptions>
  ): Promise<IssueOperationResult> {
    try {
      const updateData: any = {
        owner,
        repo,
        issue_number: parseInt(issueId)
      };
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.body = updates.description;
      if (updates.assignee) updateData.assignees = [updates.assignee];
      if (updates.labels) updateData.labels = updates.labels;
      
      const issue = await this.mcpToolCallback!('mcp__github__update_issue', updateData);
      
      return {
        success: true,
        issue: this.convertToUnifiedIssue(issue),
        providerUsed: IssueProvider.GITHUB
      };
    } catch (error) {
      return {
        success: false,
        error: `MCP update failed: ${error instanceof Error ? error.message : error}`,
        providerUsed: IssueProvider.GITHUB
      };
    }
  }
  
  private async updateIssueViaGhCli(
    owner: string,
    repo: string,
    issueId: string, 
    updates: Partial<IssueCreationOptions>
  ): Promise<IssueOperationResult> {
    const args = ['issue', 'edit', issueId, '--repo', `${owner}/${repo}`];
    
    if (updates.title) {
      args.push('--title', updates.title);
    }
    
    if (updates.description) {
      args.push('--body', updates.description);
    }
    
    const result = await this.executeGhCommand(args);
    
    return {
      success: result.success,
      error: result.success ? undefined : result.stderr,
      providerUsed: IssueProvider.GITHUB,
      fallbackUsed: true
    };
  }
  
  /**
   * Get a specific GitHub issue
   */
  async getIssue(issueId: string): Promise<IssueOperationResult> {
    try {
      const [owner, repo] = this.parseRepository();
      
      if (this.mcpToolCallback) {
        return await this.getIssueViaMcp(owner, repo, issueId);
      }
      
      return await this.getIssueViaGhCli(owner, repo, issueId);
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to get GitHub issue: ${error instanceof Error ? error.message : error}`,
        providerUsed: IssueProvider.GITHUB
      };
    }
  }
  
  private async getIssueViaMcp(owner: string, repo: string, issueId: string): Promise<IssueOperationResult> {
    try {
      const issue = await this.mcpToolCallback!('mcp__github__get_issue', {
        owner,
        repo,
        issue_number: parseInt(issueId)
      });
      
      return {
        success: true,
        issue: this.convertToUnifiedIssue(issue),
        providerUsed: IssueProvider.GITHUB
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get issue via MCP: ${error instanceof Error ? error.message : error}`,
        providerUsed: IssueProvider.GITHUB
      };
    }
  }
  
  private async getIssueViaGhCli(owner: string, repo: string, issueId: string): Promise<IssueOperationResult> {
    const result = await this.executeGhCommand([
      'issue', 'view', issueId, 
      '--repo', `${owner}/${repo}`,
      '--json', 'number,title,body,state,url,labels,assignees,createdAt,updatedAt'
    ]);
    
    if (!result.success) {
      return {
        success: false,
        error: result.stderr,
        providerUsed: IssueProvider.GITHUB,
        fallbackUsed: true
      };
    }
    
    try {
      const issueData = JSON.parse(result.stdout);
      const issue = this.convertToUnifiedIssue(issueData);
      
      return {
        success: true,
        issue,
        providerUsed: IssueProvider.GITHUB,
        fallbackUsed: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse issue data: ${error instanceof Error ? error.message : error}`,
        providerUsed: IssueProvider.GITHUB,
        fallbackUsed: true
      };
    }
  }
  
  /**
   * List GitHub issues with optional filtering
   */
  async listIssues(filters?: IssueFilters): Promise<Issue[]> {
    try {
      const [owner, repo] = this.parseRepository(filters?.repository?.[0]);

      if (this.mcpToolCallback) {
        return await this.listIssuesViaMcp(owner, repo, filters);
      }
      return await this.listIssuesViaGhCli(owner, repo, filters);

    } catch (error) {
      console.error('Failed to list GitHub issues:', error);
      return [];
    }
  }
  
  private async listIssuesViaMcp(owner: string, repo: string, filters?: IssueFilters): Promise<Issue[]> {
    try {
      const params: any = { owner, repo };
      
      if (filters?.status?.includes(IssueStatus.COMPLETED)) {
        params.state = 'closed';
      } else {
        params.state = 'open';
      }
      
      if (filters?.assignee?.length) {
        params.assignee = filters.assignee[0];
      }
      
      if (filters?.labels?.length) {
        params.labels = filters.labels.join(',');
      }
      
      const issues = await this.mcpToolCallback!('mcp__github__list_issues', params);
      return issues.map((issue: any) => this.convertToUnifiedIssue(issue));
    } catch (error) {
      console.error('Failed to list issues via MCP:', error);
      return [];
    }
  }
  
  private async listIssuesViaGhCli(owner: string, repo: string, filters?: IssueFilters): Promise<Issue[]> {
    const args = [
      'issue', 'list',
      '--repo', `${owner}/${repo}`,
      '--json', 'number,title,body,state,url,labels,assignees,createdAt,updatedAt',
      '--limit', '100'
    ];

    // Apply filters
    if (filters?.status?.includes(IssueStatus.COMPLETED)) {
      args.push('--state', 'closed');
    } else {
      args.push('--state', 'open');
    }

    if (filters?.assignee?.length) {
      args.push('--assignee', filters.assignee.join(','));
    }

    if (filters?.labels?.length) {
      args.push('--label', filters.labels.join(','));
    }

    const result = await this.executeGhCommand(args);

    if (!result.success) {
      console.error('gh CLI list failed:', result.stderr);
      return [];
    }

    try {
      const issues = JSON.parse(result.stdout);
      return issues.map((issue: any) => this.convertToUnifiedIssue(issue));
    } catch (error) {
      console.error('Failed to parse issues list:', error);
      return [];
    }
  }
  
  /**
   * Delete a GitHub issue (close it)
   */
  async deleteIssue(issueId: string): Promise<IssueOperationResult> {
    try {
      const [owner, repo] = this.parseRepository();
      
      const result = await this.executeGhCommand([
        'issue', 'close', issueId,
        '--repo', `${owner}/${repo}`
      ]);
      
      return {
        success: result.success,
        error: result.success ? undefined : result.stderr,
        providerUsed: IssueProvider.GITHUB,
        fallbackUsed: true
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to close GitHub issue: ${error instanceof Error ? error.message : error}`,
        providerUsed: IssueProvider.GITHUB
      };
    }
  }
  
  /**
   * Check if provider is available and healthy
   */
  async checkHealth(): Promise<ProviderHealthStatus> {
    const startTime = Date.now();
    
    try {
      // Test gh CLI availability as primary health check
      const result = await this.executeGhCommand(['--version']);
      const responseTime = Date.now() - startTime;
      
      return {
        available: result.success,
        lastChecked: new Date(),
        responseTime,
        error: result.success ? undefined : result.stderr,
        capabilities: this.getCapabilities()
      };
      
    } catch (error) {
      return {
        available: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        capabilities: this.getCapabilities()
      };
    }
  }
  
  /**
   * Get provider capabilities
   */
  getCapabilities(): ProviderCapabilities {
    return {
      canCreate: true,
      canUpdate: true,
      canDelete: true, // Close issues
      canList: true,
      canSearch: true,
      canAssign: true,
      canLabel: true,
      canComment: true,
      supportsTemplates: true,
      supportsAcceptanceCriteria: true,
      supportsMilestones: true,
      maxTitleLength: 256,
      maxDescriptionLength: 65536
    };
  }
  
  /**
   * Check if provider is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const result = await this.executeGhCommand(['--version']);
      return result.success;
    } catch {
      return false;
    }
  }
  
  /**
   * Convert GitHub issue to unified issue format
   */
  convertToUnifiedIssue(issueData: any): Issue {
    const gitHubData: GitHubIssueData = {
      issueNumber: issueData.number,
      state: issueData.state,
      htmlUrl: issueData.html_url || issueData.url,
      apiUrl: issueData.url || `https://api.github.com/repos/${this.defaultOwner}/${this.defaultRepo}/issues/${issueData.number}`,
      commentsCount: issueData.comments || 0,
      milestone: issueData.milestone ? {
        title: issueData.milestone.title,
        description: issueData.milestone.description,
        state: issueData.milestone.state
      } : undefined
    };
    
    return {
      id: issueData.number.toString(),
      title: issueData.title,
      description: issueData.body,
      status: issueData.state === 'closed' ? IssueStatus.COMPLETED : IssueStatus.PENDING,
      priority: this.extractPriorityFromLabels(issueData.labels || []),
      assignee: issueData.assignees?.[0]?.login,
      labels: (issueData.labels || []).map((label: any) => label.name),
      createdAt: new Date(issueData.created_at || issueData.createdAt),
      updatedAt: new Date(issueData.updated_at || issueData.updatedAt),
      repository: `${this.defaultOwner}/${this.defaultRepo}`,
      url: issueData.html_url || issueData.url,
      provider: IssueProvider.GITHUB,
      providerData: gitHubData
    };
  }
  
  // Helper methods
  
  private parseRepository(repository?: string): [string, string] {
    if (!repository) {
      return [this.defaultOwner, this.defaultRepo];
    }
    
    const parts = repository.split('/');
    if (parts.length === 2) {
      return [parts[0], parts[1]];
    }
    
    return [this.defaultOwner, repository];
  }
  
  private mapToGitHubLabels(options: IssueCreationOptions): string[] {
    const labels: string[] = [];
    
    // Add priority label
    if (options.priority) {
      const priorityLabel = GITHUB_LABEL_MAPPING.priorityLabels[options.priority];
      if (priorityLabel) labels.push(priorityLabel);
    }
    
    // Add type label
    if (options.type) {
      const typeLabel = GITHUB_LABEL_MAPPING.typeLabels[options.type];
      if (typeLabel) labels.push(typeLabel);
    }
    
    // Add template-based labels
    if (options.template) {
      const templateLabel = GITHUB_LABEL_MAPPING.customMappings[options.template];
      if (templateLabel) labels.push(templateLabel);
    }
    
    // Add custom labels
    if (options.labels) {
      labels.push(...options.labels);
    }
    
    return [...new Set(labels)]; // Remove duplicates
  }
  
  private formatIssueDescription(options: IssueCreationOptions): string {
    let description = options.description || '';
    
    if (options.acceptanceCriteria?.length) {
      description += '\n\n## Acceptance Criteria\n';
      options.acceptanceCriteria.forEach((criteria, index) => {
        description += `${index + 1}. ${criteria}\n`;
      });
    }
    
    if (options.dependencies?.length) {
      description += '\n\n## Dependencies\n';
      options.dependencies.forEach(dep => {
        description += `- ${dep}\n`;
      });
    }
    
    if (options.estimatedEffort) {
      description += `\n\n## Estimated Effort\n${options.estimatedEffort}`;
    }
    
    return description.trim();
  }
  
  private extractPriorityFromLabels(labels: any[]): IssuePriority {
    const labelNames = labels.map(label => 
      typeof label === 'string' ? label : label.name
    );
    
    for (const [priority, labelName] of Object.entries(GITHUB_LABEL_MAPPING.priorityLabels)) {
      if (labelNames.includes(labelName)) {
        return priority as IssuePriority;
      }
    }
    
    return IssuePriority.MEDIUM; // Default
  }
  
  private async executeGhCommand(args: string[]): Promise<{ success: boolean; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const child = spawn('gh', args, { stdio: 'pipe' });
      
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