/**
 * Circuit Breaker Pattern Implementation
 * 
 * Provides fault tolerance and prevents cascading failures by
 * monitoring service health and automatically opening/closing
 * the circuit based on error rates and response times.
 */

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  recoveryTimeout: number; // Time in ms before attempting to close circuit
  monitoringPeriod: number; // Time window for failure counting
  successThreshold: number; // Successes needed to close circuit from half-open
  responseTimeThreshold: number; // Max response time before considering it a failure
  minimumThroughput: number; // Minimum requests before circuit can open
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  requestCount: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  stateChangedAt: number;
  errorRate: number;
  avgResponseTime: number;
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private requestCount = 0;
  private lastFailureTime = 0;
  private lastSuccessTime = 0;
  private stateChangedAt = Date.now();
  private responseTimes: number[] = [];
  private halfOpenSuccesses = 0;
  private listeners: Map<string, ((metrics: CircuitBreakerMetrics) => void)[]> = new Map();

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      successThreshold: 3,
      responseTimeThreshold: 10000, // 10 seconds
      minimumThroughput: 10,
      ...config
    };
  }

  /**
   * Execute operation through circuit breaker
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptRecovery()) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        return this.executeFallback(fallback);
      }
    }

    const startTime = Date.now();
    this.requestCount++;

    try {
      const result = await Promise.race([
        operation(),
        this.createTimeoutPromise()
      ]) as T;

      const responseTime = Date.now() - startTime;
      this.onSuccess(responseTime);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.onFailure(responseTime, error);
      
      if (fallback && this.state === CircuitState.OPEN) {
        return this.executeFallback(fallback);
      }
      
      throw error;
    }
  }

  /**
   * Get current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    // const now = Date.now(); // Available for future timing calculations
    const recentRequests = this.getRecentRequestCount();
    const recentFailures = this.getRecentFailureCount();
    
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      requestCount: this.requestCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.stateChangedAt,
      errorRate: recentRequests > 0 ? (recentFailures / recentRequests) * 100 : 0,
      avgResponseTime: this.calculateAvgResponseTime()
    };
  }

  /**
   * Force circuit to open (for testing or emergency situations)
   */
  forceOpen(): void {
    this.transitionTo(CircuitState.OPEN);
  }

  /**
   * Force circuit to close (for testing or recovery situations)
   */
  forceClose(): void {
    this.reset();
    this.transitionTo(CircuitState.CLOSED);
  }

  /**
   * Reset all metrics and close circuit
   */
  reset(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.requestCount = 0;
    this.halfOpenSuccesses = 0;
    this.responseTimes = [];
    this.lastFailureTime = 0;
    this.lastSuccessTime = 0;
    this.transitionTo(CircuitState.CLOSED);
  }

  /**
   * Add event listener for state changes
   */
  on(event: 'stateChange' | 'failure' | 'success', listener: (metrics: CircuitBreakerMetrics) => void): void {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.push(listener);
    this.listeners.set(event, eventListeners);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (metrics: CircuitBreakerMetrics) => void): void {
    const eventListeners = this.listeners.get(event) || [];
    const index = eventListeners.indexOf(listener);
    if (index > -1) {
      eventListeners.splice(index, 1);
    }
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
    const metrics = this.getMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (metrics.state === CircuitState.OPEN) {
      issues.push('Circuit breaker is open due to high failure rate');
      recommendations.push('Check downstream service health and fix underlying issues');
    }

    if (metrics.errorRate > 10) {
      issues.push(`High error rate: ${metrics.errorRate.toFixed(1)}%`);
      recommendations.push('Investigate and resolve the root cause of failures');
    }

    if (metrics.avgResponseTime > this.config.responseTimeThreshold) {
      issues.push(`Slow response times: ${metrics.avgResponseTime.toFixed(0)}ms average`);
      recommendations.push('Optimize service performance or increase timeout thresholds');
    }

    const healthy = metrics.state === CircuitState.CLOSED && 
                    metrics.errorRate < 5 && 
                    metrics.avgResponseTime < this.config.responseTimeThreshold;

    return {
      healthy,
      status: healthy ? 'healthy' : 'degraded',
      issues,
      recommendations
    };
  }

  // Private methods

  private onSuccess(responseTime: number): void {
    this.successCount++;
    this.lastSuccessTime = Date.now();
    this.responseTimes.push(responseTime);
    this.trimResponseTimes();

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
        this.halfOpenSuccesses = 0;
      }
    }

    this.emit('success');
  }

  private onFailure(responseTime: number, error: any): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.responseTimes.push(responseTime);
    this.trimResponseTimes();

    console.warn(`Circuit breaker failure recorded:`, {
      error: error.message || error,
      responseTime,
      state: this.state,
      failureCount: this.failureCount
    });

    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
      this.halfOpenSuccesses = 0;
    } else if (this.state === CircuitState.CLOSED && this.shouldOpenCircuit()) {
      this.transitionTo(CircuitState.OPEN);
    }

    this.emit('failure');
  }

  private shouldOpenCircuit(): boolean {
    const recentRequests = this.getRecentRequestCount();
    const recentFailures = this.getRecentFailureCount();
    
    return recentRequests >= this.config.minimumThroughput &&
           recentFailures >= this.config.failureThreshold;
  }

  private shouldAttemptRecovery(): boolean {
    const timeSinceStateChange = Date.now() - this.stateChangedAt;
    return timeSinceStateChange >= this.config.recoveryTimeout;
  }

  private getRecentRequestCount(): number {
    // const cutoff = Date.now() - this.config.monitoringPeriod; // Available for future timestamp filtering
    // This is simplified - in a real implementation, you'd track request timestamps
    return this.requestCount;
  }

  private getRecentFailureCount(): number {
    const cutoff = Date.now() - this.config.monitoringPeriod;
    // This is simplified - in a real implementation, you'd track failure timestamps
    return this.lastFailureTime > cutoff ? this.failureCount : 0;
  }

  private calculateAvgResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    
    const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.responseTimes.length;
  }

  private trimResponseTimes(): void {
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.stateChangedAt = Date.now();
      
      console.log(`Circuit breaker state changed: ${oldState} -> ${newState}`);
      
      if (newState === CircuitState.CLOSED) {
        this.failureCount = 0;
      }

      this.emit('stateChange');
    }
  }

  private emit(event: string): void {
    const listeners = this.listeners.get(event) || [];
    const metrics = this.getMetrics();
    
    listeners.forEach(listener => {
      try {
        listener(metrics);
      } catch (error) {
        console.error('Error in circuit breaker event listener:', error);
      }
    });
  }

  private async executeFallback<T>(fallback?: () => Promise<T>): Promise<T> {
    if (!fallback) {
      throw new Error('Circuit breaker is open and no fallback provided');
    }

    try {
      return await fallback();
    } catch (error) {
      console.error('Fallback execution failed:', error);
      throw error;
    }
  }

  private createTimeoutPromise<T>(): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.config.responseTimeThreshold}ms`));
      }, this.config.responseTimeThreshold);
    });
  }
}

/**
 * Retry mechanism with exponential backoff and jitter
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // ms
  maxDelay: number; // ms
  backoffFactor: number;
  jitter: boolean;
  retryCondition?: (error: any) => boolean;
}

export class RetryMechanism {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: 3,
      initialDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      backoffFactor: 2,
      jitter: true,
      retryCondition: (error) => this.isRetryableError(error),
      ...config
    };
  }

  /**
   * Execute operation with retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt}/${this.config.maxRetries}${context ? ` for ${context}` : ''}`);
        }
        
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry if this is the last attempt or if error is not retryable
        if (attempt === this.config.maxRetries || !this.config.retryCondition!(error)) {
          break;
        }

        const delay = this.calculateDelay(attempt);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Operation failed${context ? ` (${context})` : ''}, retrying in ${delay}ms:`, errorMessage);
        
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Execute with custom retry condition
   */
  async executeWithCondition<T>(
    operation: () => Promise<T>,
    retryCondition: (error: any) => boolean,
    context?: string
  ): Promise<T> {
    const originalCondition = this.config.retryCondition;
    this.config.retryCondition = retryCondition;
    
    try {
      return await this.execute(operation, context);
    } finally {
      this.config.retryCondition = originalCondition;
    }
  }

  // Private methods

  private calculateDelay(attempt: number): number {
    let delay = this.config.initialDelay * Math.pow(this.config.backoffFactor, attempt);
    delay = Math.min(delay, this.config.maxDelay);
    
    if (this.config.jitter) {
      // Add random jitter (±25%)
      const jitter = delay * 0.25 * (Math.random() - 0.5);
      delay += jitter;
    }
    
    return Math.max(delay, 0);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isRetryableError(error: any): boolean {
    // Common retryable error conditions
    if (!error) return false;
    
    const message = error.message || '';
    const statusCode = error.status || error.statusCode;
    
    // Network errors
    if (message.includes('ECONNRESET') || 
        message.includes('ENOTFOUND') || 
        message.includes('ECONNREFUSED') ||
        message.includes('timeout')) {
      return true;
    }
    
    // HTTP errors that are typically retryable
    if (statusCode >= 500 || statusCode === 429 || statusCode === 408) {
      return true;
    }
    
    // GitHub-specific retryable errors
    if (statusCode === 403 && message.includes('rate limit')) {
      return true;
    }
    
    return false;
  }
}

/**
 * Combined Circuit Breaker + Retry mechanism
 */
export class ResilientExecutor {
  private circuitBreaker: CircuitBreaker;
  private retryMechanism: RetryMechanism;

  constructor(
    circuitBreakerConfig?: Partial<CircuitBreakerConfig>,
    retryConfig?: Partial<RetryConfig>
  ) {
    this.circuitBreaker = new CircuitBreaker(circuitBreakerConfig);
    this.retryMechanism = new RetryMechanism(retryConfig);
  }

  /**
   * Execute operation with both circuit breaker and retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
    context?: string
  ): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      return this.retryMechanism.execute(operation, context);
    }, fallback);
  }

  /**
   * Get health status from circuit breaker
   */
  getHealth() {
    return this.circuitBreaker.getHealth();
  }

  /**
   * Get metrics from circuit breaker
   */
  getMetrics() {
    return this.circuitBreaker.getMetrics();
  }

  /**
   * Add circuit breaker event listeners
   */
  onCircuitBreakerEvent(event: 'stateChange' | 'failure' | 'success', listener: (metrics: CircuitBreakerMetrics) => void) {
    this.circuitBreaker.on(event, listener);
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.circuitBreaker.reset();
  }
}

export default ResilientExecutor;