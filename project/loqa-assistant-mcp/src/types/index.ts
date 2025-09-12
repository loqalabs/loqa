// Core validation and repository types
export interface ValidationResult {
  valid: boolean;
  violations: string[];
  warnings: string[];
}

export interface RepositoryInfo {
  path: string;
  currentBranch: string;
  hasUncommittedChanges: boolean;
  isLoqaRepository: boolean;
}

// Task management types
export interface TaskTemplate {
  name: string;
  description: string;
  content: string;
}

export interface TaskCreationOptions {
  title: string;
  description?: string;
  template?: string;
  priority?: 'High' | 'Medium' | 'Low';
  type?: 'Feature' | 'Bug Fix' | 'Improvement' | 'Documentation';
  assignee?: string;
}

export interface CapturedThought {
  content: string;
  tags: string[];
  timestamp: Date;
  context?: string;
}

// Enhanced task creation types
export interface TaskInterviewState {
  id: string;
  originalInput: string;
  currentQuestion: string;
  questionsAsked: string[];
  answersReceived: { question: string; answer: string }[];
  accumulatedInfo: {
    title?: string;
    description?: string;
    acceptanceCriteria?: string[];
    dependencies?: string[];
    repositories?: string[];
    estimatedComplexity?: 'low' | 'medium' | 'high';
    suggestedBreakdown?: TaskBreakdownSuggestion[];
  };
  interviewComplete: boolean;
  timestamp: Date;
}

export interface TaskBreakdownSuggestion {
  title: string;
  description: string;
  repository: string;
  dependencies?: string[];
  estimatedEffort: string;
}

export interface ComprehensiveTaskCreationOptions extends TaskCreationOptions {
  description: string;
  acceptanceCriteria: string[];
  dependencies?: string[];
  repositories: string[];
  breakdown?: TaskBreakdownSuggestion[];
}

// Role management types
export interface RoleConfig {
  role_id: string;
  role_name: string;
  role_description: string;
  capabilities: string[];
  detection_patterns: string[];
  model_preference: string;
  task_templates_preferred: string[];
}

export interface RoleDetectionResult {
  detectedRole: string;
  confidence: number;
  reasoning: string[];
  alternatives: { role: string; confidence: number }[];
}

// Model selection types
export interface ModelSelectionContext {
  roleId?: string;
  taskTitle?: string;
  taskDescription?: string;
  complexity?: 'low' | 'medium' | 'high';
  filePaths?: string[];
  repositoryType?: string;
  manualOverride?: string;
}

export interface ModelRecommendation {
  model: string;
  reasoning: string[];
  confidence: number;
  alternatives: { model: string; reasoning: string; score: number }[];
}