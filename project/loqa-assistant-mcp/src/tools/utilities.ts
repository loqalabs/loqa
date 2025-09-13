/**
 * Minimal utility functions for issue management
 * This module contains only the functions that are actually used elsewhere
 *
 * Note: Most functions have been moved to thought-analysis.ts to eliminate duplication
 * and improve organization.
 */

/**
 * Estimate urgency level from thought content
 * Used by issue-commands.ts for issue creation
 */
export function estimateThoughtUrgency(content: string): string {
  const contentLower = content.toLowerCase();

  // Immediate urgency indicators
  if (
    contentLower.includes("urgent") ||
    contentLower.includes("asap") ||
    contentLower.includes("critical") ||
    contentLower.includes("breaking")
  ) {
    return "immediate";
  }

  // Next sprint indicators
  if (
    contentLower.includes("soon") ||
    contentLower.includes("next") ||
    contentLower.includes("priority")
  ) {
    return "next-sprint";
  }

  // Planned work indicators
  if (
    contentLower.includes("future") ||
    contentLower.includes("later") ||
    contentLower.includes("someday")
  ) {
    return "future";
  }

  // Default to planned if no urgency indicators
  return "planned";
}

/**
 * Map category to issue type for GitHub Issues
 * Used by issue-commands.ts for proper issue labeling
 */
export function mapCategoryToIssueType(
  category: string
): "Feature" | "Bug Fix" | "Improvement" | "Documentation" {
  const categoryToTypeMap: {
    [key: string]: "Feature" | "Bug Fix" | "Improvement" | "Documentation";
  } = {
    architecture: "Improvement", // Map architecture to Improvement instead of Refactoring
    feature: "Feature",
    "feature-idea": "Feature",
    urgent: "Bug Fix",
    "bug-insight": "Bug Fix",
    "technical-debt": "Improvement", // Map technical debt to Improvement
    "process-improvement": "Improvement",
    optimization: "Improvement",
    "research-topic": "Documentation",
    general: "Improvement",
  };

  return categoryToTypeMap[category] || "Improvement";
}