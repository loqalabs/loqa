import { KNOWN_REPOSITORIES_LIST } from "../config/repositories.js";
import { LoqaIssueManager } from "../managers/index.js";
import {
  IssueCreationOptions,
} from "../types/index.js";

/**
 * Assessment and Analysis Functions
 */

export function assessImplementationComplexity(
  content: string,
  category: string
): "trivial" | "simple" | "moderate" | "complex" | "architectural" {
  const contentLower = content.toLowerCase();

  // Architectural complexity
  if (
    contentLower.includes("architecture") ||
    contentLower.includes("refactor entire") ||
    contentLower.includes("breaking change") ||
    category === "architecture"
  ) {
    return "architectural";
  }

  // Complex implementation
  if (
    contentLower.includes("integration") ||
    contentLower.includes("multiple services") ||
    contentLower.includes("database changes") ||
    contentLower.includes("protocol change")
  ) {
    return "complex";
  }

  // Moderate implementation
  if (
    contentLower.includes("new feature") ||
    contentLower.includes("api changes") ||
    contentLower.includes("performance optimization")
  ) {
    return "moderate";
  }

  // Simple implementation
  if (
    contentLower.includes("config") ||
    contentLower.includes("small change") ||
    contentLower.includes("ui tweak")
  ) {
    return "simple";
  }

  return "trivial";
}

export function identifyCrossServiceImpact(content: string): string[] {
  const contentLower = content.toLowerCase();
  const impactedServices: string[] = [];

  if (
    contentLower.includes("hub") ||
    contentLower.includes("core") ||
    contentLower.includes("stt") ||
    contentLower.includes("tts")
  ) {
    impactedServices.push("loqa-hub");
  }
  if (
    contentLower.includes("ui") ||
    contentLower.includes("dashboard") ||
    contentLower.includes("commander")
  ) {
    impactedServices.push("loqa-commander");
  }
  if (
    contentLower.includes("relay") ||
    contentLower.includes("audio") ||
    contentLower.includes("capture")
  ) {
    impactedServices.push("loqa-relay");
  }
  if (contentLower.includes("skill") || contentLower.includes("plugin")) {
    impactedServices.push("loqa-skills");
  }
  if (
    contentLower.includes("protocol") ||
    contentLower.includes("grpc") ||
    contentLower.includes("api")
  ) {
    impactedServices.push("loqa-proto");
  }

  return [...new Set(impactedServices)];
}

export function generateTimelineSuggestion(
  content: string,
  category: string,
  urgency: string
): string {
  const complexity = assessImplementationComplexity(content, category);

  const timelineMap: { [key: string]: string } = {
    trivial: "Can be completed in 1-2 hours",
    simple: "Estimated 2-4 hours of focused work",
    moderate: "Plan for 1-2 days of development",
    complex: "Requires 3-5 days with proper testing",
    architectural: "Major effort: 1-2 weeks with coordination",
  };

  let suggestion = timelineMap[complexity];

  if (urgency === "immediate") {
    suggestion += " - Consider prioritizing in current sprint";
  } else if (urgency === "next-sprint") {
    suggestion += " - Good candidate for next sprint planning";
  } else if (urgency === "planned") {
    suggestion += " - Add to planned features for future consideration";
  }

  return suggestion;
}

export function generateContextualInsights(
  content: string,
  category: string,
  activeIssues: any[]
): string[] {
  const insights: string[] = [];
  const contentLower = content.toLowerCase();

  // Cross-issue relationship insights
  const relatedIssues = activeIssues.filter((issue) =>
    contentLower
      .split(" ")
      .some(
        (word) => word.length > 4 && issue.content?.toLowerCase().includes(word)
      )
  );

  if (relatedIssues.length > 0) {
    insights.push(
      `Relates to ${relatedIssues.length} active issue(s) - consider coordination`
    );
  }

  // Architecture insights
  if (
    contentLower.includes("microservice") ||
    contentLower.includes("distributed")
  ) {
    insights.push(
      "Microservice architecture consideration - may require cross-service coordination"
    );
  }

  // Performance insights
  if (
    contentLower.includes("performance") ||
    contentLower.includes("optimization")
  ) {
    insights.push("Performance optimization - measure before/after impact");
  }

  // User experience insights
  if (contentLower.includes("user") || contentLower.includes("ux")) {
    insights.push("User-facing change - consider UX impact and testing");
  }

  // Technical debt insights
  if (category === "technical-debt") {
    insights.push(
      "Technical debt item - balance immediate value vs. long-term maintainability"
    );
  }

  return insights;
}

export function determineActionRecommendation(
  content: string,
  category: string,
  urgency: string,
  activeIssues: any[]
):
  | "capture_only"
  | "add_to_existing"
  | "create_simple_issue"
  | "create_comprehensive_issue"
  | "schedule_discussion" {
  const complexity = assessImplementationComplexity(content, category);

  // Helper function to assess project impact (simplified version)
  const assessProjectImpact = (
    content: string,
    category: string
  ): "low" | "medium" | "high" | "critical" => {
    if (
      category === "architecture" ||
      content.toLowerCase().includes("breaking")
    )
      return "critical";
    if (
      content.toLowerCase().includes("multiple") ||
      content.toLowerCase().includes("integration")
    )
      return "high";
    if (category === "feature-idea" || category === "technical-debt")
      return "medium";
    return "low";
  };

  const impact = assessProjectImpact(content, category);

  // Schedule discussion for architectural or critical items
  if (complexity === "architectural" || impact === "critical") {
    return "schedule_discussion";
  }

  // Add to existing issue if high alignment
  const relatedIssues = activeIssues.filter((issue) =>
    content
      .toLowerCase()
      .split(" ")
      .some(
        (word) => word.length > 4 && issue.content?.toLowerCase().includes(word)
      )
  );

  if (relatedIssues.length >= 2 && urgency !== "future") {
    return "add_to_existing";
  }

  // Create comprehensive issue for complex items with high impact
  if ((complexity === "complex" || impact === "high") && urgency !== "future") {
    return "create_comprehensive_issue";
  }

  // Create simple issue for moderate complexity with immediate urgency
  if (complexity === "moderate" && urgency === "immediate") {
    return "create_simple_issue";
  }

  // Just capture for future reference
  return "capture_only";
}

/**
 * Thought Processing Functions
 */

export function detectThoughtCategory(content: string, tags: string[]): string {
  const contentLower = content.toLowerCase();

  // Check explicit category tags first
  const categoryTags = [
    "architecture",
    "feature-idea",
    "technical-debt",
    "process-improvement",
    "research-topic",
    "bug-insight",
    "optimization",
  ];
  for (const tag of tags) {
    if (categoryTags.includes(tag)) return tag;
  }

  // Content-based detection
  if (
    contentLower.includes("architecture") ||
    contentLower.includes("system design") ||
    contentLower.includes("microservice")
  ) {
    return "architecture";
  }
  if (
    contentLower.includes("bug") ||
    contentLower.includes("error") ||
    contentLower.includes("issue")
  ) {
    return "bug-insight";
  }
  if (
    contentLower.includes("debt") ||
    contentLower.includes("refactor") ||
    contentLower.includes("cleanup")
  ) {
    return "technical-debt";
  }
  if (
    contentLower.includes("performance") ||
    contentLower.includes("optimize") ||
    contentLower.includes("faster")
  ) {
    return "optimization";
  }
  if (
    contentLower.includes("feature") ||
    contentLower.includes("new") ||
    contentLower.includes("add")
  ) {
    return "feature-idea";
  }
  if (
    contentLower.includes("process") ||
    contentLower.includes("workflow") ||
    contentLower.includes("improve")
  ) {
    return "process-improvement";
  }
  if (
    contentLower.includes("research") ||
    contentLower.includes("investigate") ||
    contentLower.includes("explore")
  ) {
    return "research-topic";
  }

  return "feature-idea"; // Default category
}

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

  // Future indicators
  if (
    contentLower.includes("someday") ||
    contentLower.includes("eventually") ||
    contentLower.includes("maybe")
  ) {
    return "future";
  }

  return "planned"; // Default urgency
}

export function determineCategory(analysis: any): string {
  if (analysis.hasArchitecturalImplications) return "architecture";
  if (analysis.hasUrgencyIndicators) return "urgent";
  if (analysis.hasImplementationDetails) return "feature";
  return "general";
}

export function mapCategoryToTemplate(
  category: string,
  isMultiRepo: boolean
): string {
  if (isMultiRepo) return "cross-repo";

  const categoryMap: { [key: string]: string } = {
    architecture: "feature",
    "feature-idea": "feature",
    "bug-insight": "bug-fix",
    "technical-debt": "bug-fix",
    "process-improvement": "general",
  };

  return categoryMap[category] || "general";
}

export function estimateEffortFromScope(
  repositories: string[],
  category: string
): string {
  if (repositories.length > 2) return "weeks";
  if (repositories.length > 1) return "days-weeks";
  if (category === "architecture") return "days";
  return "hours-days";
}

/**
 * Issue Creation Helper Functions
 */

export function deriveIssueTitle(thoughtContent: string): string {
  // Extract first sentence or first 60 characters
  const firstSentence = thoughtContent.split(/[.!?]/)[0].trim();
  let title = firstSentence.length > 0 ? firstSentence : thoughtContent;

  // Truncate if too long
  if (title.length > 60) {
    title = title.substring(0, 57) + "...";
  }

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return title;
}

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

export async function appendContextToIssue(
  filePath: string,
  additionalContext: string,
  originalThought: string
): Promise<void> {
  try {
    const fs = await import("fs/promises");

    // Read current issue file content
    const currentContent = await fs.readFile(filePath, "utf-8");

    // Append the additional context section
    const appendContent = `\n\n## Original Thought\n\n${originalThought}\n\n## Additional Context\n\n${additionalContext}\n`;

    // Write back with appended content
    await fs.writeFile(filePath, currentContent + appendContent, "utf-8");
  } catch (error) {
    console.warn(`Failed to append context to issue file: ${error}`);
    // Non-critical error - issue was created successfully
  }
}

/**
 * Simple direct issue creation (replaces interview system)
 */
export async function createSimpleIssue(
  input: string,
  workspaceRoot: string
): Promise<{ success: boolean; message: string }> {
  // Simple heuristics to determine if we can create directly
  const complexity = analyzeInitialComplexity(input);

  const issueManager = new LoqaIssueManager(workspaceRoot);

  try {
    const options: IssueCreationOptions = {
      title: deriveIssueTitle(input),
      template: complexity === "high" ? "feature" : "general",
      priority: complexity === "high" ? "High" : "Medium",
      type: "Feature",
    };

    const result = await issueManager.createIssueFromTemplate(options);

    return {
      success: true,
      message: `✅ **Issue Created Successfully**\n\n📋 **Issue ID**: ${result.issue?.number || 'N/A'}\n📝 **Title**: ${options.title}\n⭐ **Priority**: ${options.priority}\n\n**Original Input**: "${input}"\n\n**Next Steps**: Issue is ready for work!`,
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Failed to create issue: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}

export async function analyzeRepositoryRequirements(
  text: string
): Promise<string[]> {
  const textLower = text.toLowerCase();
  const repos: string[] = [];

  // Direct mentions
  KNOWN_REPOSITORIES_LIST.forEach((repo) => {
    if (textLower.includes(repo.toLowerCase())) {
      repos.push(repo);
    }
  });

  // Technology-based inference
  if (
    textLower.includes("ui") ||
    textLower.includes("dashboard") ||
    textLower.includes("vue")
  ) {
    repos.push("loqa-commander");
  }
  if (textLower.includes("grpc") || textLower.includes("proto")) {
    repos.push("loqa-proto");
  }
  if (textLower.includes("skill") || textLower.includes("plugin")) {
    repos.push("loqa-skills");
  }
  if (
    textLower.includes("hub") ||
    textLower.includes("stt") ||
    textLower.includes("tts") ||
    textLower.includes("llm")
  ) {
    repos.push("loqa-hub");
  }

  return [...new Set(repos)];
}

export function analyzeInitialComplexity(
  text: string
): "low" | "medium" | "high" {
  const indicators = {
    high: [
      "system",
      "architecture",
      "refactor",
      "migration",
      "breaking",
      "multiple",
      "across",
    ],
    medium: ["feature", "implement", "integration", "api", "database"],
    low: ["fix", "update", "small", "simple", "quick"],
  };

  const textLower = text.toLowerCase();

  if (indicators.high.some((indicator) => textLower.includes(indicator)))
    return "high";
  if (indicators.medium.some((indicator) => textLower.includes(indicator)))
    return "medium";
  return "low";
}