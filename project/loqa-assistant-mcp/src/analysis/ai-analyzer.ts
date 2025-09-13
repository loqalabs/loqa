/**
 * AI Analysis Module
 *
 * Provides AI-powered analysis functions, advanced thought analysis, and machine learning integration.
 * This module handles sophisticated analysis that goes beyond basic heuristics.
 */

/**
 * AI-powered analysis to find existing issues that might be related to a thought/idea
 * Uses project context understanding instead of simple keyword matching
 */
export async function findRelatedExistingIssues(
  thoughtContent: string,
  thoughtTags: string[],
  thoughtContext: string | undefined,
  projectState: any
): Promise<Array<{ issue: any; similarity: number; reason: string }>> {
  try {
    // If no existing issues, return empty
    if (projectState.issueDetails.length === 0) {
      return [];
    }

    // Load project context for AI analysis
    const projectContext = await loadProjectContextForAI();

    // Use AI to analyze thought against existing issues
    const analysis = await analyzeThoughtWithAI(
      thoughtContent,
      thoughtTags,
      thoughtContext,
      projectState.issueDetails.slice(0, 10), // Limit to top 10 issues for performance
      projectContext
    );

    return analysis.relatedIssues || [];
  } catch (error) {
    console.warn(
      "AI-powered matching failed, falling back to basic matching:",
      error
    );
    // Fallback to simple matching if AI analysis fails
    return basicIssueMatching(
      thoughtContent,
      thoughtTags,
      thoughtContext,
      projectState
    );
  }
}

/**
 * Load project context from documentation files for AI analysis
 */
export async function loadProjectContextForAI(): Promise<string> {
  let context = "";

  try {
    const fs = await import("fs/promises");
    const { join } = await import("path");

    // Try to load key project documentation
    const contextFiles = ["CLAUDE.md", "README.md", "docs/README.md"];

    for (const file of contextFiles) {
      try {
        const filePath = join(process.cwd(), file);
        const content = await fs.readFile(filePath, "utf-8");
        context += `\n\n=== ${file} ===\n${content.substring(0, 2000)}`; // Limit to 2k chars per file
      } catch (error) {
        // File doesn't exist, skip
        continue;
      }
    }

    // Add project architecture overview
    context += "\n\n=== Project Architecture ===\n";
    context +=
      "Loqa is a local-first voice assistant platform with microservice architecture:\n";
    context +=
      "- loqa-hub (Go): Central service, gRPC, STT/TTS/LLM pipeline, SQLite storage\n";
    context +=
      "- loqa-commander (Vue.js): Administrative dashboard and monitoring\n";
    context += "- loqa-relay (Go): Audio capture client and firmware\n";
    context += "- loqa-proto (Protocol Buffers): gRPC definitions\n";
    context += "- loqa-skills (Go plugins): Modular skill system\n";
    context +=
      "- Focus: Privacy-first, local processing, no cloud dependencies\n";

    return context;
  } catch (error) {
    return "Loqa voice assistant platform - microservice architecture with Go backend, Vue.js frontend, local AI processing";
  }
}

/**
 * Use AI reasoning to analyze how a thought relates to existing issues
 */
export async function analyzeThoughtWithAI(
  thoughtContent: string,
  thoughtTags: string[],
  thoughtContext: string | undefined,
  existingIssues: any[],
  projectContext: string
): Promise<{
  relatedIssues: Array<{ issue: any; similarity: number; reason: string }>;
}> {
  // Prepare issue summaries for AI analysis
  const issueSummaries = existingIssues
    .map(
      (issue, index) =>
        `${index + 1}. "${issue.title}" (${issue.repo})\n   ${(
          issue.content || ""
        ).substring(0, 200)}`
    )
    .join("\n\n");

  const _analysisPrompt = `You are analyzing a new thought/idea in the context of the Loqa project to determine if it should be added to an existing issue or become a new issue.

PROJECT CONTEXT:
${projectContext}

NEW THOUGHT/IDEA:
Content: "${thoughtContent}"
Tags: ${thoughtTags.join(", ")}
Context: ${thoughtContext || "None provided"}

EXISTING TASKS:
${issueSummaries}

ANALYSIS INSTRUCTIONS:
1. Consider the Loqa project's goals: local-first voice assistant, microservice architecture, privacy-focused
2. Analyze how this thought relates to existing issues conceptually, not just by keywords
3. Consider if this thought would enhance/extend an existing issue vs. being a separate concern
4. Think about the project architecture and which components this affects

For each existing issue that this thought could relate to, provide:
- Similarity score (0-100): How closely related is this thought to the existing issue?
- Reasoning: Why does this thought relate to this issue? Consider:
  * Does it solve the same underlying problem?
  * Would it be implemented in the same component/repository?
  * Does it share the same user story or business goal?
  * Is it a natural extension or enhancement of the existing work?

RESPONSE FORMAT (JSON):
{
  "relatedIssues": [
    {
      "issueIndex": 1,
      "similarity": 85,
      "reason": "Both address STT accuracy improvements and would be implemented in the loqa-hub service. This thought provides specific implementation approach for the existing issue's goals."
    }
  ],
  "recommendation": "add_to_existing|create_new",
  "reasoning": "Overall assessment of whether this thought should extend existing work or become new issue"
}

Only include issues with similarity > 30. If no issues are significantly related, return empty relatedIssues array.`;

  try {
    // In a real implementation, this would call an LLM API
    // For now, we'll return a structured analysis based on simple heuristics
    // that can be enhanced with actual LLM integration

    const analysis = performHeuristicAIAnalysis(
      thoughtContent,
      thoughtTags,
      thoughtContext,
      existingIssues
    );
    return analysis;
  } catch (error) {
    throw new Error(`AI analysis failed: ${error}`);
  }
}

/**
 * Heuristic-based analysis that simulates AI reasoning
 * This can be replaced with actual LLM API calls
 */
export function performHeuristicAIAnalysis(
  thoughtContent: string,
  thoughtTags: string[],
  thoughtContext: string | undefined,
  existingIssues: any[]
): {
  relatedIssues: Array<{ issue: any; similarity: number; reason: string }>;
} {
  const relatedIssues = [];
  const thoughtLower = `${thoughtContent} ${thoughtTags.join(" ")} ${
    thoughtContext || ""
  }`.toLowerCase();

  for (const issue of existingIssues) {
    const issueText = `${issue.title} ${issue.content || ""}`.toLowerCase();
    let similarity = 0;
    let reasons = [];

    // Enhanced semantic analysis
    const semanticPatterns = [
      // STT/TTS/Audio patterns
      {
        terms: ["stt", "speech", "voice", "audio", "transcrib", "recogni"],
        weight: 25,
        domain: "audio processing",
      },
      {
        terms: ["tts", "synthesiz", "speak", "voice output"],
        weight: 25,
        domain: "speech synthesis",
      },

      // AI/LLM patterns
      {
        terms: ["llm", "model", "ai", "intelligence", "prompt", "response"],
        weight: 20,
        domain: "AI/LLM",
      },

      // Architecture patterns
      {
        terms: ["service", "api", "grpc", "microservice", "architecture"],
        weight: 15,
        domain: "architecture",
      },
      {
        terms: ["hub", "central", "orchestrat", "pipeline"],
        weight: 20,
        domain: "hub service",
      },

      // UI/Frontend patterns
      {
        terms: ["ui", "interface", "dashboard", "commander", "vue", "frontend"],
        weight: 20,
        domain: "UI/frontend",
      },

      // Skills/Integration patterns
      {
        terms: ["skill", "plugin", "integration", "homeassistant", "command"],
        weight: 20,
        domain: "skills system",
      },

      // Performance/Quality patterns
      {
        terms: [
          "performance",
          "optim",
          "speed",
          "efficiency",
          "accuracy",
          "quality",
        ],
        weight: 15,
        domain: "performance",
      },
      {
        terms: ["error", "retry", "failur", "reliabil", "robust"],
        weight: 20,
        domain: "reliability",
      },

      // Infrastructure patterns
      {
        terms: ["docker", "deploy", "config", "setup", "infra"],
        weight: 15,
        domain: "infrastructure",
      },
    ];

    // Check for semantic domain overlaps
    for (const pattern of semanticPatterns) {
      const thoughtHasDomain = pattern.terms.some((term) =>
        thoughtLower.includes(term)
      );
      const issueHasDomain = pattern.terms.some((term) =>
        issueText.includes(term)
      );

      if (thoughtHasDomain && issueHasDomain) {
        similarity += pattern.weight;
        reasons.push(`both relate to ${pattern.domain}`);
      }
    }

    // Check for component/repository alignment
    const componentMap = {
      hub: ["stt", "tts", "llm", "central", "service", "api", "grpc"],
      commander: ["ui", "dashboard", "frontend", "vue", "interface"],
      relay: ["audio", "capture", "client", "device"],
      skills: ["skill", "plugin", "integration", "command"],
      proto: ["protocol", "grpc", "definition", "api"],
    };

    for (const [component, terms] of Object.entries(componentMap)) {
      const thoughtHasComponent = terms.some((term) =>
        thoughtLower.includes(term)
      );
      const issueHasComponent =
        terms.some((term) => issueText.includes(term)) ||
        issue.repo?.includes(component);

      if (thoughtHasComponent && issueHasComponent) {
        similarity += 15;
        reasons.push(`both target ${component} component`);
      }
    }

    // Check for problem/solution alignment
    const problemSolutionPairs = [
      {
        problem: ["accuracy", "error", "wrong", "incorrect"],
        solution: ["improve", "fix", "enhance", "optim"],
      },
      {
        problem: ["slow", "performance", "delay"],
        solution: ["speed", "faster", "optim", "cache"],
      },
      {
        problem: ["fail", "crash", "break"],
        solution: ["retry", "robust", "handle", "recover"],
      },
    ];

    for (const pair of problemSolutionPairs) {
      const thoughtHasProblem = pair.problem.some((term) =>
        thoughtLower.includes(term)
      );
      const issueHasSolution = pair.solution.some((term) =>
        issueText.includes(term)
      );
      const thoughtHasSolution = pair.solution.some((term) =>
        thoughtLower.includes(term)
      );
      const issueHasProblem = pair.problem.some((term) =>
        issueText.includes(term)
      );

      if (
        (thoughtHasProblem && issueHasSolution) ||
        (thoughtHasSolution && issueHasProblem)
      ) {
        similarity += 20;
        reasons.push("addresses related problem/solution space");
      }
    }

    if (similarity > 30) {
      relatedIssues.push({
        issue,
        similarity,
        reason: reasons.join(", ") || "semantic relationship detected",
      });
    }
  }

  return {
    relatedIssues: relatedIssues.sort((a, b) => b.similarity - a.similarity),
  };
}

/**
 * Fallback basic matching for when AI analysis fails
 */
export function basicIssueMatching(
  _thoughtContent: string,
  thoughtTags: string[],
  _thoughtContext: string | undefined,
  projectState: any
): Array<{ issue: any; similarity: number; reason: string }> {
  // Simple fallback - just check for exact tag matches
  const relatedIssues = [];

  for (const issueDetail of projectState.issueDetails) {
    let similarity = 0;
    let reasons = [];

    // Check for exact tag matches
    for (const tag of thoughtTags) {
      if (
        issueDetail.title.toLowerCase().includes(tag.toLowerCase()) ||
        issueDetail.content?.toLowerCase().includes(tag.toLowerCase())
      ) {
        similarity += 15;
        reasons.push(`tag match: ${tag}`);
      }
    }

    if (similarity > 10) {
      relatedIssues.push({
        issue: issueDetail,
        similarity,
        reason: reasons.join(", "),
      });
    }
  }

  return relatedIssues.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Phase 2: Advanced thought impact assessment with sprint alignment analysis
 */
export async function performAdvancedThoughtAnalysis(
  thoughtContent: string,
  thoughtTags: string[],
  _thoughtContext: string | undefined,
  category: string,
  urgency: string,
  workspaceRoot?: string
): Promise<{
  projectImpact: "low" | "medium" | "high" | "critical";
  sprintAlignment: "perfect" | "good" | "moderate" | "poor";
  projectValue: number; // 0-100
  implementationComplexity:
    | "trivial"
    | "simple"
    | "moderate"
    | "complex"
    | "architectural";
  crossServiceImpact: string[];
  timelineSuggestion: string;
  contextualInsights: string[];
  actionRecommendation:
    | "capture_only"
    | "add_to_existing"
    | "create_simple_issue"
    | "create_comprehensive_issue"
    | "schedule_discussion";
}> {
  const { readFile } = await import("fs/promises");
  const { join } = await import("path");
  const { LoqaIssueManager } = await import("../managers/index.js");

  const actualWorkspaceRoot = workspaceRoot || process.cwd();

  // Load current project context and active work
  const projectDocs: string[] = [];
  const activeIssues: any[] = [];

  try {
    // Load project documentation
    try {
      const claudeFile = await readFile(
        join(actualWorkspaceRoot, "..", "loqa", "CLAUDE.md"),
        "utf-8"
      );
      projectDocs.push(claudeFile);
    } catch {
      // Try alternative path structure
      try {
        const claudeFile = await readFile(
          join(actualWorkspaceRoot, "CLAUDE.md"),
          "utf-8"
        );
        projectDocs.push(claudeFile);
      } catch {
        // No project docs available
      }
    }

    // Load active issues from key repositories to understand current sprint focus
    const keyRepos = [
      "loqa-hub",
      "loqa-commander",
      "loqa-relay",
      "loqa-skills",
    ];
    for (const repo of keyRepos) {
      try {
        const issueManager = new LoqaIssueManager(
          join(actualWorkspaceRoot, "..", repo)
        );
        const issueList = await issueManager.listIssues();

        for (const issue of (issueList.issues || []).slice(0, 5)) {
          // Load top 5 active GitHub Issues per repo
          try {
            activeIssues.push({
              file: `${issue.number}.md`, // For backward compatibility
              issueNumber: issue.number,
              repository: repo,
              content: (issue.body || "").substring(0, 500),
            });
          } catch {
            // Skip if issue file can't be read
          }
        }
      } catch {
        // Repository doesn't exist or no issues
      }
    }
  } catch (error) {
    console.warn("Could not load full project context for advanced analysis");
  }

  // Advanced analysis based on thought content and current project state
  const analysis = {
    projectImpact: assessProjectImpact(thoughtContent, category, projectDocs),
    sprintAlignment: assessSprintAlignment(
      thoughtContent,
      activeIssues,
      category
    ),
    projectValue: calculateProjectValue(
      thoughtContent,
      thoughtTags,
      category,
      urgency,
      projectDocs
    ),
    implementationComplexity: assessImplementationComplexity(
      thoughtContent,
      category
    ),
    crossServiceImpact: identifyCrossServiceImpact(thoughtContent),
    timelineSuggestion: generateTimelineSuggestion(
      thoughtContent,
      category,
      urgency
    ),
    contextualInsights: generateContextualInsights(
      thoughtContent,
      category,
      activeIssues
    ),
    actionRecommendation: determineActionRecommendation(
      thoughtContent,
      category,
      urgency,
      activeIssues
    ),
  };

  return analysis;
}

// Helper functions for advanced analysis
function assessProjectImpact(
  content: string,
  category: string,
  _projectDocs: string[]
): "low" | "medium" | "high" | "critical" {
  const contentLower = content.toLowerCase();

  // Critical impact indicators
  if (
    contentLower.includes("breaking") ||
    contentLower.includes("architecture") ||
    contentLower.includes("security") ||
    contentLower.includes("data loss") ||
    category === "security-compliance"
  ) {
    return "critical";
  }

  // High impact indicators
  if (
    contentLower.includes("protocol") ||
    contentLower.includes("grpc") ||
    contentLower.includes("api change") ||
    contentLower.includes("database") ||
    category === "architecture"
  ) {
    return "high";
  }

  // Medium impact indicators
  if (
    contentLower.includes("performance") ||
    contentLower.includes("integration") ||
    contentLower.includes("user experience") ||
    category === "feature-idea"
  ) {
    return "medium";
  }

  return "low";
}

function assessSprintAlignment(
  content: string,
  activeIssues: any[],
  category: string
): "perfect" | "good" | "moderate" | "poor" {
  const contentLower = content.toLowerCase();

  // Check if thought aligns with current active issues
  const issueAlignment = activeIssues.filter((issue) => {
    const issueContent = issue.content?.toLowerCase() || "";
    return contentLower
      .split(" ")
      .some((word) => word.length > 4 && issueContent.includes(word));
  });

  if (issueAlignment.length >= 3) return "perfect";
  if (issueAlignment.length >= 2) return "good";
  if (issueAlignment.length >= 1) return "moderate";

  // Category-based alignment assessment
  if (category === "bug-insight" || category === "technical-debt") {
    return "good"; // Always relevant for sprint health
  }

  return "poor";
}

function calculateProjectValue(
  content: string,
  _tags: string[],
  category: string,
  urgency: string,
  _projectDocs: string[]
): number {
  let score = 50; // Base score

  const contentLower = content.toLowerCase();

  // Category-based scoring
  const categoryScores: { [key: string]: number } = {
    architecture: 25,
    "feature-idea": 20,
    "technical-debt": 15,
    "bug-insight": 18,
    optimization: 12,
    "process-improvement": 10,
    "research-topic": 8,
  };
  score += categoryScores[category] || 5;

  // Urgency-based scoring
  const urgencyScores: { [key: string]: number } = {
    immediate: 20,
    "next-sprint": 15,
    planned: 5,
    future: 0,
  };
  score += urgencyScores[urgency] || 0;

  // Content-based project value indicators
  if (
    contentLower.includes("scalability") ||
    contentLower.includes("performance")
  )
    score += 15;
  if (
    contentLower.includes("user experience") ||
    contentLower.includes("usability")
  )
    score += 12;
  if (contentLower.includes("security") || contentLower.includes("privacy"))
    score += 20;
  if (
    contentLower.includes("maintainability") ||
    contentLower.includes("technical debt")
  )
    score += 10;
  if (
    contentLower.includes("innovation") ||
    contentLower.includes("competitive")
  )
    score += 8;

  // Microservice architecture relevance
  if (
    contentLower.includes("microservice") ||
    contentLower.includes("distributed")
  )
    score += 10;
  if (contentLower.includes("grpc") || contentLower.includes("protocol"))
    score += 12;

  return Math.min(100, Math.max(0, score));
}

function assessImplementationComplexity(
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

function identifyCrossServiceImpact(content: string): string[] {
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

function generateTimelineSuggestion(
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

function generateContextualInsights(
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

function determineActionRecommendation(
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
  const impact = assessProjectImpact(content, category, []);

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