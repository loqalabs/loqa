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
import { PreviewStateManager } from "../utils/preview-state-manager.js";
import {
  formatIssueCreationPreview,
  formatCommentCreationPreview,
} from "../utils/preview-formatter.js";

// Interview system imports
import { TaskCreationInterviewer } from "../utils/task-creation-interviewer.js";
import { TaskInterviewStorage } from "../utils/task-interview-storage.js";
import { InterviewContextManager } from "../utils/interview-context-manager.js";

// Import from split modules
import {
  deriveIssueTitle,
  detectThoughtCategory,
  createSimpleIssue,
  mapCategoryToIssueType,
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
import { estimateThoughtUrgency } from "./utilities.js";

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
          enum: ["review", "cleanup", "stats", "list"]
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
        preview_mode: {
          type: "boolean",
          description: "Show preview of changes without executing",
          default: false,
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
        preview_mode: {
          type: "boolean",
          description: "Show preview of changes without executing",
          default: false,
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
        preview_mode = false,
      } = args;

      // Simple issue creation for straightforward cases
      const title = customTitle || deriveIssueTitle(thoughtContent);

      if (preview_mode) {
        // Generate preview of issue that would be created
        const issueType = mapCategoryToIssueType(category);
        const previewData = {
          title: title,
          body: `## Description\n\n${thoughtContent}\n\n## Template\n\n${suggestedTemplate}\n\n## Category\n\n${category}\n\n## Type\n\n${issueType}`,
          labels: [category.toLowerCase(), `${suggestedPriority.toLowerCase()}-priority`],
          assignees: [],
          milestone: undefined,
        };

        const preview = formatIssueCreationPreview(previewData, "current repository");

        return {
          content: [
            {
              type: "text",
              text: preview,
            },
          ],
        };
      }

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
        // Generate preview and store as pending operation
        const title = deriveIssueTitle(initialInput);
        const category = detectThoughtCategory(initialInput, []);
        const issueType = mapCategoryToIssueType(category);

        const previewData = {
          title: title,
          body: `## Description\n\n${initialInput}\n\n## Type\n\n${issueType}`,
          labels: [category.toLowerCase(), "medium-priority"],
          assignees: [],
          milestone: undefined,
        };

        const preview = formatIssueCreationPreview(previewData, "current repository");

        // Store the pending operation
        const previewManager = PreviewStateManager.getInstance();
        const operationId = previewManager.storePendingOperation({
          type: 'create_issue',
          toolName: 'issue:CreateSimple',
          originalArgs: args,
          previewText: preview,
        });

        return {
          content: [
            {
              type: "text",
              text: `${preview}\n\n---\n\n⏸️ **AWAITING YOUR RESPONSE**\n\n**Please review the preview above and respond:**\n✅ **"yes"** or **"confirm"** → Create this issue\n❌ **"no"** or **"cancel"** → Cancel operation\n🔄 **Provide feedback** → Revise with your input\n\n*I'll wait for your decision before proceeding.*`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to preview issue creation: ${
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
        preview_mode = false,
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

        if (preview_mode) {
          // Generate preview of comment that would be added
          const commentPreviewData = {
            body: `## ${sectionTitle}\n*Added on ${new Date().toLocaleString()}*\n\n${content}`,
            issueNumber: parseInt(issueNumber),
            repository: repository,
          };

          const preview = formatCommentCreationPreview(commentPreviewData);

          return {
            content: [
              {
                type: "text",
                text: preview,
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

        if (action === "list") {
          // Get all stored thoughts with their content
          const allThoughts = await issueManager.getStoredThoughts({ limit: 100 });

          if (allThoughts.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `📝 **No Thoughts Found**\n\nYou don't have any captured thoughts yet.\n\n**Create your first thought**: Use \`issue:CaptureThought\` to capture an idea or insight.`,
                },
              ],
            };
          }

          // Format thoughts for display
          const thoughtsList = allThoughts.map((thought, index) => {
            const age = Math.round((Date.now() - new Date(thought.createdAt).getTime()) / (24 * 60 * 60 * 1000));
            const tagsDisplay = thought.tags && thought.tags.length > 0 ? ` 🏷️ ${thought.tags.join(', ')}` : '';
            const contextDisplay = thought.context ? ` 📍 ${thought.context.substring(0, 50)}${thought.context.length > 50 ? '...' : ''}` : '';

            return `${index + 1}. **${thought.id}** (${age} day${age === 1 ? '' : 's'} ago)${tagsDisplay}\n   "${thought.content}"${contextDisplay}`;
          }).join('\n\n');

          const statsInfo = `📊 **Total**: ${allThoughts.length} thought${allThoughts.length === 1 ? '' : 's'}`;

          return {
            content: [
              {
                type: "text",
                text: `📝 **Your Captured Thoughts**\n\n${thoughtsList}\n\n---\n${statsInfo}\n\n**Actions**: Use \`issue:UpdateThought\`, \`issue:DeleteThought\`, or \`issue:ConvertThoughtToIssue\` with the thought ID.`,
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
      const previewManager = PreviewStateManager.getInstance();
      const contextManager = InterviewContextManager.getInstance();

      // Check for pending preview operations first
      const pendingOps = previewManager.getAllPendingOperations();


      if (pendingOps.length > 0) {
        const latestOp = pendingOps[pendingOps.length - 1]; // Get most recent

        // Check for confirmation responses
        const lowerMessage = message.toLowerCase().trim();
        if (lowerMessage === 'yes' || lowerMessage === 'confirm' || lowerMessage === 'y' || lowerMessage === 'ok' || lowerMessage === 'proceed') {
          // Import and use preview confirmation handler directly
          const { handlePreviewConfirmation } = await import('./preview-confirmation.js');
          return await handlePreviewConfirmation("preview:ConfirmOrRevise", {
            operationId: latestOp.id,
            action: "confirm"
          });
        }

        if (lowerMessage === 'no' || lowerMessage === 'cancel' || lowerMessage === 'abort' || lowerMessage === 'n') {
          const { handlePreviewConfirmation } = await import('./preview-confirmation.js');
          return await handlePreviewConfirmation("preview:ConfirmOrRevise", {
            operationId: latestOp.id,
            action: "cancel"
          });
        }

        // If it's not a simple yes/no, treat it as revision input
        if (message.length > 10) { // Reasonable threshold for revision input
          const { handlePreviewConfirmation } = await import('./preview-confirmation.js');
          return await handlePreviewConfirmation("preview:ConfirmOrRevise", {
            operationId: latestOp.id,
            action: "revise",
            revisionInput: message
          });
        }

        // Unclear response with pending operation
        return {
          content: [{
            type: "text",
            text: `🤔 **I didn't understand your response**: "${message}"\n\n**You have a pending operation**: ${latestOp.type.replace('_', ' ')}\n\n✅ Say **"yes"** or **"confirm"** to proceed\n❌ Say **"no"** or **"cancel"** to abort\n🔄 Provide **additional details** to revise the operation\n\n**Operation ID**: \`${latestOp.id}\``
          }]
        };
      }

      // SIMPLIFIED GitHub operations detection (much more reliable)
      const msg = message.toLowerCase();

      // 1. Pull Request Creation - very simple patterns
      if ((msg.includes('create') || msg.includes('make')) && (msg.includes('pr') || msg.includes('pull request'))) {
        const titleMatch = message.match(/[""]([^"""]+)[""]|'([^']+)'|"([^"]+)"/);
        const prTitle = titleMatch ? (titleMatch[1] || titleMatch[2] || titleMatch[3]) : "Pull Request";

        const previewText = `## 🔀 Pull Request Creation Preview\n\n**Title**: ${prTitle}\n**Head Branch**: fix/github-comment-workflow (current)\n**Base Branch**: main\n**Repository**: loqalabs/loqa (detected from context)\n\n**Auto-Generated Description**: Will include commit messages and file changes\n\n---\n\n✅ Reply **"yes"** to create this pull request\n❌ Reply **"no"** to cancel\n🔄 Reply with changes to revise the title or description`;

        const previewManager = PreviewStateManager.getInstance();
        previewManager.storePendingOperation({
          type: 'create_pr',
          toolName: 'github:CreatePR',
          originalArgs: {
            owner: 'loqalabs',
            repo: 'loqa',
            title: prTitle,
            head: 'fix/github-comment-workflow',
            base: 'main',
            body: `Auto-generated PR from conversational workflow\n\nThis pull request was created through natural language processing.`
          },
          previewText
        });

        return {
          content: [{
            type: "text",
            text: previewText
          }]
        };
      }

      // 2. Issue Creation - very simple patterns
      if ((msg.includes('create') || msg.includes('make')) && msg.includes('issue')) {
        // Extract title from message
        const titleMatch = message.match(/[""]([^"""]+)[""]|'([^']+)'|"([^"]+)"/);
        const issueTitle = titleMatch ? (titleMatch[1] || titleMatch[2] || titleMatch[3]) : "New Issue";

        const previewText = `## 📋 Issue Creation Preview\n\n**Title**: ${issueTitle}\n**Repository**: loqalabs/loqa (detected from context)\n**Labels**: feature, medium-priority (auto-detected)\n**Assignees**: None\n\n**Body**: Auto-generated from conversational request\n\n---\n\n✅ Reply **"yes"** to create this issue\n❌ Reply **"no"** to cancel\n🔄 Reply with changes to revise the title, description, or labels`;

        const previewManager = PreviewStateManager.getInstance();
        previewManager.storePendingOperation({
          type: 'create_issue',
          toolName: 'github:CreateIssue',
          originalArgs: {
            owner: 'loqalabs',
            repo: 'loqa',
            title: issueTitle,
            body: `Auto-generated issue from conversational workflow\n\nThis issue was created through natural language processing.`,
            labels: ['feature', 'medium-priority']
          },
          previewText
        });

        return {
          content: [{
            type: "text",
            text: previewText
          }]
        };
      }

      // 3. Issue Editing
      const issueEditMatch = message.match(/edit.*issue.*#?(\d+)|update.*issue.*#?(\d+)|issue.*#?(\d+).*edit|issue.*#?(\d+).*update/i);
      if (issueEditMatch) {
        const issueNumber = parseInt(issueEditMatch[1] || issueEditMatch[2] || issueEditMatch[3] || issueEditMatch[4]);

        // Extract what to edit
        let updates: any = {};
        let updatesList: string[] = [];

        const titleMatch = message.match(/title.*[""]([^"""]+)[""]|title.*'([^']+)'|title.*"([^"]+)"/i);
        if (titleMatch) {
          updates.title = titleMatch[1] || titleMatch[2] || titleMatch[3];
          updatesList.push('title');
        }

        const labelMatch = message.match(/label.*[""]([^"""]+)[""]|label.*'([^']+)'|label.*"([^"]+)"/i);
        if (labelMatch) {
          updates.labels = [labelMatch[1] || labelMatch[2] || labelMatch[3]];
          updatesList.push('labels');
        }

        if (message.toLowerCase().includes('close')) {
          updates.state = 'closed';
          updatesList.push('state');
        }

        if (updatesList.length === 0) {
          return {
            content: [{
              type: "text",
              text: `## ✏️ Issue Edit Request\n\n**Target**: Issue #${issueNumber}\n\nI can help you edit this issue. Please specify what you'd like to update:\n\n**Examples:**\n- "Edit issue #${issueNumber} title to 'New Title'"\n- "Update issue #${issueNumber} add label 'high-priority'"\n- "Close issue #${issueNumber}"\n\nWhat would you like to change?`
            }]
          };
        }

        const previewText = `## ✏️ Issue Edit Preview\n\n**Target**: Issue #${issueNumber}\n**Repository**: loqalabs/loqa (detected from context)\n\n**Updates to Apply:**\n${updatesList.map(update => `- **${update}**: ${updates[update]}`).join('\n')}\n\n---\n\n✅ Reply **"yes"** to apply these changes\n❌ Reply **"no"** to cancel\n🔄 Reply with changes to revise the updates`;

        const previewManager = PreviewStateManager.getInstance();
        previewManager.storePendingOperation({
          type: 'update_issue',
          toolName: 'github:UpdateIssue',
          originalArgs: {
            owner: 'loqalabs',
            repo: 'loqa',
            issue_number: issueNumber,
            ...updates
          },
          previewText
        });

        return {
          content: [{
            type: "text",
            text: previewText
          }]
        };
      }

      // 4. PR Editing
      const prEditMatch = message.match(/edit.*pr.*#?(\d+)|update.*pr.*#?(\d+)|pr.*#?(\d+).*edit|pr.*#?(\d+).*update|edit.*pull request.*#?(\d+)|update.*pull request.*#?(\d+)/i);
      if (prEditMatch) {
        const prNumber = parseInt(prEditMatch[1] || prEditMatch[2] || prEditMatch[3] || prEditMatch[4] || prEditMatch[5] || prEditMatch[6]);

        // Extract what to edit
        let updates: any = {};
        let updatesList: string[] = [];

        const titleMatch = message.match(/title.*[""]([^"""]+)[""]|title.*'([^']+)'|title.*"([^"]+)"/i);
        if (titleMatch) {
          updates.title = titleMatch[1] || titleMatch[2] || titleMatch[3];
          updatesList.push('title');
        }

        if (message.toLowerCase().includes('draft')) {
          updates.draft = true;
          updatesList.push('draft status');
        }

        if (message.toLowerCase().includes('ready')) {
          updates.draft = false;
          updatesList.push('ready for review');
        }

        if (updatesList.length === 0) {
          return {
            content: [{
              type: "text",
              text: `## 🔧 Pull Request Edit Request\n\n**Target**: PR #${prNumber}\n\nI can help you edit this pull request. Please specify what you'd like to update:\n\n**Examples:**\n- "Edit PR #${prNumber} title to 'New Title'"\n- "Update PR #${prNumber} to draft"\n- "Mark PR #${prNumber} ready for review"\n\nWhat would you like to change?`
            }]
          };
        }

        const previewText = `## 🔧 Pull Request Edit Preview\n\n**Target**: PR #${prNumber}\n**Repository**: loqalabs/loqa (detected from context)\n\n**Updates to Apply:**\n${updatesList.map(update => `- **${update}**: ${updates[update] === true ? 'true' : updates[update] === false ? 'false' : updates[update]}`).join('\n')}\n\n---\n\n✅ Reply **"yes"** to apply these changes\n❌ Reply **"no"** to cancel\n🔄 Reply with changes to revise the updates`;

        const previewManager = PreviewStateManager.getInstance();
        previewManager.storePendingOperation({
          type: 'update_pr',
          toolName: 'github:UpdatePR',
          originalArgs: {
            owner: 'loqalabs',
            repo: 'loqa',
            pullNumber: prNumber,
            ...updates
          },
          previewText
        });

        return {
          content: [{
            type: "text",
            text: previewText
          }]
        };
      }

      // 5. GitHub Comments - simplified pattern
      if (msg.includes('comment') && (msg.includes('issue') || msg.includes('#'))) {
        const issueMatch = message.match(/#(\d+)|issue\s*(\d+)/i);
        if (issueMatch) {
          const issueNumber = parseInt(issueMatch[1] || issueMatch[2]);

          // Extract comment content (everything after the issue reference, or ask for it)
          const colonIndex = message.indexOf(':');
          const afterMatch = colonIndex > -1 ? message.substring(colonIndex + 1).trim() : '';

          if (afterMatch.length < 10) {
          return {
            content: [{
              type: "text",
              text: `📝 **GitHub Comment Request Detected**\n\nI can help you add a comment to issue #${issueNumber}, but I need the comment content.\n\nPlease provide your message in this format:\n"Add a comment to issue #${issueNumber}: [your comment content here]"`
            }]
          };
        }

        // Generate preview for GitHub comment delegation
        const commentContent = afterMatch.startsWith(':') ? afterMatch.substring(1).trim() : afterMatch;
        const previewText = `## 📝 GitHub Comment Preview\n\n**Target**: Issue #${issueNumber}\n**Repository**: loqalabs/loqa (detected from context)\n\n**Comment Content:**\n\n${commentContent}\n\n---\n\n✅ Reply **"yes"** to post this comment\n❌ Reply **"no"** to cancel\n🔄 Reply with changes to revise the comment`;

        // Store as pending operation for GitHub MCP delegation
        const previewManager = PreviewStateManager.getInstance();
        previewManager.storePendingOperation({
          type: 'add_comment',
          toolName: 'github:AddComment',
          originalArgs: {
            owner: 'loqalabs',
            repo: 'loqa',
            issue_number: issueNumber,
            body: commentContent
          },
          previewText
        });

          return {
            content: [{
              type: "text",
              text: previewText
            }]
          };
        }
      }

      // Priority 2: Check for active interview responses (after GitHub operations to avoid conflicts)
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

      // Not a preview response, interview response, or GitHub operation - return helpful message
      return {
        content: [{
          type: "text",
          text: `📝 **Message received**: "${message}"\n\n${contextManager.isInActiveInterview()
            ? `💡 **Active Interview**: You're in an interview but your message doesn't look like an answer. The current question is:\n\n"${contextManager.getLastQuestion()}"\n\nPlease provide your answer, or use \`issue:ListActiveInterviews\` to see available interviews.`
            : '💡 **No Active Context**: Your message was received but there\'s no active interview or pending operation. Use \`issue:StartInterview\` with your idea to start a new issue creation process.'}`
        }]
      };
    }

    default:
      throw new Error(`Unknown issue management tool: ${name}`);
  }
}

// Removed interview functionality - these exports are no longer needed