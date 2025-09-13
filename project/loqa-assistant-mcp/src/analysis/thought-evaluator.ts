/**
 * Core Thought Evaluation Module
 *
 * Provides core thought evaluation logic, priority assessment, and basic analysis functions.
 * This module focuses on the primary evaluation workflow and assessment logic.
 */

import { join } from "path";
import { KNOWN_REPOSITORIES_LIST } from "../config/repositories.js";
import { LoqaIssueManager } from "../managers/index.js";
import { extractKeywords } from "./analysis-utils.js";

export interface ThoughtEvaluation {
  shouldSuggestIssue: boolean;
  reasoning: string;
  suggestedTemplate: string;
  suggestedPriority: string;
  category: string;
  scope?: string;
  estimatedEffort?: string;
}

/**
 * Evaluates a thought/idea against current project state using simple heuristics
 */
export async function evaluateThoughtPriority(
  content: string,
  tags: string[] = [],
  context?: string,
  workspaceRoot?: string
): Promise<ThoughtEvaluation> {
  try {
    // Get current project state
    const projectState = await analyzeCurrentProjectState(workspaceRoot);

    // Import analysis functions from other modules
    const { analyzeThoughtContent } = await import("./analysis-utils.js");

    // Analyze thought content for patterns and keywords
    const thoughtAnalysis = analyzeThoughtContent(content, tags, context);

    // Cross-reference with current priorities and gaps
    const priorityAssessment = assessPriorityAgainstCurrentState(
      thoughtAnalysis,
      projectState
    );

    return priorityAssessment;
  } catch (error) {
    // Final fallback
    return {
      shouldSuggestIssue: false,
      reasoning:
        "Unable to analyze against current project state. Captured for later review.",
      suggestedTemplate: "general",
      suggestedPriority: "Medium",
      category: "general",
    };
  }
}


/**
 * Enhanced evaluation for comprehensive thoughts with full context
 */
export async function evaluateComprehensiveThought(
  content: string,
  category: string,
  urgency: string,
  relatedRepositories: string[],
  workspaceRoot?: string
): Promise<ThoughtEvaluation> {
  try {
    const projectState = await analyzeCurrentProjectState(workspaceRoot);
    const { analyzeThoughtContent } = await import("./analysis-utils.js");

    const thoughtAnalysis = {
      ...analyzeThoughtContent(content, [category, urgency], ""),
      category,
      urgency,
      relatedRepositories,
    };

    const assessment = assessPriorityAgainstCurrentState(
      thoughtAnalysis,
      projectState
    );

    // Enhanced reasoning for comprehensive thoughts
    assessment.scope =
      relatedRepositories.length > 1
        ? "Multi-repository"
        : `Single repository (${relatedRepositories.join(", ")})`;
    assessment.estimatedEffort = estimateEffortFromScope(
      relatedRepositories,
      category
    );

    return assessment;
  } catch (error) {
    const { mapCategoryToTemplate } = await import("./categorizer.js");

    return {
      shouldSuggestIssue: urgency === "immediate" || urgency === "next-sprint",
      reasoning: `${category} with ${urgency} urgency. Dynamic analysis unavailable, using category-based assessment.`,
      suggestedTemplate: mapCategoryToTemplate(
        category,
        relatedRepositories.length > 1
      ),
      suggestedPriority: urgency === "immediate" ? "High" : "Medium",
      category,
    };
  }
}

/**
 * Analyzes current project state by examining issues, activity, and priorities
 */
export async function analyzeCurrentProjectState(workspaceRoot?: string) {
  const actualWorkspaceRoot = workspaceRoot || process.cwd();
  const state = {
    activeIssues: [] as any[],
    recentActivity: [] as string[],
    priorityAreas: [] as string[],
    gaps: [] as string[],
    overloadedAreas: [] as string[],
    issueDetails: [] as Array<{
      issueFile: string;
      repo: string;
      title: string;
      content?: string;
    }>,
  };

  try {
    // Analyze each repository's issues
    for (const repoName of KNOWN_REPOSITORIES_LIST) {
      try {
        const repoPath = join(actualWorkspaceRoot, repoName);
        const issueManager = new LoqaIssueManager(repoPath);
        const result = await issueManager.listIssues();

        // Collect active issues and identify patterns
        state.activeIssues.push(
          ...result.issues.map((issue) => ({ issue, repo: repoName }))
        );

        // Load GitHub Issues for better matching
        for (const issue of result.issues || []) {
          try {
            const title = issue.title;

            state.issueDetails.push({
              issueFile: `${issue.number}.md`, // For backward compatibility
              repo: repoName,
              title: title || `Issue #${issue.number}`,
              content: (issue.body || "").substring(0, 500), // First 500 chars for matching
            });
          } catch (error) {
            // Skip if can't read issue details
            state.issueDetails.push({
              issueFile: `${issue.number || "unknown"}.md`, // For backward compatibility
              repo: repoName,
              title: issue.title || `Issue #${issue.number || "unknown"}`,
              content: undefined,
            });
          }
        }

        // Identify priority areas from issue titles and patterns
        result.issues.forEach((issue) => {
          const issueText = typeof issue === 'string' ? issue : issue?.title || '';
          const issueLower = issueText.toLowerCase();
          if (
            issueLower.includes("critical") ||
            issueLower.includes("urgent")
          ) {
            state.priorityAreas.push(...extractKeywords(issueText));
          }
        });

        // Identify overloaded areas (too many issues)
        if (result.issues.length > 8) {
          state.overloadedAreas.push(repoName);
        }

        // Identify gaps (repositories with few or no issues)
        if (result.issues.length < 2) {
          state.gaps.push(repoName);
        }
      } catch (error) {
        // Repository might not exist or have issues - continue
        continue;
      }
    }
  } catch (error) {
    console.warn("Failed to analyze project state:", error);
  }

  return state;
}

/**
 * Assesses priority by comparing thought against current project state
 */
export function assessPriorityAgainstCurrentState(
  thoughtAnalysis: any,
  projectState: any
): ThoughtEvaluation {
  let score = 0;
  let reasoning = [];
  let suggestedTemplate = "general";
  let suggestedPriority = "Low";

  // Check if thought addresses current priority areas
  const addressesPriorities = thoughtAnalysis.keywords.some((keyword: string) =>
    projectState.priorityAreas.some((priority: string) =>
      priority.includes(keyword)
    )
  );

  if (addressesPriorities) {
    score += 3;
    reasoning.push("addresses current priority areas");
    suggestedPriority = "High";
  }

  // Check if thought fills identified gaps
  const fillsGaps = projectState.gaps.some((gap: string) =>
    thoughtAnalysis.keywords.some((keyword: string) =>
      gap.toLowerCase().includes(keyword)
    )
  );

  if (fillsGaps) {
    score += 2;
    reasoning.push("addresses underserved areas");
    suggestedTemplate = "feature";
  }

  // Avoid overloaded areas unless urgent
  const targetsOverloadedArea = projectState.overloadedAreas.some(
    (area: string) =>
      thoughtAnalysis.keywords.some((keyword: string) =>
        area.toLowerCase().includes(keyword)
      )
  );

  if (targetsOverloadedArea && !thoughtAnalysis.hasUrgencyIndicators) {
    score -= 1;
    reasoning.push("targets already busy area - consider timing");
  }

  // Urgency indicators
  if (thoughtAnalysis.hasUrgencyIndicators) {
    score += 2;
    reasoning.push("contains urgency indicators");
    suggestedPriority = "High";
    suggestedTemplate = "bug-fix";
  }

  // Implementation readiness
  if (thoughtAnalysis.hasImplementationDetails) {
    score += 1;
    reasoning.push("includes implementation details");
    suggestedTemplate = "feature";
  }

  // Architectural implications
  if (thoughtAnalysis.hasArchitecturalImplications) {
    score += 1;
    reasoning.push("has architectural implications");
    if (thoughtAnalysis.complexity === "high") {
      suggestedTemplate = "cross-repo";
    }
  }

  // Determine final recommendation
  const shouldSuggestIssue = score >= 2;

  if (suggestedPriority === "Low" && score >= 2) {
    suggestedPriority = "Medium";
  }

  return {
    shouldSuggestIssue,
    reasoning:
      reasoning.length > 0 ? reasoning.join(", ") : "general idea captured",
    suggestedTemplate,
    suggestedPriority,
    category: determineCategory(thoughtAnalysis),
  };
}

/**
 * Helper function to determine category from analysis
 */
function determineCategory(analysis: any): string {
  if (analysis.hasArchitecturalImplications) return "architecture";
  if (analysis.hasUrgencyIndicators) return "urgent";
  if (analysis.hasImplementationDetails) return "feature";
  return "general";
}

/**
 * Helper function to estimate effort from scope
 */
function estimateEffortFromScope(
  repositories: string[],
  category: string
): string {
  if (repositories.length > 2) return "weeks";
  if (repositories.length > 1) return "days-weeks";
  if (category === "architecture") return "days";
  return "hours-days";
}