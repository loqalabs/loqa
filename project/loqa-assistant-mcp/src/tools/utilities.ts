/**
 * Shared utility functions and helper methods for task management
 * This module contains common functionality used across task management tools
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { KNOWN_REPOSITORIES_LIST } from '../config/repositories.js';
import { LoqaTaskManager } from '../managers/index.js';
import { TaskInterviewState, TaskBreakdownSuggestion, TaskCreationOptions, CapturedThought } from '../types/index.js';

/**
 * Interface for thought evaluation results
 */
export interface ThoughtEvaluation {
  shouldSuggestTask: boolean;
  reasoning: string;
  suggestedTemplate: string;
  suggestedPriority: string;
  category: string;
  scope?: string;
  estimatedEffort?: string;
}

/**
 * String similarity calculation using word overlap
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  let matches = 0;
  const maxLength = Math.max(words1.length, words2.length);
  
  for (const word1 of words1) {
    if (words2.some(word2 => word1.includes(word2) || word2.includes(word1))) {
      matches++;
    }
  }
  
  return matches / maxLength;
}

/**
 * Find semantic relationships between thought and task content
 */
export function findSemanticRelationships(thoughtText: string, taskContent: string): string[] {
  const relationships = [];
  
  // Define concept clusters
  const conceptClusters = {
    'ui': ['interface', 'component', 'frontend', 'dashboard', 'vue', 'react', 'style'],
    'backend': ['service', 'api', 'server', 'endpoint', 'database', 'grpc'],
    'audio': ['stt', 'tts', 'voice', 'sound', 'speech', 'transcription'],
    'ai': ['llm', 'model', 'ai', 'ml', 'intelligence', 'learning'],
    'infrastructure': ['docker', 'deployment', 'config', 'setup', 'devops'],
    'testing': ['test', 'spec', 'validation', 'verify', 'check'],
    'performance': ['optimization', 'speed', 'performance', 'efficiency', 'fast'],
    'security': ['auth', 'security', 'permission', 'access', 'token'],
    'skills': ['skill', 'plugin', 'integration', 'homeassistant', 'command']
  };
  
  for (const [cluster, terms] of Object.entries(conceptClusters)) {
    const thoughtHasCluster = terms.some(term => thoughtText.includes(term));
    const taskHasCluster = terms.some(term => taskContent.includes(term));
    
    if (thoughtHasCluster && taskHasCluster) {
      relationships.push(cluster);
    }
  }
  
  return relationships;
}

/**
 * Extracts key information from thought content
 */
export function analyzeThoughtContent(content: string, tags: string[], context?: string) {
  const allText = `${content} ${tags.join(' ')} ${context || ''}`.toLowerCase();
  
  return {
    keywords: extractKeywords(allText),
    hasUrgencyIndicators: /\b(urgent|critical|asap|immediately|broken|failing|blocker)\b/.test(allText),
    hasImplementationDetails: /\b(implement|code|develop|build|create|add)\b/.test(allText),
    hasArchitecturalImplications: /\b(architecture|design|structure|system|refactor)\b/.test(allText),
    mentionsSpecificTech: extractTechMentions(allText),
    complexity: estimateComplexity(allText)
  };
}

/**
 * Assesses priority by comparing thought against current project state
 */
export function assessPriorityAgainstCurrentState(thoughtAnalysis: any, projectState: any): ThoughtEvaluation {
  let score = 0;
  let reasoning = [];
  let suggestedTemplate = 'general';
  let suggestedPriority = 'Low';
  
  // Check if thought addresses current priority areas
  const addressesPriorities = thoughtAnalysis.keywords.some((keyword: string) => 
    projectState.priorityAreas.some((priority: string) => priority.includes(keyword))
  );
  
  if (addressesPriorities) {
    score += 3;
    reasoning.push('addresses current priority areas');
    suggestedPriority = 'High';
  }
  
  // Check if thought fills identified gaps
  const fillsGaps = projectState.gaps.some((gap: string) => 
    thoughtAnalysis.keywords.some((keyword: string) => gap.toLowerCase().includes(keyword))
  );
  
  if (fillsGaps) {
    score += 2;
    reasoning.push('addresses underserved areas');
    suggestedTemplate = 'feature';
  }
  
  // Avoid overloaded areas unless urgent
  const targetsOverloadedArea = projectState.overloadedAreas.some((area: string) =>
    thoughtAnalysis.keywords.some((keyword: string) => area.toLowerCase().includes(keyword))
  );
  
  if (targetsOverloadedArea && !thoughtAnalysis.hasUrgencyIndicators) {
    score -= 1;
    reasoning.push('targets already busy area - consider timing');
  }
  
  // Urgency indicators
  if (thoughtAnalysis.hasUrgencyIndicators) {
    score += 2;
    reasoning.push('contains urgency indicators');
    suggestedPriority = 'High';
    suggestedTemplate = 'bug-fix';
  }
  
  // Implementation readiness
  if (thoughtAnalysis.hasImplementationDetails) {
    score += 1;
    reasoning.push('includes implementation details');
    suggestedTemplate = 'feature';
  }
  
  // Architectural implications
  if (thoughtAnalysis.hasArchitecturalImplications) {
    score += 1;
    reasoning.push('has architectural implications');
    if (thoughtAnalysis.complexity === 'high') {
      suggestedTemplate = 'cross-repo';
    }
  }
  
  // Determine final recommendation
  const shouldSuggestTask = score >= 2;
  
  if (suggestedPriority === 'Low' && score >= 2) {
    suggestedPriority = 'Medium';
  }
  
  return {
    shouldSuggestTask,
    reasoning: reasoning.length > 0 ? reasoning.join(', ') : 'general idea captured',
    suggestedTemplate,
    suggestedPriority,
    category: determineCategory(thoughtAnalysis)
  };
}

/**
 * Helper function to extract meaningful keywords from text
 */
export function extractKeywords(text: string): string[] {
  // Extract meaningful keywords, avoiding common words
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']);
  return text.match(/\b\w{3,}\b/g)?.filter(word => !stopWords.has(word)) || [];
}

/**
 * Helper function to extract technology mentions from text
 */
export function extractTechMentions(text: string): string[] {
  const techTerms = ['go', 'vue', 'docker', 'grpc', 'protobuf', 'sqlite', 'nats', 'ollama', 'stt', 'tts', 'llm'];
  return techTerms.filter(term => text.includes(term));
}

/**
 * Helper function to estimate complexity from text content
 */
export function estimateComplexity(text: string): 'low' | 'medium' | 'high' {
  const complexityIndicators = ['system', 'architecture', 'refactor', 'migration', 'breaking'];
  const matches = complexityIndicators.filter(indicator => text.includes(indicator));
  
  if (matches.length >= 2) return 'high';
  if (matches.length >= 1) return 'medium';
  return 'low';
}

/**
 * Project impact assessment for thoughts and tasks
 */
export function assessProjectImpact(
  content: string, 
  category: string, 
  projectDocs: string[]
): 'low' | 'medium' | 'high' | 'critical' {
  const contentLower = content.toLowerCase();
  
  // Critical impact indicators
  if (contentLower.includes('breaking') || 
      contentLower.includes('architecture') || 
      contentLower.includes('security') ||
      contentLower.includes('data loss') ||
      category === 'security-compliance') {
    return 'critical';
  }
  
  // High impact indicators
  if (contentLower.includes('protocol') ||
      contentLower.includes('grpc') ||
      contentLower.includes('api change') ||
      contentLower.includes('database') ||
      category === 'architecture') {
    return 'high';
  }
  
  // Medium impact indicators  
  if (contentLower.includes('performance') ||
      contentLower.includes('integration') ||
      contentLower.includes('user experience') ||
      category === 'feature-idea') {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Sprint alignment assessment
 */
export function assessSprintAlignment(
  content: string,
  activeTasks: any[],
  category: string
): 'perfect' | 'good' | 'moderate' | 'poor' {
  const contentLower = content.toLowerCase();
  
  // Check if thought aligns with current active tasks
  const taskAlignment = activeTasks.filter(task => {
    const taskContent = task.content?.toLowerCase() || '';
    return contentLower.split(' ').some(word => 
      word.length > 4 && taskContent.includes(word)
    );
  });
  
  if (taskAlignment.length >= 3) return 'perfect';
  if (taskAlignment.length >= 2) return 'good'; 
  if (taskAlignment.length >= 1) return 'moderate';
  
  // Category-based alignment assessment
  if (category === 'bug-insight' || category === 'technical-debt') {
    return 'good'; // Always relevant for sprint health
  }
  
  return 'poor';
}

/**
 * Calculate strategic value score
 */
export function calculateStrategicValue(
  content: string,
  tags: string[],
  category: string,
  urgency: string,
  projectDocs: string[]
): number {
  let score = 50; // Base score
  
  const contentLower = content.toLowerCase();
  
  // Category-based scoring
  const categoryScores: { [key: string]: number } = {
    'architecture': 25,
    'feature-idea': 20,
    'technical-debt': 15,
    'bug-insight': 18,
    'optimization': 12,
    'process-improvement': 10,
    'research-topic': 8
  };
  score += categoryScores[category] || 5;
  
  // Urgency-based scoring
  const urgencyScores: { [key: string]: number } = {
    'immediate': 20,
    'next-sprint': 15,
    'backlog': 5,
    'future': 0
  };
  score += urgencyScores[urgency] || 0;
  
  // Content-based strategic indicators
  if (contentLower.includes('scalability') || contentLower.includes('performance')) score += 15;
  if (contentLower.includes('user experience') || contentLower.includes('usability')) score += 12;
  if (contentLower.includes('security') || contentLower.includes('privacy')) score += 20;
  if (contentLower.includes('maintainability') || contentLower.includes('technical debt')) score += 10;
  if (contentLower.includes('innovation') || contentLower.includes('competitive')) score += 8;
  
  // Microservice architecture relevance
  if (contentLower.includes('microservice') || contentLower.includes('distributed')) score += 10;
  if (contentLower.includes('grpc') || contentLower.includes('protocol')) score += 12;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Assess implementation complexity
 */
export function assessImplementationComplexity(
  content: string,
  category: string
): 'trivial' | 'simple' | 'moderate' | 'complex' | 'architectural' {
  const contentLower = content.toLowerCase();
  
  // Architectural complexity
  if (contentLower.includes('architecture') ||
      contentLower.includes('refactor entire') ||
      contentLower.includes('breaking change') ||
      category === 'architecture') {
    return 'architectural';
  }
  
  // Complex implementation
  if (contentLower.includes('integration') ||
      contentLower.includes('multiple services') ||
      contentLower.includes('database changes') ||
      contentLower.includes('protocol change')) {
    return 'complex';
  }
  
  // Moderate implementation
  if (contentLower.includes('new feature') ||
      contentLower.includes('api changes') ||
      contentLower.includes('performance optimization')) {
    return 'moderate';
  }
  
  // Simple implementation
  if (contentLower.includes('config') ||
      contentLower.includes('small change') ||
      contentLower.includes('ui tweak')) {
    return 'simple';
  }
  
  return 'trivial';
}

/**
 * Identify cross-service impact
 */
export function identifyCrossServiceImpact(content: string): string[] {
  const contentLower = content.toLowerCase();
  const impactedServices: string[] = [];
  
  if (contentLower.includes('hub') || contentLower.includes('core') || contentLower.includes('stt') || contentLower.includes('tts')) {
    impactedServices.push('loqa-hub');
  }
  if (contentLower.includes('ui') || contentLower.includes('dashboard') || contentLower.includes('commander')) {
    impactedServices.push('loqa-commander');
  }
  if (contentLower.includes('relay') || contentLower.includes('audio') || contentLower.includes('capture')) {
    impactedServices.push('loqa-relay');
  }
  if (contentLower.includes('skill') || contentLower.includes('plugin')) {
    impactedServices.push('loqa-skills');
  }
  if (contentLower.includes('protocol') || contentLower.includes('grpc') || contentLower.includes('api')) {
    impactedServices.push('loqa-proto');
  }
  
  return [...new Set(impactedServices)];
}

/**
 * Generate timeline suggestion based on complexity and urgency
 */
export function generateTimelineSuggestion(
  content: string,
  category: string,
  urgency: string
): string {
  const complexity = assessImplementationComplexity(content, category);
  
  const timelineMap: { [key: string]: string } = {
    'trivial': 'Can be completed in 1-2 hours',
    'simple': 'Estimated 2-4 hours of focused work',
    'moderate': 'Plan for 1-2 days of development',
    'complex': 'Requires 3-5 days with proper testing',
    'architectural': 'Major effort: 1-2 weeks with coordination'
  };
  
  let suggestion = timelineMap[complexity];
  
  if (urgency === 'immediate') {
    suggestion += ' - Consider prioritizing in current sprint';
  } else if (urgency === 'next-sprint') {
    suggestion += ' - Good candidate for next sprint planning';
  } else if (urgency === 'backlog') {
    suggestion += ' - Add to backlog for future consideration';
  }
  
  return suggestion;
}

/**
 * Generate contextual insights
 */
export function generateContextualInsights(
  content: string,
  category: string,
  activeTasks: any[]
): string[] {
  const insights: string[] = [];
  const contentLower = content.toLowerCase();
  
  // Cross-task relationship insights
  const relatedTasks = activeTasks.filter(task => 
    contentLower.split(' ').some(word => 
      word.length > 4 && task.content?.toLowerCase().includes(word)
    )
  );
  
  if (relatedTasks.length > 0) {
    insights.push(`Relates to ${relatedTasks.length} active task(s) - consider coordination`);
  }
  
  // Architecture insights
  if (contentLower.includes('microservice') || contentLower.includes('distributed')) {
    insights.push('Microservice architecture consideration - may require cross-service coordination');
  }
  
  // Performance insights
  if (contentLower.includes('performance') || contentLower.includes('optimization')) {
    insights.push('Performance optimization - measure before/after impact');
  }
  
  // User experience insights
  if (contentLower.includes('user') || contentLower.includes('ux')) {
    insights.push('User-facing change - consider UX impact and testing');
  }
  
  // Technical debt insights
  if (category === 'technical-debt') {
    insights.push('Technical debt item - balance immediate value vs. long-term maintainability');
  }
  
  return insights;
}

/**
 * Determine action recommendation
 */
export function determineActionRecommendation(
  content: string,
  category: string,
  urgency: string,
  activeTasks: any[]
): 'capture_only' | 'add_to_existing' | 'create_simple_task' | 'create_comprehensive_task' | 'schedule_discussion' {
  const complexity = assessImplementationComplexity(content, category);
  const impact = assessProjectImpact(content, category, []);
  
  // Schedule discussion for architectural or critical items
  if (complexity === 'architectural' || impact === 'critical') {
    return 'schedule_discussion';
  }
  
  // Add to existing task if high alignment
  const relatedTasks = activeTasks.filter(task => 
    content.toLowerCase().split(' ').some(word => 
      word.length > 4 && task.content?.toLowerCase().includes(word)
    )
  );
  
  if (relatedTasks.length >= 2 && urgency !== 'future') {
    return 'add_to_existing';
  }
  
  // Create comprehensive task for complex items with high impact
  if ((complexity === 'complex' || impact === 'high') && urgency !== 'future') {
    return 'create_comprehensive_task';
  }
  
  // Create simple task for moderate complexity with immediate urgency
  if (complexity === 'moderate' && urgency === 'immediate') {
    return 'create_simple_task';
  }
  
  // Just capture for future reference
  return 'capture_only';
}

/**
 * Intelligent category detection for simple thoughts
 */
export function detectThoughtCategory(content: string, tags: string[]): string {
  const contentLower = content.toLowerCase();
  
  // Check explicit category tags first
  const categoryTags = ['architecture', 'feature-idea', 'technical-debt', 'process-improvement', 'research-topic', 'bug-insight', 'optimization'];
  for (const tag of tags) {
    if (categoryTags.includes(tag)) return tag;
  }
  
  // Content-based detection
  if (contentLower.includes('architecture') || contentLower.includes('system design') || contentLower.includes('microservice')) {
    return 'architecture';
  }
  if (contentLower.includes('bug') || contentLower.includes('error') || contentLower.includes('issue')) {
    return 'bug-insight';
  }
  if (contentLower.includes('debt') || contentLower.includes('refactor') || contentLower.includes('cleanup')) {
    return 'technical-debt';
  }
  if (contentLower.includes('performance') || contentLower.includes('optimize') || contentLower.includes('faster')) {
    return 'optimization';
  }
  if (contentLower.includes('feature') || contentLower.includes('new') || contentLower.includes('add')) {
    return 'feature-idea';
  }
  if (contentLower.includes('process') || contentLower.includes('workflow') || contentLower.includes('improve')) {
    return 'process-improvement';
  }
  if (contentLower.includes('research') || contentLower.includes('investigate') || contentLower.includes('explore')) {
    return 'research-topic';
  }
  
  return 'feature-idea'; // Default category
}

/**
 * Estimate urgency from thought content
 */
export function estimateThoughtUrgency(content: string): string {
  const contentLower = content.toLowerCase();
  
  // Immediate urgency indicators
  if (contentLower.includes('urgent') || contentLower.includes('asap') || contentLower.includes('critical') || contentLower.includes('breaking')) {
    return 'immediate';
  }
  
  // Next sprint indicators
  if (contentLower.includes('soon') || contentLower.includes('next') || contentLower.includes('priority')) {
    return 'next-sprint';
  }
  
  // Future indicators
  if (contentLower.includes('someday') || contentLower.includes('eventually') || contentLower.includes('maybe')) {
    return 'future';
  }
  
  return 'backlog'; // Default urgency
}

/**
 * Determine category from analysis
 */
export function determineCategory(analysis: any): string {
  if (analysis.hasArchitecturalImplications) return 'architecture';
  if (analysis.hasUrgencyIndicators) return 'urgent';
  if (analysis.hasImplementationDetails) return 'feature';
  return 'general';
}

/**
 * Map category to template
 */
export function mapCategoryToTemplate(category: string, isMultiRepo: boolean): string {
  if (isMultiRepo) return 'cross-repo';
  
  const categoryMap: { [key: string]: string } = {
    'architecture': 'feature',
    'feature-idea': 'feature',
    'bug-insight': 'bug-fix',
    'technical-debt': 'bug-fix',
    'process-improvement': 'general'
  };
  
  return categoryMap[category] || 'general';
}

/**
 * Estimate effort from scope
 */
export function estimateEffortFromScope(repositories: string[], category: string): string {
  if (repositories.length > 2) return 'weeks';
  if (repositories.length > 1) return 'days-weeks';
  if (category === 'architecture') return 'days';
  return 'hours-days';
}

/**
 * Derive a concise task title from thought content
 */
export function deriveTaskTitle(thoughtContent: string): string {
  // Extract first sentence or first 60 characters
  const firstSentence = thoughtContent.split(/[.!?]/)[0].trim();
  let title = firstSentence.length > 0 ? firstSentence : thoughtContent;
  
  // Truncate if too long
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  return title;
}

/**
 * Map AI-determined category to task type
 */
export function mapCategoryToTaskType(category: string): "Feature" | "Bug Fix" | "Improvement" | "Documentation" {
  const categoryToTypeMap: { [key: string]: "Feature" | "Bug Fix" | "Improvement" | "Documentation" } = {
    'architecture': 'Improvement', // Map architecture to Improvement instead of Refactoring
    'feature': 'Feature', 
    'feature-idea': 'Feature',
    'urgent': 'Bug Fix',
    'bug-insight': 'Bug Fix',
    'technical-debt': 'Improvement', // Map technical debt to Improvement
    'process-improvement': 'Improvement',
    'optimization': 'Improvement',
    'research-topic': 'Documentation',
    'general': 'Improvement'
  };
  
  return categoryToTypeMap[category] || 'Improvement';
}

/**
 * Append additional context and original thought to task file
 */
export async function appendContextToTask(filePath: string, additionalContext: string, originalThought: string): Promise<void> {
  try {
    const fs = await import('fs/promises');
    
    // Read current task file content
    const currentContent = await fs.readFile(filePath, 'utf-8');
    
    // Append the additional context section
    const appendContent = `\n\n## Original Thought\n\n${originalThought}\n\n## Additional Context\n\n${additionalContext}\n`;
    
    // Write back with appended content
    await fs.writeFile(filePath, currentContent + appendContent, 'utf-8');
  } catch (error) {
    console.warn(`Failed to append context to task file: ${error}`);
    // Non-critical error - task was created successfully
  }
}

/**
 * Analyze repository requirements from text
 */
export async function analyzeRepositoryRequirements(text: string): Promise<string[]> {
  const textLower = text.toLowerCase();
  const repos: string[] = [];
  
  // Direct mentions
  KNOWN_REPOSITORIES_LIST.forEach(repo => {
    if (textLower.includes(repo.toLowerCase())) {
      repos.push(repo);
    }
  });
  
  // Technology-based inference
  if (textLower.includes('ui') || textLower.includes('dashboard') || textLower.includes('vue')) {
    repos.push('loqa-commander');
  }
  if (textLower.includes('grpc') || textLower.includes('proto')) {
    repos.push('loqa-proto');
  }
  if (textLower.includes('skill') || textLower.includes('plugin')) {
    repos.push('loqa-skills');
  }
  if (textLower.includes('hub') || textLower.includes('stt') || textLower.includes('tts') || textLower.includes('llm')) {
    repos.push('loqa-hub');
  }
  
  return [...new Set(repos)];
}

/**
 * Analyze initial complexity of text
 */
export function analyzeInitialComplexity(text: string): 'low' | 'medium' | 'high' {
  const indicators = {
    high: ['system', 'architecture', 'refactor', 'migration', 'breaking', 'multiple', 'across'],
    medium: ['feature', 'implement', 'integration', 'api', 'database'],
    low: ['fix', 'update', 'small', 'simple', 'quick']
  };
  
  const textLower = text.toLowerCase();
  
  if (indicators.high.some(indicator => textLower.includes(indicator))) return 'high';
  if (indicators.medium.some(indicator => textLower.includes(indicator))) return 'medium';
  return 'low';
}

/**
 * Analyze complexity from user answer
 */
export function analyzeComplexityFromAnswer(answer: string): { complexity: 'low' | 'medium' | 'high', needsBreakdown: boolean } {
  const answerLower = answer.toLowerCase();
  
  const complexityKeywords = {
    high: ['very complex', 'multiple weeks', 'architectural', 'breaking changes', 'risky'],
    medium: ['moderately complex', 'few days', 'some risk', 'multiple files'],
    low: ['simple', 'straightforward', 'quick', 'few hours']
  };
  
  let complexity: 'low' | 'medium' | 'high' = 'medium';
  
  if (complexityKeywords.high.some(kw => answerLower.includes(kw))) {
    complexity = 'high';
  } else if (complexityKeywords.low.some(kw => answerLower.includes(kw))) {
    complexity = 'low';
  }
  
  const needsBreakdown = complexity === 'high' || 
                        answerLower.includes('break') || 
                        answerLower.includes('multiple') ||
                        answerLower.includes('phases');
  
  return { complexity, needsBreakdown };
}

/**
 * Suggest task breakdown based on interview state
 */
export async function suggestTaskBreakdown(interview: TaskInterviewState): Promise<TaskBreakdownSuggestion[]> {
  const breakdown: TaskBreakdownSuggestion[] = [];
  const repos = interview.accumulatedInfo.repositories || ['loqa'];
  const description = interview.accumulatedInfo.description || '';
  
  // Simple breakdown logic - in practice this could be more sophisticated
  if (repos.length > 1) {
    // Multi-repo task - suggest one task per repo
    repos.forEach(repo => {
      breakdown.push({
        title: `${interview.accumulatedInfo.title} - ${repo} changes`,
        description: `Implement ${repo}-specific changes for: ${description}`,
        repository: repo,
        estimatedEffort: 'days'
      });
    });
  } else if (interview.accumulatedInfo.estimatedComplexity === 'high') {
    // Complex single-repo task - suggest phases
    breakdown.push(
      {
        title: `${interview.accumulatedInfo.title} - Planning & Design`,
        description: `Design and plan the implementation approach for: ${description}`,
        repository: repos[0],
        estimatedEffort: 'hours'
      },
      {
        title: `${interview.accumulatedInfo.title} - Core Implementation`,
        description: `Implement core functionality: ${description}`,
        repository: repos[0],
        estimatedEffort: 'days',
        dependencies: ['Planning & Design']
      },
      {
        title: `${interview.accumulatedInfo.title} - Testing & Validation`,
        description: `Test and validate implementation: ${description}`,
        repository: repos[0],
        estimatedEffort: 'hours',
        dependencies: ['Core Implementation']
      }
    );
  }
  
  return breakdown;
}

/**
 * Format time ago helper
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return 'recently';
  }
}

/**
 * Determine template from breakdown
 */
export function determineTemplateFromBreakdown(subtask: TaskBreakdownSuggestion): string {
  if (subtask.title.toLowerCase().includes('design') || subtask.title.toLowerCase().includes('planning')) {
    return 'general';
  }
  if (subtask.title.toLowerCase().includes('test')) {
    return 'bug-fix';
  }
  return 'feature';
}

/**
 * Phase 2: Advanced thought impact assessment with sprint alignment analysis
 */
export async function performAdvancedThoughtAnalysis(
  thoughtContent: string,
  thoughtTags: string[],
  thoughtContext: string | undefined,
  category: string,
  urgency: string,
  workspaceRoot?: string
): Promise<{
  projectImpact: 'low' | 'medium' | 'high' | 'critical';
  sprintAlignment: 'perfect' | 'good' | 'moderate' | 'poor';
  strategicValue: number; // 0-100
  implementationComplexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'architectural';
  crossServiceImpact: string[];
  timelineSuggestion: string;
  contextualInsights: string[];
  actionRecommendation: 'capture_only' | 'add_to_existing' | 'create_simple_task' | 'create_comprehensive_task' | 'schedule_discussion';
}> {
  const actualWorkspaceRoot = workspaceRoot || process.cwd();
  
  // Load current project context and active work
  const projectDocs: string[] = [];
  const activeTasks: any[] = [];
  
  try {
    // Load project documentation
    try {
      const claudeFile = await readFile(join(actualWorkspaceRoot, '..', 'loqa', 'CLAUDE.md'), 'utf-8');
      projectDocs.push(claudeFile);
    } catch {
      // Try alternative path structure
      try {
        const claudeFile = await readFile(join(actualWorkspaceRoot, 'CLAUDE.md'), 'utf-8');
        projectDocs.push(claudeFile);
      } catch {
        // No project docs available
      }
    }
    
    // Load active tasks from key repositories to understand current sprint focus
    const keyRepos = ['loqa-hub', 'loqa-commander', 'loqa-relay', 'loqa-skills'];
    for (const repo of keyRepos) {
      try {
        const taskManager = new LoqaTaskManager(join(actualWorkspaceRoot, '..', repo));
        const taskList = await taskManager.listTasks();
        
        for (const taskFile of taskList.tasks.slice(0, 5)) { // Load top 5 active tasks per repo
          try {
            const taskPath = join(actualWorkspaceRoot, '..', repo, 'backlog', 'tasks', taskFile);
            const content = await readFile(taskPath, 'utf-8');
            activeTasks.push({
              file: taskFile,
              repository: repo,
              content: content.substring(0, 500)
            });
          } catch {
            // Skip if task file can't be read
          }
        }
      } catch {
        // Repository doesn't exist or no tasks
      }
    }
  } catch (error) {
    console.warn('Could not load full project context for advanced analysis');
  }

  // Advanced analysis based on thought content and current project state
  const analysis = {
    projectImpact: assessProjectImpact(thoughtContent, category, projectDocs),
    sprintAlignment: assessSprintAlignment(thoughtContent, activeTasks, category),
    strategicValue: calculateStrategicValue(thoughtContent, thoughtTags, category, urgency, projectDocs),
    implementationComplexity: assessImplementationComplexity(thoughtContent, category),
    crossServiceImpact: identifyCrossServiceImpact(thoughtContent),
    timelineSuggestion: generateTimelineSuggestion(thoughtContent, category, urgency),
    contextualInsights: generateContextualInsights(thoughtContent, category, activeTasks),
    actionRecommendation: determineActionRecommendation(thoughtContent, category, urgency, activeTasks)
  };
  
  return analysis;
}