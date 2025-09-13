/**
 * GitHub API Optimizer
 *
 * Simple GitHub API management with basic caching and rate limiting.
 * Focused on pragmatic optimization without enterprise complexity.
 */

import { ResilientExecutor } from './circuit-breaker.js';
import { GitHubCacheManager } from './github-cache-manager.js';

export interface GitHubRequest {
  id: string;
  toolName: string;
  params: any;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeout?: number;
  retries?: number;
  tags?: string[];
  dependencies?: string[];
  resolve?: (value: any) => void;
  reject?: (error: any) => void;
  timestamp?: number;
}

export interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number; // ms
  priorityThresholds: {
    critical: number;
    high: number;
    medium: number;
  };
  concurrencyLimits: {
    core: number;
    search: number;
    graphql: number;
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  resetTime: Date;
}

export interface ApiLimits {
  core: RateLimitInfo;
  search: RateLimitInfo;
  graphql: RateLimitInfo;
}

export interface RequestAnalytics {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  rateLimitHits: number;
  cacheHitRate: number;
  topEndpoints: Array<{ endpoint: string; count: number; avgTime: number }>;
}

export interface OptimizationRecommendations {
  suggestions: string[];
  potential_savings: {
    requests_reduced: number;
    time_saved_ms: number;
    rate_limit_pressure_reduction: number;
  };
  priority_actions: string[];
}

export class GitHubApiOptimizer {
  private batchQueue: Map<string, GitHubRequest[]> = new Map();
  private processingBatches = new Set<string>();
  private rateLimits: ApiLimits;
  private config: BatchConfig;
  private cacheManager: GitHubCacheManager;
  private resilientExecutor: ResilientExecutor;
  private requestAnalytics: Map<string, { count: number; totalTime: number; errors: number }> = new Map();
  private batchProcessingTimer?: NodeJS.Timeout;

  constructor(
    cacheManager?: GitHubCacheManager,
    config: Partial<BatchConfig> = {}
  ) {
    this.config = {
      maxBatchSize: 10,
      maxWaitTime: 2000, // 2 seconds
      priorityThresholds: {
        critical: 0, // Process immediately
        high: 500, // 0.5 seconds
        medium: 2000, // 2 seconds
      },
      concurrencyLimits: {
        core: 10,
        search: 2,
        graphql: 5,
      },
      ...config
    };

    this.cacheManager = cacheManager || new GitHubCacheManager();
    this.resilientExecutor = new ResilientExecutor();
    
    this.rateLimits = {
      core: this.createDefaultRateLimit(5000),
      search: this.createDefaultRateLimit(30),
      graphql: this.createDefaultRateLimit(5000)
    };

    this.startBatchProcessing();
    this.setupRateLimitMonitoring();
  }

  /**
   * Execute optimized GitHub API request
   */
  async executeOptimized<T>(
    request: GitHubRequest,
    mcpExecutor: (toolName: string, params: any) => Promise<T>
  ): Promise<T> {
    const apiType = this.getApiType(request.toolName);
    
    // Check if we should batch this request
    if (this.shouldBatch(request, apiType)) {
      return this.addToBatch(request, mcpExecutor);
    }

    // Execute immediately for critical requests or when batching isn't beneficial
    return this.executeSingleRequest(request, mcpExecutor);
  }

  /**
   * Execute multiple requests with intelligent optimization
   */
  async executeMultiple<T>(
    requests: GitHubRequest[],
    mcpExecutor: (toolName: string, params: any) => Promise<T>
  ): Promise<Array<{ id: string; success: boolean; data?: T; error?: string; fromCache: boolean }>> {
    // Analyze and optimize the request set
    const optimizedRequests = await this.optimizeRequestSet(requests);
    
    // Group by API type and priority
    const groups = this.groupRequests(optimizedRequests);
    
    // Execute groups in optimal order
    const results: Array<{ id: string; success: boolean; data?: T; error?: string; fromCache: boolean }> = [];
    
    for (const [apiType, groupRequests] of groups) {
      const groupResults = await this.executeRequestGroup(groupRequests, mcpExecutor, apiType);
      results.push(...groupResults);
    }

    // Sort results back to original order
    const sortedResults = requests.map(req => 
      results.find(result => result.id === req.id) || 
      { id: req.id, success: false, error: 'Request not processed', fromCache: false }
    );

    return sortedResults;
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): ApiLimits {
    return JSON.parse(JSON.stringify(this.rateLimits));
  }

  /**
   * Update rate limits from API response headers
   */
  updateRateLimits(apiType: keyof ApiLimits, headers: any): void {
    const limit = parseInt(headers['x-ratelimit-limit'] || '0');
    const remaining = parseInt(headers['x-ratelimit-remaining'] || '0');
    const reset = parseInt(headers['x-ratelimit-reset'] || '0');

    if (limit && reset) {
      this.rateLimits[apiType] = {
        limit,
        remaining,
        reset,
        used: limit - remaining,
        resetTime: new Date(reset * 1000)
      };
    }
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<OptimizationRecommendations> {
    const analytics = this.getRequestAnalytics();
    const suggestions: string[] = [];
    let requestsReduced = 0;
    let timeSaved = 0;
    let rateLimitReduction = 0;

    // Cache optimization suggestions
    if (analytics.cacheHitRate < 80) {
      suggestions.push(`Improve caching strategy - current hit rate: ${analytics.cacheHitRate.toFixed(1)}%`);
      requestsReduced += Math.floor(analytics.totalRequests * 0.2);
    }

    // Rate limit pressure analysis
    const corePressure = (this.rateLimits.core.used / this.rateLimits.core.limit) * 100;
    const searchPressure = (this.rateLimits.search.used / this.rateLimits.search.limit) * 100;
    
    if (corePressure > 80) {
      suggestions.push('High core API usage - consider request batching or caching');
      rateLimitReduction += 20;
    }

    if (searchPressure > 70) {
      suggestions.push('High search API usage - implement aggressive caching for search results');
      rateLimitReduction += 15;
    }

    // Response time optimization
    const slowEndpoints = analytics.topEndpoints
      .filter(ep => ep.avgTime > 2000)
      .slice(0, 3);
      
    if (slowEndpoints.length > 0) {
      suggestions.push(`Optimize slow endpoints: ${slowEndpoints.map(ep => ep.endpoint).join(', ')}`);
      timeSaved += slowEndpoints.reduce((sum, ep) => sum + (ep.avgTime * ep.count), 0);
    }

    // GraphQL optimization
    const graphqlOpportunities = this.findGraphQLOpportunities();
    if (graphqlOpportunities.length > 0) {
      suggestions.push('Consider using GraphQL for complex queries to reduce request count');
      requestsReduced += graphqlOpportunities.length;
    }

    // Priority actions
    const priorityActions: string[] = [];
    
    if (analytics.successRate < 95) {
      priorityActions.push('Improve error handling and retry logic');
    }
    
    if (corePressure > 90 || searchPressure > 90) {
      priorityActions.push('Implement immediate rate limit throttling');
    }
    
    if (analytics.cacheHitRate < 50) {
      priorityActions.push('Implement comprehensive caching strategy');
    }

    return {
      suggestions,
      potential_savings: {
        requests_reduced: requestsReduced,
        time_saved_ms: timeSaved,
        rate_limit_pressure_reduction: rateLimitReduction
      },
      priority_actions: priorityActions
    };
  }

  /**
   * Get detailed request analytics
   */
  getRequestAnalytics(): RequestAnalytics {
    const analytics = Array.from(this.requestAnalytics.entries());
    const totalRequests = analytics.reduce((sum, [, data]) => sum + data.count, 0);
    const totalErrors = analytics.reduce((sum, [, data]) => sum + data.errors, 0);
    const totalTime = analytics.reduce((sum, [, data]) => sum + data.totalTime, 0);

    const topEndpoints = analytics
      .map(([endpoint, data]) => ({
        endpoint,
        count: data.count,
        avgTime: data.count > 0 ? data.totalTime / data.count : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests,
      successRate: totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 100,
      avgResponseTime: totalRequests > 0 ? totalTime / totalRequests : 0,
      rateLimitHits: this.getRateLimitHitCount(),
      cacheHitRate: this.getCacheHitRate(),
      topEndpoints
    };
  }

  /**
   * Preload frequently accessed data
   */
  async preloadFrequentData(
    patterns: string[],
    mcpExecutor: (toolName: string, params: any) => Promise<any>
  ): Promise<void> {
    console.log(`Starting preload for ${patterns.length} patterns`);
    
    const preloadRequests: GitHubRequest[] = [];
    
    for (const pattern of patterns) {
      const requests = this.generatePreloadRequests(pattern);
      preloadRequests.push(...requests);
    }

    if (preloadRequests.length > 0) {
      // Execute preload requests with low priority
      const preloadRequestsLowPriority = preloadRequests.map(req => ({ ...req, priority: 'low' as const }));
      await this.executeMultiple(preloadRequestsLowPriority, mcpExecutor);
    }

    console.log(`Preload completed for ${preloadRequests.length} requests`);
  }

  /**
   * Optimize specific workflow
   */
  async optimizeWorkflow(
    workflowName: string,
    requests: GitHubRequest[],
    mcpExecutor: (toolName: string, params: any) => Promise<any>
  ): Promise<{
    originalTime: number;
    optimizedTime: number;
    improvement: number;
    optimizations: string[];
  }> {
    console.log(`Optimizing workflow: ${workflowName}`);
    
    // Measure original performance
    const originalStart = Date.now();
    // const originalResults = await this.executeMultiple([...requests], mcpExecutor); // Available for future comparison
    await this.executeMultiple([...requests], mcpExecutor);
    const originalTime = Date.now() - originalStart;

    // Apply optimizations
    const optimizations: string[] = [];
    let optimizedRequests = [...requests];

    // 1. Remove redundant requests
    const deduplicated = this.deduplicateRequests(optimizedRequests);
    if (deduplicated.length < optimizedRequests.length) {
      optimizations.push(`Removed ${optimizedRequests.length - deduplicated.length} duplicate requests`);
      optimizedRequests = deduplicated;
    }

    // 2. Reorder for optimal execution
    optimizedRequests = this.reorderForOptimalExecution(optimizedRequests);
    optimizations.push('Reordered requests for optimal execution');

    // 3. Identify batch opportunities
    const batchOpportunities = this.identifyBatchOpportunities(optimizedRequests);
    if (batchOpportunities > 0) {
      optimizations.push(`Identified ${batchOpportunities} batch opportunities`);
    }

    // Measure optimized performance
    const optimizedStart = Date.now();
    // const optimizedResults = await this.executeMultiple(optimizedRequests, mcpExecutor); // Available for future comparison
    await this.executeMultiple(optimizedRequests, mcpExecutor);
    const optimizedTime = Date.now() - optimizedStart;

    const improvement = ((originalTime - optimizedTime) / originalTime) * 100;

    console.log(`Workflow optimization completed: ${improvement.toFixed(1)}% improvement`);

    return {
      originalTime,
      optimizedTime,
      improvement,
      optimizations
    };
  }

  /**
   * Get health status
   */
  getHealth(): {
    healthy: boolean;
    status: string;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check rate limits
    const corePressure = (this.rateLimits.core.used / this.rateLimits.core.limit) * 100;
    const searchPressure = (this.rateLimits.search.used / this.rateLimits.search.limit) * 100;

    if (corePressure > 90) {
      issues.push(`Core API rate limit at ${corePressure.toFixed(1)}%`);
      recommendations.push('Implement rate limit throttling');
    }

    if (searchPressure > 80) {
      issues.push(`Search API rate limit at ${searchPressure.toFixed(1)}%`);
      recommendations.push('Cache search results more aggressively');
    }

    // Check performance
    const analytics = this.getRequestAnalytics();
    if (analytics.successRate < 95) {
      issues.push(`Low success rate: ${analytics.successRate.toFixed(1)}%`);
      recommendations.push('Improve error handling and retry logic');
    }

    if (analytics.avgResponseTime > 5000) {
      issues.push(`High average response time: ${analytics.avgResponseTime.toFixed(0)}ms`);
      recommendations.push('Optimize slow operations');
    }

    const healthy = issues.length === 0;

    return {
      healthy,
      status: healthy ? 'healthy' : 'degraded',
      issues,
      recommendations
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.batchProcessingTimer) {
      clearInterval(this.batchProcessingTimer);
    }
    this.cacheManager.stopMonitoring();
  }

  // Private methods

  private getApiType(toolName: string): keyof ApiLimits {
    if (toolName.includes('search')) return 'search';
    if (toolName.includes('graphql') || toolName.includes('project')) return 'graphql';
    return 'core';
  }

  private shouldBatch(request: GitHubRequest, apiType: keyof ApiLimits): boolean {
    // Don't batch critical requests
    if (request.priority === 'critical') return false;
    
    // Don't batch if rate limits are healthy
    const rateLimitPressure = (this.rateLimits[apiType].used / this.rateLimits[apiType].limit) * 100;
    if (rateLimitPressure < 50) return false;

    // Batch if there's rate limit pressure or performance benefits
    return rateLimitPressure > 70 || this.batchQueue.size > 0;
  }

  private async addToBatch<T>(
    request: GitHubRequest,
    mcpExecutor: (toolName: string, params: any) => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const batchKey = this.getBatchKey(request);
      const batch = this.batchQueue.get(batchKey) || [];
      
      // Add completion handlers to the request
      const enhancedRequest = {
        ...request,
        resolve,
        reject
      } as any;

      batch.push(enhancedRequest);
      this.batchQueue.set(batchKey, batch);

      // Trigger immediate processing for high priority
      if (request.priority === 'high' || batch.length >= this.config.maxBatchSize) {
        this.processBatch(batchKey, mcpExecutor);
      }
    });
  }

  private async executeSingleRequest<T>(
    request: GitHubRequest,
    mcpExecutor: (toolName: string, params: any) => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();

    return this.resilientExecutor.execute(
      async () => {
        // Try cache first
        const cached = await this.cacheManager.get(
          request.toolName,
          request.params,
          mcpExecutor
        );

        const responseTime = Date.now() - startTime;
        this.recordAnalytics(request.toolName, responseTime, false);
        return cached;
      },
      undefined,
      request.toolName
    );
  }

  private getBatchKey(request: GitHubRequest): string {
    const apiType = this.getApiType(request.toolName);
    return `${apiType}_${request.priority}`;
  }

  private async processBatch(
    batchKey: string,
    mcpExecutor: (toolName: string, params: any) => Promise<any>
  ): Promise<void> {
    if (this.processingBatches.has(batchKey)) return;
    
    const batch = this.batchQueue.get(batchKey);
    if (!batch || batch.length === 0) return;

    this.processingBatches.add(batchKey);
    this.batchQueue.delete(batchKey);

    try {
      console.log(`Processing batch ${batchKey} with ${batch.length} requests`);
      
      const results = await this.cacheManager.batchRequests(
        batch.map(req => ({
          toolName: req.toolName,
          params: req.params
        })),
        mcpExecutor,
        'parallel',
        this.config.concurrencyLimits[this.getApiType(batch[0].toolName)]
      );

      // Resolve individual request promises
      for (let i = 0; i < batch.length; i++) {
        const request = batch[i];
        const result = results[i];

        if (result.success) {
          request.resolve?.(result.data);
        } else {
          request.reject?.(new Error(result.error || 'Batch execution failed'));
        }

        this.recordAnalytics(request.toolName, 0, !result.success);
      }

    } catch (error) {
      console.error(`Batch processing failed for ${batchKey}:`, error);
      
      // Reject all requests in the batch
      for (const request of batch) {
        request.reject?.(error);
      }
    } finally {
      this.processingBatches.delete(batchKey);
    }
  }

  private startBatchProcessing(): void {
    this.batchProcessingTimer = setInterval(() => {
      // Process batches that have been waiting too long
      for (const [batchKey, batch] of this.batchQueue) {
        if (batch.length > 0) {
          const oldestRequest = Math.min(...batch.map(req => req.timestamp || Date.now()));
          const waitTime = Date.now() - oldestRequest;
          
          if (waitTime >= this.config.maxWaitTime) {
            this.processBatch(batchKey, async () => ({})); // Placeholder
          }
        }
      }
    }, 1000);
  }

  private async optimizeRequestSet(requests: GitHubRequest[]): Promise<GitHubRequest[]> {
    // Remove duplicates
    const deduplicated = this.deduplicateRequests(requests);
    
    // Add timestamps for batching decisions
    const timestamped = deduplicated.map(req => ({
      ...req,
      timestamp: Date.now()
    }));

    return timestamped;
  }

  private groupRequests(requests: GitHubRequest[]): Map<keyof ApiLimits, GitHubRequest[]> {
    const groups = new Map<keyof ApiLimits, GitHubRequest[]>();
    
    for (const request of requests) {
      const apiType = this.getApiType(request.toolName);
      const group = groups.get(apiType) || [];
      group.push(request);
      groups.set(apiType, group);
    }

    return groups;
  }

  private async executeRequestGroup<T>(
    requests: GitHubRequest[],
    mcpExecutor: (toolName: string, params: any) => Promise<T>,
    apiType: keyof ApiLimits
  ): Promise<Array<{ id: string; success: boolean; data?: T; error?: string; fromCache: boolean }>> {
    const concurrencyLimit = this.config.concurrencyLimits[apiType];
    const results: Array<{ id: string; success: boolean; data?: T; error?: string; fromCache: boolean }> = [];

    // Process in chunks to respect concurrency limits
    for (let i = 0; i < requests.length; i += concurrencyLimit) {
      const chunk = requests.slice(i, i + concurrencyLimit);
      const chunkPromises = chunk.map(async (request) => {
        try {
          const data = await this.executeSingleRequest(request, mcpExecutor);
          return {
            id: request.id,
            success: true,
            data,
            fromCache: false // This would need actual cache tracking
          };
        } catch (error) {
          return {
            id: request.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            fromCache: false
          };
        }
      });

      const chunkResults = await Promise.allSettled(chunkPromises);
      const processedResults = chunkResults.map(result => 
        result.status === 'fulfilled' ? result.value : 
        { id: '', success: false, error: 'Promise rejected', fromCache: false }
      );

      results.push(...processedResults);
    }

    return results;
  }

  private deduplicateRequests(requests: GitHubRequest[]): GitHubRequest[] {
    const seen = new Set<string>();
    return requests.filter(request => {
      const key = `${request.toolName}:${JSON.stringify(request.params)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private reorderForOptimalExecution(requests: GitHubRequest[]): GitHubRequest[] {
    return requests.sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by dependencies
      if (b.dependencies?.includes(a.id)) return -1;
      if (a.dependencies?.includes(b.id)) return 1;
      
      return 0;
    });
  }

  private identifyBatchOpportunities(requests: GitHubRequest[]): number {
    const apiTypeCounts = new Map<keyof ApiLimits, number>();
    
    for (const request of requests) {
      const apiType = this.getApiType(request.toolName);
      apiTypeCounts.set(apiType, (apiTypeCounts.get(apiType) || 0) + 1);
    }

    let opportunities = 0;
    for (const [, count] of apiTypeCounts) {
      if (count > 1) opportunities += Math.floor(count / this.config.maxBatchSize);
    }

    return opportunities;
  }

  private generatePreloadRequests(_pattern: string): GitHubRequest[] {
    // This would generate requests based on access patterns
    // For now, return empty array
    return [];
  }

  private findGraphQLOpportunities(): string[] {
    // Analyze request patterns to find GraphQL opportunities
    const opportunities: string[] = [];
    
    // Look for multiple REST calls that could be combined into GraphQL
    const restEndpoints = Array.from(this.requestAnalytics.keys())
      .filter(endpoint => !endpoint.includes('graphql'));
    
    if (restEndpoints.length > 5) {
      opportunities.push('Multiple REST endpoints could be combined with GraphQL');
    }

    return opportunities;
  }

  private getRateLimitHitCount(): number {
    // This would track actual rate limit hits
    return 0;
  }

  private getCacheHitRate(): number {
    // This would get actual cache hit rate from cache manager
    return 85;
  }

  private recordAnalytics(toolName: string, responseTime: number, isError: boolean): void {
    const analytics = this.requestAnalytics.get(toolName) || { count: 0, totalTime: 0, errors: 0 };
    analytics.count++;
    analytics.totalTime += responseTime;
    if (isError) analytics.errors++;
    
    this.requestAnalytics.set(toolName, analytics);
  }

  private createDefaultRateLimit(limit: number): RateLimitInfo {
    const now = Date.now();
    return {
      limit,
      remaining: limit,
      reset: Math.floor((now + 3600000) / 1000), // 1 hour from now
      used: 0,
      resetTime: new Date(now + 3600000)
    };
  }

  private setupRateLimitMonitoring(): void {
    // Monitor rate limits and trigger warnings
    setInterval(() => {
      for (const [apiType, limits] of Object.entries(this.rateLimits) as [keyof ApiLimits, RateLimitInfo][]) {
        const pressure = (limits.used / limits.limit) * 100;
        
        if (pressure > 90) {
          console.warn(`High ${apiType} API rate limit pressure: ${pressure.toFixed(1)}%`);
        }
      }
    }, 60000); // Check every minute
  }
}

export default GitHubApiOptimizer;