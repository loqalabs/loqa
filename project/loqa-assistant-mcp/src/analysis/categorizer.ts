/**
 * Categorization Module
 *
 * Provides category detection and classification, thought categorization logic, and category mapping functions.
 * This module handles all aspects of organizing thoughts and issues into meaningful categories.
 */

/**
 * Phase 2: Intelligent category detection for simple thoughts
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

/**
 * Estimate urgency level based on content analysis
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

/**
 * Map category to appropriate issue template
 */
export function mapCategoryToTemplate(category: string, isMultiRepo: boolean): string {
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

/**
 * Advanced category classification with confidence scoring
 */
export function classifyThoughtWithConfidence(
  content: string,
  tags: string[],
  context?: string
): {
  category: string;
  confidence: number; // 0-100
  alternativeCategories: Array<{ category: string; confidence: number }>;
  reasoning: string;
} {
  const contentLower = content.toLowerCase();
  const allText = `${content} ${tags.join(" ")} ${context || ""}`.toLowerCase();

  const categoryScores: { [key: string]: number } = {};
  const categoryReasons: { [key: string]: string[] } = {};

  // Architecture indicators
  const architectureTerms = [
    "architecture", "system design", "microservice", "service", "api design",
    "protocol", "infrastructure", "scalability", "distributed"
  ];
  const architectureScore = countMatches(allText, architectureTerms);
  if (architectureScore > 0) {
    categoryScores.architecture = architectureScore * 15;
    categoryReasons.architecture = [`Found ${architectureScore} architecture-related terms`];
  }

  // Feature idea indicators
  const featureTerms = [
    "feature", "new", "add", "implement", "create", "enhancement",
    "functionality", "capability", "improvement"
  ];
  const featureScore = countMatches(allText, featureTerms);
  if (featureScore > 0) {
    categoryScores["feature-idea"] = featureScore * 12;
    categoryReasons["feature-idea"] = [`Found ${featureScore} feature-related terms`];
  }

  // Technical debt indicators
  const debtTerms = [
    "debt", "refactor", "cleanup", "legacy", "outdated", "maintain",
    "improve", "simplify", "modernize"
  ];
  const debtScore = countMatches(allText, debtTerms);
  if (debtScore > 0) {
    categoryScores["technical-debt"] = debtScore * 13;
    categoryReasons["technical-debt"] = [`Found ${debtScore} technical debt terms`];
  }

  // Bug insight indicators
  const bugTerms = [
    "bug", "error", "issue", "problem", "fail", "broken", "fix",
    "crash", "incorrect", "wrong"
  ];
  const bugScore = countMatches(allText, bugTerms);
  if (bugScore > 0) {
    categoryScores["bug-insight"] = bugScore * 14;
    categoryReasons["bug-insight"] = [`Found ${bugScore} bug-related terms`];
  }

  // Optimization indicators
  const optimizationTerms = [
    "performance", "optimize", "faster", "speed", "efficiency", "cache",
    "memory", "cpu", "latency", "throughput"
  ];
  const optimizationScore = countMatches(allText, optimizationTerms);
  if (optimizationScore > 0) {
    categoryScores.optimization = optimizationScore * 11;
    categoryReasons.optimization = [`Found ${optimizationScore} optimization terms`];
  }

  // Process improvement indicators
  const processTerms = [
    "process", "workflow", "automation", "ci/cd", "testing", "deployment",
    "documentation", "standards", "guidelines"
  ];
  const processScore = countMatches(allText, processTerms);
  if (processScore > 0) {
    categoryScores["process-improvement"] = processScore * 10;
    categoryReasons["process-improvement"] = [`Found ${processScore} process terms`];
  }

  // Research topic indicators
  const researchTerms = [
    "research", "investigate", "explore", "study", "analyze", "experiment",
    "proof of concept", "poc", "evaluation"
  ];
  const researchScore = countMatches(allText, researchTerms);
  if (researchScore > 0) {
    categoryScores["research-topic"] = researchScore * 9;
    categoryReasons["research-topic"] = [`Found ${researchScore} research terms`];
  }

  // Check explicit tags with high confidence
  for (const tag of tags) {
    if (tag in categoryScores) {
      categoryScores[tag] += 20;
      categoryReasons[tag] = categoryReasons[tag] || [];
      categoryReasons[tag].push("Explicitly tagged");
    }
  }

  // Sort categories by score
  const sortedCategories = Object.entries(categoryScores)
    .sort(([, a], [, b]) => b - a)
    .map(([category, score]) => ({
      category,
      confidence: Math.min(100, Math.max(0, score)),
    }));

  // Determine primary category
  const primaryCategory = sortedCategories.length > 0
    ? sortedCategories[0]
    : { category: "feature-idea", confidence: 30 };

  // Get alternative categories (excluding primary)
  const alternativeCategories = sortedCategories
    .slice(1, 4) // Top 3 alternatives
    .filter(cat => cat.confidence > 20);

  // Build reasoning
  const reasoning = categoryReasons[primaryCategory.category]?.join(", ") ||
    "Default classification based on general content";

  return {
    category: primaryCategory.category,
    confidence: primaryCategory.confidence,
    alternativeCategories,
    reasoning,
  };
}

/**
 * Get category-specific templates and suggestions
 */
export function getCategoryTemplateInfo(category: string): {
  template: string;
  suggestedLabels: string[];
  estimatedComplexity: "low" | "medium" | "high";
  requiredFields: string[];
  optionalFields: string[];
} {
  const categoryInfo: { [key: string]: any } = {
    architecture: {
      template: "feature",
      suggestedLabels: ["architecture", "high-priority", "cross-repo"],
      estimatedComplexity: "high",
      requiredFields: ["impact-analysis", "component-affected", "breaking-changes"],
      optionalFields: ["migration-plan", "rollback-strategy"],
    },
    "feature-idea": {
      template: "feature",
      suggestedLabels: ["feature", "enhancement"],
      estimatedComplexity: "medium",
      requiredFields: ["user-story", "acceptance-criteria"],
      optionalFields: ["mockups", "api-design"],
    },
    "technical-debt": {
      template: "bug-fix",
      suggestedLabels: ["technical-debt", "maintenance"],
      estimatedComplexity: "medium",
      requiredFields: ["current-state", "target-state", "benefits"],
      optionalFields: ["migration-strategy", "testing-plan"],
    },
    "bug-insight": {
      template: "bug-fix",
      suggestedLabels: ["bug", "investigation"],
      estimatedComplexity: "low",
      requiredFields: ["symptoms", "reproduction-steps", "expected-behavior"],
      optionalFields: ["workaround", "root-cause-analysis"],
    },
    optimization: {
      template: "feature",
      suggestedLabels: ["performance", "optimization"],
      estimatedComplexity: "medium",
      requiredFields: ["current-metrics", "target-metrics", "measurement-plan"],
      optionalFields: ["profiling-results", "load-test-plan"],
    },
    "process-improvement": {
      template: "general",
      suggestedLabels: ["process", "workflow", "tooling"],
      estimatedComplexity: "low",
      requiredFields: ["current-process", "proposed-changes", "benefits"],
      optionalFields: ["implementation-plan", "training-needs"],
    },
    "research-topic": {
      template: "general",
      suggestedLabels: ["research", "investigation", "low-priority"],
      estimatedComplexity: "low",
      requiredFields: ["research-question", "success-criteria"],
      optionalFields: ["timeline", "resources-needed"],
    },
  };

  return categoryInfo[category] || {
    template: "general",
    suggestedLabels: ["general"],
    estimatedComplexity: "medium",
    requiredFields: ["description"],
    optionalFields: [],
  };
}

/**
 * Analyze category distribution across thoughts/issues
 */
export function analyzeCategoryDistribution(
  items: Array<{ category: string; urgency?: string; content?: string }>
): {
  distribution: { [category: string]: number };
  recommendations: string[];
  imbalances: Array<{ category: string; status: "overloaded" | "underrepresented" }>;
} {
  const distribution: { [category: string]: number } = {};
  const urgencyByCategory: { [category: string]: string[] } = {};

  // Count categories and track urgency
  for (const item of items) {
    distribution[item.category] = (distribution[item.category] || 0) + 1;
    if (item.urgency) {
      urgencyByCategory[item.category] = urgencyByCategory[item.category] || [];
      urgencyByCategory[item.category].push(item.urgency);
    }
  }

  const totalItems = items.length;
  const recommendations: string[] = [];
  const imbalances: Array<{ category: string; status: "overloaded" | "underrepresented" }> = [];

  // Analyze distribution patterns
  for (const [category, count] of Object.entries(distribution)) {
    const percentage = (count / totalItems) * 100;

    if (percentage > 40) {
      imbalances.push({ category, status: "overloaded" });
      recommendations.push(
        `High concentration in ${category} (${percentage.toFixed(1)}%) - consider breaking down or redistributing work`
      );
    } else if (percentage < 5 && totalItems > 10) {
      imbalances.push({ category, status: "underrepresented" });
      recommendations.push(
        `Low representation in ${category} (${percentage.toFixed(1)}%) - may indicate missed opportunities`
      );
    }

    // Check urgency patterns
    const urgencies = urgencyByCategory[category] || [];
    const immediateCount = urgencies.filter(u => u === "immediate").length;
    if (immediateCount > count * 0.5) {
      recommendations.push(
        `High urgency concentration in ${category} - may indicate systemic issues`
      );
    }
  }

  // General recommendations
  if (distribution["technical-debt"] && distribution["feature-idea"]) {
    const debtRatio = distribution["technical-debt"] / distribution["feature-idea"];
    if (debtRatio > 0.5) {
      recommendations.push(
        "High technical debt to feature ratio - consider dedicating sprint capacity to debt reduction"
      );
    }
  }

  if (!distribution["process-improvement"]) {
    recommendations.push(
      "No process improvement items found - consider capturing workflow enhancement opportunities"
    );
  }

  return {
    distribution,
    recommendations,
    imbalances,
  };
}

/**
 * Helper function to count term matches
 */
function countMatches(text: string, terms: string[]): number {
  return terms.reduce((count, term) => {
    return count + (text.includes(term) ? 1 : 0);
  }, 0);
}

/**
 * Get smart category suggestions based on existing patterns
 */
export function getSmartCategorySuggestions(
  content: string,
  existingCategories: string[]
): Array<{ category: string; reason: string; confidence: number }> {
  const suggestions: Array<{ category: string; reason: string; confidence: number }> = [];

  // Get base classification
  const classification = classifyThoughtWithConfidence(content, []);

  // Add primary suggestion
  suggestions.push({
    category: classification.category,
    reason: classification.reasoning,
    confidence: classification.confidence,
  });

  // Add alternatives
  for (const alt of classification.alternativeCategories) {
    suggestions.push({
      category: alt.category,
      reason: `Alternative classification with ${alt.confidence}% confidence`,
      confidence: alt.confidence,
    });
  }

  // Consider existing category patterns
  const categoryFrequency: { [key: string]: number } = {};
  for (const cat of existingCategories) {
    categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
  }

  // Suggest less common categories to balance distribution
  const underrepresentedCategories = Object.entries(categoryFrequency)
    .filter(([, count]) => count < 2)
    .map(([category]) => category);

  for (const category of underrepresentedCategories) {
    if (!suggestions.find(s => s.category === category)) {
      suggestions.push({
        category,
        reason: "Suggested to balance category distribution",
        confidence: 25,
      });
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}