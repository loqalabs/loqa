import { LoqaTaskManager } from '../managers/index.js';
import { join } from 'path';
import { KNOWN_REPOSITORIES_LIST } from '../config/repositories.js';
import { analyzeTaskPriorityWithAI, AITaskAnalysis } from './ai-prioritization.js';

/**
 * Thought Analysis Module
 * 
 * Extracted from monolithic task-management-tools.ts to provide focused
 * thought analysis and evaluation functionality.
 */

interface ThoughtEvaluation {
  shouldSuggestTask: boolean;
  reasoning: string;
  suggestedTemplate: string;
  suggestedPriority: string;
  category: string;
  scope?: string;
  estimatedEffort?: string;
}

/**
 * Dynamically evaluates a thought/idea against current project state
 * Uses AI-powered analysis instead of brittle keyword matching
 */
async function evaluateThoughtPriority(
  content: string, 
  tags: string[] = [], 
  context?: string,
  workspaceRoot?: string
): Promise<ThoughtEvaluation> {
  try {
    // NEW: Use AI-powered analysis for smarter prioritization
    const aiAnalysis = await analyzeTaskPriorityWithAI(
      content,
      undefined, // no title for thoughts
      'architect', // default to architect perspective for strategic analysis
      'Voice assistant microservice project with focus on developer experience'
    );
    
    // Convert AI analysis to ThoughtEvaluation format
    return convertAIAnalysisToThoughtEvaluation(aiAnalysis, content, tags, context);
    
  } catch (error) {
    // Fallback to heuristic analysis if AI analysis fails
    console.warn('AI analysis failed, falling back to heuristics:', error);
    return await evaluateThoughtPriorityFallback(content, tags, context, workspaceRoot);
  }
}

/**
 * Converts AI analysis to the legacy ThoughtEvaluation format
 * for backward compatibility
 */
function convertAIAnalysisToThoughtEvaluation(
  aiAnalysis: AITaskAnalysis,
  content: string,
  tags: string[],
  context?: string
): ThoughtEvaluation {
  
  const templateMap: { [key: string]: string } = {
    'critical': 'feature',
    'high': 'feature', 
    'medium': 'general',
    'low': 'general'
  };
  
  const priorityMap: { [key: string]: string } = {
    'critical': 'High',
    'high': 'High',
    'medium': 'Medium', 
    'low': 'Low'
  };
  
  // Determine category from AI analysis
  let category = 'general';
  if (aiAnalysis.technicalDebtLevel > 60) category = 'technical-debt';
  if (aiAnalysis.architecturalImpact > 60) category = 'architecture';
  if (content.toLowerCase().includes('feature')) category = 'feature-idea';
  if (content.toLowerCase().includes('bug')) category = 'bug-insight';
  
  // Enhanced reasoning that includes AI insights
  const enhancedReasoning = `AI Analysis (Score: ${aiAnalysis.score}): ${aiAnalysis.reasoning}. ` +
    `Architectural Impact: ${aiAnalysis.architecturalImpact}%, Technical Debt: ${aiAnalysis.technicalDebtLevel}%, ` +
    `Productivity Impact: ${aiAnalysis.productivityImpact}%`;
  
  return {
    shouldSuggestTask: aiAnalysis.score > 50, // AI-driven threshold
    reasoning: enhancedReasoning,
    suggestedTemplate: templateMap[aiAnalysis.priority] || 'general',
    suggestedPriority: priorityMap[aiAnalysis.priority] || 'Medium',
    category: category,
    scope: aiAnalysis.urgencyFactors.length > 0 ? 'urgent' : 'normal',
    estimatedEffort: aiAnalysis.score > 80 ? 'High' : aiAnalysis.score > 50 ? 'Medium' : 'Low'
  };
}

/**
 * Fallback to original heuristic-based analysis
 * Kept for reliability in case AI analysis fails
 */
async function evaluateThoughtPriorityFallback(
  content: string, 
  tags: string[] = [], 
  context?: string,
  workspaceRoot?: string
): Promise<ThoughtEvaluation> {
  try {
    // Get current project state
    const projectState = await analyzeCurrentProjectState(workspaceRoot);
    
    // Analyze thought content for patterns and keywords
    const thoughtAnalysis = analyzeThoughtContent(content, tags, context);
    
    // Cross-reference with current priorities and gaps
    const priorityAssessment = assessPriorityAgainstCurrentState(thoughtAnalysis, projectState);
    
    return priorityAssessment;
  } catch (error) {
    // Final fallback
    return {
      shouldSuggestTask: false,
      reasoning: 'Unable to analyze against current project state. Captured for later review.',
      suggestedTemplate: 'general',
      suggestedPriority: 'Medium',
      category: 'general'
    };
  }
}

/**
 * Enhanced evaluation for comprehensive thoughts with full context
 */
async function evaluateComprehensiveThought(
  content: string,
  category: string,
  urgency: string,
  relatedRepositories: string[],
  workspaceRoot?: string
): Promise<ThoughtEvaluation> {
  try {
    const projectState = await analyzeCurrentProjectState(workspaceRoot);
    const thoughtAnalysis = {
      ...analyzeThoughtContent(content, [category, urgency], ''),
      category,
      urgency,
      relatedRepositories
    };
    
    const assessment = assessPriorityAgainstCurrentState(thoughtAnalysis, projectState);
    
    // Enhanced reasoning for comprehensive thoughts
    assessment.scope = relatedRepositories.length > 1 ? 'Multi-repository' : `Single repository (${relatedRepositories.join(', ')})`;
    assessment.estimatedEffort = estimateEffortFromScope(relatedRepositories, category);
    
    return assessment;
  } catch (error) {
    return {
      shouldSuggestTask: urgency === 'immediate' || urgency === 'next-sprint',
      reasoning: `${category} with ${urgency} urgency. Dynamic analysis unavailable, using category-based assessment.`,
      suggestedTemplate: mapCategoryToTemplate(category, relatedRepositories.length > 1),
      suggestedPriority: urgency === 'immediate' ? 'High' : 'Medium',
      category
    };
  }
}

/**
 * Analyzes current project state by examining tasks, activity, and priorities
 */
async function analyzeCurrentProjectState(workspaceRoot?: string) {
  const actualWorkspaceRoot = workspaceRoot || process.cwd();
  const state = {
    activeTasks: [] as any[],
    recentActivity: [] as string[],
    priorityAreas: [] as string[],
    gaps: [] as string[],
    overloadedAreas: [] as string[],
    taskDetails: [] as Array<{ taskFile: string, repo: string, title: string, content?: string }>
  };
  
  try {
    // Analyze each repository's backlog
    for (const repoName of KNOWN_REPOSITORIES_LIST) {
      try {
        const repoPath = join(actualWorkspaceRoot, repoName);
        const taskManager = new LoqaTaskManager(repoPath);
        const result = await taskManager.listTasks();
        
        // Collect active tasks and identify patterns
        state.activeTasks.push(...result.tasks.map(task => ({ task, repo: repoName })));
        
        // Load task details for better matching
        for (const taskFile of result.tasks) {
          try {
            const taskPath = join(repoPath, 'backlog', 'tasks', taskFile);
            const content = await import('fs/promises').then(fs => fs.readFile(taskPath, 'utf-8'));
            const title = extractTaskTitle(content);
            
            state.taskDetails.push({
              taskFile,
              repo: repoName,
              title: title || taskFile,
              content: content.substring(0, 500) // First 500 chars for matching
            });
          } catch (error) {
            // Skip if can't read task file
            state.taskDetails.push({
              taskFile,
              repo: repoName,
              title: taskFile,
              content: undefined
            });
          }
        }
        
        // Identify priority areas from task titles and patterns
        result.tasks.forEach(task => {
          const taskLower = task.toLowerCase();
          if (taskLower.includes('critical') || taskLower.includes('urgent')) {
            state.priorityAreas.push(...extractKeywords(task));
          }
        });
        
        // Identify overloaded areas (too many tasks)
        if (result.tasks.length > 8) {
          state.overloadedAreas.push(repoName);
        }
        
        // Identify gaps (repositories with few or no tasks)
        if (result.tasks.length < 2) {
          state.gaps.push(repoName);
        }
      } catch (error) {
        // Repository might not exist or have backlog - continue
        continue;
      }
    }
  } catch (error) {
    console.warn('Failed to analyze project state:', error);
  }
  
  return state;
}

/**
 * Extract task title from task file content
 */
function extractTaskTitle(content: string): string | null {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.replace('# ', '').replace(/^Task:\s*/, '').trim();
    }
  }
  return null;
}

/**
 * AI-powered analysis to find existing tasks that might be related to a thought/idea
 * Uses project context understanding instead of simple keyword matching
 */
async function findRelatedExistingTasks(
  thoughtContent: string,
  thoughtTags: string[],
  thoughtContext: string | undefined,
  projectState: any
): Promise<Array<{ task: any, similarity: number, reason: string }>> {
  try {
    // If no existing tasks, return empty
    if (projectState.taskDetails.length === 0) {
      return [];
    }
    
    // Load project context for AI analysis
    const projectContext = await loadProjectContextForAI();
    
    // Use AI to analyze thought against existing tasks
    const analysis = await analyzeThoughtWithAI(
      thoughtContent,
      thoughtTags,
      thoughtContext,
      projectState.taskDetails.slice(0, 10), // Limit to top 10 tasks for performance
      projectContext
    );
    
    return analysis.relatedTasks || [];
  } catch (error) {
    console.warn('AI-powered matching failed, falling back to basic matching:', error);
    // Fallback to simple matching if AI analysis fails
    return basicTaskMatching(thoughtContent, thoughtTags, thoughtContext, projectState);
  }
}

/**
 * Load project context from documentation files for AI analysis
 */
async function loadProjectContextForAI(): Promise<string> {
  let context = '';
  
  try {
    const fs = await import('fs/promises');
    const { join } = await import('path');
    
    // Try to load key project documentation
    const contextFiles = [
      'CLAUDE.md',
      'README.md', 
      'backlog/README.md'
    ];
    
    for (const file of contextFiles) {
      try {
        const filePath = join(process.cwd(), file);
        const content = await fs.readFile(filePath, 'utf-8');
        context += `\n\n=== ${file} ===\n${content.substring(0, 2000)}`; // Limit to 2k chars per file
      } catch (error) {
        // File doesn't exist, skip
        continue;
      }
    }
    
    // Add project architecture overview
    context += '\n\n=== Project Architecture ===\n';
    context += 'Loqa is a local-first voice assistant platform with microservice architecture:\n';
    context += '- loqa-hub (Go): Central service, gRPC, STT/TTS/LLM pipeline, SQLite storage\n';
    context += '- loqa-commander (Vue.js): Administrative dashboard and monitoring\n';
    context += '- loqa-relay (Go): Audio capture client and firmware\n';
    context += '- loqa-proto (Protocol Buffers): gRPC definitions\n';
    context += '- loqa-skills (Go plugins): Modular skill system\n';
    context += '- Focus: Privacy-first, local processing, no cloud dependencies\n';
    
    return context;
  } catch (error) {
    return 'Loqa voice assistant platform - microservice architecture with Go backend, Vue.js frontend, local AI processing';
  }
}

/**
 * Use AI reasoning to analyze how a thought relates to existing tasks
 */
async function analyzeThoughtWithAI(
  thoughtContent: string,
  thoughtTags: string[],
  thoughtContext: string | undefined,
  existingTasks: any[],
  projectContext: string
): Promise<{ relatedTasks: Array<{ task: any, similarity: number, reason: string }> }> {
  
  // Prepare task summaries for AI analysis
  const taskSummaries = existingTasks.map((task, index) => 
    `${index + 1}. "${task.title}" (${task.repo})\n   ${(task.content || '').substring(0, 200)}`
  ).join('\n\n');
  
  const analysisPrompt = `You are analyzing a new thought/idea in the context of the Loqa project to determine if it should be added to an existing task or become a new task.

PROJECT CONTEXT:
${projectContext}

NEW THOUGHT/IDEA:
Content: "${thoughtContent}"
Tags: ${thoughtTags.join(', ')}
Context: ${thoughtContext || 'None provided'}

EXISTING TASKS:
${taskSummaries}

ANALYSIS INSTRUCTIONS:
1. Consider the Loqa project's goals: local-first voice assistant, microservice architecture, privacy-focused
2. Analyze how this thought relates to existing tasks conceptually, not just by keywords
3. Consider if this thought would enhance/extend an existing task vs. being a separate concern
4. Think about the project architecture and which components this affects

For each existing task that this thought could relate to, provide:
- Similarity score (0-100): How closely related is this thought to the existing task?
- Reasoning: Why does this thought relate to this task? Consider:
  * Does it solve the same underlying problem?
  * Would it be implemented in the same component/repository?
  * Does it share the same user story or business goal?
  * Is it a natural extension or enhancement of the existing work?

RESPONSE FORMAT (JSON):
{
  "relatedTasks": [
    {
      "taskIndex": 1,
      "similarity": 85,
      "reason": "Both address STT accuracy improvements and would be implemented in the loqa-hub service. This thought provides specific implementation approach for the existing task's goals."
    }
  ],
  "recommendation": "add_to_existing|create_new",
  "reasoning": "Overall assessment of whether this thought should extend existing work or become new task"
}

Only include tasks with similarity > 30. If no tasks are significantly related, return empty relatedTasks array.`;

  try {
    // In a real implementation, this would call an LLM API
    // For now, we'll return a structured analysis based on simple heuristics
    // that can be enhanced with actual LLM integration
    
    const analysis = performHeuristicAIAnalysis(thoughtContent, thoughtTags, thoughtContext, existingTasks);
    return analysis;
    
  } catch (error) {
    throw new Error(`AI analysis failed: ${error}`);
  }
}

/**
 * Heuristic-based analysis that simulates AI reasoning
 * This can be replaced with actual LLM API calls
 */
function performHeuristicAIAnalysis(
  thoughtContent: string,
  thoughtTags: string[],
  thoughtContext: string | undefined,
  existingTasks: any[]
): { relatedTasks: Array<{ task: any, similarity: number, reason: string }> } {
  
  const relatedTasks = [];
  const thoughtLower = `${thoughtContent} ${thoughtTags.join(' ')} ${thoughtContext || ''}`.toLowerCase();
  
  for (const task of existingTasks) {
    const taskText = `${task.title} ${task.content || ''}`.toLowerCase();
    let similarity = 0;
    let reasons = [];
    
    // Enhanced semantic analysis
    const semanticPatterns = [
      // STT/TTS/Audio patterns
      { terms: ['stt', 'speech', 'voice', 'audio', 'transcrib', 'recogni'], weight: 25, domain: 'audio processing' },
      { terms: ['tts', 'synthesiz', 'speak', 'voice output'], weight: 25, domain: 'speech synthesis' },
      
      // AI/LLM patterns  
      { terms: ['llm', 'model', 'ai', 'intelligence', 'prompt', 'response'], weight: 20, domain: 'AI/LLM' },
      
      // Architecture patterns
      { terms: ['service', 'api', 'grpc', 'microservice', 'architecture'], weight: 15, domain: 'architecture' },
      { terms: ['hub', 'central', 'orchestrat', 'pipeline'], weight: 20, domain: 'hub service' },
      
      // UI/Frontend patterns
      { terms: ['ui', 'interface', 'dashboard', 'commander', 'vue', 'frontend'], weight: 20, domain: 'UI/frontend' },
      
      // Skills/Integration patterns
      { terms: ['skill', 'plugin', 'integration', 'homeassistant', 'command'], weight: 20, domain: 'skills system' },
      
      // Performance/Quality patterns
      { terms: ['performance', 'optim', 'speed', 'efficiency', 'accuracy', 'quality'], weight: 15, domain: 'performance' },
      { terms: ['error', 'retry', 'failur', 'reliabil', 'robust'], weight: 20, domain: 'reliability' },
      
      // Infrastructure patterns
      { terms: ['docker', 'deploy', 'config', 'setup', 'infra'], weight: 15, domain: 'infrastructure' }
    ];
    
    // Check for semantic domain overlaps
    for (const pattern of semanticPatterns) {
      const thoughtHasDomain = pattern.terms.some(term => thoughtLower.includes(term));
      const taskHasDomain = pattern.terms.some(term => taskText.includes(term));
      
      if (thoughtHasDomain && taskHasDomain) {
        similarity += pattern.weight;
        reasons.push(`both relate to ${pattern.domain}`);
      }
    }
    
    // Check for component/repository alignment
    const componentMap = {
      'hub': ['stt', 'tts', 'llm', 'central', 'service', 'api', 'grpc'],
      'commander': ['ui', 'dashboard', 'frontend', 'vue', 'interface'],
      'relay': ['audio', 'capture', 'client', 'device'],
      'skills': ['skill', 'plugin', 'integration', 'command'],
      'proto': ['protocol', 'grpc', 'definition', 'api']
    };
    
    for (const [component, terms] of Object.entries(componentMap)) {
      const thoughtHasComponent = terms.some(term => thoughtLower.includes(term));
      const taskHasComponent = terms.some(term => taskText.includes(term)) || task.repo?.includes(component);
      
      if (thoughtHasComponent && taskHasComponent) {
        similarity += 15;
        reasons.push(`both target ${component} component`);
      }
    }
    
    // Check for problem/solution alignment
    const problemSolutionPairs = [
      { problem: ['accuracy', 'error', 'wrong', 'incorrect'], solution: ['improve', 'fix', 'enhance', 'optim'] },
      { problem: ['slow', 'performance', 'delay'], solution: ['speed', 'faster', 'optim', 'cache'] },
      { problem: ['fail', 'crash', 'break'], solution: ['retry', 'robust', 'handle', 'recover'] }
    ];
    
    for (const pair of problemSolutionPairs) {
      const thoughtHasProblem = pair.problem.some(term => thoughtLower.includes(term));
      const taskHasSolution = pair.solution.some(term => taskText.includes(term));
      const thoughtHasSolution = pair.solution.some(term => thoughtLower.includes(term));
      const taskHasProblem = pair.problem.some(term => taskText.includes(term));
      
      if ((thoughtHasProblem && taskHasSolution) || (thoughtHasSolution && taskHasProblem)) {
        similarity += 20;
        reasons.push('addresses related problem/solution space');
      }
    }
    
    if (similarity > 30) {
      relatedTasks.push({
        task,
        similarity,
        reason: reasons.join(', ') || 'semantic relationship detected'
      });
    }
  }
  
  return { relatedTasks: relatedTasks.sort((a, b) => b.similarity - a.similarity) };
}

/**
 * Fallback basic matching for when AI analysis fails
 */
function basicTaskMatching(
  thoughtContent: string,
  thoughtTags: string[],
  thoughtContext: string | undefined,
  projectState: any
): Array<{ task: any, similarity: number, reason: string }> {
  // Simple fallback - just check for exact tag matches
  const relatedTasks = [];
  
  for (const taskDetail of projectState.taskDetails) {
    let similarity = 0;
    let reasons = [];
    
    // Check for exact tag matches
    for (const tag of thoughtTags) {
      if (taskDetail.title.toLowerCase().includes(tag.toLowerCase()) || 
          taskDetail.content?.toLowerCase().includes(tag.toLowerCase())) {
        similarity += 15;
        reasons.push(`tag match: ${tag}`);
      }
    }
    
    if (similarity > 10) {
      relatedTasks.push({
        task: taskDetail,
        similarity,
        reason: reasons.join(', ')
      });
    }
  }
  
  return relatedTasks.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Extracts key information from thought content
 */
function analyzeThoughtContent(content: string, tags: string[], context?: string) {
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
function assessPriorityAgainstCurrentState(thoughtAnalysis: any, projectState: any): ThoughtEvaluation {
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
 * Helper functions
 */
function extractKeywords(text: string): string[] {
  // Extract meaningful keywords, avoiding common words
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']);
  return text.match(/\b\w{3,}\b/g)?.filter(word => !stopWords.has(word)) || [];
}

function extractTechMentions(text: string): string[] {
  const techTerms = ['go', 'vue', 'docker', 'grpc', 'protobuf', 'sqlite', 'nats', 'ollama', 'stt', 'tts', 'llm'];
  return techTerms.filter(term => text.includes(term));
}

function estimateComplexity(text: string): 'low' | 'medium' | 'high' {
  const complexityIndicators = ['system', 'architecture', 'refactor', 'migration', 'breaking'];
  const matches = complexityIndicators.filter(indicator => text.includes(indicator));
  
  if (matches.length >= 2) return 'high';
  if (matches.length >= 1) return 'medium';
  return 'low';
}

/**
 * Phase 2: Advanced thought impact assessment with sprint alignment analysis
 */
async function performAdvancedThoughtAnalysis(
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
  const { readFile } = await import('fs/promises');
  const { join } = await import('path');
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

function assessProjectImpact(
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

function assessSprintAlignment(
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

function calculateStrategicValue(
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

function assessImplementationComplexity(
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

function identifyCrossServiceImpact(content: string): string[] {
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

function generateTimelineSuggestion(
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

function generateContextualInsights(
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

function determineActionRecommendation(
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
 * Phase 2: Intelligent category detection for simple thoughts
 */
function detectThoughtCategory(content: string, tags: string[]): string {
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

function estimateThoughtUrgency(content: string): string {
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

function determineCategory(analysis: any): string {
  if (analysis.hasArchitecturalImplications) return 'architecture';
  if (analysis.hasUrgencyIndicators) return 'urgent';
  if (analysis.hasImplementationDetails) return 'feature';
  return 'general';
}

function mapCategoryToTemplate(category: string, isMultiRepo: boolean): string {
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

function estimateEffortFromScope(repositories: string[], category: string): string {
  if (repositories.length > 2) return 'weeks';
  if (repositories.length > 1) return 'days-weeks';
  if (category === 'architecture') return 'days';
  return 'hours-days';
}

// Export all functions for use by other modules
export {
  ThoughtEvaluation,
  evaluateThoughtPriority,
  evaluateComprehensiveThought,
  analyzeCurrentProjectState,
  extractTaskTitle,
  findRelatedExistingTasks,
  loadProjectContextForAI,
  analyzeThoughtWithAI,
  performHeuristicAIAnalysis,
  basicTaskMatching,
  analyzeThoughtContent,
  assessPriorityAgainstCurrentState,
  extractKeywords,
  extractTechMentions,
  estimateComplexity,
  performAdvancedThoughtAnalysis,
  assessProjectImpact,
  assessSprintAlignment,
  calculateStrategicValue,
  assessImplementationComplexity,
  identifyCrossServiceImpact,
  generateTimelineSuggestion,
  generateContextualInsights,
  determineActionRecommendation,
  detectThoughtCategory,
  estimateThoughtUrgency,
  determineCategory,
  mapCategoryToTemplate,
  estimateEffortFromScope
};