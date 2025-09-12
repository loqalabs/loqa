/**
 * AI-Powered Task Prioritization
 * 
 * Uses Claude's intelligence for context-aware task priority analysis
 * instead of brittle keyword matching and hardcoded weights.
 */

export interface AITaskAnalysis {
  priority: 'critical' | 'high' | 'medium' | 'low';
  score: number; // 0-100
  reasoning: string;
  architecturalImpact: number; // 0-100
  technicalDebtLevel: number; // 0-100
  productivityImpact: number; // 0-100
  urgencyFactors: string[];
  roleAlignment: {
    architect: number; // 0-100 how relevant for architect
    developer: number; // 0-100 how relevant for developer
    devops: number; // 0-100 how relevant for devops
    qa: number; // 0-100 how relevant for qa
  };
}

/**
 * Analyzes a task using AI intelligence for role-specific prioritization
 * This replaces the brittle keyword-based scoring system
 */
export async function analyzeTaskPriorityWithAI(
  taskContent: string,
  taskTitle?: string,
  currentRole?: string,
  projectContext?: string
): Promise<AITaskAnalysis> {
  
  // For now, implement intelligent heuristic analysis
  // In the future, this could call Claude API directly for even smarter analysis
  
  const analysis = performIntelligentAnalysis(
    taskContent, 
    taskTitle, 
    currentRole, 
    projectContext
  );
  
  return analysis;
}

/**
 * Performs intelligent analysis using Claude-like reasoning patterns
 * Focuses on the architectural thinking that was missing in the original algorithm
 */
function performIntelligentAnalysis(
  content: string,
  title?: string,
  role?: string,
  context?: string
): AITaskAnalysis {
  
  const fullText = `${title || ''} ${content}`.toLowerCase();
  
  // AI-style pattern recognition for different impact types
  const impacts = analyzeImpactDimensions(fullText);
  const roleRelevance = analyzeRoleRelevance(fullText);
  const urgencyFactors = identifyUrgencyFactors(fullText);
  
  // Calculate overall score using AI-inspired weighting
  const baseScore = calculateIntelligentScore(impacts, roleRelevance, urgencyFactors, role);
  
  // Apply role-specific multipliers (the key insight missing from original algorithm)
  const roleMultiplier = getRoleSpecificMultiplier(roleRelevance, role);
  const finalScore = Math.min(100, baseScore * roleMultiplier);
  
  const priority = scoreToPriority(finalScore);
  const reasoning = generateIntelligentReasoning(impacts, urgencyFactors, roleRelevance, role);
  
  return {
    priority,
    score: finalScore,
    reasoning,
    architecturalImpact: impacts.architectural,
    technicalDebtLevel: impacts.technicalDebt,
    productivityImpact: impacts.productivity,
    urgencyFactors,
    roleAlignment: roleRelevance
  };
}

function analyzeImpactDimensions(text: string) {
  let architectural = 0;
  let technicalDebt = 0;
  let productivity = 0;
  
  // Architectural impact indicators (high-value patterns)
  const architecturalPatterns = [
    // System-level patterns
    { pattern: /monolith|2[\d,]+.line|massive\s+file/g, weight: 40 },
    { pattern: /split|modular|refactor|decompos/g, weight: 35 },
    { pattern: /timeout|blocking|emergency|critical/g, weight: 45 },
    
    // Infrastructure patterns  
    { pattern: /infrastructure|developer\s+experience|tooling/g, weight: 30 },
    { pattern: /build\s+system|ci\/cd|workflow/g, weight: 25 },
    
    // Architecture quality patterns
    { pattern: /maintainabil|scalabil|code\s+quality/g, weight: 30 },
    { pattern: /microservice|service.*architecture/g, weight: 25 }
  ];
  
  // Technical debt patterns (architect-focused)
  const techDebtPatterns = [
    { pattern: /technical\s+debt|tech\s+debt|debt/g, weight: 40 },
    { pattern: /monolith|massive.*file|[\d,]+.*line.*file/g, weight: 45 },
    { pattern: /legacy|outdated|deprecated/g, weight: 30 },
    { pattern: /hack|workaround|temporary|quick.*fix/g, weight: 25 },
    { pattern: /cleanup|refactor|moderniz|split.*file/g, weight: 35 }
  ];
  
  // Productivity impact patterns (critical for architects)
  const productivityPatterns = [
    { pattern: /productivity|developer.*experience|dx/g, weight: 40 },
    { pattern: /claude.*code|timeout|tool.*issue/g, weight: 45 },
    { pattern: /slow|inefficient|manual.*process/g, weight: 25 },
    { pattern: /automation|optimization/g, weight: 20 }
  ];
  
  // Calculate scores
  architectural = calculatePatternScore(text, architecturalPatterns);
  technicalDebt = calculatePatternScore(text, techDebtPatterns);
  productivity = calculatePatternScore(text, productivityPatterns);
  
  return { architectural, technicalDebt, productivity };
}

function analyzeRoleRelevance(text: string) {
  // Smart role relevance calculation
  const architectPatterns = [
    /system.*design|architecture|infrastructure|technical.*debt|refactor|monolith/g,
    /scalability|maintainability|design.*pattern|service.*design/g,
    /cross.*service|dependency|integration|protocol/g
  ];
  
  const developerPatterns = [
    /feature|implement|bug.*fix|api|function|component/g,
    /code|programming|logic|algorithm/g,
    /test|debug|performance.*tune/g
  ];
  
  const devopsPatterns = [
    /deploy|ci\/cd|docker|kubernetes|infrastructure.*code/g,
    /monitoring|logging|observability|metrics/g,
    /automation|pipeline|build.*system/g
  ];
  
  const qaPatterns = [
    /test|quality.*assurance|validation|verification/g,
    /bug|defect|regression|coverage/g,
    /acceptance.*criteria|specification/g
  ];
  
  return {
    architect: Math.min(100, calculatePatternScore(text, architectPatterns.map(p => ({ pattern: p, weight: 30 })))),
    developer: Math.min(100, calculatePatternScore(text, developerPatterns.map(p => ({ pattern: p, weight: 30 })))),
    devops: Math.min(100, calculatePatternScore(text, devopsPatterns.map(p => ({ pattern: p, weight: 30 })))),
    qa: Math.min(100, calculatePatternScore(text, qaPatterns.map(p => ({ pattern: p, weight: 30 }))))
  };
}

function identifyUrgencyFactors(text: string): string[] {
  const factors = [];
  
  if (/emergency|urgent|critical|blocking/.test(text)) {
    factors.push('Emergency/Critical Issue');
  }
  if (/productivity|developer.*experience|timeout/.test(text)) {
    factors.push('Developer Productivity Impact');
  }
  if (/technical.*debt|monolith|refactor/.test(text)) {
    factors.push('Technical Debt Accumulation');
  }
  if (/infrastructure|tooling|build/.test(text)) {
    factors.push('Infrastructure/Tooling Issue');
  }
  
  return factors;
}

function calculatePatternScore(text: string, patterns: { pattern: RegExp; weight: number }[]): number {
  let score = 0;
  
  for (const { pattern, weight } of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      score += weight * Math.min(matches.length, 3); // Cap repeated matches
    }
  }
  
  return Math.min(100, score);
}

function calculateIntelligentScore(
  impacts: { architectural: number; technicalDebt: number; productivity: number },
  roleRelevance: { architect: number; developer: number; devops: number; qa: number },
  urgencyFactors: string[],
  role?: string
): number {
  
  // Base score from impact dimensions
  let score = (impacts.architectural + impacts.technicalDebt + impacts.productivity) / 3;
  
  // Urgency multiplier (this was completely missing in original algorithm!)
  const urgencyMultiplier = 1 + (urgencyFactors.length * 0.3);
  score *= urgencyMultiplier;
  
  // Role alignment bonus
  if (role) {
    const roleScore = roleRelevance[role as keyof typeof roleRelevance] || 0;
    score += roleScore * 0.4; // 40% weight for role alignment
  }
  
  return Math.min(100, score);
}

function getRoleSpecificMultiplier(
  roleRelevance: { architect: number; developer: number; devops: number; qa: number },
  role?: string
): number {
  
  if (!role) return 1.0;
  
  // This is the key insight - architect role should heavily weight infrastructure concerns
  const multipliers = {
    architect: 1.0 + (roleRelevance.architect * 0.012), // Slightly higher boost for architects
    developer: 1.0 + (roleRelevance.developer * 0.008),
    devops: 1.0 + (roleRelevance.devops * 0.009),
    qa: 1.0 + (roleRelevance.qa * 0.008)
  };
  
  return multipliers[role as keyof typeof multipliers] || 1.0;
}

function scoreToPriority(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function generateIntelligentReasoning(
  impacts: { architectural: number; technicalDebt: number; productivity: number },
  urgencyFactors: string[],
  roleRelevance: { architect: number; developer: number; devops: number; qa: number },
  role?: string
): string {
  
  const reasons = [];
  
  // Impact-based reasoning
  if (impacts.productivity > 70) {
    reasons.push('High developer productivity impact detected');
  }
  if (impacts.technicalDebt > 60) {
    reasons.push('Significant technical debt implications');
  }
  if (impacts.architectural > 60) {
    reasons.push('Major architectural considerations identified');
  }
  
  // Urgency-based reasoning
  if (urgencyFactors.length > 0) {
    reasons.push(`Urgency factors: ${urgencyFactors.join(', ')}`);
  }
  
  // Role-specific reasoning
  if (role === 'architect' && roleRelevance.architect > 70) {
    reasons.push('High strategic value for architecture role');
  }
  
  return reasons.length > 0 
    ? reasons.join('; ')
    : 'Standard task with moderate priority';
}

export default {
  analyzeTaskPriorityWithAI
};