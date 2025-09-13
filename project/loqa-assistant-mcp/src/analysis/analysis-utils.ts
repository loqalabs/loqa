/**
 * Analysis Utilities Module
 *
 * Provides helper functions for text processing, keyword extraction, and common analysis utilities.
 * This module contains shared utility functions used across the analysis system.
 */

/**
 * Extract issue title from issue file content
 */
export function extractIssueTitle(content: string): string | null {
  const lines = content.split("\n");
  for (const line of lines) {
    if (line.startsWith("# ")) {
      return line
        .replace("# ", "")
        .replace(/^Issue:\s*/, "")
        .trim();
    }
  }
  return null;
}

/**
 * Extracts key information from thought content
 */
export function analyzeThoughtContent(
  content: string,
  tags: string[],
  context?: string
) {
  const allText = `${content} ${tags.join(" ")} ${context || ""}`.toLowerCase();

  return {
    keywords: extractKeywords(allText),
    hasUrgencyIndicators:
      /\b(urgent|critical|asap|immediately|broken|failing|blocker)\b/.test(
        allText
      ),
    hasImplementationDetails:
      /\b(implement|code|develop|build|create|add)\b/.test(allText),
    hasArchitecturalImplications:
      /\b(architecture|design|structure|system|refactor)\b/.test(allText),
    mentionsSpecificTech: extractTechMentions(allText),
    complexity: estimateComplexity(allText),
  };
}

/**
 * Extract meaningful keywords from text, avoiding common stop words
 */
export function extractKeywords(text: string): string[] {
  // Extract meaningful keywords, avoiding common words
  const stopWords = new Set([
    "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "a", "an",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "should", "could", "can", "may", "might", "must", "shall", "this", "that",
    "these", "those", "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them"
  ]);

  return (
    text.match(/\b\w{3,}\b/g)?.filter((word) => !stopWords.has(word)) || []
  );
}

/**
 * Extract technology mentions from text
 */
export function extractTechMentions(text: string): string[] {
  const techTerms = [
    "go", "golang", "vue", "vuejs", "javascript", "typescript", "docker", "kubernetes",
    "grpc", "protobuf", "sqlite", "postgresql", "mysql", "redis", "nats", "ollama",
    "stt", "tts", "llm", "ai", "machine learning", "neural network",
    "microservice", "api", "rest", "graphql", "websocket", "http", "https",
    "git", "github", "gitlab", "jenkins", "ci/cd", "terraform", "ansible",
    "aws", "azure", "gcp", "cloud", "serverless", "lambda",
    "react", "angular", "svelte", "node", "express", "fastify",
    "python", "java", "c++", "rust", "kotlin", "swift"
  ];

  const mentioned = techTerms.filter((term) => {
    // Handle multi-word terms
    if (term.includes(" ")) {
      return text.includes(term);
    }
    // Handle single word terms with word boundaries
    return new RegExp(`\\b${term}\\b`, 'i').test(text);
  });

  return mentioned;
}

/**
 * Estimate complexity level based on content indicators
 */
export function estimateComplexity(text: string): "low" | "medium" | "high" {
  const complexityIndicators = [
    { terms: ["system", "architecture", "refactor", "migration", "breaking"], weight: 3 },
    { terms: ["integration", "distributed", "scalability", "performance"], weight: 2 },
    { terms: ["api", "database", "protocol", "security", "auth"], weight: 2 },
    { terms: ["multiple", "cross", "service", "component", "module"], weight: 1 },
    { terms: ["new", "feature", "enhancement", "improvement"], weight: 1 }
  ];

  let complexityScore = 0;

  for (const indicator of complexityIndicators) {
    const matches = indicator.terms.filter((term) => text.includes(term));
    complexityScore += matches.length * indicator.weight;
  }

  if (complexityScore >= 8) return "high";
  if (complexityScore >= 4) return "medium";
  return "low";
}

/**
 * Enhanced keyword extraction with context awareness
 */
export function extractContextualKeywords(
  text: string,
  context?: string,
  domain?: string
): {
  primary: string[];
  secondary: string[];
  technical: string[];
  domain: string[];
} {
  const allText = `${text} ${context || ""}`.toLowerCase();

  // Domain-specific terms for Loqa project
  const domainTerms = {
    loqa: [
      "hub", "commander", "relay", "skills", "proto",
      "voice", "assistant", "stt", "tts", "audio",
      "transcription", "synthesis", "pipeline"
    ],
    general: [
      "feature", "bug", "issue", "performance", "security",
      "ui", "api", "database", "service", "component"
    ]
  };

  const primaryKeywords = extractKeywords(allText)
    .filter(word => word.length >= 4)
    .slice(0, 10); // Top 10 most relevant

  const technicalTerms = extractTechMentions(allText);

  const domainKeywords = domain && domainTerms[domain as keyof typeof domainTerms]
    ? domainTerms[domain as keyof typeof domainTerms].filter(term => allText.includes(term))
    : domainTerms.loqa.filter(term => allText.includes(term));

  // Secondary keywords are less common but still relevant
  const allKeywords = extractKeywords(allText);
  const secondaryKeywords = allKeywords
    .filter(word => !primaryKeywords.includes(word))
    .filter(word => word.length >= 5)
    .slice(0, 8);

  return {
    primary: primaryKeywords,
    secondary: secondaryKeywords,
    technical: technicalTerms,
    domain: domainKeywords
  };
}

/**
 * Calculate semantic similarity between two texts
 */
export function calculateSemanticSimilarity(text1: string, text2: string): number {
  const keywords1 = new Set(extractKeywords(text1.toLowerCase()));
  const keywords2 = new Set(extractKeywords(text2.toLowerCase()));

  const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
  const union = new Set([...keywords1, ...keywords2]);

  // Jaccard similarity
  const jaccardSimilarity = intersection.size / union.size;

  // Tech mention bonus
  const tech1 = new Set(extractTechMentions(text1.toLowerCase()));
  const tech2 = new Set(extractTechMentions(text2.toLowerCase()));
  const techIntersection = new Set([...tech1].filter(x => tech2.has(x)));
  const techBonus = techIntersection.size * 0.1;

  // Length normalization factor
  const lengthFactor = Math.min(text1.length, text2.length) / Math.max(text1.length, text2.length);

  return Math.min(1.0, jaccardSimilarity + techBonus) * lengthFactor;
}

/**
 * Analyze text sentiment and tone
 */
export function analyzeTextTone(text: string): {
  sentiment: "positive" | "neutral" | "negative";
  urgency: "low" | "medium" | "high";
  confidence: number;
} {
  const textLower = text.toLowerCase();

  // Sentiment indicators
  const positiveWords = [
    "improve", "enhance", "better", "good", "great", "excellent",
    "optimize", "upgrade", "modernize", "streamline"
  ];
  const negativeWords = [
    "bug", "error", "fail", "broken", "problem", "issue",
    "slow", "bad", "terrible", "crash", "wrong"
  ];
  const urgentWords = [
    "urgent", "critical", "asap", "immediately", "blocker",
    "breaking", "emergency", "deadline", "priority"
  ];

  const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
  const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
  const urgentCount = urgentWords.filter(word => textLower.includes(word)).length;

  // Determine sentiment
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (positiveCount > negativeCount + 1) {
    sentiment = "positive";
  } else if (negativeCount > positiveCount + 1) {
    sentiment = "negative";
  }

  // Determine urgency
  let urgency: "low" | "medium" | "high" = "low";
  if (urgentCount >= 2) {
    urgency = "high";
  } else if (urgentCount >= 1 || negativeCount >= 2) {
    urgency = "medium";
  }

  // Calculate confidence based on indicator strength
  const totalIndicators = positiveCount + negativeCount + urgentCount;
  const confidence = Math.min(100, (totalIndicators / 5) * 100);

  return {
    sentiment,
    urgency,
    confidence
  };
}

/**
 * Extract actionable items from text
 */
export function extractActionableItems(text: string): {
  actions: string[];
  deliverables: string[];
  requirements: string[];
} {
  const textLower = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);

  const actionVerbs = [
    "implement", "create", "build", "develop", "design", "add", "remove",
    "update", "modify", "fix", "repair", "optimize", "improve", "enhance",
    "test", "deploy", "configure", "setup", "install"
  ];

  const deliverableTerms = [
    "deliverable", "output", "result", "artifact", "document", "report",
    "dashboard", "interface", "api", "service", "component", "feature"
  ];

  const requirementTerms = [
    "must", "should", "need", "require", "necessary", "essential",
    "mandatory", "critical", "important", "have to"
  ];

  const actions = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    return actionVerbs.some(verb => lower.includes(verb));
  });

  const deliverables = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    return deliverableTerms.some(term => lower.includes(term));
  });

  const requirements = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    return requirementTerms.some(term => lower.includes(term));
  });

  return {
    actions: actions.slice(0, 5), // Limit to top 5
    deliverables: deliverables.slice(0, 3),
    requirements: requirements.slice(0, 3)
  };
}

/**
 * Estimate reading and implementation time
 */
export function estimateTimeRequirements(text: string, category?: string): {
  readingTime: number; // in minutes
  implementationTime: {
    min: number; // in hours
    max: number; // in hours
    confidence: "low" | "medium" | "high";
  };
} {
  // Reading time estimation (average 200 words per minute)
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Implementation time based on complexity and category
  const complexity = estimateComplexity(text);
  const techMentions = extractTechMentions(text);

  let baseHours = 2; // Default base implementation time
  let multiplier = 1;
  let confidence: "low" | "medium" | "high" = "medium";

  // Category-based adjustments
  if (category) {
    const categoryMultipliers = {
      "architecture": 3.0,
      "feature-idea": 1.5,
      "technical-debt": 1.2,
      "bug-insight": 0.8,
      "optimization": 1.3,
      "process-improvement": 0.6,
      "research-topic": 0.5
    };
    multiplier *= categoryMultipliers[category as keyof typeof categoryMultipliers] || 1;
  }

  // Complexity adjustments
  const complexityMultipliers = {
    low: 0.8,
    medium: 1.2,
    high: 2.0
  };
  multiplier *= complexityMultipliers[complexity];

  // Technical complexity bonus
  if (techMentions.length > 3) {
    multiplier *= 1.3;
    confidence = "low"; // More tech = more uncertainty
  }

  // Integration complexity
  if (text.toLowerCase().includes("integration") ||
      text.toLowerCase().includes("multiple services")) {
    multiplier *= 1.5;
    confidence = "low";
  }

  const minHours = Math.round(baseHours * multiplier * 0.7);
  const maxHours = Math.round(baseHours * multiplier * 1.8);

  return {
    readingTime,
    implementationTime: {
      min: minHours,
      max: maxHours,
      confidence
    }
  };
}

/**
 * Generate text summary with key points
 */
export function generateTextSummary(text: string, maxLength: number = 150): {
  summary: string;
  keyPoints: string[];
  wordCount: number;
} {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const wordCount = text.split(/\s+/).length;

  // Extract key points (sentences with important terms)
  const importantTerms = [
    "implement", "create", "improve", "fix", "optimize", "enhance",
    "critical", "important", "must", "should", "need", "problem",
    "feature", "bug", "performance", "security", "user"
  ];

  const keyPoints = sentences
    .filter(sentence => {
      const lower = sentence.toLowerCase();
      return importantTerms.some(term => lower.includes(term));
    })
    .slice(0, 3); // Top 3 key points

  // Generate summary
  let summary = "";
  let currentLength = 0;

  for (const sentence of sentences) {
    if (currentLength + sentence.length <= maxLength) {
      summary += (summary ? " " : "") + sentence;
      currentLength += sentence.length + 1;
    } else {
      // Add partial sentence if space allows
      const remaining = maxLength - currentLength - 3; // Save space for "..."
      if (remaining > 20) {
        summary += " " + sentence.substring(0, remaining) + "...";
      }
      break;
    }
  }

  // Fallback if summary is too short
  if (summary.length < 50 && text.length > 50) {
    summary = text.substring(0, maxLength - 3) + "...";
  }

  return {
    summary: summary || text.substring(0, maxLength),
    keyPoints,
    wordCount
  };
}

/**
 * Validate and clean text input
 */
export function cleanAndValidateText(text: string): {
  cleaned: string;
  warnings: string[];
  isValid: boolean;
} {
  const warnings: string[] = [];
  let cleaned = text;

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Check for minimum length
  if (cleaned.length < 10) {
    warnings.push("Text is very short - may not provide enough context for analysis");
  }

  // Check for maximum length
  if (cleaned.length > 5000) {
    warnings.push("Text is very long - consider breaking into smaller thoughts");
    cleaned = cleaned.substring(0, 5000) + "... [truncated]";
  }

  // Check for special characters that might cause issues
  const specialChars = /[<>{}[\]]/g;
  if (specialChars.test(cleaned)) {
    warnings.push("Contains special characters that might affect processing");
  }

  // Check for potentially sensitive information
  const sensitivePatterns = [
    /password/i, /secret/i, /token/i, /key.*[:=]/i, /api.*key/i
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(cleaned)) {
      warnings.push("May contain sensitive information - review before sharing");
      break;
    }
  }

  const isValid = warnings.length === 0 || warnings.every(w =>
    !w.includes("very short") && !w.includes("sensitive information")
  );

  return {
    cleaned,
    warnings,
    isValid
  };
}