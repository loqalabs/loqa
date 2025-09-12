import { LoqaTaskManager, LoqaRoleManager, LoqaModelSelector } from '../managers/index.js';
import { TaskCreationOptions, CapturedThought } from '../types/index.js';
import { resolveWorkspaceRoot } from '../utils/workspace-resolver.js';
import { SmartGitHelpers } from '../utils/smart-git-helpers.js';
import { KNOWN_REPOSITORIES_LIST } from '../config/repositories.js';
import { join, dirname, basename } from 'path';

/**
 * Advanced Workflow MCP tools
 * Handles complex multi-step workflows and strategic operations
 */

export const workflowTools = [
  {
    name: "workflow:StartTaskWork",
    description: "Begin comprehensive task work with AI-powered task selection, full context setup, role detection, and workflow optimization",
    inputSchema: {
      type: "object",
      properties: {
        taskTitle: {
          type: "string",
          description: "Optional specific task title. If not provided, AI will recommend optimal tasks based on context"
        },
        taskDescription: {
          type: "string",
          description: "Optional task description for specific task work"
        },
        workMode: {
          type: "string",
          enum: ["specific", "smart-selection", "priority-focused", "blocked-resolution"],
          description: "Work mode: specific task, AI task selection, priority-focused work, or resolving blockers"
        },
        timeAvailable: {
          type: "string",
          enum: ["15min", "30min", "1hour", "2hours", "half-day", "full-day", "multi-day"],
          description: "Available time for work session"
        },
        focusArea: {
          type: "string",
          enum: ["frontend", "backend", "infrastructure", "skills", "protocol", "documentation", "testing", "any"],
          description: "Preferred focus area for work"
        },
        skillLevel: {
          type: "string", 
          enum: ["beginner", "intermediate", "expert", "maintainer"],
          description: "Skill level in the focus area"
        },
        workContext: {
          type: "string",
          description: "Optional context about current work situation or constraints"
        },
        filePaths: {
          type: "array",
          items: { type: "string" },
          description: "File paths currently being worked on (for context)"
        },
        repository: {
          type: "string",
          description: "Repository preference or current repository context"
        },
        priority: {
          type: "string",
          enum: ["High", "Medium", "Low"],
          description: "Priority level preference"
        },
        category: {
          type: "string",
          enum: ["feature", "bug-fix", "technical-debt", "documentation", "devops-infrastructure", "research-exploration", "security-compliance", "internal-tools"],
          description: "Task category preference"
        },
        updateStatus: {
          type: "boolean",
          description: "Whether to automatically update task status as work progresses"
        }
      }
    }
  },
  {
    name: "workflow:PlanStrategicShift", 
    description: "Plan and coordinate strategic shifts across the workspace with comprehensive impact analysis",
    inputSchema: {
      type: "object",
      properties: {
        shiftTitle: {
          type: "string",
          description: "Title of the strategic shift"
        },
        description: {
          type: "string",
          description: "Detailed description of the strategic change"
        },
        scope: {
          type: "array", 
          items: { type: "string" },
          description: "Repositories or components affected by this shift"
        },
        timeline: {
          type: "string",
          description: "Expected timeline for implementing this shift"
        },
        stakeholders: {
          type: "array",
          items: { type: "string" },
          description: "Key stakeholders who need to be involved"
        },
        riskLevel: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
          description: "Risk level assessment"
        }
      },
      required: ["shiftTitle", "description"]
    }
  },
  {
    name: "workflow:CaptureComprehensiveThought",
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
          enum: ["architecture", "feature-idea", "technical-debt", "process-improvement", "research-topic", "bug-insight", "optimization"],
          description: "Category of the thought"
        },
        urgency: {
          type: "string",
          enum: ["immediate", "next-sprint", "backlog", "future"],
          description: "Urgency level for acting on this thought"
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
        context: {
          type: "string",
          description: "Context about where this thought originated"
        }
      },
      required: ["content", "category"]
    }
  },
  {
    name: "workflow:StartComplexTodo",
    description: "Create and begin work on complex, multi-step todos with automatic workflow setup",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Main title of the complex todo"
        },
        description: {
          type: "string",
          description: "Detailed description of all work involved"
        },
        subtasks: {
          type: "array",
          items: { type: "string" },
          description: "List of subtasks or steps involved"
        },
        repositories: {
          type: "array",
          items: { type: "string" },
          description: "Repositories involved in this work"
        },
        dependencies: {
          type: "array",
          items: { type: "string" },
          description: "External dependencies or blockers"
        },
        estimatedEffort: {
          type: "string",
          enum: ["hours", "days", "weeks", "months"],
          description: "Estimated effort level"
        },
        priority: {
          type: "string",
          enum: ["High", "Medium", "Low"],
          description: "Overall priority"
        }
      },
      required: ["title", "description"]
    }
  }
];

/**
 * AI-powered task selection based on context, availability, and project state
 */
async function intelligentTaskSelection(
  workMode: string,
  timeAvailable: string,
  focusArea: string,
  skillLevel: string,
  workContext?: string,
  repository?: string,
  priority?: string,
  workspaceRoot?: string
): Promise<{
  recommendedTasks: Array<{
    task: any;
    repository: string;
    score: number;
    reasoning: string;
    estimatedTime: string;
    difficulty: string;
  }>;
  workAnalysis: {
    projectHealth: string;
    bottlenecks: string[];
    strategicAlignment: string;
    recommendation: string;
  };
}> {
  
  try {
    // Load comprehensive project state
    const projectState = await analyzeComprehensiveProjectState(workspaceRoot);
    
    // Analyze work context and constraints
    const workAnalysis = analyzeWorkContext(
      workMode,
      timeAvailable,
      focusArea,
      skillLevel,
      workContext,
      projectState
    );
    
    // Score and rank available tasks
    const scoredTasks = await scoreAndRankTasks(
      projectState.availableTasks,
      workAnalysis,
      repository,
      priority
    );
    
    return {
      recommendedTasks: scoredTasks.slice(0, 5), // Top 5 recommendations
      workAnalysis
    };
    
  } catch (error) {
    console.warn('AI task selection failed, using fallback:', error);
    return fallbackTaskSelection(workMode, timeAvailable, focusArea, workspaceRoot);
  }
}

/**
 * Comprehensive project state analysis for intelligent work decisions
 */
async function analyzeComprehensiveProjectState(workspaceRoot?: string) {
  const actualWorkspaceRoot = workspaceRoot || process.cwd();
  const state = {
    availableTasks: [] as any[],
    repositoryHealth: {} as { [key: string]: any },
    recentActivity: [] as string[],
    bottlenecks: [] as string[],
    priorities: [] as string[],
    blockedTasks: [] as any[]
  };
  
  try {
    // Analyze each repository
    for (const repoName of KNOWN_REPOSITORIES_LIST) {
      try {
        const repoPath = join(actualWorkspaceRoot, repoName);
        const taskManager = new LoqaTaskManager(repoPath);
        const result = await taskManager.listTasks();
        
        // Collect available tasks with metadata
        for (const taskFile of result.tasks) {
          try {
            const taskPath = join(repoPath, 'backlog', 'tasks', taskFile);
            const content = await import('fs/promises').then(fs => fs.readFile(taskPath, 'utf-8'));
            const taskMeta = extractTaskMetadata(content, taskFile, repoName);
            
            if (taskMeta && !taskMeta.isCompleted) {
              state.availableTasks.push(taskMeta);
              
              // Identify blocked tasks
              if (taskMeta.isBlocked) {
                state.blockedTasks.push(taskMeta);
              }
            }
          } catch (error) {
            continue;
          }
        }
        
        // Analyze repository health
        state.repositoryHealth[repoName] = {
          taskCount: result.tasks.length,
          draftCount: result.drafts.length,
          status: result.tasks.length > 10 ? 'overloaded' : result.tasks.length < 2 ? 'understocked' : 'healthy'
        };
        
      } catch (error) {
        continue;
      }
    }
    
    // Analyze project bottlenecks and priorities
    state.bottlenecks = identifyBottlenecks(state.availableTasks, state.repositoryHealth);
    state.priorities = identifyCurrentPriorities(state.availableTasks);
    
  } catch (error) {
    console.warn('Failed to analyze comprehensive project state:', error);
  }
  
  return state;
}

/**
 * Extract task metadata from task file content
 */
function extractTaskMetadata(content: string, taskFile: string, repository: string) {
  const lines = content.split('\n');
  let title = '';
  let priority = 'Medium';
  let type = 'Feature';
  let isCompleted = false;
  let isBlocked = false;
  let estimatedEffort = 'hours';
  let tags = [];
  
  // Parse task content
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('# ')) {
      title = line.replace('# ', '').replace(/^Task:\s*/, '').trim();
    } else if (line.toLowerCase().includes('priority:')) {
      const match = line.match(/priority:\s*(high|medium|low)/i);
      if (match) priority = match[1];
    } else if (line.toLowerCase().includes('type:')) {
      const match = line.match(/type:\s*(feature|bug fix|improvement|documentation)/i);
      if (match) type = match[1];
    } else if (line.toLowerCase().includes('status:') && line.toLowerCase().includes('complete')) {
      isCompleted = true;
    } else if (line.toLowerCase().includes('blocked') || line.toLowerCase().includes('waiting')) {
      isBlocked = true;
    } else if (line.toLowerCase().includes('effort:') || line.toLowerCase().includes('estimate:')) {
      if (line.includes('day') || line.includes('week')) estimatedEffort = 'days';
    }
  }
  
  // Extract tags from filename and content
  const filenameTags = taskFile.toLowerCase().match(/\b(stt|tts|ui|api|grpc|skill|test|doc)\b/g) || [];
  const contentTags = content.toLowerCase().match(/\b(urgent|critical|enhancement|refactor|migration)\b/g) || [];
  tags = [...new Set([...filenameTags, ...contentTags])];
  
  return {
    title: title || taskFile,
    taskFile,
    repository,
    priority,
    type,
    isCompleted,
    isBlocked,
    estimatedEffort,
    tags,
    content: content.substring(0, 300) // First 300 chars for analysis
  };
}

/**
 * Analyze work context to understand constraints and preferences
 */
function analyzeWorkContext(
  workMode: string,
  timeAvailable: string,
  focusArea: string,
  skillLevel: string,
  workContext?: string,
  projectState?: any
) {
  
  // Map time availability to effort compatibility
  const timeToEffortMap = {
    '15min': ['quick-fix', 'review'],
    '30min': ['quick-fix', 'small-task'],
    '1hour': ['small-task', 'investigation'],
    '2hours': ['small-task', 'medium-task'],
    'half-day': ['medium-task', 'complex-investigation'],
    'full-day': ['medium-task', 'large-task'],
    'multi-day': ['large-task', 'architectural']
  };
  
  const compatibleEfforts = (timeToEffortMap as any)[timeAvailable] || ['small-task'];
  
  // Analyze project health
  const totalTasks = projectState?.availableTasks?.length || 0;
  const blockedTasks = projectState?.blockedTasks?.length || 0;
  const bottlenecks = projectState?.bottlenecks || [];
  
  let projectHealth = 'healthy';
  if (blockedTasks > totalTasks * 0.3) projectHealth = 'blocked';
  else if (bottlenecks.length > 2) projectHealth = 'bottlenecked';
  else if (totalTasks > 50) projectHealth = 'overloaded';
  
  // Generate strategic recommendation
  let strategicAlignment = '';
  let recommendation = '';
  
  if (workMode === 'blocked-resolution') {
    strategicAlignment = 'Unblocking critical work paths';
    recommendation = 'Focus on resolving blockers to enable team progress';
  } else if (workMode === 'priority-focused') {
    strategicAlignment = 'Addressing high-impact work first';
    recommendation = 'Tackle high-priority items to maximize immediate value';
  } else if (projectHealth === 'bottlenecked') {
    strategicAlignment = 'Resolving system bottlenecks';
    recommendation = 'Address infrastructure and architectural constraints';
  } else {
    strategicAlignment = 'Balanced feature development';
    recommendation = 'Focus on incremental improvements and new capabilities';
  }
  
  return {
    compatibleEfforts,
    projectHealth,
    bottlenecks,
    strategicAlignment,
    recommendation,
    focusAreaPriority: mapFocusAreaToPriority(focusArea, projectState),
    skillCompatibility: skillLevel
  };
}

/**
 * Score and rank tasks based on work analysis
 */
async function scoreAndRankTasks(
  availableTasks: any[],
  workAnalysis: any,
  repositoryPreference?: string,
  priorityPreference?: string
): Promise<Array<{
  task: any;
  repository: string;
  score: number;
  reasoning: string;
  estimatedTime: string;
  difficulty: string;
}>> {
  
  const scoredTasks = [];
  
  for (const task of availableTasks) {
    let score = 0;
    let reasons = [];
    
    // Priority alignment
    if (task.priority === 'High') {
      score += 30;
      reasons.push('high priority');
    } else if (task.priority === 'Medium') {
      score += 15;
    }
    
    // Priority preference match
    if (priorityPreference && task.priority === priorityPreference) {
      score += 10;
      reasons.push('matches priority preference');
    }
    
    // Repository preference
    if (repositoryPreference && task.repository === repositoryPreference) {
      score += 15;
      reasons.push('matches repository preference');
    }
    
    // Time compatibility
    const isTimeCompatible = isTaskTimeCompatible(task, workAnalysis.compatibleEfforts);
    if (isTimeCompatible) {
      score += 20;
      reasons.push('fits available time');
    } else {
      score -= 10;
      reasons.push('time mismatch');
    }
    
    // Focus area alignment
    if (workAnalysis.focusAreaPriority && taskMatchesFocusArea(task, workAnalysis.focusAreaPriority)) {
      score += 15;
      reasons.push('aligns with focus area');
    }
    
    // Strategic alignment
    if (workAnalysis.projectHealth === 'blocked' && !task.isBlocked) {
      score += 25;
      reasons.push('can make progress while others blocked');
    }
    
    if (workAnalysis.bottlenecks.some((bottleneck: string) => task.tags.includes(bottleneck))) {
      score += 20;
      reasons.push('addresses system bottleneck');
    }
    
    // Skill level compatibility
    const difficulty = estimateTaskDifficulty(task);
    const skillMatch = assessSkillMatch(difficulty, workAnalysis.skillCompatibility);
    score += skillMatch.score;
    if (skillMatch.reason) reasons.push(skillMatch.reason);
    
    // Avoid blocked tasks unless specifically focusing on unblocking
    if (task.isBlocked) {
      score -= 15;
      reasons.push('currently blocked');
    }
    
    if (score > 0) {
      scoredTasks.push({
        task,
        repository: task.repository,
        score,
        reasoning: reasons.join(', ') || 'available for work',
        estimatedTime: mapEffortToTime(task.estimatedEffort),
        difficulty
      });
    }
  }
  
  return scoredTasks.sort((a, b) => b.score - a.score);
}

/**
 * Helper functions
 */
function identifyBottlenecks(tasks: any[], repositoryHealth: any): string[] {
  const bottlenecks = [];
  
  // Infrastructure bottlenecks
  if (tasks.some(t => t.tags.includes('docker') || t.tags.includes('deployment'))) {
    bottlenecks.push('infrastructure');
  }
  
  // Protocol bottlenecks  
  if (tasks.some(t => t.tags.includes('grpc') || t.tags.includes('api'))) {
    bottlenecks.push('protocol');
  }
  
  // Performance bottlenecks
  if (tasks.some(t => t.content?.includes('performance') || t.content?.includes('slow'))) {
    bottlenecks.push('performance');
  }
  
  return bottlenecks;
}

function identifyCurrentPriorities(tasks: any[]): string[] {
  const priorities = [];
  const highPriorityTasks = tasks.filter(t => t.priority === 'High');
  
  // Extract common themes from high priority tasks
  const themes = {} as { [key: string]: number };
  highPriorityTasks.forEach(task => {
    task.tags.forEach((tag: string) => {
      themes[tag] = (themes[tag] || 0) + 1;
    });
  });
  
  return Object.entries(themes)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme)
    .slice(0, 3);
}

function mapFocusAreaToPriority(focusArea: string, projectState: any): string[] {
  const focusMap = {
    'frontend': ['ui', 'commander', 'interface'],
    'backend': ['hub', 'api', 'grpc', 'service'],
    'infrastructure': ['docker', 'deployment', 'config'],
    'skills': ['skill', 'plugin', 'integration'],
    'protocol': ['grpc', 'proto', 'api'],
    'documentation': ['doc', 'readme', 'guide'],
    'testing': ['test', 'spec', 'validation']
  };
  
  return (focusMap as any)[focusArea] || [];
}

function isTaskTimeCompatible(task: any, compatibleEfforts: string[]): boolean {
  const taskEffortMap = {
    'hours': ['quick-fix', 'small-task'],
    'days': ['medium-task', 'complex-investigation'],
    'weeks': ['large-task', 'architectural']
  };
  
  const taskEfforts = (taskEffortMap as any)[task.estimatedEffort] || ['small-task'];
  return taskEfforts.some((effort: string) => compatibleEfforts.includes(effort));
}

function taskMatchesFocusArea(task: any, focusAreaTags: string[]): boolean {
  return task.tags.some((tag: string) => focusAreaTags.includes(tag)) ||
         focusAreaTags.some(tag => task.content?.toLowerCase().includes(tag));
}

function estimateTaskDifficulty(task: any): string {
  if (task.tags.includes('architectural') || task.content?.includes('system') || task.content?.includes('refactor')) {
    return 'expert';
  } else if (task.tags.includes('api') || task.tags.includes('grpc') || task.content?.includes('integration')) {
    return 'intermediate';
  } else {
    return 'beginner';
  }
}

function assessSkillMatch(taskDifficulty: string, userSkill: string): { score: number; reason?: string } {
  const skillLevels = ['beginner', 'intermediate', 'expert', 'maintainer'];
  const taskLevel = skillLevels.indexOf(taskDifficulty);
  const userLevel = skillLevels.indexOf(userSkill);
  
  if (userLevel >= taskLevel) {
    const bonus = userLevel === taskLevel ? 10 : 5;
    return { 
      score: bonus, 
      reason: userLevel === taskLevel ? 'perfect skill match' : 'skill level sufficient' 
    };
  } else {
    return { 
      score: -5, 
      reason: 'may be too challenging for current skill level' 
    };
  }
}

function mapEffortToTime(effort: string): string {
  const effortTimeMap = {
    'hours': '1-4 hours',
    'days': '1-3 days', 
    'weeks': '1+ weeks'
  };
  return (effortTimeMap as any)[effort] || '2-4 hours';
}

/**
 * Fallback task selection when AI analysis fails
 */
async function fallbackTaskSelection(
  workMode: string,
  timeAvailable: string,
  focusArea: string,
  workspaceRoot?: string
) {
  return {
    recommendedTasks: [{
      task: { title: 'No tasks available or analysis failed', taskFile: '', repository: '', priority: 'Medium' },
      repository: '',
      score: 0,
      reasoning: 'Fallback recommendation - please specify a task manually',
      estimatedTime: timeAvailable,
      difficulty: 'unknown'
    }],
    workAnalysis: {
      projectHealth: 'unknown',
      bottlenecks: [],
      strategicAlignment: 'Unable to determine',
      recommendation: 'Consider using specific task mode or checking backlog status'
    }
  };
}

export async function handleWorkflowTool(name: string, args: any): Promise<any> {
  // Intelligently resolve the workspace root
  const workspaceRoot = await resolveWorkspaceRoot(args);
  
  const taskManager = new LoqaTaskManager(workspaceRoot);
  const roleManager = new LoqaRoleManager();
  const modelSelector = new LoqaModelSelector();

  switch (name) {
    case "workflow:StartTaskWork": {
      const { 
        taskTitle, 
        taskDescription, 
        workMode = "smart-selection",
        timeAvailable = "2hours",
        focusArea = "any",
        skillLevel = "intermediate",
        workContext,
        filePaths = [], 
        repository, 
        priority = "Medium", 
        category = "feature", 
        updateStatus = true 
      } = args;
      
      try {
        // Step 0: Ensure we have the latest code state before starting work
        let syncMessage = '';
        try {
          const mainStatus = await SmartGitHelpers.checkMainStatus();
          if (mainStatus.success && mainStatus.isBehind) {
            syncMessage = `🔄 Syncing with latest changes (${mainStatus.commitsBeind} commits behind)...\n`;
            const syncResult = await SmartGitHelpers.smartSync();
            if (syncResult.success) {
              if (syncResult.pulledCommits > 0) {
                syncMessage += `✅ Pulled ${syncResult.pulledCommits} commits to main\n`;
              }
              if (syncResult.cleanupResult?.deleted.length) {
                syncMessage += `🧹 Cleaned up ${syncResult.cleanupResult.deleted.length} merged branches\n`;
              }
              syncMessage += '\n';
            } else {
              syncMessage += `⚠️ Sync failed: ${syncResult.error}\n\n`;
            }
          }
        } catch (error) {
          // Continue without sync if it fails - don't block the workflow
          syncMessage = `⚠️ Could not check for updates, continuing with current state\n\n`;
        }

        // Step 1: Detect appropriate role
        const roleDetection = await roleManager.detectRole({
          title: taskTitle,
          description: taskDescription,
          filePaths,
          repositoryType: repository
        });

        // Step 2: Get model recommendation
        const modelRecommendation = await modelSelector.selectModel({
          roleId: roleDetection.detectedRole,
          taskTitle,
          taskDescription,
          filePaths,
          repositoryType: repository
        });

        // Step 3: AI-Powered Task Selection (if no specific task provided)
        let taskSelectionResult = null;
        if (!taskTitle || workMode === "smart-selection") {
          try {
            taskSelectionResult = await intelligentTaskSelection(
              workMode,
              timeAvailable,
              focusArea,
              skillLevel,
              workContext,
              repository,
              priority,
              workspaceRoot
            );
            
            // If we have intelligent recommendations, use them
            if (taskSelectionResult.recommendedTasks.length > 0) {
              const topTask = taskSelectionResult.recommendedTasks[0];
              const workAnalysis = taskSelectionResult.workAnalysis;
              
              return {
                success: true,
                message: `🧠 **AI-Powered Work Recommendation**\n\n` +
                        `${syncMessage}` +
                        `**Recommended Task**: ${topTask.task.title}\n` +
                        `**Repository**: ${topTask.repository}\n` +
                        `**Estimated Time**: ${topTask.estimatedTime}\n` +
                        `**Difficulty**: ${topTask.difficulty}\n` +
                        `**Score**: ${topTask.score}/100\n\n` +
                        `**Reasoning**: ${topTask.reasoning}\n\n` +
                        `**📊 Project Analysis**:\n` +
                        `• **Health**: ${workAnalysis.projectHealth}\n` +
                        `• **Strategic Alignment**: ${workAnalysis.strategicAlignment}\n` +
                        (workAnalysis.bottlenecks.length > 0 ? `• **Bottlenecks**: ${workAnalysis.bottlenecks.join(', ')}\n` : '') +
                        `\n**💡 Recommendation**: ${workAnalysis.recommendation}\n\n` +
                        `**🚀 Next Steps**:\n` +
                        `1. Review the recommended task details\n` +
                        `2. Create feature branch: \`./tools/smart-git branch feature/${topTask.task.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}\`\n` +
                        `3. Begin implementation following the task requirements\n` +
                        `4. Run quality checks before committing\n\n` +
                        `**🤖 Role Context**: Optimized for ${roleDetection.detectedRole} workflows\n` +
                        `**🧠 Model Recommendation**: ${modelRecommendation.model} (${modelRecommendation.reasoning.join(', ')})\n\n` +
                        (taskSelectionResult.recommendedTasks.length > 1 ? 
                          `**Alternative Options**:\n${taskSelectionResult.recommendedTasks.slice(1, 3).map((t, i) => 
                            `${i + 2}. ${t.task.title} (${t.repository}) - ${t.reasoning}`).join('\n')}\n\n` : '') +
                        `Use \`/loqa dev work\` with specific task title to work on a different task.`,
                roleContext: roleDetection.detectedRole,
                modelRecommendation: modelRecommendation.model,
                taskRecommendation: topTask,
                workAnalysis: workAnalysis,
                alternativeTasks: taskSelectionResult.recommendedTasks.slice(1, 3)
              };
            }
          } catch (error) {
            console.warn('AI task selection failed, continuing with manual approach:', error);
            // Fall through to manual task creation
          }
        }

        // Step 4: Manual Task Creation (if no AI selection or specific task provided)
        const roleConfig = await roleManager.getRoleConfig(roleDetection.detectedRole);
        const preferredTemplate = roleConfig?.task_templates_preferred?.[0] || 'general';
        
        const taskOptions: TaskCreationOptions = {
          title: taskTitle || "New Development Task",
          template: preferredTemplate,
          priority: priority as "High" | "Medium" | "Low",
          type: category.includes('bug') ? 'Bug Fix' : 'Feature'
        };

        const task = await taskManager.createTaskFromTemplate(taskOptions);

        let responseText = `${syncMessage}🚀 **Task Work Initiated**\n\n`;
        responseText += `📋 **Task**: ${taskTitle}\n`;
        responseText += `📁 **File**: ${task.filePath}\n`;
        responseText += `🎯 **Role**: ${roleConfig?.role_name || roleDetection.detectedRole} (${(roleDetection.confidence * 100).toFixed(0)}% confidence)\n`;
        responseText += `🤖 **Recommended Model**: ${modelRecommendation.model} (${(modelRecommendation.confidence * 100).toFixed(0)}% confidence)\n`;
        responseText += `📝 **Template**: ${preferredTemplate}\n`;
        responseText += `⭐ **Priority**: ${priority}\n`;
        responseText += `📂 **Repository**: ${repository || 'Current'}\n\n`;
        
        responseText += `**Workflow Context**:\n`;
        responseText += `• **Role Reasoning**: ${roleDetection.reasoning.join(', ')}\n`;
        responseText += `• **Model Reasoning**: ${modelRecommendation.reasoning.join(', ')}\n`;
        
        if (filePaths.length > 0) {
          responseText += `• **Files Involved**: ${filePaths.slice(0, 5).join(', ')}${filePaths.length > 5 ? `... (+${filePaths.length - 5} more)` : ''}\n`;
        }

        responseText += `\n**Next Steps**: Begin work with optimized role and model context. ${updateStatus ? 'Status will be tracked automatically.' : 'Update status manually as needed.'}`;

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
            text: `❌ Failed to start task work: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "workflow:PlanStrategicShift": {
      const { shiftTitle, description, scope = [], timeline, stakeholders = [], riskLevel = "medium" } = args;
      
      try {
        // Ensure we have the latest code state for accurate impact analysis
        let syncMessage = '';
        try {
          const mainStatus = await SmartGitHelpers.checkMainStatus();
          if (mainStatus.success && mainStatus.isBehind) {
            const syncResult = await SmartGitHelpers.smartSync();
            if (syncResult.success && syncResult.pulledCommits > 0) {
              syncMessage = `🔄 Updated to latest main (${syncResult.pulledCommits} commits) for accurate impact analysis\n\n`;
            }
          }
        } catch (error) {
          // Continue without sync if it fails
        }
        // Create a comprehensive thought for the strategic shift
        const thought: CapturedThought = {
          content: `Strategic Shift: ${shiftTitle}\n\nDescription: ${description}\n\nScope: ${scope.join(', ')}\nTimeline: ${timeline || 'TBD'}\nStakeholders: ${stakeholders.join(', ')}\nRisk Level: ${riskLevel}`,
          tags: ['strategic-shift', 'planning', riskLevel, ...scope],
          timestamp: new Date(),
          context: 'Strategic planning session'
        };

        const thoughtResult = await taskManager.captureThought(thought);
        
        let planText = `${syncMessage}📈 **Strategic Shift Plan Created**\n\n`;
        planText += `🎯 **Title**: ${shiftTitle}\n`;
        planText += `📝 **Description**: ${description}\n`;
        planText += `🔍 **Scope**: ${scope.join(', ') || 'To be defined'}\n`;
        planText += `⏰ **Timeline**: ${timeline || 'To be estimated'}\n`;
        planText += `👥 **Stakeholders**: ${stakeholders.join(', ') || 'To be identified'}\n`;
        planText += `⚠️ **Risk Level**: ${riskLevel.toUpperCase()}\n\n`;
        
        planText += `**Planning Document**: ${thoughtResult.filePath}\n\n`;
        
        planText += `**Recommended Next Steps**:\n`;
        planText += `1. Review and refine the scope with stakeholders\n`;
        planText += `2. Create detailed implementation tasks for each affected repository\n`;
        planText += `3. Assess cross-repository dependencies and coordination needs\n`;
        planText += `4. Establish checkpoints and success criteria\n`;
        planText += `5. Create communication plan for rollout\n\n`;
        
        planText += `**Risk Mitigation** (${riskLevel} risk):\n`;
        if (riskLevel === 'high' || riskLevel === 'critical') {
          planText += `• Consider phased rollout approach\n`;
          planText += `• Establish rollback procedures\n`;
          planText += `• Increase testing and validation rigor\n`;
        }
        planText += `• Monitor impact across all affected repositories\n`;
        planText += `• Maintain clear documentation of changes`;

        return {
          content: [{
            type: "text",
            text: planText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to plan strategic shift: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "workflow:CaptureComprehensiveThought": {
      const { content, category, urgency = "backlog", relatedRepositories = [], tags = [], context } = args;
      
      try {
        const enhancedTags = [category, urgency, ...relatedRepositories.map((r: any) => `repo:${r}`), ...tags];
        
        const thought: CapturedThought = {
          content: `[${category.toUpperCase()}] ${content}`,
          tags: enhancedTags,
          timestamp: new Date(),
          context: context || `Comprehensive thought capture - ${category}`
        };

        const result = await taskManager.captureThought(thought);
        
        let thoughtText = `💡 **Comprehensive Thought Captured**\n\n`;
        thoughtText += `📂 **Category**: ${category}\n`;
        thoughtText += `⚡ **Urgency**: ${urgency}\n`;
        thoughtText += `📁 **File**: ${result.filePath}\n`;
        thoughtText += `🏷️ **Tags**: ${enhancedTags.join(', ')}\n`;
        
        if (relatedRepositories.length > 0) {
          thoughtText += `📦 **Related Repos**: ${relatedRepositories.join(', ')}\n`;
        }
        
        thoughtText += `\n**Suggested Follow-up Actions**:\n`;
        
        switch (urgency) {
          case 'immediate':
            thoughtText += `• Create high-priority task immediately\n`;
            thoughtText += `• Notify relevant stakeholders\n`;
            thoughtText += `• Begin work within current sprint\n`;
            break;
          case 'next-sprint':
            thoughtText += `• Add to next sprint planning\n`;
            thoughtText += `• Estimate effort and dependencies\n`;
            thoughtText += `• Coordinate with team leads\n`;
            break;
          case 'backlog':
            thoughtText += `• Add to product backlog for prioritization\n`;
            thoughtText += `• Gather additional requirements when ready\n`;
            break;
          case 'future':
            thoughtText += `• Document for future reference\n`;
            thoughtText += `• Review quarterly during roadmap planning\n`;
            break;
        }

        return {
          content: [{
            type: "text",
            text: thoughtText
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

    case "workflow:StartComplexTodo": {
      const { title, description, subtasks = [], repositories = [], dependencies = [], estimatedEffort = "days", priority = "Medium" } = args;
      
      try {
        // Create the main task with comprehensive context
        let enhancedDescription = description;
        
        if (subtasks.length > 0) {
          enhancedDescription += `\n\n## Subtasks:\n${subtasks.map((task: any, i: any) => `${i + 1}. ${task}`).join('\n')}`;
        }
        
        if (repositories.length > 0) {
          enhancedDescription += `\n\n## Affected Repositories:\n${repositories.map((repo: any) => `- ${repo}`).join('\n')}`;
        }
        
        if (dependencies.length > 0) {
          enhancedDescription += `\n\n## Dependencies:\n${dependencies.map((dep: any) => `- ${dep}`).join('\n')}`;
        }
        
        enhancedDescription += `\n\n## Estimated Effort: ${estimatedEffort}`;
        
        const taskOptions: TaskCreationOptions = {
          title,
          template: 'general',
          priority: priority as "High" | "Medium" | "Low",
          type: 'Feature'
        };

        const mainTask = await taskManager.createTaskFromTemplate(taskOptions);
        
        // Create individual subtasks if provided
        const createdSubtasks = [];
        for (let i = 0; i < Math.min(subtasks.length, 5); i++) { // Limit to 5 subtasks
          const subtaskOptions: TaskCreationOptions = {
            title: `${title} - ${subtasks[i]}`,
            template: 'general',
            priority: priority as "High" | "Medium" | "Low",
            type: 'Feature'
          };
          
          try {
            const subtask = await taskManager.createTaskFromTemplate(subtaskOptions);
            createdSubtasks.push(subtasks[i]);
          } catch (error) {
            // Continue with other subtasks if one fails
          }
        }

        let responseText = `🎯 **Complex Todo Initiated**\n\n`;
        responseText += `📋 **Main Task**: ${title}\n`;
        responseText += `📁 **File**: ${mainTask.filePath}\n`;
        responseText += `⭐ **Priority**: ${priority}\n`;
        responseText += `⏱️ **Estimated Effort**: ${estimatedEffort}\n\n`;
        
        if (createdSubtasks.length > 0) {
          responseText += `**Subtasks Created** (${createdSubtasks.length}/${subtasks.length}):\n`;
          responseText += createdSubtasks.map((task, i) => `${i + 1}. ${task}`).join('\n');
          responseText += '\n\n';
        }
        
        if (repositories.length > 0) {
          responseText += `**Repositories Involved**: ${repositories.join(', ')}\n`;
        }
        
        if (dependencies.length > 0) {
          responseText += `**Dependencies**: ${dependencies.join(', ')}\n`;
        }
        
        responseText += `\n**Next Steps**:\n`;
        responseText += `1. Review and refine task breakdown\n`;
        responseText += `2. Coordinate across affected repositories\n`;
        responseText += `3. Address dependencies before starting work\n`;
        responseText += `4. Begin with highest-priority subtasks\n`;
        responseText += `5. Track progress and update status regularly`;

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
            text: `❌ Failed to start complex todo: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    default:
      throw new Error(`Unknown workflow tool: ${name}`);
  }
}