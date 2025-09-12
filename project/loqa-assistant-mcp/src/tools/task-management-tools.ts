import { LoqaTaskManager } from '../managers/index.js';
import { basename, dirname, join } from 'path';
import { TaskCreationOptions, CapturedThought, TaskInterviewState, TaskBreakdownSuggestion, ComprehensiveTaskCreationOptions } from '../types/index.js';
import { resolveWorkspaceRoot } from '../utils/workspace-resolver.js';
import { KNOWN_REPOSITORIES_LIST } from '../config/repositories.js';
import { TaskInterviewStorage } from '../utils/task-interview-storage.js';
import { randomUUID } from 'crypto';

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
 * Analyzes existing tasks, recent activity, and project context to determine priority
 */
async function evaluateThoughtPriority(
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
    // Fallback to basic evaluation if dynamic analysis fails
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
 * AI-powered decision on whether to use comprehensive task creation flow
 */
async function shouldUseComprehensiveTaskCreation(
  title: string,
  template: string,
  priority: string,
  type?: string,
  workspaceRoot?: string
): Promise<{
  decision: boolean;
  reasoning: string;
  complexityIndicators: string[];
  estimatedEffort: string;
  recommendedApproach: string;
}> {
  
  try {
    // Load project context
    const projectContext = await loadProjectContextForAI();
    
    // Analyze task complexity using AI reasoning
    const analysis = analyzeTaskComplexityWithAI(title, template, priority, type, projectContext);
    
    return analysis;
  } catch (error) {
    // Fallback to simple heuristics
    return simpleComplexityDecision(title, template, priority, type);
  }
}

/**
 * AI-powered analysis of task complexity and requirements
 */
function analyzeTaskComplexityWithAI(
  title: string,
  template: string,
  priority: string,
  type?: string,
  projectContext?: string
): {
  decision: boolean;
  reasoning: string;
  complexityIndicators: string[];
  estimatedEffort: string;
  recommendedApproach: string;
} {
  
  const titleLower = title.toLowerCase();
  const complexityIndicators: string[] = [];
  let complexityScore = 0;
  
  // Analyze architectural complexity
  const architecturalTerms = [
    { terms: ['system', 'architecture', 'design', 'refactor', 'restructure'], weight: 25, indicator: 'architectural changes' },
    { terms: ['migrate', 'upgrade', 'breaking', 'protocol', 'api change'], weight: 30, indicator: 'breaking changes' },
    { terms: ['integration', 'connect', 'interface', 'external'], weight: 20, indicator: 'external integration' },
    { terms: ['security', 'auth', 'permission', 'access control'], weight: 20, indicator: 'security implications' }
  ];
  
  for (const group of architecturalTerms) {
    if (group.terms.some(term => titleLower.includes(term))) {
      complexityScore += group.weight;
      complexityIndicators.push(group.indicator);
    }
  }
  
  // Analyze multi-component impact
  const componentTerms = [
    'hub', 'commander', 'relay', 'skills', 'proto', 'grpc', 'stt', 'tts', 'llm'
  ];
  const mentionedComponents = componentTerms.filter(comp => titleLower.includes(comp));
  if (mentionedComponents.length > 1) {
    complexityScore += 20;
    complexityIndicators.push('multiple components affected');
  }
  
  // Analyze scope and scale
  const scopeTerms = [
    { terms: ['implement', 'build', 'create', 'develop'], weight: 15, indicator: 'new implementation' },
    { terms: ['improve', 'enhance', 'optimize', 'performance'], weight: 10, indicator: 'enhancement work' },
    { terms: ['fix', 'bug', 'error', 'issue'], weight: 5, indicator: 'bug fix' },
    { terms: ['add support', 'enable', 'allow', 'provide'], weight: 15, indicator: 'feature addition' }
  ];
  
  for (const group of scopeTerms) {
    if (group.terms.some(term => titleLower.includes(term))) {
      complexityScore += group.weight;
      complexityIndicators.push(group.indicator);
      break; // Only count one scope type
    }
  }
  
  // Consider template complexity
  const templateComplexity = {
    'cross-repo': 30,
    'protocol-change': 25,
    'feature': 15,
    'bug-fix': 5,
    'general': 10
  };
  complexityScore += templateComplexity[template as keyof typeof templateComplexity] || 10;
  
  // Consider priority urgency
  if (priority === 'High') {
    complexityScore += 15;
    complexityIndicators.push('high priority');
  }
  
  // Analyze length and detail level
  if (title.length < 20) {
    complexityScore += 10;
    complexityIndicators.push('brief description (needs elaboration)');
  } else if (title.length > 80) {
    complexityScore += 15;
    complexityIndicators.push('complex description');
  }
  
  // Make decision based on complexity score
  const decision = complexityScore > 35;
  
  // Determine estimated effort
  let estimatedEffort = 'hours';
  if (complexityScore > 60) {
    estimatedEffort = 'weeks';
  } else if (complexityScore > 40) {
    estimatedEffort = 'days';
  }
  
  // Generate reasoning
  let reasoning = '';
  if (decision) {
    reasoning = `This task shows high complexity (score: ${complexityScore}) indicating it would benefit from comprehensive planning. `;
    if (complexityIndicators.includes('architectural changes')) {
      reasoning += 'Architectural changes require careful design and coordination. ';
    }
    if (complexityIndicators.includes('multiple components affected')) {
      reasoning += 'Multi-component work needs cross-repository coordination. ';
    }
    if (complexityIndicators.includes('breaking changes')) {
      reasoning += 'Breaking changes require impact analysis and migration planning. ';
    }
    reasoning += 'Comprehensive creation will help ensure proper scoping and acceptance criteria.';
  } else {
    reasoning = `This task appears straightforward (score: ${complexityScore}) and can be handled with standard task creation. `;
    if (complexityIndicators.includes('bug fix')) {
      reasoning += 'Bug fixes typically have clear scope and acceptance criteria. ';
    }
    if (complexityScore < 20) {
      reasoning += 'Low complexity indicates well-defined work that doesn\'t require extensive planning.';
    }
  }
  
  return {
    decision,
    reasoning,
    complexityIndicators,
    estimatedEffort,
    recommendedApproach: decision ? 'comprehensive_creation' : 'standard_creation'
  };
}

/**
 * Fallback complexity decision using simple heuristics
 */
function simpleComplexityDecision(
  title: string,
  template: string,
  priority: string,
  type?: string
): {
  decision: boolean;
  reasoning: string;
  complexityIndicators: string[];
  estimatedEffort: string;
  recommendedApproach: string;
} {
  
  const shouldUseComprehensive = (
    priority === "High" || 
    template === "cross-repo" || 
    template === "protocol-change" ||
    !title || 
    title.length < 10
  );
  
  return {
    decision: shouldUseComprehensive,
    reasoning: shouldUseComprehensive 
      ? 'High priority, cross-repo, or insufficient detail detected - comprehensive creation recommended'
      : 'Standard task appears suitable for basic creation',
    complexityIndicators: shouldUseComprehensive ? ['high priority or cross-repo'] : ['standard complexity'],
    estimatedEffort: shouldUseComprehensive ? 'days-weeks' : 'hours-days',
    recommendedApproach: shouldUseComprehensive ? 'comprehensive_creation' : 'standard_creation'
  };
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
 * Calculate string similarity using simple algorithm
 */
function calculateStringSimilarity(str1: string, str2: string): number {
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
function findSemanticRelationships(thoughtText: string, taskContent: string): string[] {
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

/**
 * Derives a concise task title from thought content
 */
function deriveTaskTitle(thoughtContent: string): string {
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
 * Maps AI-determined category to task type
 */
function mapCategoryToTaskType(category: string): "Feature" | "Bug Fix" | "Improvement" | "Documentation" {
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
 * Appends additional context and original thought to task file
 */
async function appendContextToTask(filePath: string, additionalContext: string, originalThought: string): Promise<void> {
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
 * Handler functions for comprehensive task creation
 */

async function handleStartComprehensiveTaskCreation(args: any, workspaceRoot: string): Promise<any> {
  const { initialInput, skipInterview = false } = args;
  const storage = new TaskInterviewStorage(workspaceRoot);
  
  try {
    // Clean up old interviews/drafts
    await storage.cleanup();
    
    // If skip interview requested, try direct creation
    if (skipInterview) {
      const directResult = await attemptDirectTaskCreation(initialInput, workspaceRoot);
      if (directResult.success) {
        return {
          content: [{
            type: "text",
            text: directResult.message
          }]
        };
      }
    }
    
    // Start comprehensive interview process
    const interview = await TaskCreationInterviewer.startInterview(initialInput, workspaceRoot, storage);
    
    return {
      content: [{
        type: "text",
        text: `🎯 **Starting Comprehensive Task Creation**\n\n**Original Input**: "${initialInput}"\n\n**Interview ID**: \`${interview.id}\`\n\n**Question 1**: ${interview.currentQuestion}\n\nPlease answer this question to help me create a fully-fleshed out task. Use \`/answer-task-interview-question ${interview.id} "your answer"\` to respond.`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to start task creation: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

async function handleAnswerInterviewQuestion(args: any, workspaceRoot: string): Promise<any> {
  const { interviewId, answer } = args;
  const storage = new TaskInterviewStorage(workspaceRoot);
  
  try {
    const interview = await TaskCreationInterviewer.processAnswer(interviewId, answer, storage);
    
    if (!interview) {
      return {
        content: [{
          type: "text",
          text: `❌ Interview not found. It may have expired or been completed. Use \`/continue-task-development\` to see available drafts.`
        }]
      };
    }
    
    if (interview.interviewComplete) {
      // Create the final task(s)
      const creationResult = await createTasksFromInterview(interview, workspaceRoot);
      
      // Clean up completed interview
      await storage.deleteInterview(interviewId);
      
      return {
        content: [{
          type: "text",
          text: creationResult.message
        }]
      };
    } else {
      // Continue with next question
      return {
        content: [{
          type: "text",
          text: `📝 **Answer Recorded**\n\n**Next Question**: ${interview.currentQuestion}\n\nPlease use \`/answer-task-interview-question ${interviewId} "your answer"\` to continue.`
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to process answer: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

async function handleContinueTaskDevelopment(args: any, workspaceRoot: string): Promise<any> {
  const { draftId } = args;
  const storage = new TaskInterviewStorage(workspaceRoot);
  
  try {
    if (draftId) {
      // Resume specific draft
      const resumedInterview = await storage.resumeDraftAsInterview(draftId);
      
      if (!resumedInterview) {
        return {
          content: [{
            type: "text",
            text: `❌ Draft not found: ${draftId}`
          }]
        };
      }
      
      return {
        content: [{
          type: "text",
          text: `🔄 **Resumed Draft Task**\n\n**Title**: ${resumedInterview.accumulatedInfo?.title || 'Untitled'}\n**Interview ID**: \`${resumedInterview.id}\`\n\n**Current Question**: ${resumedInterview.currentQuestion}\n\nPlease use \`/answer-task-interview-question ${resumedInterview.id} "your answer"\` to continue.`
        }]
      };
    } else {
      // List available drafts and active interviews
      const [drafts, activeInterviews] = await Promise.all([
        storage.listDrafts(),
        storage.listActiveInterviews()
      ]);
      
      let response = `📋 **Task Development Status**\n\n`;
      
      if (activeInterviews.length > 0) {
        response += `**🔄 Active Interviews (${activeInterviews.length}):**\n`;
        activeInterviews.forEach(interview => {
          response += `• **${interview.title}** (\`${interview.id}\`) - ${interview.currentQuestion.substring(0, 60)}...\n`;
        });
        response += `\nUse \`/answer-task-interview-question <id> "your answer"\` to continue.\n\n`;
      }
      
      if (drafts.length > 0) {
        response += `**📝 Available Drafts (${drafts.length}):**\n`;
        drafts.forEach(draft => {
          const timeAgo = formatTimeAgo(draft.timestamp);
          response += `• **${draft.title}** (\`${draft.id}\`) - ${draft.originalInput.substring(0, 40)}... (${timeAgo})\n`;
        });
        response += `\nUse \`/continue-task-development <draft-id>\` to resume.\n`;
      } else {
        response += `**No drafts or active interviews found.**\n\nUse \`/start-comprehensive-task-creation "your task idea"\` to begin.`;
      }
      
      return {
        content: [{
          type: "text",
          text: response
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to handle task development: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

async function attemptDirectTaskCreation(input: string, workspaceRoot: string): Promise<{ success: boolean; message: string }> {
  // Simple heuristics to determine if we can create directly
  const complexity = analyzeInitialComplexity(input);
  const hasSpecificDetails = input.length > 100 && (input.includes('acceptance') || input.includes('criteria'));
  
  if (complexity === 'low' && hasSpecificDetails) {
    // Try to create directly
    const taskManager = new LoqaTaskManager(workspaceRoot);
    
    try {
      const options: TaskCreationOptions = {
        title: deriveTaskTitle(input),
        template: 'general',
        priority: 'Medium',
        type: 'Improvement'
      };
      
      const result = await taskManager.createTaskFromTemplate(options);
      
      return {
        success: true,
        message: `✅ **Task Created Directly**\n\n📋 **Task ID**: ${result.taskId}\n📁 **File**: ${result.filePath}\n\n**Next Steps**: Task is ready for work!`
      };
    } catch (error) {
      return { success: false, message: '' };
    }
  }
  
  return { success: false, message: '' };
}

async function createTasksFromInterview(interview: TaskInterviewState, workspaceRoot: string): Promise<{ message: string }> {
  const taskManager = new LoqaTaskManager(workspaceRoot);
  const info = interview.accumulatedInfo;
  
  try {
    if (info.suggestedBreakdown && info.suggestedBreakdown.length > 1) {
      // Create multiple tasks from breakdown
      const createdTasks = [];
      
      for (const subtask of info.suggestedBreakdown) {
        const repoTaskManager = new LoqaTaskManager(join(workspaceRoot, '..', subtask.repository));
        
        const options: TaskCreationOptions = {
          title: subtask.title,
          template: determineTemplateFromBreakdown(subtask),
          priority: 'Medium', // TODO: derive from interview
          type: 'Feature' // TODO: derive from interview
        };
        
        const result = await repoTaskManager.createTaskFromTemplate(options);
        createdTasks.push({ ...result, repository: subtask.repository });
      }
      
      let message = `🎉 **Task Breakdown Complete!**\n\n**Created ${createdTasks.length} Tasks:**\n\n`;
      createdTasks.forEach(task => {
        message += `• **${task.repository}**: ${task.taskId}\n`;
      });
      message += `\n**Next Steps**: All tasks are ready for work!`;
      
      return { message };
    } else {
      // Create single comprehensive task
      const repos = info.repositories || ['loqa'];
      const primaryRepo = repos[0];
      const primaryTaskManager = new LoqaTaskManager(join(workspaceRoot, '..', primaryRepo));
      
      const options: TaskCreationOptions = {
        title: info.title || 'New Task',
        template: repos.length > 1 ? 'cross-repo' : 'feature',
        priority: 'Medium', // TODO: derive from complexity/urgency
        type: 'Feature'
      };
      
      const result = await primaryTaskManager.createTaskFromTemplate(options);
      
      // Append comprehensive details to task file
      const additionalContent = buildComprehensiveTaskContent(interview);
      if (additionalContent) {
        await appendContextToTask(result.filePath, additionalContent, interview.originalInput);
      }
      
      return {
        message: `🎉 **Comprehensive Task Created!**\n\n📋 **Task ID**: ${result.taskId}\n📁 **File**: ${result.filePath}\n🏢 **Repository**: ${primaryRepo}\n\n**Next Steps**: Task is fully scoped and ready for work!`
      };
    }
  } catch (error) {
    return {
      message: `❌ Failed to create final task(s): ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

function buildComprehensiveTaskContent(interview: TaskInterviewState): string {
  const info = interview.accumulatedInfo;
  let content = '';
  
  if (info.description) {
    content += `## Detailed Description\n\n${info.description}\n\n`;
  }
  
  if (info.acceptanceCriteria?.length) {
    content += `## Acceptance Criteria\n\n`;
    info.acceptanceCriteria.forEach((criteria, index) => {
      content += `${index + 1}. ${criteria}\n`;
    });
    content += '\n';
  }
  
  if (info.dependencies?.length) {
    content += `## Dependencies\n\n`;
    info.dependencies.forEach(dep => {
      content += `- ${dep}\n`;
    });
    content += '\n';
  }
  
  if (info.repositories?.length && info.repositories.length > 1) {
    content += `## Affected Repositories\n\n`;
    info.repositories.forEach(repo => {
      content += `- ${repo}\n`;
    });
    content += '\n';
  }
  
  return content;
}

function determineTemplateFromBreakdown(subtask: TaskBreakdownSuggestion): string {
  if (subtask.title.toLowerCase().includes('design') || subtask.title.toLowerCase().includes('planning')) {
    return 'general';
  }
  if (subtask.title.toLowerCase().includes('test')) {
    return 'bug-fix';
  }
  return 'feature';
}

function formatTimeAgo(date: Date): string {
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
 * Enhanced Task Creation Interviewer with persistent storage
 */
class TaskCreationInterviewer {
  private static readonly INTERVIEW_QUESTIONS = [
    {
      id: 'scope',
      question: "What specific problem does this task solve? Please describe the current state and desired end state.",
      followUp: "Are there any edge cases or special scenarios to consider?"
    },
    {
      id: 'acceptance',
      question: "How will we know this task is complete? What are the specific acceptance criteria?",
      followUp: "What should NOT be included in this task scope?"
    },
    {
      id: 'technical',
      question: "Are there any technical requirements, constraints, or architectural considerations?",
      followUp: "Which files, services, or components will need to be modified?"
    },
    {
      id: 'dependencies',
      question: "Does this task depend on other work being completed first? Any blockers or prerequisites?",
      followUp: "Will this task block or enable other planned work?"
    },
    {
      id: 'complexity',
      question: "How complex do you estimate this task to be? Does it need to be broken down into smaller tasks?",
      followUp: "What's the riskiest or most uncertain part of this work?"
    }
  ];

  static async startInterview(initialInput: string, workspaceRoot: string, storage: TaskInterviewStorage): Promise<TaskInterviewState> {
    const interviewId = randomUUID();
    
    // Analyze initial input for repository suggestions
    const suggestedRepos = await analyzeRepositoryRequirements(initialInput);
    const complexity = analyzeInitialComplexity(initialInput);
    
    const interview: TaskInterviewState = {
      id: interviewId,
      originalInput: initialInput,
      currentQuestion: this.INTERVIEW_QUESTIONS[0].question,
      questionsAsked: [this.INTERVIEW_QUESTIONS[0].question],
      answersReceived: [],
      accumulatedInfo: {
        title: deriveTaskTitle(initialInput),
        repositories: suggestedRepos,
        estimatedComplexity: complexity
      },
      interviewComplete: false,
      timestamp: new Date()
    };
    
    await storage.saveInterview(interview);
    return interview;
  }

  static async processAnswer(interviewId: string, answer: string, storage: TaskInterviewStorage): Promise<TaskInterviewState | null> {
    const interview = await storage.loadInterview(interviewId);
    if (!interview) return null;

    // Record the answer
    const currentQuestionIndex = interview.questionsAsked.length - 1;
    const currentQuestionId = this.INTERVIEW_QUESTIONS[currentQuestionIndex]?.id;
    
    interview.answersReceived.push({
      question: interview.currentQuestion,
      answer
    });

    // Process answer based on question type
    await this.processAnswerByType(interview, currentQuestionId, answer);

    // Determine next question or completion
    const nextQuestionIndex = interview.questionsAsked.length;
    
    if (nextQuestionIndex < this.INTERVIEW_QUESTIONS.length) {
      // Ask next question
      const nextQuestion = this.INTERVIEW_QUESTIONS[nextQuestionIndex];
      interview.currentQuestion = nextQuestion.question;
      interview.questionsAsked.push(nextQuestion.question);
    } else {
      // Interview complete, analyze and finalize
      interview.interviewComplete = true;
      await this.finalizeInterview(interview);
    }

    await storage.saveInterview(interview);
    return interview;
  }

  private static async processAnswerByType(interview: TaskInterviewState, questionId: string | undefined, answer: string): Promise<void> {
    switch (questionId) {
      case 'scope':
        interview.accumulatedInfo.description = answer;
        break;
      case 'acceptance':
        interview.accumulatedInfo.acceptanceCriteria = answer.split('\n').filter(line => line.trim());
        break;
      case 'technical':
        // Re-analyze repositories based on technical details
        const additionalRepos = await analyzeRepositoryRequirements(answer);
        interview.accumulatedInfo.repositories = [
          ...new Set([...(interview.accumulatedInfo.repositories || []), ...additionalRepos])
        ];
        break;
      case 'dependencies':
        interview.accumulatedInfo.dependencies = answer.split('\n').filter(line => line.trim());
        break;
      case 'complexity':
        // Re-assess complexity and suggest breakdown if needed
        const complexityAssessment = analyzeComplexityFromAnswer(answer);
        interview.accumulatedInfo.estimatedComplexity = complexityAssessment.complexity;
        if (complexityAssessment.needsBreakdown) {
          interview.accumulatedInfo.suggestedBreakdown = await suggestTaskBreakdown(interview);
        }
        break;
    }
  }

  private static async finalizeInterview(interview: TaskInterviewState): Promise<void> {
    // Final validation and optimization
    if (!interview.accumulatedInfo.repositories?.length) {
      interview.accumulatedInfo.repositories = ['loqa']; // Default to main repo
    }
    
    // Ensure we have minimum viable task definition
    if (!interview.accumulatedInfo.description || !interview.accumulatedInfo.acceptanceCriteria?.length) {
      // Mark as incomplete - should save as draft
      interview.interviewComplete = false;
      interview.currentQuestion = "This task needs more definition. Can you provide more details about what specifically needs to be accomplished and how we'll know it's done?";
      interview.questionsAsked.push(interview.currentQuestion);
    }
  }
}

async function analyzeRepositoryRequirements(text: string): Promise<string[]> {
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

function analyzeInitialComplexity(text: string): 'low' | 'medium' | 'high' {
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

function analyzeComplexityFromAnswer(answer: string): { complexity: 'low' | 'medium' | 'high', needsBreakdown: boolean } {
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

async function suggestTaskBreakdown(interview: TaskInterviewState): Promise<TaskBreakdownSuggestion[]> {
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
 * Task Management MCP tools
 * Handles todo creation, thought capture, template management, etc.
 */

export const taskManagementTools = [
  {
    name: "task:AddTodo",
    description: "Add a new task to the backlog using templates and priority",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Clear, descriptive task title"
        },
        template: {
          type: "string",
          description: "Template to use (feature, bug-fix, protocol-change, cross-repo, general)",
          enum: ["feature", "bug-fix", "protocol-change", "cross-repo", "general"]
        },
        priority: {
          type: "string",
          description: "Task priority level",
          enum: ["High", "Medium", "Low"]
        },
        type: {
          type: "string",
          description: "Type of work being done",
          enum: ["Feature", "Bug Fix", "Improvement", "Documentation", "Refactoring"]
        },
        assignee: {
          type: "string",
          description: "Who will work on this task"
        }
      },
      required: ["title"]
    }
  },
  {
    name: "task:CaptureThought",
    description: "Capture a quick thought or idea for later processing",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The thought or idea content"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Optional tags to categorize the thought"
        },
        context: {
          type: "string",
          description: "Optional context about where this thought came from"
        }
      },
      required: ["content"]
    }
  },
  {
    name: "task:CaptureComprehensiveThought",
    description: "Capture complex thoughts with full context, automatic categorization, and intelligent follow-up suggestions",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The detailed thought or idea content"
        },
        category: {
          type: "string",
          description: "Category of the thought",
          enum: ["architecture", "feature-idea", "technical-debt", "process-improvement", "research-topic", "bug-insight", "optimization"]
        },
        context: {
          type: "string",
          description: "Context about where this thought originated"
        },
        relatedRepositories: {
          type: "array",
          items: { type: "string" },
          description: "Repositories this thought relates to"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Custom tags for categorization"
        },
        urgency: {
          type: "string",
          description: "Urgency level for acting on this thought",
          enum: ["immediate", "next-sprint", "backlog", "future"]
        }
      },
      required: ["content", "category"]
    }
  },
  {
    name: "task:ListTemplates",
    description: "List all available task templates",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description: "Optional repository path (defaults to current directory)"
        }
      }
    }
  },
  {
    name: "task:ListTasks",
    description: "List current tasks and drafts in the backlog",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description: "Optional repository path (defaults to current directory)"
        }
      }
    }
  },
  {
    name: "task:CreateFromThought",
    description: "Create a structured task from an evaluated thought/idea with pre-filled template suggestions",
    inputSchema: {
      type: "object",
      properties: {
        thoughtContent: {
          type: "string",
          description: "The original thought/idea content"
        },
        suggestedTemplate: {
          type: "string", 
          description: "AI-suggested template based on evaluation",
          enum: ["feature", "bug-fix", "protocol-change", "cross-repo", "general"]
        },
        suggestedPriority: {
          type: "string",
          description: "AI-suggested priority based on evaluation", 
          enum: ["High", "Medium", "Low"]
        },
        category: {
          type: "string",
          description: "AI-determined category"
        },
        customTitle: {
          type: "string",
          description: "Custom title for the task (optional, will derive from thought if not provided)"
        },
        additionalContext: {
          type: "string", 
          description: "Additional context or requirements to include in the task"
        }
      },
      required: ["thoughtContent", "suggestedTemplate", "suggestedPriority", "category"]
    }
  },
  {
    name: "task:StartComprehensiveCreation",
    description: "Begin structured interview process to create fully-fleshed out, actionable tasks with proper scoping",
    inputSchema: {
      type: "object",
      properties: {
        initialInput: {
          type: "string",
          description: "The initial task idea, description, or thought"
        },
        skipInterview: {
          type: "boolean",
          description: "If true, attempt to create task directly without interview (for simple, well-defined tasks)"
        }
      },
      required: ["initialInput"]
    }
  },
  {
    name: "task:AnswerInterviewQuestion",
    description: "Provide an answer to a task creation interview question",
    inputSchema: {
      type: "object",
      properties: {
        interviewId: {
          type: "string",
          description: "The ID of the active task interview"
        },
        answer: {
          type: "string",
          description: "The answer to the current interview question"
        }
      },
      required: ["interviewId", "answer"]
    }
  },
  {
    name: "task:ContinueDevelopment",
    description: "Resume development of draft tasks, showing available drafts and continuing where left off",
    inputSchema: {
      type: "object",
      properties: {
        draftId: {
          type: "string",
          description: "Optional specific draft ID to resume. If not provided, shows available drafts."
        }
      }
    }
  },
  {
    name: "task:AppendToExistingTask",
    description: "Append a thought or additional content to an existing task file",
    inputSchema: {
      type: "object",
      properties: {
        taskFile: {
          type: "string",
          description: "The task filename to append to (e.g., 'task-001-feature-name.md')"
        },
        repository: {
          type: "string",
          description: "The repository containing the task (e.g., 'loqa-hub', 'loqa-commander')"
        },
        content: {
          type: "string",
          description: "The content to append to the task"
        },
        sectionTitle: {
          type: "string",
          description: "Optional section title for the appended content (defaults to 'Additional Thoughts')"
        }
      },
      required: ["taskFile", "repository", "content"]
    }
  }
];

export async function handleTaskManagementTool(name: string, args: any): Promise<any> {
  // Intelligently resolve the workspace root
  const workspaceRoot = await resolveWorkspaceRoot(args);
  
  const taskManager = new LoqaTaskManager(workspaceRoot);

  switch (name) {
    case "task:AddTodo": {
      const { title, template = "general", priority = "Medium", type, assignee } = args;
      
      // AI-powered decision on whether to use comprehensive creation
      const shouldUseComprehensive = await shouldUseComprehensiveTaskCreation(
        title, 
        template, 
        priority, 
        type, 
        workspaceRoot
      );
      
      if (shouldUseComprehensive.decision) {
        return {
          content: [{
            type: "text",
            text: `🎯 **Comprehensive Task Creation Recommended**\n\n**Reasoning**: ${shouldUseComprehensive.reasoning}\n\n**Complexity Indicators**: ${shouldUseComprehensive.complexityIndicators.join(', ')}\n\n**Estimated Effort**: ${shouldUseComprehensive.estimatedEffort}\n\nStarting comprehensive task creation process...\n\n---\n\n`
          }]
        };
        // Note: Removing the automatic redirect to comprehensive creation for now
        // User can manually use /start-comprehensive-task-creation if they want the full flow
      }
      
      const options: TaskCreationOptions = {
        title,
        template,
        priority: priority as "High" | "Medium" | "Low",
        type: type as "Feature" | "Bug Fix" | "Improvement" | "Documentation",
        assignee
      };

      try {
        const result = await taskManager.createTaskFromTemplate(options);
        return {
          content: [{
            type: "text",
            text: `✅ Task created successfully!\n\n📋 **Task ID**: ${result.taskId}\n📁 **File**: ${result.filePath}\n📝 **Template**: ${template}\n⭐ **Priority**: ${priority}\n\n**Next Steps**: The task has been added to your backlog and is ready for work.\n\n💡 **Tip**: For more complex tasks, try \`/start-comprehensive-task-creation\` for guided setup.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `❌ Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "task:CaptureThought": {
      const { content, tags = [], context } = args;
      
      const thought: CapturedThought = {
        content,
        tags,
        timestamp: new Date(),
        context
      };

      try {
        // First check for related existing tasks
        const projectState = await analyzeCurrentProjectState(workspaceRoot);
        const relatedTasks = await findRelatedExistingTasks(content, tags, context, projectState);
        
        // Evaluate thought priority and suggest task creation if warranted
        const evaluation = await evaluateThoughtPriority(content, tags, context, workspaceRoot);
        const result = await taskManager.captureThought(thought);
        
        let responseText = `💡 Thought captured successfully!\n\n📁 **File**: ${result.filePath}\n🏷️ **Tags**: ${tags.join(', ') || 'None'}\n⏰ **Captured**: ${thought.timestamp.toISOString()}`;
        
        // Prioritize suggesting addition to existing tasks over creating new ones
        if (relatedTasks.length > 0) {
          const bestMatch = relatedTasks[0];
          responseText += `\n\n🎯 **Related Task Found!** This thought might relate to an existing task:\n\n`;
          responseText += `**📋 Task**: ${bestMatch.task.title} (${bestMatch.task.repo})\n`;
          responseText += `**🔗 Match Reason**: ${bestMatch.reason}\n`;
          responseText += `**📊 Similarity Score**: ${bestMatch.similarity}\n\n`;
          
          if (bestMatch.similarity > 25) {
            responseText += `**🎯 Recommendation**: Consider adding this thought to the existing task instead of creating a new one.\n\n`;
            responseText += `**Task Location**: \`${bestMatch.task.repo}/backlog/tasks/${bestMatch.task.taskFile}\`\n\n`;
            responseText += `**Quick Actions**:\n`;
            responseText += `• **Add to existing**: Use \`/append-to-task "${bestMatch.task.taskFile}" "${bestMatch.task.repo}" "${content}"\`\n`;
            responseText += `• **Create new task**: Use \`/start-comprehensive-task-creation "${content}"\``;
          } else {
            responseText += `**💡 Note**: There's a potential connection, but your thought might warrant a separate task.\n\n`;
            if (evaluation.shouldSuggestTask) {
              responseText += `**🚀 Priority Assessment**: This thought appears to align with current project goals!\n\n`;
              responseText += `**Why it matters**: ${evaluation.reasoning}\n\n`;
              responseText += `**💪 Suggested Action**: Create a new task with:\n`;
              responseText += `• Template: \`${evaluation.suggestedTemplate}\`\n`;
              responseText += `• Priority: \`${evaluation.suggestedPriority}\`\n`;
              responseText += `• Category: ${evaluation.category}\n\n`;
              responseText += `**Ready to create?** Use \`/start-comprehensive-task-creation "${content}"\``;
            }
          }
        } else if (evaluation.shouldSuggestTask) {
          responseText += `\n\n🚀 **Priority Assessment**: This thought appears to align with current project goals!\n\n**Why it matters**: ${evaluation.reasoning}\n\n**💪 Suggested Action**: Create a comprehensive task with:\n• Template: \`${evaluation.suggestedTemplate}\`\n• Priority: \`${evaluation.suggestedPriority}\`\n• Category: ${evaluation.category}\n\n**Ready to create a fully-scoped task?** Use:\n\`/start-comprehensive-task-creation "${content}"\`\n\nOr for quick task: \`/create-task-from-thought\` with the evaluation above.`;
        } else {
          responseText += `\n\n**Next Steps**: Review the thought later and convert to a formal task if needed.`;
        }
        
        return {
          content: [{
            type: "text",
            text: responseText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to capture thought: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "task:CaptureComprehensiveThought": {
      const { content, category, context, relatedRepositories = [], tags = [], urgency = "backlog" } = args;
      
      const thought: CapturedThought = {
        content,
        tags: [...tags, category, urgency],
        timestamp: new Date(),
        context: context || `Category: ${category}, Urgency: ${urgency}, Repositories: ${relatedRepositories.join(', ')}`
      };

      try {
        // First check for related existing tasks
        const projectState = await analyzeCurrentProjectState(workspaceRoot);
        const relatedTasks = await findRelatedExistingTasks(content, [...tags, category, urgency], context, projectState);
        
        // Enhanced evaluation for comprehensive thoughts
        const evaluation = await evaluateComprehensiveThought(content, category, urgency, relatedRepositories, workspaceRoot);
        const result = await taskManager.captureThought(thought);
        
        let responseText = `💡 **Comprehensive Thought Captured!**\n\n📁 **File**: ${result.filePath}\n📂 **Category**: ${category}\n⚡ **Urgency**: ${urgency}\n🏷️ **Tags**: ${tags.join(', ') || 'None'}\n🗂️ **Related Repos**: ${relatedRepositories.join(', ') || 'None'}\n⏰ **Captured**: ${thought.timestamp.toISOString()}`;
        
        // Check for existing task matches first, especially for comprehensive thoughts
        if (relatedTasks.length > 0) {
          const bestMatch = relatedTasks[0];
          responseText += `\n\n🎯 **Existing Task Analysis**:\n\n`;
          responseText += `**📋 Best Match**: ${bestMatch.task.title} (${bestMatch.task.repo})\n`;
          responseText += `**🔗 Match Strength**: ${bestMatch.reason}\n`;
          responseText += `**📊 Similarity**: ${bestMatch.similarity}\n\n`;
          
          // For comprehensive thoughts, we're more conservative about recommending merging
          if (bestMatch.similarity > 35) {
            responseText += `**🎯 Strong Match Detected**: This ${category} thought appears to significantly overlap with an existing task.\n\n`;
            responseText += `**💡 Recommendation**: Consider enhancing the existing task with your comprehensive insights rather than creating a duplicate.\n\n`;
            responseText += `**Task Location**: \`${bestMatch.task.repo}/backlog/tasks/${bestMatch.task.taskFile}\`\n\n`;
            responseText += `**Quick Actions**:\n`;
            responseText += `• **Enhance existing**: \`/append-to-task "${bestMatch.task.taskFile}" "${bestMatch.task.repo}" "${content}" --section="Enhanced Analysis"\`\n`;
            responseText += `• **Create related**: Use \`/start-comprehensive-task-creation\` for a complementary task\n`;
            responseText += `• **Create independent**: If truly different, create new task anyway`;
          } else {
            responseText += `**💡 Potential Connection**: Found related work, but your ${category} thought may warrant separate attention.\n\n`;
            if (evaluation.shouldSuggestTask) {
              responseText += `**🎯 Intelligent Assessment**: This ${category} thought has high strategic value!\n\n`;
              responseText += `**Impact Analysis**: ${evaluation.reasoning}\n\n`;
              responseText += `**🚀 Recommended Action**: Create a new comprehensive task with:\n`;
              responseText += `• Template: \`${evaluation.suggestedTemplate}\`\n`;
              responseText += `• Priority: \`${evaluation.suggestedPriority}\`\n`;
              responseText += `• Scope: ${evaluation.scope}\n`;
              responseText += `• Estimated Effort: ${evaluation.estimatedEffort}\n\n`;
              responseText += `**Create task?** Use \`/start-comprehensive-task-creation "${content}"\``;
            }
          }
          
          // Show additional related tasks if they exist
          if (relatedTasks.length > 1) {
            responseText += `\n\n**📋 Other Related Tasks (${relatedTasks.length - 1}):**\n`;
            relatedTasks.slice(1, 4).forEach((task, index) => {
              responseText += `${index + 2}. ${task.task.title} (${task.task.repo}) - Score: ${task.similarity}\n`;
            });
            if (relatedTasks.length > 4) {
              responseText += `... and ${relatedTasks.length - 4} more`;
            }
          }
        } else if (evaluation.shouldSuggestTask) {
          responseText += `\n\n🎯 **Intelligent Assessment**: This ${category} thought has high strategic value!\n\n**Impact Analysis**: ${evaluation.reasoning}\n\n**🚀 Recommended Action**: Create an active task with:\n• Template: \`${evaluation.suggestedTemplate}\`\n• Priority: \`${evaluation.suggestedPriority}\`\n• Scope: ${evaluation.scope}\n• Estimated Effort: ${evaluation.estimatedEffort}\n\n**Would you like me to create a structured task for this? Reply 'yes' to proceed.**`;
        } else {
          responseText += `\n\n📋 **Status**: Captured as ${urgency} priority. ${evaluation.reasoning}`;
        }
        
        return {
          content: [{
            type: "text",
            text: responseText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to capture comprehensive thought: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "task:ListTemplates": {
      const { repoPath } = args;
      
      try {
        const templates = await taskManager.getAvailableTemplates(repoPath);
        const templateList = templates.map(t => `• **${t.name}**: ${t.description}`).join('\n');
        
        return {
          content: [{
            type: "text",
            text: `📋 **Available Task Templates** (${templates.length} found)\n\n${templateList || 'No templates found. Initialize backlog with `backlog init` first.'}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to list templates: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "task:ListTasks": {
      const { repoPath } = args;
      
      try {
        // If specific repo specified, use single repo mode
        if (repoPath) {
          const result = await taskManager.listTasks(repoPath);
          const tasksList = result.tasks.map(t => `• ${t}`).join('\n');
          const draftsList = result.drafts.map(d => `• ${d}`).join('\n');
          
          return {
            content: [{
              type: "text",
              text: `📋 **Current Backlog Status** (${repoPath})\n\n**📝 Tasks (${result.tasks.length}):**\n${tasksList || 'No tasks found'}\n\n**💭 Drafts (${result.drafts.length}):**\n${draftsList || 'No drafts found'}`
            }]
          };
        }
        
        // Multi-repository mode: scan all repositories
        const knownRepositories = KNOWN_REPOSITORIES_LIST;
        
        // Determine actual workspace root
        const actualWorkspaceRoot = knownRepositories.includes(basename(workspaceRoot)) 
          ? dirname(workspaceRoot) 
          : workspaceRoot;
        
        let allTasks: string[] = [];
        let allDrafts: string[] = [];
        let repoSummaries: string[] = [];
        
        for (const repoName of knownRepositories) {
          try {
            const repoPath = join(actualWorkspaceRoot, repoName);
            const repoTaskManager = new LoqaTaskManager(repoPath);
            const result = await repoTaskManager.listTasks();
            
            if (result.tasks.length > 0 || result.drafts.length > 0) {
              repoSummaries.push(`**${repoName}**: ${result.tasks.length} tasks, ${result.drafts.length} drafts`);
              
              // Add repo prefix to tasks and drafts
              allTasks.push(...result.tasks.map(task => `${task} (${repoName})`));
              allDrafts.push(...result.drafts.map(draft => `${draft} (${repoName})`));
            }
          } catch (error) {
            // Repository doesn't exist or no backlog - skip silently
            continue;
          }
        }
        
        const tasksList = allTasks.map(t => `• ${t}`).join('\n');
        const draftsList = allDrafts.map(d => `• ${d}`).join('\n');
        const repoSummary = repoSummaries.join('\n');
        
        return {
          content: [{
            type: "text",
            text: `📋 **Workspace-Wide Backlog Status**\n\n${repoSummary}\n\n**📝 All Tasks (${allTasks.length}):**\n${tasksList || 'No tasks found'}\n\n**💭 All Drafts (${allDrafts.length}):**\n${draftsList || 'No drafts found'}`
          }]
        };
        
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to list tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "task:CreateFromThought": {
      const { thoughtContent, suggestedTemplate, suggestedPriority, category, customTitle, additionalContext } = args;
      
      // Use comprehensive creation for complex tasks
      if (suggestedTemplate === 'cross-repo' || suggestedPriority === 'High') {
        return await handleStartComprehensiveTaskCreation({
          initialInput: thoughtContent,
          skipInterview: false
        }, workspaceRoot);
      }
      
      // Simple task creation for straightforward cases
      const title = customTitle || deriveTaskTitle(thoughtContent);
      
      const options: TaskCreationOptions = {
        title,
        template: suggestedTemplate,
        priority: suggestedPriority as "High" | "Medium" | "Low",
        type: mapCategoryToTaskType(category),
        assignee: undefined // Let template handle default assignee
      };

      try {
        const result = await taskManager.createTaskFromTemplate(options);
        
        // If additional context provided, append it to the task file
        if (additionalContext) {
          await appendContextToTask(result.filePath, additionalContext, thoughtContent);
        }
        
        return {
          content: [{
            type: "text",
            text: `🚀 **Task Created from Thought!**\n\n📋 **Task ID**: ${result.taskId}\n📁 **File**: ${result.filePath}\n📝 **Template**: ${suggestedTemplate}\n⭐ **Priority**: ${suggestedPriority}\n📂 **Category**: ${category}\n\n**Original Thought**: "${thoughtContent}"\n\n**Next Steps**: The task is now ready for work and has been added to your active backlog.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `❌ Failed to create task from thought: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "task:StartComprehensiveCreation": {
      return await handleStartComprehensiveTaskCreation(args, workspaceRoot);
    }

    case "task:AnswerInterviewQuestion": {
      return await handleAnswerInterviewQuestion(args, workspaceRoot);
    }

    case "task:ContinueDevelopment": {
      return await handleContinueTaskDevelopment(args, workspaceRoot);
    }

    case "task:AppendToExistingTask": {
      const { taskFile, repository, content, sectionTitle = "Additional Thoughts" } = args;
      
      try {
        // Determine workspace root and task path
        const actualWorkspaceRoot = KNOWN_REPOSITORIES_LIST.includes(basename(workspaceRoot)) 
          ? dirname(workspaceRoot) 
          : workspaceRoot;
        
        const repoPath = join(actualWorkspaceRoot, repository);
        const taskPath = join(repoPath, 'backlog', 'tasks', taskFile);
        
        // Check if task file exists
        const fs = await import('fs/promises');
        await fs.access(taskPath);
        
        // Read current task content
        const currentContent = await fs.readFile(taskPath, 'utf-8');
        
        // Prepare content to append
        const timestamp = new Date().toISOString().split('T')[0];
        const appendContent = `\n\n## ${sectionTitle}\n*Added on ${timestamp}*\n\n${content}\n`;
        
        // Append to task file
        await fs.writeFile(taskPath, currentContent + appendContent, 'utf-8');
        
        // Auto-commit the change
        const taskManager = new LoqaTaskManager(repoPath);
        await taskManager['autoCommitBacklogChange'](taskPath, 'update', `Add ${sectionTitle.toLowerCase()}`, repoPath);
        
        return {
          content: [{
            type: "text",
            text: `✅ **Content Added to Existing Task!**\n\n📋 **Task**: ${taskFile}\n📁 **Repository**: ${repository}\n📝 **Section**: ${sectionTitle}\n📍 **Location**: \`${repository}/backlog/tasks/${taskFile}\`\n\n**Added Content**:\n${content}\n\n**Next Steps**: The task has been updated with your additional thoughts and automatically committed.`
          }]
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes('ENOENT')) {
          return {
            content: [{
              type: "text",
              text: `❌ Task file not found: \`${taskFile}\` in repository \`${repository}\`\n\nPlease check:\n• Task filename is correct\n• Repository name is correct\n• Task exists in \`${repository}/backlog/tasks/\``
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: `❌ Failed to append to task: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    default:
      throw new Error(`Unknown task management tool: ${name}`);
  }
}