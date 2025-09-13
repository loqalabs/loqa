/**
 * GitHub Cache Manager
 * 
 * Provides intelligent caching and rate limiting for GitHub MCP operations
 * to optimize performance and reliability.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

interface GitHubApiLimits {
  core: RateLimitInfo;
  search: RateLimitInfo;
  graphql: RateLimitInfo;
}

export interface CacheConfig {
  defaultTTL: number; // Default TTL in milliseconds
  maxSize: number; // Maximum number of cached entries
  rateLimitBuffer: number; // Buffer percentage for rate limiting (0.1 = 10%)
  persistToDisk: boolean; // Whether to persist cache to disk
  cacheDirectory?: string; // Directory for persistent cache
}

export class GitHubCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private rateLimits: GitHubApiLimits = {
    core: { limit: 5000, remaining: 5000, reset: 0, used: 0 },
    search: { limit: 30, remaining: 30, reset: 0, used: 0 },
    graphql: { limit: 5000, remaining: 5000, reset: 0, used: 0 }
  };
  private requestQueue: Array<{
    toolName: string;
    params: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    priority: 'high' | 'medium' | 'low';
    timestamp: number;
  }> = [];
  private isProcessingQueue = false;
  private config: CacheConfig;
  
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      rateLimitBuffer: 0.1, // 10% buffer
      persistToDisk: false,
      ...config
    };
    
    // Start queue processing
    this.processQueue();
    
    // Periodic cleanup
    setInterval(() => this.cleanup(), 60000); // Every minute
  }
  
  /**
   * Get cached data or execute MCP tool if not cached
   */
  async get<T>(
    toolName: string,
    params: any,
    mcpExecutor: (toolName: string, params: any) => Promise<T>,
    options: {
      ttl?: number;
      priority?: 'high' | 'medium' | 'low';
      forceRefresh?: boolean;
    } = {}
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(toolName, params);
    const ttl = options.ttl || this.config.defaultTTL;
    
    // Check cache first (unless force refresh)
    if (!options.forceRefresh) {
      const cached = this.getCached<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Check rate limits and queue if necessary
    if (this.shouldQueue(toolName)) {
      return new Promise<T>((resolve, reject) => {
        this.requestQueue.push({
          toolName,
          params,
          resolve: (data) => {
            this.setCached(cacheKey, data, ttl);
            resolve(data);
          },
          reject,
          priority: options.priority || 'medium',
          timestamp: Date.now()
        });
        this.requestQueue.sort(this.priorityComparator);
      });
    }
    
    // Execute immediately
    try {
      const data = await mcpExecutor(toolName, params);
      this.setCached(cacheKey, data, ttl);
      this.updateRateLimits(toolName);
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Execute multiple requests efficiently with batching and rate limiting
   */
  async batchRequests<T>(
    requests: Array<{
      toolName: string;
      params: any;
      priority?: 'high' | 'medium' | 'low';
    }>,
    mcpExecutor: (toolName: string, params: any) => Promise<T>,
    strategy: 'parallel' | 'sequential' | 'adaptive' = 'adaptive',
    maxConcurrency = 5
  ): Promise<Array<{ success: boolean; data?: T; error?: string; index: number }>> {
    // const results: Array<{ success: boolean; data?: T; error?: string; index: number }> = []; // Available for future fallback logic

    switch (strategy) {
      case 'parallel':
        return this.executeBatchParallel(requests, mcpExecutor, maxConcurrency);
      case 'sequential':
        return this.executeBatchSequential(requests, mcpExecutor);
      case 'adaptive':
        return this.executeBatchAdaptive(requests, mcpExecutor, maxConcurrency);
      default:
        throw new Error(`Unknown batch strategy: ${strategy}`);
    }
  }
  
  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): GitHubApiLimits {
    return { ...this.rateLimits };
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    memoryUsage: string;
    oldestEntry: number;
    newestEntry: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const cacheHits = entries.filter(entry => entry.accessCount > 1).length;
    
    return {
      size: this.cache.size,
      hitRate: totalAccesses > 0 ? cacheHits / totalAccesses : 0,
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0
    };
  }
  
  /**
   * Clear cache
   */
  clearCache(pattern?: string): number {
    if (!pattern) {
      const size = this.cache.size;
      this.cache.clear();
      return size;
    }
    
    const regex = new RegExp(pattern);
    let cleared = 0;
    
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }
  
  /**
   * Optimize cache by removing least-used entries
   */
  optimizeCache(): {
    before: number;
    after: number;
    removed: number;
  } {
    const beforeSize = this.cache.size;
    
    if (beforeSize <= this.config.maxSize) {
      return { before: beforeSize, after: beforeSize, removed: 0 };
    }
    
    // Sort by access frequency and age
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        entry,
        score: this.calculateCacheScore(entry)
      }))
      .sort((a, b) => a.score - b.score);
    
    // Remove lowest-scoring entries
    const toRemove = beforeSize - this.config.maxSize;
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i].key);
    }
    
    const afterSize = this.cache.size;
    return {
      before: beforeSize,
      after: afterSize,
      removed: beforeSize - afterSize
    };
  }
  
  /**
   * Stop monitoring and cleanup resources
   */
  stopMonitoring(): void {
    // This method can be overridden by subclasses
    // Base implementation does nothing as there's no monitoring to stop
  }

  // Private methods

  private generateCacheKey(toolName: string, params: any): string {
    const sortedParams = this.sortObjectKeys(params);
    return `${toolName}:${JSON.stringify(sortedParams)}`;
  }
  
  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccess = now;
    
    return entry.data;
  }
  
  private setCached<T>(key: string, data: T, ttl: number): void {
    const now = Date.now();
    
    // Check if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.optimizeCache();
    }
    
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccess: now
    });
  }
  
  private shouldQueue(toolName: string): boolean {
    const apiType = this.getApiType(toolName);
    const limit = this.rateLimits[apiType];
    const buffer = Math.floor(limit.limit * this.config.rateLimitBuffer);
    
    return limit.remaining <= buffer;
  }
  
  private getApiType(toolName: string): keyof GitHubApiLimits {
    if (toolName.includes('search')) return 'search';
    if (toolName.includes('graphql') || toolName.includes('project')) return 'graphql';
    return 'core';
  }
  
  private updateRateLimits(toolName: string): void {
    const apiType = this.getApiType(toolName);
    this.rateLimits[apiType].remaining = Math.max(0, this.rateLimits[apiType].remaining - 1);
    this.rateLimits[apiType].used++;
  }
  
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (!request) break;
      
      try {
        // Check if we can execute now
        if (!this.shouldQueue(request.toolName)) {
          // Execute the request
          const data = await this.executeRequest(request);
          request.resolve(data);
        } else {
          // Put back in queue and wait
          this.requestQueue.unshift(request);
          await this.waitForRateLimit(request.toolName);
        }
      } catch (error) {
        request.reject(error);
      }
    }
    
    this.isProcessingQueue = false;
    
    // Schedule next processing if queue has items
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }
  
  private async executeRequest(request: any): Promise<any> {
    // This would be implemented to actually call the MCP tool
    // For now, it's a placeholder
    console.log(`Executing queued request: ${request.toolName}`);
    this.updateRateLimits(request.toolName);
    return {};
  }
  
  private async waitForRateLimit(toolName: string): Promise<void> {
    const apiType = this.getApiType(toolName);
    const resetTime = this.rateLimits[apiType].reset * 1000; // Convert to milliseconds
    const now = Date.now();
    
    if (resetTime > now) {
      const waitTime = resetTime - now;
      await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000))); // Max 1 minute wait
    }
    
    // Reset the rate limit (simulated)
    this.rateLimits[apiType].remaining = this.rateLimits[apiType].limit;
    this.rateLimits[apiType].reset = Math.floor((now + 3600000) / 1000); // Next hour
  }
  
  private priorityComparator(a: any, b: any): number {
    const priorityValues: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
    const priorityDiff = (priorityValues[b.priority] || 1) - (priorityValues[a.priority] || 1);
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by timestamp (FIFO)
    return a.timestamp - b.timestamp;
  }
  
  private async executeBatchParallel<T>(
    requests: any[],
    mcpExecutor: (toolName: string, params: any) => Promise<T>,
    maxConcurrency: number
  ): Promise<any[]> {
    const results: any[] = [];
    
    for (let i = 0; i < requests.length; i += maxConcurrency) {
      const batch = requests.slice(i, i + maxConcurrency);
      const batchPromises = batch.map(async (request, batchIndex) => {
        const index = i + batchIndex;
        try {
          const data = await this.get(request.toolName, request.params, mcpExecutor, {
            priority: request.priority
          });
          return { success: true, data, index };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            index
          };
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : { success: false, error: 'Promise rejected', index: -1 }
      ));
    }
    
    return results;
  }
  
  private async executeBatchSequential<T>(
    requests: any[],
    mcpExecutor: (toolName: string, params: any) => Promise<T>
  ): Promise<any[]> {
    const results: any[] = [];
    
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      try {
        const data = await this.get(request.toolName, request.params, mcpExecutor, {
          priority: request.priority
        });
        results.push({ success: true, data, index: i });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          index: i
        });
      }
    }
    
    return results;
  }
  
  private async executeBatchAdaptive<T>(
    requests: any[],
    mcpExecutor: (toolName: string, params: any) => Promise<T>,
    maxConcurrency: number
  ): Promise<any[]> {
    // Analyze rate limits and adjust strategy
    const coreRemaining = this.rateLimits.core.remaining;
    const searchRemaining = this.rateLimits.search.remaining;
    
    // If rate limits are low, use sequential
    if (coreRemaining < 100 || searchRemaining < 5) {
      return this.executeBatchSequential(requests, mcpExecutor);
    }
    
    // Otherwise use parallel with adjusted concurrency
    const adjustedConcurrency = Math.min(
      maxConcurrency,
      Math.floor(coreRemaining / 10),
      requests.length
    );
    
    return this.executeBatchParallel(requests, mcpExecutor, adjustedConcurrency);
  }
  
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => this.cache.delete(key));
  }
  
  private calculateCacheScore(entry: CacheEntry<any>): number {
    const now = Date.now();
    const age = now - entry.timestamp;
    const timeSinceLastAccess = now - entry.lastAccess;
    
    // Score based on access frequency, recency, and age
    // Lower score = more likely to be evicted
    return (entry.accessCount / (age + 1)) - (timeSinceLastAccess / 1000);
  }
  
  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.sortObjectKeys(item));
    
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = this.sortObjectKeys(obj[key]);
    }
    return sorted;
  }
  
  private estimateMemoryUsage(): string {
    const entries = Array.from(this.cache.values());
    const estimatedBytes = entries.reduce((sum, entry) => {
      return sum + JSON.stringify(entry.data).length * 2; // Rough estimate
    }, 0);
    
    if (estimatedBytes > 1024 * 1024) {
      return `${(estimatedBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (estimatedBytes > 1024) {
      return `${(estimatedBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${estimatedBytes} bytes`;
    }
  }
}