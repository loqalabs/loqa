import { basename, dirname, join } from "path";
import { KNOWN_REPOSITORIES_LIST } from "../config/repositories.js";
import { LoqaIssueManager } from "../managers/index.js";
import { IssueProviderManager } from "../managers/issue-provider-manager.js";
import {
  CapturedThought,
  IssueCreationOptions as LegacyIssueCreationOptions,
} from "../types/index.js";
import { IssueProvider } from "../types/issue-provider.js";
import { resolveWorkspaceRoot } from "../utils/workspace-resolver.js";

// Interview system imports
import { TaskCreationInterviewer } from "../utils/task-creation-interviewer.js";
import { TaskInterviewStorage } from "../utils/task-interview-storage.js";
import { InterviewContextManager } from "../utils/interview-context-manager.js";

// Import from split modules
import {
  deriveIssueTitle,
  detectThoughtCategory,
  createSimpleIssue,
} from "./handlers.js";

/**
 * Create comprehensive issue text from interview data for existing issue management system
 */
function createIssueTextFromInterview(interview: any): string {
  const answers = interview.answers;

  let issueText = `# ${answers.title || 'Untitled Task'}\n\n`;

  if (answers.description) {
    issueText += `## Description\n\n${answers.description}\n\n`;
  }

  if (answers.acceptance_criteria) {
    issueText += `## Acceptance Criteria\n\n${answers.acceptance_criteria}\n\n`;
  }

  if (answers.technical_notes) {
    issueText += `## Technical Notes\n\n${answers.technical_notes}\n\n`;
  }

  if (answers.affected_repos) {
    issueText += `## Affected Repositories\n\n${answers.affected_repos}\n\n`;
  }

  if (answers.breaking_change === 'yes') {
    issueText += `## ⚠️ Breaking Change\n\nThis change will affect other services and requires coordinated deployment.\n\n`;
  }

  issueText += `## Metadata\n\n`;
  issueText += `- **Type**: ${interview.issueType}\n`;
  issueText += `- **Priority**: ${interview.priority}\n`;
  issueText += `- **Repository**: ${answers.repository}\n`;
  issueText += `- **Created from**: ${interview.originalInput}\n`;
  issueText += `- **Interview ID**: ${interview.id}\n`;

  return issueText;
}
import {
  analyzeCurrentProjectState,
  evaluateComprehensiveThought,
  evaluateThoughtPriority,
  findRelatedExistingIssues,
  performAdvancedThoughtAnalysis,
} from "./thought-analysis.js";
import { estimateThoughtUrgency, mapCategoryToIssueType } from "./utilities.js";

export const issueManagementTools = [
  {
    name: "issue:CaptureThought",
    description: "Capture a quick thought or idea for later processing",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "The thought or idea content" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Optional tags to categorize the thought",
        },
        context: {
          type: "string",
          description: "Optional context about where this thought came from",
        },
        forceNew: {
          type: "boolean",
          description: "Force creation of new thought even if similar ones exist",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "issue:UpdateThought",
    description: "Update an existing thought with additional content",
    inputSchema: {
      type: "object",
      properties: {
        thoughtId: { type: "string", description: "ID of the thought to update" },
        additionalContent: { type: "string", description: "New content to append to the thought" },
        newTags: {
          type: "array",
          items: { type: "string" },
          description: "Optional new tags to add to the thought",
        },
      },
      required: ["thoughtId", "additionalContent"],
    },
  },
  {
    name: "issue:DeleteThought",
    description: "Delete a thought by ID",
    inputSchema: {
      type: "object",
      properties: {
        thoughtId: { type: "string", description: "ID of the thought to delete" },
      },
      required: ["thoughtId"],
    },
  },
  {
    name: "issue:ManageThoughts",
    description: "Get aging thoughts and thought management recommendations",
    inputSchema: {
      type: "object",
      properties: {
        daysOld: { type: "number", description: "Number of days to consider thoughts as aging (default: 7)" },
        action: {
          type: "string",
          description: "Management action to perform",
          enum: ["review", "cleanup", "stats"]
        },
      },
    },
  },
  {
    name: "issue:ConvertThoughtToIssue",
    description: "Convert a thought to a GitHub issue",
    inputSchema: {
      type: "object",
      properties: {
        thoughtId: { type: "string", description: "ID of the thought to convert" },
        repository: { type: "string", description: "Target repository for the GitHub issue (optional)" },
        priority: {
          type: "string",
          description: "Issue priority",
          enum: ["High", "Medium", "Low"]
        },
        assignee: { type: "string", description: "GitHub username to assign the issue to (optional)" },
      },
      required: ["thoughtId"],
    },
  },
  {
    name: "issue:CaptureComprehensiveThought",
    description:
      "Capture complex thoughts with full context, automatic categorization, and intelligent follow-up suggestions",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The detailed thought or idea content",
        },
        category: {
          type: "string",
          description: "Category of the thought",
          enum: [
            "architecture",
            "feature-idea",
            "technical-debt",
            "process-improvement",
            "research-topic",
            "bug-insight",
            "optimization",
          ],
        },
        context: {
          type: "string",
          description: "Context about where this thought originated",
        },
        relatedRepositories: {
          type: "array",
          items: { type: "string" },
          description: "Repositories this thought relates to",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Custom tags for categorization",
        },
        urgency: {
          type: "string",
          description: "Urgency level for acting on this thought",
          enum: ["immediate", "next-sprint", "planned", "future"],
        },
      },
      required: ["content", "category"],
    },
  },
  {
    name: "issue:ListIssues",
    description: "List current GitHub Issues in the repository",
    inputSchema: {
      type: "object",
      properties: {
        repoPath: {
          type: "string",
          description:
            "Optional repository path (defaults to current directory)",
        },
      },
    },
  },
  {
    name: "issue:CreateFromThought",
    description:
      "Create a structured issue from an evaluated thought/idea with pre-filled template suggestions",
    inputSchema: {
      type: "object",
      properties: {
        thoughtContent: {
          type: "string",
          description: "The original thought/idea content",
        },
        suggestedTemplate: {
          type: "string",
          description: "AI-suggested template based on evaluation",
          enum: [
            "feature",
            "bug-fix",
            "protocol-change",
            "cross-repo",
            "general",
          ],
        },
        suggestedPriority: {
          type: "string",
          description: "AI-suggested priority based on evaluation",
          enum: ["High", "Medium", "Low"],
        },
        category: { type: "string", description: "AI-determined category" },
        customTitle: {
          type: "string",
          description:
            "Custom title for the issue (optional, will derive from thought if not provided)",
        },
        additionalContext: {
          type: "string",
          description:
            "Additional context or requirements to include in the issue",
        },
      },
      required: [
        "thoughtContent",
        "suggestedTemplate",
        "suggestedPriority",
        "category",
      ],
    },
  },
  {
    name: "issue:CreateSimple",
    description:
      "Create a simple issue directly without complex workflows",
    inputSchema: {
      type: "object",
      properties: {
        initialInput: {
          type: "string",
          description: "The issue idea, description, or thought",
        },
      },
      required: ["initialInput"],
    },
  },
  {
    name: "issue:AppendToExistingIssue",
    description:
      "Append a thought or additional content to an existing issue file",
    inputSchema: {
      type: "object",
      properties: {
        issueFile: {
          type: "string",
          description:
            "The issue filename to append to (e.g., 'issue-001-feature-name.md')",
        },
        repository: {
          type: "string",
          description:
            "The repository containing the issue (e.g., 'loqa-hub', 'loqa-commander')",
        },
        content: {
          type: "string",
          description: "The content to append to the issue",
        },
        sectionTitle: {
          type: "string",
          description:
            "Optional section title for the appended content (defaults to 'Additional Thoughts')",
        },
      },
      required: ["issueFile", "repository", "content"],
    },
  },
  {
    name: "issue:StartInterview",
    description: "Start an intelligent interview to create a fully-fleshed GitHub issue",
    inputSchema: {
      type: "object",
      properties: {
        initialInput: {
          type: "string",
          description: "Initial description or idea for the issue",
        },
        skipKnownAnswers: {
          type: "boolean",
          description: "Skip questions where answers can be inferred from input",
        },
      },
      required: ["initialInput"],
    },
  },
  {
    name: "issue:AnswerInterviewQuestion",
    description: "Answer a question in an active interview",
    inputSchema: {
      type: "object",
      properties: {
        interviewId: {
          type: "string",
          description: "The interview ID to respond to",
        },
        answer: {
          type: "string",
          description: "Answer to the current question",
        },
      },
      required: ["interviewId", "answer"],
    },
  },
  {
    name: "issue:ListActiveInterviews",
    description: "List all active interviews that can be resumed",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "issue:ProcessConversationalResponse",
    description: "Process a conversational response, automatically handling active interviews",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The user's conversational message",
        },
        contextHint: {
          type: "string",
          description: "Optional context hint for processing",
        },
      },
      required: ["message"],
    },
  },
];

/**
 * Main handler for issue management tool calls
 */
export async function handleIssueManagementTool(
  name: string,
  args: any
): Promise<any> {
  // Intelligently resolve the workspace root
  const workspaceRoot = await resolveWorkspaceRoot(args);

  const issueManager = new LoqaIssueManager(workspaceRoot);

  switch (name) {
    case "issue:CaptureThought": {
      const { content, tags = [], context, forceNew = false } = args;

      const thought: CapturedThought = {
        content,
        tags,
        timestamp: new Date(),
        context,
      };

      try {
        // Phase 2: Intelligent category detection for simple thoughts
        const detectedCategory = detectThoughtCategory(content, tags);
        const estimatedUrgency = estimateThoughtUrgency(content);

        // Phase 2: Advanced analysis for simple thoughts too
        const advancedAnalysis = await performAdvancedThoughtAnalysis(
          content,
          [...tags, detectedCategory],
          context,
          detectedCategory,
          estimatedUrgency,
          workspaceRoot
        );

        // Legacy analysis for compatibility
        const projectState = await analyzeCurrentProjectState(workspaceRoot);
        const relatedIssues = await findRelatedExistingIssues(
          content,
          tags,
          context,
          projectState
        );

        // Evaluate thought priority and suggest issue creation if warranted
        const evaluation = await evaluateThoughtPriority(
          content,
          tags,
          context,
          workspaceRoot
        );

        // Check for similar existing thoughts before storing (unless forceNew is true)
        const similarThoughts = !forceNew ? await issueManager.findSimilarThoughts(thought) : [];
        let thoughtResult: any;

        if (!forceNew && similarThoughts.length > 0 && similarThoughts[0].similarity > 25) {
          // High similarity - suggest updating existing thought
          const bestMatch = similarThoughts[0];
          thoughtResult = { success: true, updatedExisting: true, similarThought: bestMatch };
        } else {
          // No similar thoughts, low similarity, or forced new - create new thought
          thoughtResult = await issueManager.captureThought(thought);
        }

        let responseText = `🧠 **Smart Thought Analysis**\n🏷️ **Tags**: ${
          tags.join(", ") || "None"
        } | **Category**: ${detectedCategory} | **Urgency**: ${estimatedUrgency}\n\n🔍 **Analysis**: Impact: ${
          advancedAnalysis.projectImpact
        } | Complexity: ${advancedAnalysis.implementationComplexity} | Value: ${
          advancedAnalysis.projectValue
        }/100${
          advancedAnalysis.crossServiceImpact.length > 0
            ? ` | Affects: ${advancedAnalysis.crossServiceImpact.join(", ")}`
            : ""
        }\n`;

        // Handle similar thought detection
        if (thoughtResult.updatedExisting) {
          const similarThought = thoughtResult.similarThought;
          responseText += `\n🔗 **Similar Thought Found!**\n\n`;
          responseText += `**📋 Existing Thought**: "${similarThought.thought.content.substring(0, 100)}${similarThought.thought.content.length > 100 ? '...' : ''}"\n`;
          responseText += `**🎯 Similarity Score**: ${similarThought.similarity}%\n`;
          responseText += `**🔍 Reasons**: ${similarThought.reasons.join(' • ')}\n\n`;
          responseText += `**💡 Recommendation**: This thought is very similar to an existing one. Would you like to:\n\n`;
          responseText += `**Option 1**: Update the existing thought with your new content\n`;
          responseText += `**Option 2**: Create a new thought anyway\n\n`;
          responseText += `**To update existing**: Use \`issue:UpdateThought\` with ID "${similarThought.thought.id}"\n`;
          responseText += `**To create new**: Use \`issue:CaptureThought\` again with \`forceNew: true\`\n`;

          return {
            content: [
              {
                type: "text",
                text: responseText,
              },
            ],
          };
        }

        // Prioritize suggesting addition to existing issues over creating new ones
        if (relatedIssues.length > 0) {
          const bestMatch = relatedIssues[0];
          responseText += `\n\n🎯 **Related Issue Found!** This thought might relate to an existing issue:\n\n`;
          responseText += `**📋 Issue**: ${bestMatch.issue.title} (${bestMatch.issue.repo})\n`;
          responseText += `**🔗 Match Reason**: ${bestMatch.reason}\n`;
          responseText += `**📊 Similarity Score**: ${bestMatch.similarity}\n\n`;

          if (bestMatch.similarity > 25) {
            responseText += `**🎯 Recommendation**: Consider adding this thought to the existing issue instead of creating a new one.\n\n`;
            responseText += `**Issue Location**: GitHub Issue #${bestMatch.issue.number} in \`${bestMatch.issue.repo}\`\n\n`;
            responseText += `**Quick Actions**:\n`;
            responseText += `• **Add to existing**: Use \`/append-to-issue "${bestMatch.issue.issueFile}" "${bestMatch.issue.repo}" "${content}"\`\n`;
            responseText += `• **Create new issue**: Use \`issue:CreateSimple\` with "${content}"`;
          } else {
            responseText += `**💡 Note**: There's a potential connection, but your thought might warrant a separate issue.\n\n`;
            if (evaluation.shouldSuggestIssue) {
              responseText += `**🚀 Priority Assessment**: This thought appears to align with current project goals!\n\n`;
              responseText += `**Why it matters**: ${evaluation.reasoning}\n\n`;
              responseText += `**💪 Suggested Action**: Create a new issue with:\n`;
              responseText += `• Template: \`${evaluation.suggestedTemplate}\`\n`;
              responseText += `• Priority: \`${evaluation.suggestedPriority}\`\n`;
              responseText += `• Category: ${evaluation.category}\n\n`;
              responseText += `**Ready to create?** Use \`issue:CreateSimple\` with "${content}"`;
            }
          }
        } else if (evaluation.shouldSuggestIssue) {
          responseText += `\n\n🚀 **Priority Assessment**: This thought appears to align with current project goals!\n\n**Why it matters**: ${evaluation.reasoning}\n\n**💪 Suggested Action**: Create an issue with:\n• Template: \`${evaluation.suggestedTemplate}\`\n• Priority: \`${evaluation.suggestedPriority}\`\n• Category: ${evaluation.category}\n\n**Ready to create?** Use \`issue:CreateSimple\` with "${content}"`;
        } else {
          responseText += `\n\n**Next Steps**: Review the thought later and convert to a formal issue if needed.`;
        }

        return {
          content: [
            {
              type: "text",
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to capture thought: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }

    case "issue:CaptureComprehensiveThought": {
      const {
        content,
        category,
        context,
        relatedRepositories = [],
        tags = [],
        urgency = "planned",
      } = args;

      const thought: CapturedThought = {
        content,
        tags: [...tags, category, urgency],
        timestamp: new Date(),
        context:
          context ||
          `Category: ${category}, Urgency: ${urgency}, Repositories: ${relatedRepositories.join(
            ", "
          )}`,
      };

      try {
        // Phase 2: Advanced Thought Analysis with Sprint Alignment
        const advancedAnalysis = await performAdvancedThoughtAnalysis(
          content,
          [...tags, category, urgency],
          context,
          category,
          urgency,
          workspaceRoot
        );

        // Legacy analysis for compatibility
        const projectState = await analyzeCurrentProjectState(workspaceRoot);
        const relatedIssues = await findRelatedExistingIssues(
          content,
          [...tags, category, urgency],
          context,
          projectState
        );
        const evaluation = await evaluateComprehensiveThought(
          content,
          category,
          urgency,
          relatedRepositories,
          workspaceRoot
        );

        const _result = await issueManager.captureThought(thought);

        let responseText = `🧠 **Advanced Analysis**\n📂 ${category} | ⚡ ${urgency} | 🏷️ ${
          tags.join(", ") || "None"
        } | 🗂️ ${
          relatedRepositories.join(", ") || "None"
        }\n\n🔍 **Results**: Impact: ${advancedAnalysis.projectImpact.toUpperCase()} | Sprint: ${
          advancedAnalysis.sprintAlignment
        } | Value: ${advancedAnalysis.projectValue}/100 | Complexity: ${
          advancedAnalysis.implementationComplexity
        } | Timeline: ${advancedAnalysis.timelineSuggestion}${
          advancedAnalysis.crossServiceImpact.length > 0
            ? `\n🔗 **Cross-Service Impact**: ${advancedAnalysis.crossServiceImpact.join(
                ", "
              )}`
            : ""
        }${
          advancedAnalysis.contextualInsights.length > 0
            ? `\n💡 **Insights**: ${advancedAnalysis.contextualInsights.join(
                " • "
              )}`
            : ""
        }\n`;

        // Action Recommendation based on AI Analysis
        const actionMap = {
          schedule_discussion: `**Schedule Team Discussion** - ${advancedAnalysis.implementationComplexity} complexity requires planning`,
          add_to_existing:
            "**Add to Existing Issue** - High alignment with current work",
          create_comprehensive_issue: `**Create Issue** - Use: \`issue:CreateSimple\` with "${content.substring(
            0,
            50
          )}..."\``,
          create_simple_issue: `**Create Simple Issue** - Use: \`issue:CreateSimple\` with "${content.substring(
            0,
            50
          )}..."\``,
          capture_only:
            "**Captured for Future Reference** - Available for future planning sessions",
        };
        responseText += `🎯 **Action**: ${
          actionMap[
            advancedAnalysis.actionRecommendation as keyof typeof actionMap
          ] || actionMap["capture_only"]
        }\n`;

        // Check for existing issue matches first, especially for comprehensive thoughts
        if (relatedIssues.length > 0) {
          const bestMatch = relatedIssues[0];
          responseText += `\n\n🎯 **Existing Issue Analysis**:\n\n`;
          responseText += `**📋 Best Match**: ${bestMatch.issue.title} (${bestMatch.issue.repo})\n`;
          responseText += `**🔗 Match Strength**: ${bestMatch.reason}\n`;
          responseText += `**📊 Similarity**: ${bestMatch.similarity}\n\n`;

          // For comprehensive thoughts, we're more conservative about recommending merging
          if (bestMatch.similarity > 35) {
            responseText += `**🎯 Strong Match Detected**: This ${category} thought appears to significantly overlap with an existing issue.\n\n`;
            responseText += `**💡 Recommendation**: Consider enhancing the existing issue with your comprehensive insights rather than creating a duplicate.\n\n`;
            responseText += `**Issue Location**: GitHub Issue #${bestMatch.issue.number} in \`${bestMatch.issue.repo}\`\n\n`;
            responseText += `**Quick Actions**:\n`;
            responseText += `• **Enhance existing**: \`issue:AppendToExistingIssue\` with issue "${bestMatch.issue.issueFile}" in "${bestMatch.issue.repo}"\n`;
            responseText += `• **Create related**: Use \`issue:CreateSimple\` for a complementary issue\n`;
            responseText += `• **Create independent**: If truly different, create new issue anyway`;
          } else {
            responseText += `**💡 Potential Connection**: Found related work, but your ${category} thought may warrant separate attention.\n\n`;
            if (evaluation.shouldSuggestIssue) {
              responseText += `**🎯 Intelligent Assessment**: This ${category} thought has high project value!\n\n`;
              responseText += `**Impact Analysis**: ${evaluation.reasoning}\n\n`;
              responseText += `**🚀 Recommended Action**: Create a new issue with:\n`;
              responseText += `• Template: \`${evaluation.suggestedTemplate}\`\n`;
              responseText += `• Priority: \`${evaluation.suggestedPriority}\`\n`;
              responseText += `• Scope: ${evaluation.scope}\n`;
              responseText += `• Estimated Effort: ${evaluation.estimatedEffort}\n\n`;
              responseText += `**Create issue?** Use \`issue:CreateSimple\` with "${content}"`;
            }
          }

          // Show additional related issues if they exist
          if (relatedIssues.length > 1) {
            responseText += `\n\n**📋 Other Related Issues (${
              relatedIssues.length - 1
            }):**\n`;
            relatedIssues.slice(1, 4).forEach((issue: any, index: number) => {
              responseText += `${index + 2}. ${issue.issue.title} (${
                issue.issue.repo
              }) - Score: ${issue.similarity}\n`;
            });
            if (relatedIssues.length > 4) {
              responseText += `... and ${relatedIssues.length - 4} more`;
            }
          }
        } else if (evaluation.shouldSuggestIssue) {
          responseText += `\n\n🎯 **Intelligent Assessment**: This ${category} thought has high project value!\n\n**Impact Analysis**: ${evaluation.reasoning}\n\n**🚀 Recommended Action**: Create an active issue with:\n• Template: \`${evaluation.suggestedTemplate}\`\n• Priority: \`${evaluation.suggestedPriority}\`\n• Scope: ${evaluation.scope}\n• Estimated Effort: ${evaluation.estimatedEffort}\n\n**Create issue?** Use \`issue:CreateSimple\` with "${content}"`;
        } else {
          responseText += `\n\n📋 **Status**: Captured as ${urgency} priority. ${evaluation.reasoning}`;
        }

        return {
          content: [
            {
              type: "text",
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to capture comprehensive thought: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }

    case "issue:ListIssues": {
      const { repoPath } = args;

      try {
        // If specific repo specified, use single repo mode
        if (repoPath) {
          const result = await issueManager.listIssues(repoPath);
          const issuesList = result.issues.map((t) => `• ${t}`).join("\n");
          const draftsList = (result.drafts || []).map((d) => `• ${d}`).join("\n");

          return {
            content: [
              {
                type: "text",
                text: `📋 **Current Issue Status** (${repoPath})\n\n**📝 Issues (${
                  result.issues.length
                }):**\n${issuesList || "No issues found"}\n\n**💭 Drafts (${
                  (result.drafts || []).length
                }):**\n${draftsList || "No drafts found"}`,
              },
            ],
          };
        }

        // Multi-repository mode: scan all repositories
        const knownRepositories = KNOWN_REPOSITORIES_LIST;

        // Determine actual workspace root
        const actualWorkspaceRoot = knownRepositories.includes(
          basename(workspaceRoot)
        )
          ? dirname(workspaceRoot)
          : workspaceRoot;

        let allIssues: string[] = [];
        let allDrafts: string[] = [];
        let repoSummaries: string[] = [];

        for (const repoName of knownRepositories) {
          try {
            const repoPath = join(actualWorkspaceRoot, repoName);
            const repoIssueManager = new LoqaIssueManager(repoPath);
            const result = await repoIssueManager.listIssues();

            if (result.issues.length > 0 || (result.drafts || []).length > 0) {
              repoSummaries.push(
                `**${repoName}**: ${result.issues.length} issues, ${(result.drafts || []).length} drafts`
              );

              // Add repo prefix to issues and drafts
              allIssues.push(
                ...result.issues.map((issue) => `${issue} (${repoName})`)
              );
              allDrafts.push(
                ...(result.drafts || []).map((draft) => `${draft} (${repoName})`)
              );
            }
          } catch (error) {
            // Repository doesn't exist or no issues - skip silently
            continue;
          }
        }

        const issuesList = allIssues.map((t) => `• ${t}`).join("\n");
        const draftsList = allDrafts.map((d) => `• ${d}`).join("\n");
        const repoSummary = repoSummaries.join("\n");

        return {
          content: [
            {
              type: "text",
              text: `📋 **Workspace-Wide Issue Status**\n\n${repoSummary}\n\n**📝 All Issues (${
                allIssues.length
              }):**\n${issuesList || "No issues found"}\n\n**💭 All Drafts (${
                allDrafts.length
              }):**\n${draftsList || "No drafts found"}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to list issues: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }

    case "issue:CreateFromThought": {
      const {
        thoughtContent,
        suggestedTemplate,
        suggestedPriority,
        category,
        customTitle,
        _additionalContext,
      } = args;

      // Simple issue creation for straightforward cases
      const title = customTitle || deriveIssueTitle(thoughtContent);

      const options: LegacyIssueCreationOptions = {
        title,
        template: suggestedTemplate,
        priority: suggestedPriority as "High" | "Medium" | "Low",
        type: mapCategoryToIssueType(category),
        assignee: undefined, // Let template handle default assignee
      };

      try {
        const result = await issueManager.createIssueFromTemplate(options);

        return {
          content: [
            {
              type: "text",
              text: `🚀 **Issue Created from Thought!**\n\n📋 **Issue ID**: ${result.issue?.number || 'N/A'}\n📝 **Template**: ${suggestedTemplate}\n⭐ **Priority**: ${suggestedPriority}\n📂 **Category**: ${category}\n\n**Original Thought**: "${thoughtContent}"\n\n**Next Steps**: The issue is now ready for work and has been added to your active issues.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to create issue from thought: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }

    case "issue:CreateSimple": {
      const { initialInput } = args;

      try {
        const result = await createSimpleIssue(initialInput, workspaceRoot);

        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to create simple issue: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }

    case "issue:AppendToExistingIssue": {
      const {
        issueFile,
        repository,
        content,
        sectionTitle = "Additional Thoughts",
      } = args;

      try {
        // Extract issue number from issue file (e.g., "123" from "issue-123.md" or "123.md")
        const issueNumber = issueFile.match(/(\d+)/)?.[1];

        if (!issueNumber) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Invalid issue file format: \`${issueFile}\`. Expected format with issue number (e.g., "123.md" or "issue-123.md")`,
              },
            ],
          };
        }

        // Initialize GitHub API or issue provider
        const issueProviderManager = new IssueProviderManager({
          preferredProvider: IssueProvider.GITHUB,
          fallbackEnabled: true,
        });

        try {
          // Add comment to GitHub Issue
          const timestamp = new Date().toLocaleString();
          const _commentBody = `## ${sectionTitle}\n*Added on ${timestamp}*\n\n${content}`;

          // Note: GitHub comment functionality temporarily disabled during migration
          // TODO: Implement GitHub API comment functionality
          const result = {
            success: false,
            error:
              "GitHub comment functionality temporarily disabled during migration",
          };

          if (result.success) {
            return {
              content: [
                {
                  type: "text",
                  text: `✅ **Comment Added to GitHub Issue!**\n\n📋 **Issue**: #${issueNumber}\n📁 **Repository**: ${repository}\n📝 **Section**: ${sectionTitle}\n\n**Added Content**:\n${content}\n\n**Next Steps**: The comment has been added to the GitHub Issue and is visible to all collaborators.`,
                },
              ],
            };
          } else {
            throw new Error(
              result.error || "Failed to add comment to GitHub Issue"
            );
          }
        } finally {
          issueProviderManager.shutdown();
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to add comment to GitHub Issue in \`${repository}\`: ${
                error instanceof Error ? error.message : "Unknown error"
              }\n\nPlease check:\n• Issue file format is correct\n• Repository name is correct\n• GitHub API access is available\n• Issue exists in ${repository}`,
            },
          ],
        };
      }
    }

    case "issue:UpdateThought": {
      const { thoughtId, additionalContent, newTags = [] } = args;

      try {
        const result = await issueManager.updateThought(thoughtId, additionalContent, newTags);

        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: `✅ **Thought Updated Successfully!**\n\n📋 **Thought ID**: ${thoughtId}\n📝 **Added Content**: ${additionalContent.substring(0, 100)}${additionalContent.length > 100 ? '...' : ''}\n🏷️ **New Tags**: ${newTags.length > 0 ? newTags.join(', ') : 'None'}\n\n**Next Steps**: The thought has been updated with your additional content and is available in your thought storage.`,
              },
            ],
          };
        } else {
          throw new Error(result.error || 'Failed to update thought');
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to update thought: ${
                error instanceof Error ? error.message : "Unknown error"
              }\n\nPlease check that the thought ID is correct and try again.`,
            },
          ],
        };
      }
    }

    case "issue:DeleteThought": {
      const { thoughtId } = args;

      try {
        const result = await issueManager.deleteThought(thoughtId);

        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: `🗑️ **Thought Deleted Successfully!**\n\n📋 **Thought ID**: ${thoughtId}\n\n**Status**: The thought has been permanently removed from your thought storage.`,
              },
            ],
          };
        } else {
          throw new Error(result.error || 'Failed to delete thought');
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to delete thought: ${
                error instanceof Error ? error.message : "Unknown error"
              }\n\nPlease check that the thought ID is correct and try again.`,
            },
          ],
        };
      }
    }

    case "issue:ManageThoughts": {
      const { daysOld = 7, action = "review" } = args;

      try {
        const agingData = await issueManager.getAgingThoughts(daysOld);

        if (action === "stats") {
          return {
            content: [
              {
                type: "text",
                text: `📊 **Thought Storage Statistics**\n\n📈 **Overview**:\n• Total Thoughts: ${agingData.stats.totalThoughts}\n• Aging Thoughts (${daysOld}+ days): ${agingData.stats.agingCount}\n• Stale Thoughts (${daysOld * 2}+ days): ${agingData.stats.staleCount}\n• Average Age: ${agingData.stats.averageAge} days\n\n${agingData.stats.agingCount > 0 || agingData.stats.staleCount > 0 ? '💡 **Recommendation**: Use `issue:ManageThoughts` with `action: "review"` to see specific thoughts that need attention.' : '✅ **All thoughts are fresh!** No aging thoughts found.'}`,
              },
            ],
          };
        }

        let responseText = `🧠 **Thought Lifecycle Management**\n\n`;

        if (agingData.stats.staleCount > 0) {
          responseText += `🚨 **Stale Thoughts (${daysOld * 2}+ days old)**: ${agingData.stats.staleCount}\n`;
          agingData.stale.slice(0, 3).forEach((thought: any) => {
            const age = Math.round((Date.now() - new Date(thought.createdAt).getTime()) / (24 * 60 * 60 * 1000));
            responseText += `• **${thought.id}** (${age} days): "${thought.content.substring(0, 60)}..."\n`;
          });
          if (agingData.stale.length > 3) {
            responseText += `• ... and ${agingData.stale.length - 3} more\n`;
          }
          responseText += `\n`;
        }

        if (agingData.stats.agingCount > 0) {
          responseText += `⚠️ **Aging Thoughts (${daysOld}-${daysOld * 2} days old)**: ${agingData.stats.agingCount}\n`;
          agingData.aging.slice(0, 3).forEach((thought: any) => {
            const age = Math.round((Date.now() - new Date(thought.createdAt).getTime()) / (24 * 60 * 60 * 1000));
            responseText += `• **${thought.id}** (${age} days): "${thought.content.substring(0, 60)}..."\n`;
          });
          if (agingData.aging.length > 3) {
            responseText += `• ... and ${agingData.aging.length - 3} more\n`;
          }
          responseText += `\n`;
        }

        if (agingData.stats.agingCount === 0 && agingData.stats.staleCount === 0) {
          responseText += `✅ **All thoughts are fresh!** No thoughts older than ${daysOld} days.\n\n`;
        } else {
          responseText += `💡 **Recommended Actions**:\n`;
          responseText += `• **Convert to Issues**: Use \`issue:ConvertThoughtToIssue\` for important thoughts\n`;
          responseText += `• **Delete Old Thoughts**: Use \`issue:DeleteThought\` for outdated ideas\n`;
          responseText += `• **Update Existing**: Use \`issue:UpdateThought\` to refresh with new insights\n\n`;
        }

        responseText += `📈 **Summary**: ${agingData.stats.totalThoughts} total thoughts, average age ${agingData.stats.averageAge} days`;

        return {
          content: [
            {
              type: "text",
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to manage thoughts: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }

    case "issue:ConvertThoughtToIssue": {
      const { thoughtId, priority = "Medium", assignee } = args;

      try {
        // First, get the thought
        const thoughts = await issueManager.getStoredThoughts();
        const thought = thoughts.find((t: any) => t.id === thoughtId);

        if (!thought) {
          return {
            content: [
              {
                type: "text",
                text: `❌ **Thought Not Found**\n\nThought with ID "${thoughtId}" could not be found. Please check the ID and try again.`,
              },
            ],
          };
        }

        // Use existing issue creation logic
        const options = {
          title: `${thought.content.substring(0, 80)}${thought.content.length > 80 ? '...' : ''}`,
          description: `**Original Thought**: ${thought.content}\n\n**Context**: ${thought.context || 'None'}\n\n**Tags**: ${thought.tags.join(', ')}\n\n---\n*Converted from thought ${thoughtId} created on ${new Date(thought.createdAt).toLocaleDateString()}*`,
          priority,
          assignee,
          labels: [...thought.tags, 'from-thought'],
          template: 'general',
        };

        const result = await issueManager.createIssueFromTemplate(options);

        if (result.success) {
          // Delete the thought after successful conversion
          await issueManager.deleteThought(thoughtId);

          return {
            content: [
              {
                type: "text",
                text: `🎯 **Thought Converted to GitHub Issue!**\n\n📋 **Issue Created**: ${result.issue?.number || 'N/A'}\n📝 **Title**: ${options.title}\n⭐ **Priority**: ${priority}\n🏷️ **Labels**: ${options.labels?.join(', ')}\n\n**Original Thought**: "${thought.content.substring(0, 100)}${thought.content.length > 100 ? '...' : ''}"\n\n✅ **Thought deleted** from temporary storage\n\n**Next Steps**: The GitHub issue is now ready for work and tracking.`,
              },
            ],
          };
        } else {
          throw new Error(result.error || 'Failed to create GitHub issue');
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to convert thought to issue: ${
                error instanceof Error ? error.message : "Unknown error"
              }\n\nNote: GitHub Issues integration may not be fully implemented yet.`,
            },
          ],
        };
      }
    }

    case "issue:StartInterview": {
      const { initialInput, skipKnownAnswers = true } = args;

      try {
        const storage = new TaskInterviewStorage(workspaceRoot);
        const interview = await TaskCreationInterviewer.startInterview(
          initialInput,
          workspaceRoot,
          storage
        );

        // Set active interview context for seamless conversation
        const contextManager = InterviewContextManager.getInstance();
        contextManager.setActiveInterview(interview.id, interview.currentQuestion);

        return {
          content: [{
            type: "text",
            text: `🎯 **Starting Intelligent Issue Creation Interview**\n\n**Original Input**: "${initialInput}"\n\n**Interview ID**: \`${interview.id}\`\n\n**First Question**: ${interview.currentQuestion}\n\n*Just reply with your answer - no special commands needed.*`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to start interview: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "issue:AnswerInterviewQuestion": {
      const { interviewId, answer } = args;

      try {
        const storage = new TaskInterviewStorage(workspaceRoot);
        const interview = await TaskCreationInterviewer.processAnswer(interviewId, answer, storage);

        if (!interview) {
          return {
            content: [{
              type: "text",
              text: `❌ Interview not found. It may have expired or been completed.`
            }]
          };
        }

        if (interview.interviewComplete) {
          // Interview completed - prepare GitHub issue data for Claude Code to create
          try {
            const answers = interview.answers;
            const issueData = {
              title: answers.title || 'Untitled Task',
              body: createIssueTextFromInterview(interview),
              repository: answers.repository || 'loqa-hub',
              labels: [
                `type: ${interview.issueType}`,
                `priority: ${interview.priority.toLowerCase()}`,
                ...(answers.breaking_change === 'yes' ? ['type: breaking-change'] : []),
                ...(answers.affected_repos ? ['scope: cross-repo'] : []),
                ...(answers.technical_notes ? ['needs-technical-review'] : [])
              ].filter(Boolean)
            };

            // Clean up completed interview
            await storage.deleteInterview(interviewId);

            const contextManager = InterviewContextManager.getInstance();
            contextManager.clearActiveInterview();

            return {
              content: [{
                type: "text",
                text: `✅ **Interview Complete!** Here's the comprehensive GitHub issue ready to be created:\n\n## Issue Details\n**Title**: ${issueData.title}\n**Repository**: loqalabs/${issueData.repository}\n**Labels**: ${issueData.labels.join(', ')}\n\n## Issue Body\n${issueData.body}\n\n---\n\n**Next Step**: I'll now create this GitHub issue using the GitHub MCP tools.`
              }]
            };
          } catch (error) {
            return {
              content: [{
                type: "text",
                text: `❌ Failed to process interview completion: ${error instanceof Error ? error.message : 'Unknown error'}\n\nInterview data has been preserved. You can try again or create the issue manually.`
              }]
            };
          }
        } else {
          // Continue with next question
          const contextManager = InterviewContextManager.getInstance();
          contextManager.updateLastQuestion(interview.currentQuestion);

          return {
            content: [{
              type: "text",
              text: `📝 **Answer recorded.**\n\n**Next Question**: ${interview.currentQuestion}\n\n*Continue with your answer...*`
            }]
          };
        }
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to process answer: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "issue:ListActiveInterviews": {
      try {
        const storage = new TaskInterviewStorage(workspaceRoot);
        const activeInterviews = await storage.listActiveInterviews();

        if (activeInterviews.length === 0) {
          return {
            content: [{
              type: "text",
              text: `📝 **No Active Interviews**\n\nYou don't have any active interviews at the moment.\n\nUse \`issue:StartInterview\` to begin creating a new GitHub issue with guided questions.`
            }]
          };
        }

        const interviewList = activeInterviews.map(interview => {
          const age = Math.round((Date.now() - interview.createdAt.getTime()) / (1000 * 60));
          return `• **${interview.id}** - ${interview.originalInput.substring(0, 50)}${interview.originalInput.length > 50 ? '...' : ''}\n  *Created ${age} minutes ago, ${interview.questionIndex + 1} questions answered*`;
        }).join('\n\n');

        return {
          content: [{
            type: "text",
            text: `📋 **Active Interviews** (${activeInterviews.length})\n\n${interviewList}\n\nUse \`issue:AnswerInterviewQuestion\` with the interview ID to continue any of these interviews.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to list interviews: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "issue:ProcessConversationalResponse": {
      const { message } = args;
      const contextManager = InterviewContextManager.getInstance();

      // Check if there's an active interview
      if (contextManager.isInActiveInterview()) {
        const interviewId = contextManager.getActiveInterviewId()!;

        // Detect if this message is likely an interview response
        if (contextManager.isLikelyInterviewResponse(message)) {
          // Process the response seamlessly by calling the answer handler
          return await handleIssueManagementTool("issue:AnswerInterviewQuestion", {
            interviewId,
            answer: message
          });
        }
      }

      // Not an interview response, return helpful message
      return {
        content: [{
          type: "text",
          text: `📝 **Message received**: "${message}"\n\n${contextManager.isInActiveInterview()
            ? `💡 **Active Interview**: You're in an interview but your message doesn't look like an answer. The current question is:\n\n"${contextManager.getLastQuestion()}"\n\nPlease provide your answer, or use \`issue:ListActiveInterviews\` to see available interviews.`
            : '💡 **No Active Interview**: Your message was received but there\'s no active interview. Use \`issue:StartInterview\` with your idea to start a new issue creation process.'}`
        }]
      };
    }

    default:
      throw new Error(`Unknown issue management tool: ${name}`);
  }
}

// Removed interview functionality - these exports are no longer needed