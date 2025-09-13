import { ModelSelectionContext, ModelRecommendation } from '../types/index.js';
import { LoqaRoleManager } from './role-manager.js';
import { REPOSITORIES } from '../config/repositories.js';

export class LoqaModelSelector {
  private roleManager: LoqaRoleManager;

  constructor(workspaceRoot?: string) {
    // workspaceRoot is only used to initialize the role manager
    this.roleManager = new LoqaRoleManager(workspaceRoot);
  }

  /**
   * Select appropriate model based on context and complexity
   */
  async selectModel(context: ModelSelectionContext): Promise<ModelRecommendation> {
    const reasoning: string[] = [];
    let selectedModel = 'haiku'; // Default
    let confidence = 0.5;
    const alternatives: { model: string; reasoning: string; score: number }[] = [];

    // Manual override takes precedence
    if (context.manualOverride) {
      return {
        model: context.manualOverride,
        reasoning: [`Manual override specified: ${context.manualOverride}`],
        confidence: 1.0,
        alternatives: []
      };
    }

    // Role-based model preference
    if (context.roleId) {
      const roleConfig = await this.roleManager.getRoleConfig(context.roleId);
      if (roleConfig) {
        selectedModel = roleConfig.model_preference;
        reasoning.push(`Role-based preference: ${roleConfig.role_name} → ${selectedModel}`);
        confidence += 0.3;
      }
    }

    // Issue complexity analysis
    const complexityScore = this.analyzeComplexity(context);
    if (complexityScore.level === 'high') {
      if (selectedModel !== 'sonnet-4') {
        alternatives.push({
          model: selectedModel,
          reasoning: `Original role preference`,
          score: 0.6
        });
        selectedModel = 'sonnet-4';
        reasoning.push(`High complexity detected (${complexityScore.score}) → upgraded to Sonnet 4`);
        confidence = Math.max(confidence, 0.8);
      } else {
        reasoning.push(`High complexity confirmed, Sonnet 4 appropriate`);
        confidence += 0.2;
      }
    } else if (complexityScore.level === 'low') {
      if (selectedModel === 'sonnet-4') {
        alternatives.push({
          model: selectedModel,
          reasoning: `Role-based preference`,
          score: 0.7
        });
        selectedModel = 'haiku';
        reasoning.push(`Low complexity detected (${complexityScore.score}) → downgraded to Haiku for efficiency`);
        confidence = Math.max(confidence, 0.7);
      } else {
        reasoning.push(`Low complexity confirmed, Haiku appropriate`);
        confidence += 0.2;
      }
    }

    // Repository-specific adjustments
    if (context.repositoryType) {
      const repoAdjustment = this.getRepositoryModelPreference(context.repositoryType);
      if (repoAdjustment.preferredModel !== selectedModel) {
        alternatives.push({
          model: selectedModel,
          reasoning: `Previous selection`,
          score: confidence
        });
        selectedModel = repoAdjustment.preferredModel;
        reasoning.push(repoAdjustment.reasoning);
        confidence = Math.max(confidence, 0.6);
      }
    }

    // File path analysis for additional context
    const fileAnalysis = this.analyzeFilePaths(context.filePaths || []);
    if (fileAnalysis.suggestedModel && fileAnalysis.suggestedModel !== selectedModel) {
      alternatives.push({
        model: selectedModel,
        reasoning: `Previous selection based on role/complexity`,
        score: confidence
      });
      selectedModel = fileAnalysis.suggestedModel;
      reasoning.push(fileAnalysis.reasoning);
      confidence = Math.max(confidence, 0.7);
    }

    // Ensure confidence is capped at 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      model: selectedModel,
      reasoning,
      confidence,
      alternatives: alternatives.slice(0, 2) // Top 2 alternatives
    };
  }

  /**
   * Analyze issue complexity based on various factors
   */
  private analyzeComplexity(context: ModelSelectionContext): { level: 'low' | 'medium' | 'high'; score: number } {
    let complexityScore = 0;
    const factors: string[] = [];

    // Manual complexity override
    if (context.complexity) {
      const scoreMap = { low: 0.2, medium: 0.5, high: 0.8 };
      return { level: context.complexity, score: scoreMap[context.complexity] };
    }

    // Analyze issue title and description
    const text = [context.issueTitle || '', context.issueDescription || ''].join(' ').toLowerCase();
    
    // High complexity indicators
    const highComplexityPatterns = [
      'architect', 'architecture', 'design system', 'protocol', 'api design',
      'microservice', 'distributed', 'scalability', 'performance optimization',
      'security', 'infrastructure', 'kubernetes', 'deployment', 'ci/cd',
      'migration', 'refactor large', 'cross-service', 'breaking change'
    ];

    const mediumComplexityPatterns = [
      'implement', 'feature', 'integration', 'database', 'testing',
      'debugging', 'optimization', 'configuration', 'monitoring'
    ];

    const lowComplexityPatterns = [
      'documentation', 'readme', 'comment', 'typo', 'style',
      'update', 'minor', 'simple', 'small fix', 'cleanup'
    ];

    // Count pattern matches
    for (const pattern of highComplexityPatterns) {
      if (text.includes(pattern)) {
        complexityScore += 0.3;
        factors.push(`high: ${pattern}`);
      }
    }

    for (const pattern of mediumComplexityPatterns) {
      if (text.includes(pattern)) {
        complexityScore += 0.2;
        factors.push(`medium: ${pattern}`);
      }
    }

    for (const pattern of lowComplexityPatterns) {
      if (text.includes(pattern)) {
        complexityScore += 0.1;
        factors.push(`low: ${pattern}`);
      }
    }

    // Length-based complexity (longer descriptions often indicate complexity)
    const textLength = text.length;
    if (textLength > 500) {
      complexityScore += 0.2;
    } else if (textLength > 200) {
      complexityScore += 0.1;
    }

    // File count complexity (more files = more complex)
    const fileCount = context.filePaths?.length || 0;
    if (fileCount > 10) {
      complexityScore += 0.3;
    } else if (fileCount > 5) {
      complexityScore += 0.2;
    } else if (fileCount > 0) {
      complexityScore += 0.1;
    }

    // Determine level based on score
    let level: 'low' | 'medium' | 'high';
    if (complexityScore >= 0.7) {
      level = 'high';
    } else if (complexityScore >= 0.4) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return { level, score: Math.min(complexityScore, 1.0) };
  }

  /**
   * Get repository-specific model preferences
   */
  private getRepositoryModelPreference(repositoryType: string): { preferredModel: string; reasoning: string } {
    // Build preferences from centralized repository configuration
    const repoPreferences: Record<string, { preferredModel: string; reasoning: string }> = {};
    
    // Define model preferences based on repository types
    Object.keys(REPOSITORIES).forEach(repoName => {
      const repo = REPOSITORIES[repoName];
      switch (repo.type) {
        case 'core':
        case 'protocol':
        case 'service':
          repoPreferences[repoName] = {
            preferredModel: 'sonnet-4',
            reasoning: `${repo.description} requires architectural understanding`
          };
          break;
        case 'client':
          repoPreferences[repoName] = {
            preferredModel: 'sonnet-4',
            reasoning: `${repo.description} involves complex real-time processing`
          };
          break;
        case 'ui':
        case 'website':
        case 'config':
        default:
          repoPreferences[repoName] = {
            preferredModel: 'haiku',
            reasoning: `${repo.description} typically has lower complexity requirements`
          };
          break;
      }
    });

    return repoPreferences[repositoryType] || { 
      preferredModel: 'haiku', 
      reasoning: 'Unknown repository type, using efficient default' 
    };
  }

  /**
   * Analyze file paths for complexity indicators
   */
  private analyzeFilePaths(filePaths: string[]): { suggestedModel?: string; reasoning: string } {
    const complexityIndicators = {
      high: ['.proto', 'Dockerfile', 'docker-compose', 'kubernetes', 'helm', '.tf', 'terraform'],
      medium: ['.go', '.ts', '.js', '.py', 'Makefile', '.sql', '.graphql'],
      low: ['.md', '.txt', '.json', '.yaml', '.yml', '.css', '.scss']
    };

    let highCount = 0, mediumCount = 0, lowCount = 0;

    for (const path of filePaths) {
      const pathLower = path.toLowerCase();
      
      if (complexityIndicators.high.some(ext => pathLower.includes(ext))) {
        highCount++;
      } else if (complexityIndicators.medium.some(ext => pathLower.includes(ext))) {
        mediumCount++;
      } else if (complexityIndicators.low.some(ext => pathLower.includes(ext))) {
        lowCount++;
      }
    }

    if (highCount > 0) {
      return {
        suggestedModel: 'sonnet-4',
        reasoning: `File analysis: ${highCount} high-complexity files detected (infrastructure/protocol)`
      };
    } else if (mediumCount > lowCount && mediumCount > 2) {
      return {
        suggestedModel: 'sonnet-4',
        reasoning: `File analysis: ${mediumCount} code files suggest implementation complexity`
      };
    } else if (lowCount > mediumCount) {
      return {
        suggestedModel: 'haiku',
        reasoning: `File analysis: ${lowCount} documentation/config files suggest low complexity`
      };
    }

    return { reasoning: 'File analysis inconclusive, maintaining current selection' };
  }

  /**
   * Get model capabilities and use cases
   */
  getModelCapabilities(): Record<string, { strengths: string[]; useCases: string[]; performance: string }> {
    return {
      'sonnet-4': {
        strengths: [
          'Complex reasoning and analysis',
          'Architectural design and system thinking',
          'Advanced code generation and debugging',
          'Multi-step problem solving'
        ],
        useCases: [
          'System architecture design',
          'Complex algorithm implementation', 
          'Cross-service integration planning',
          'Performance optimization',
          'Security analysis and implementation'
        ],
        performance: 'Higher latency, more thorough analysis'
      },
      'haiku': {
        strengths: [
          'Fast response times',
          'Efficient for straightforward issues',
          'Good for documentation and simple code',
          'Cost-effective for high-volume work'
        ],
        useCases: [
          'Documentation writing',
          'Simple bug fixes',
          'Code formatting and style',
          'Configuration updates',
          'Basic testing issues'
        ],
        performance: 'Lower latency, optimized for efficiency'
      }
    };
  }
}