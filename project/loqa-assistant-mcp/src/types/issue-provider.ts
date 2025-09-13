/**
 * IssueProvider Interface Architecture
 * 
 * Provides a unified interface for issue management across different providers
 * with intelligent provider selection and fallback.
 */

export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: string;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
  repository?: string;
  url?: string;
  
  // Provider-specific data
  provider: IssueProvider;
  providerData: GitHubIssueData;
}

export enum IssueStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress', 
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum IssuePriority {
  LOW = 'Low',
  MEDIUM = 'Medium', 
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum IssueProvider {
  GITHUB = 'github'
}

// Provider-specific data types
export interface GitHubIssueData {
  issueNumber: number;
  state: 'open' | 'closed';
  htmlUrl: string;
  apiUrl: string;
  commentsCount: number;
  milestone?: {
    title: string;
    description?: string;
    state: string;
  };
}


// Issue creation options
export interface IssueCreationOptions {
  title: string;
  description?: string;
  priority?: IssuePriority;
  assignee?: string;
  labels?: string[];
  template?: string;
  repository?: string;
  
  // Provider preferences
  preferredProvider?: IssueProvider;
  fallbackToOtherProvider?: boolean;
  
  // Extended options for comprehensive creation
  acceptanceCriteria?: string[];
  dependencies?: string[];
  estimatedEffort?: string;
  type?: 'Feature' | 'Bug Fix' | 'Improvement' | 'Documentation';
}

// Issue filtering and querying
export interface IssueFilters {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  assignee?: string[];
  labels?: string[];
  repository?: string[];
  provider?: IssueProvider[];
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
}

// Issue operations result
export interface IssueOperationResult {
  success: boolean;
  issue?: Issue;
  error?: string;
  warnings?: string[];
  providerUsed: IssueProvider;
  fallbackUsed?: boolean;
}

// Provider capabilities
export interface ProviderCapabilities {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canList: boolean;
  canSearch: boolean;
  canAssign: boolean;
  canLabel: boolean;
  canComment: boolean;
  supportsTemplates: boolean;
  supportsAcceptanceCriteria: boolean;
  supportsMilestones: boolean;
  maxDescriptionLength?: number;
  maxTitleLength?: number;
}

// Provider health status
export interface ProviderHealthStatus {
  available: boolean;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
  capabilities: ProviderCapabilities;
}

/**
 * Abstract base class for issue providers
 */
export abstract class IssueProviderBase {
  abstract readonly providerType: IssueProvider;
  abstract readonly name: string;
  
  // Core operations
  abstract createIssue(options: IssueCreationOptions): Promise<IssueOperationResult>;
  abstract updateIssue(issueId: string, updates: Partial<IssueCreationOptions>): Promise<IssueOperationResult>;
  abstract getIssue(issueId: string): Promise<IssueOperationResult>;
  abstract listIssues(filters?: IssueFilters): Promise<Issue[]>;
  abstract deleteIssue(issueId: string): Promise<IssueOperationResult>;
  
  // Provider management
  abstract checkHealth(): Promise<ProviderHealthStatus>;
  abstract getCapabilities(): ProviderCapabilities;
  
  // Utility methods
  abstract isAvailable(): Promise<boolean>;
  abstract convertToUnifiedIssue(providerIssue: any): Issue;
  
  // Optional advanced features
  searchIssues?(query: string, filters?: IssueFilters): Promise<Issue[]>;
  addComment?(issueId: string, comment: string): Promise<boolean>;
  assignIssue?(issueId: string, assignee: string): Promise<boolean>;
  addLabels?(issueId: string, labels: string[]): Promise<boolean>;
  
  // Template support
  getAvailableTemplates?(): Promise<Array<{ name: string; description: string; content: string }>>;
  createIssueFromTemplate?(templateName: string, options: IssueCreationOptions): Promise<IssueOperationResult>;
}

// Removed unused label mapping configuration - can be re-added when needed