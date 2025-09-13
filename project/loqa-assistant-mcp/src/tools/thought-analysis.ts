import { join } from "path";
import { KNOWN_REPOSITORIES_LIST } from "../config/repositories.js";
import { LoqaIssueManager } from "../managers/index.js";

/**
 * Thought Analysis Module - Main Interface
 *
 * This module serves as the main interface for thought analysis functionality,
 * importing from specialized analysis modules for focused functionality.
 *
 * Module Structure:
 * - thought-evaluator.ts: Core evaluation logic and priority assessment
 * - ai-analyzer.ts: AI-powered analysis and advanced reasoning
 * - categorizer.ts: Category detection and classification
 * - analysis-utils.ts: Utility functions and text processing
 */

// Import core types and functions from analysis modules
export {
  ThoughtEvaluation,
  evaluateThoughtPriority,
  evaluateComprehensiveThought,
  analyzeCurrentProjectState,
  assessPriorityAgainstCurrentState,
} from "../analysis/thought-evaluator.js";

export {
  findRelatedExistingIssues,
  loadProjectContextForAI,
  analyzeThoughtWithAI,
  performHeuristicAIAnalysis,
  basicIssueMatching,
  performAdvancedThoughtAnalysis,
} from "../analysis/ai-analyzer.js";

export {
  detectThoughtCategory,
  estimateThoughtUrgency,
  mapCategoryToTemplate,
  classifyThoughtWithConfidence,
  getCategoryTemplateInfo,
  analyzeCategoryDistribution,
  getSmartCategorySuggestions,
} from "../analysis/categorizer.js";

export {
  extractIssueTitle,
  analyzeThoughtContent,
  extractKeywords,
  extractTechMentions,
  estimateComplexity,
  extractContextualKeywords,
  calculateSemanticSimilarity,
  analyzeTextTone,
  extractActionableItems,
  estimateTimeRequirements,
  generateTextSummary,
  cleanAndValidateText,
} from "../analysis/analysis-utils.js";

// Legacy exports are now available through direct imports from the appropriate modules