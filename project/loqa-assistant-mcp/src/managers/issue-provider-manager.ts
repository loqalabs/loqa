/**
 * Issue Provider Manager
 * 
 * Manages multiple issue providers with intelligent selection, fallback handling,
 * and health monitoring
 */

import {
  IssueProviderBase,
  IssueProvider,
  Issue,
  IssueCreationOptions,
  IssueFilters,
  IssueOperationResult,
  ProviderHealthStatus,
  IssuePriority
} from '../types/issue-provider.js';
import { GitHubIssueProvider } from '../providers/github-issue-provider.js';

export interface IssueProviderConfig {
  preferredProvider: IssueProvider;
  fallbackEnabled: boolean;
  healthCheckInterval: number; // minutes
  maxRetryAttempts: number;
  providerPriority: IssueProvider[];
}

export interface ProviderSelectionCriteria {
  repository?: string;
  issueType?: string;
  priority?: IssuePriority;
  requiredFeatures?: string[];
  preferredProvider?: IssueProvider;
}

export class IssueProviderManager {
  private providers: Map<IssueProvider, IssueProviderBase> = new Map();
  private healthStatus: Map<IssueProvider, ProviderHealthStatus> = new Map();
  private config: IssueProviderConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  
  constructor(config?: Partial<IssueProviderConfig>) {
    this.config = {
      preferredProvider: IssueProvider.GITHUB,
      fallbackEnabled: false,
      healthCheckInterval: 5, // 5 minutes
      maxRetryAttempts: 2,
      providerPriority: [IssueProvider.GITHUB],
      ...config
    };
    
    this.initializeProviders();
    this.startHealthMonitoring();
  }
  
  /**
   * Initialize available providers (GitHub Issues only)
   */
  private initializeProviders(): void {
    // Initialize GitHub provider as primary
    const githubProvider = new GitHubIssueProvider();
    this.providers.set(IssueProvider.GITHUB, githubProvider);
    
    console.log('IssueProviderManager: Initialized providers:', Array.from(this.providers.keys()));
  }
  
  /**
   * Create an issue using the best available provider
   */
  async createIssue(options: IssueCreationOptions): Promise<IssueOperationResult> {
    const criteria: ProviderSelectionCriteria = {
      repository: options.repository,
      priority: options.priority,
      preferredProvider: options.preferredProvider,
      requiredFeatures: this.extractRequiredFeatures(options)
    };
    
    const selectedProvider = await this.selectProvider(criteria, 'create');
    
    if (!selectedProvider) {
      return {
        success: false,
        error: 'GitHub Issues provider not available. Please ensure GitHub CLI (gh) is installed and authenticated.',
        providerUsed: IssueProvider.GITHUB
      };
    }
    
    // Attempt issue creation with retry logic
    return await this.executeWithRetry(
      () => selectedProvider.createIssue(options),
      selectedProvider.providerType,
      criteria
    );
  }
  
  /**
   * Update an issue using the appropriate provider
   */
  async updateIssue(issueId: string, updates: Partial<IssueCreationOptions>): Promise<IssueOperationResult> {
    // First, try to identify which provider owns this issue
    const owningProvider = await this.findIssueOwner(issueId, updates.repository);
    
    if (owningProvider) {
      return await this.executeWithRetry(
        () => owningProvider.updateIssue(issueId, updates),
        owningProvider.providerType
      );
    }
    
    // If we can't find the owner, try all providers
    for (const providerType of this.config.providerPriority) {
      const provider = this.providers.get(providerType);
      if (provider && await this.isProviderHealthy(providerType)) {
        const result = await provider.updateIssue(issueId, updates);
        if (result.success) {
          return result;
        }
      }
    }
    
    return {
      success: false,
      error: `Issue ${issueId} not found in GitHub Issues`,
      providerUsed: IssueProvider.GITHUB
    };
  }
  
  /**
   * Get a specific issue from any provider
   */
  async getIssue(issueId: string, _repository?: string): Promise<IssueOperationResult> {
    // Try to find the issue in all providers
    for (const providerType of this.config.providerPriority) {
      const provider = this.providers.get(providerType);
      if (provider && await this.isProviderHealthy(providerType)) {
        const result = await provider.getIssue(issueId);
        if (result.success && result.issue) {
          return result;
        }
      }
    }
    
    return {
      success: false,
      error: `Issue ${issueId} not found in GitHub Issues`,
      providerUsed: IssueProvider.GITHUB
    };
  }
  
  /**
   * List issues from all providers or a specific provider
   */
  async listIssues(filters?: IssueFilters): Promise<Issue[]> {
    const allIssues: Issue[] = [];
    const providersToQuery = filters?.provider || this.config.providerPriority;
    
    for (const providerType of providersToQuery) {
      const provider = this.providers.get(providerType);
      if (provider && await this.isProviderHealthy(providerType)) {
        try {
          const issues = await provider.listIssues(filters);
          allIssues.push(...issues);
        } catch (error) {
          console.warn(`Failed to list issues from ${providerType}:`, error);
        }
      }
    }
    
    // Remove duplicates and sort by updated date
    const uniqueIssues = this.deduplicateIssues(allIssues);
    return uniqueIssues.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  
  /**
   * Delete an issue from the appropriate provider
   */
  async deleteIssue(issueId: string, repository?: string): Promise<IssueOperationResult> {
    const owningProvider = await this.findIssueOwner(issueId, repository);
    
    if (owningProvider) {
      return await owningProvider.deleteIssue(issueId);
    }
    
    return {
      success: false,
      error: `Issue ${issueId} not found in GitHub Issues`,
      providerUsed: IssueProvider.GITHUB
    };
  }
  
  /**
   * Get health status for all providers
   */
  async getAllProviderHealth(): Promise<Map<IssueProvider, ProviderHealthStatus>> {
    const healthMap = new Map<IssueProvider, ProviderHealthStatus>();
    
    for (const [providerType, provider] of this.providers) {
      try {
        const health = await provider.checkHealth();
        healthMap.set(providerType, health);
        this.healthStatus.set(providerType, health);
      } catch (error) {
        const errorHealth: ProviderHealthStatus = {
          available: false,
          lastChecked: new Date(),
          error: error instanceof Error ? error.message : 'Health check failed',
          capabilities: provider.getCapabilities()
        };
        healthMap.set(providerType, errorHealth);
        this.healthStatus.set(providerType, errorHealth);
      }
    }
    
    return healthMap;
  }
  
  /**
   * Get the best provider for a given criteria
   */
  async selectProvider(
    criteria: ProviderSelectionCriteria,
    operation?: 'create' | 'update' | 'delete' | 'list'
  ): Promise<IssueProviderBase | null> {
    // If a preferred provider is specified and healthy, use it
    if (criteria.preferredProvider) {
      const preferredProvider = this.providers.get(criteria.preferredProvider);
      if (preferredProvider && await this.isProviderHealthy(criteria.preferredProvider)) {
        if (this.providerSupportsOperation(preferredProvider, operation)) {
          return preferredProvider;
        }
      }
    }
    
    // GitHub-specific logic
    if (this.shouldPreferGitHub(criteria)) {
      const githubProvider = this.providers.get(IssueProvider.GITHUB);
      if (githubProvider && await this.isProviderHealthy(IssueProvider.GITHUB)) {
        if (this.providerSupportsOperation(githubProvider, operation)) {
          return githubProvider;
        }
      }
    }
    
    // Fallback to priority order
    for (const providerType of this.config.providerPriority) {
      const provider = this.providers.get(providerType);
      if (provider && await this.isProviderHealthy(providerType)) {
        if (this.providerSupportsOperation(provider, operation)) {
          return provider;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Get available templates from all providers
   */
  async getAvailableTemplates(): Promise<Array<{ provider: IssueProvider; templates: any[] }>> {
    const allTemplates = [];
    
    for (const [providerType, provider] of this.providers) {
      if (provider.getAvailableTemplates && await this.isProviderHealthy(providerType)) {
        try {
          const templates = await provider.getAvailableTemplates();
          allTemplates.push({
            provider: providerType,
            templates
          });
        } catch (error) {
          console.warn(`Failed to get templates from ${providerType}:`, error);
        }
      }
    }
    
    return allTemplates;
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<IssueProviderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('IssueProviderManager: Configuration updated:', this.config);
  }
  
  /**
   * Shutdown the manager and cleanup resources
   */
  shutdown(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }
  
  // Private helper methods
  
  private startHealthMonitoring(): void {
    // Initial health check
    this.getAllProviderHealth().then(() => {
      console.log('IssueProviderManager: Initial health check completed');
    });
    
    // Periodic health checks
    this.healthCheckTimer = setInterval(async () => {
      await this.getAllProviderHealth();
    }, this.config.healthCheckInterval * 60 * 1000);
  }
  
  private async isProviderHealthy(providerType: IssueProvider): Promise<boolean> {
    const health = this.healthStatus.get(providerType);
    if (!health) {
      // No health data, perform check
      const provider = this.providers.get(providerType);
      if (provider) {
        const freshHealth = await provider.checkHealth();
        this.healthStatus.set(providerType, freshHealth);
        return freshHealth.available;
      }
      return false;
    }
    
    // Check if health data is stale (older than 2x health check interval)
    const staleThreshold = this.config.healthCheckInterval * 2 * 60 * 1000;
    const isStale = Date.now() - health.lastChecked.getTime() > staleThreshold;
    
    if (isStale) {
      // Refresh health check
      const provider = this.providers.get(providerType);
      if (provider) {
        try {
          const freshHealth = await provider.checkHealth();
          this.healthStatus.set(providerType, freshHealth);
          return freshHealth.available;
        } catch {
          return false;
        }
      }
    }
    
    return health.available;
  }
  
  private shouldPreferGitHub(criteria: ProviderSelectionCriteria): boolean {
    // Prefer GitHub for:
    // 1. Cross-repository work
    // 2. High priority issues that might need external visibility
    // 3. Issues that require collaboration features
    
    if (criteria.repository?.includes('/')) {
      // Repository specified as owner/repo format
      return true;
    }
    
    if (criteria.priority === IssuePriority.HIGH || criteria.priority === IssuePriority.CRITICAL) {
      return true;
    }
    
    if (criteria.requiredFeatures?.includes('collaboration')) {
      return true;
    }
    
    if (criteria.issueType?.includes('cross-repo')) {
      return true;
    }
    
    return false;
  }
  
  private extractRequiredFeatures(options: IssueCreationOptions): string[] {
    const features: string[] = [];
    
    if (options.assignee) features.push('assignment');
    if (options.labels?.length) features.push('labels');
    if (options.acceptanceCriteria?.length) features.push('acceptance-criteria');
    if (options.dependencies?.length) features.push('dependencies');
    if (options.template) features.push('templates');
    
    return features;
  }
  
  private providerSupportsOperation(
    provider: IssueProviderBase,
    operation?: 'create' | 'update' | 'delete' | 'list'
  ): boolean {
    if (!operation) return true;
    
    const capabilities = provider.getCapabilities();
    
    switch (operation) {
      case 'create': return capabilities.canCreate;
      case 'update': return capabilities.canUpdate;
      case 'delete': return capabilities.canDelete;
      case 'list': return capabilities.canList;
      default: return true;
    }
  }
  
  private async findIssueOwner(issueId: string, _repository?: string): Promise<IssueProviderBase | null> {
    for (const [providerType, provider] of this.providers) {
      if (await this.isProviderHealthy(providerType)) {
        try {
          const result = await provider.getIssue(issueId);
          if (result.success && result.issue) {
            return provider;
          }
        } catch {
          // Continue to next provider
        }
      }
    }
    
    return null;
  }
  
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    providerType: IssueProvider,
    fallbackCriteria?: ProviderSelectionCriteria
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`IssueProviderManager: Attempt ${attempt} failed for ${providerType}:`, error);
        
        if (attempt === this.config.maxRetryAttempts) {
          break;
        }
        
        // Wait before retry
        await this.delay(1000 * attempt);
      }
    }
    
    // If all retries failed and fallback is enabled, try other providers
    if (this.config.fallbackEnabled && fallbackCriteria) {
      const fallbackProviders = this.config.providerPriority.filter(p => p !== providerType);
      
      for (const fallbackType of fallbackProviders) {
        const fallbackProvider = this.providers.get(fallbackType);
        if (fallbackProvider && await this.isProviderHealthy(fallbackType)) {
          try {
            console.log(`IssueProviderManager: Falling back to ${fallbackType}`);
            return await operation();
          } catch (error) {
            console.warn(`IssueProviderManager: Fallback to ${fallbackType} failed:`, error);
          }
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }
  
  private deduplicateIssues(issues: Issue[]): Issue[] {
    const seen = new Set<string>();
    const unique: Issue[] = [];
    
    for (const issue of issues) {
      const key = `${issue.title}-${issue.provider}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(issue);
      }
    }
    
    return unique;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}