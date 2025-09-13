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

// Import from split modules
import {
  deriveIssueTitle,
  detectThoughtCategory,
  createSimpleIssue,
} from "./handlers.js";
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
      },
      required: ["content"],
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
      const { content, tags = [], context } = args;

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
        const _result = await issueManager.captureThought(thought);

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

    default:
      throw new Error(`Unknown issue management tool: ${name}`);
  }
}

// Removed interview functionality - these exports are no longer needed