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