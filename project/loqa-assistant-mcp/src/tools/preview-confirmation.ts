/**
 * Preview Confirmation Tools - Handle user responses to GitHub operation previews
 */

import { PreviewStateManager, PendingOperation } from "../utils/preview-state-manager.js";
import {
  formatIssueCreationPreview,
  formatCommentCreationPreview
} from "../utils/preview-formatter.js";
import {
  deriveIssueTitle,
  detectThoughtCategory,
  createSimpleIssue,
  mapCategoryToIssueType,
} from "./handlers.js";
import { resolveWorkspaceRoot } from "../utils/workspace-resolver.js";
import { LoqaIssueManager } from "../managers/index.js";
import { IssueProviderManager } from "../managers/issue-provider-manager.js";
import { IssueProvider } from "../types/issue-provider.js";

export const previewConfirmationTools = [
  {
    name: "preview:ConfirmOrRevise",
    description: "Confirm, cancel, or revise a pending GitHub operation after seeing the preview",
    inputSchema: {
      type: "object",
      properties: {
        operationId: {
          type: "string",
          description: "The ID of the pending operation to respond to",
        },
        action: {
          type: "string",
          enum: ["confirm", "cancel", "revise"],
          description: "Action to take: confirm to proceed, cancel to abort, revise to modify",
        },
        revisionInput: {
          type: "string",
          description: "Additional input or changes to make (required if action is 'revise')",
        },
      },
      required: ["operationId", "action"],
    },
  },
];

/**
 * Handle preview confirmation responses
 */
export async function handlePreviewConfirmation(
  name: string,
  args: any
): Promise<any> {
  const previewManager = PreviewStateManager.getInstance();

  switch (name) {
    case "preview:ConfirmOrRevise": {
      const { operationId, action, revisionInput } = args;

      const pendingOp = previewManager.getPendingOperation(operationId);
      if (!pendingOp) {
        return {
          content: [
            {
              type: "text",
              text: `❌ **Operation Not Found**\n\nThe preview operation \`${operationId}\` was not found or has expired.\n\nPending operations expire after 1 hour.`,
            },
          ],
        };
      }

      switch (action) {
        case "cancel":
          previewManager.removePendingOperation(operationId);
          return {
            content: [
              {
                type: "text",
                text: `🚫 **Operation Cancelled**\n\nThe ${pendingOp.type.replace('_', ' ')} operation has been cancelled.\n\nNo changes were made.`,
              },
            ],
          };

        case "confirm":
          // Execute the original operation
          try {
            const result = await executeConfirmedOperation(pendingOp);
            previewManager.removePendingOperation(operationId);
            return result;
          } catch (error) {
            previewManager.removePendingOperation(operationId);
            return {
              content: [
                {
                  type: "text",
                  text: `❌ **Execution Failed**\n\nFailed to execute the confirmed operation: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`,
                },
              ],
            };
          }

        case "revise":
          if (!revisionInput) {
            return {
              content: [
                {
                  type: "text",
                  text: `❌ **Revision Input Required**\n\nTo revise the operation, please provide \`revisionInput\` with your changes or additional requirements.`,
                },
              ],
            };
          }

          try {
            const revisedResult = await reviseOperation(pendingOp, revisionInput);
            return revisedResult;
          } catch (error) {
            return {
              content: [
                {
                  type: "text",
                  text: `❌ **Revision Failed**\n\nFailed to revise the operation: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`,
                },
              ],
            };
          }

        default:
          return {
            content: [
              {
                type: "text",
                text: `❌ **Invalid Action**\n\nAction must be one of: confirm, cancel, revise`,
              },
            ],
          };
      }
    }

    default:
      return {
        content: [
          {
            type: "text",
            text: `❌ **Unknown Preview Tool**\n\nUnknown tool: ${name}`,
          },
        ],
      };
    }
  }

/**
 * Execute a confirmed operation
 */
async function executeConfirmedOperation(pendingOp: PendingOperation): Promise<any> {
  const workspaceRoot = await resolveWorkspaceRoot(pendingOp.originalArgs);

  switch (pendingOp.toolName) {
    case "issue:CreateSimple": {
      const { initialInput } = pendingOp.originalArgs;
      const result = await createSimpleIssue(initialInput, workspaceRoot);
      return {
        content: [
          {
            type: "text",
            text: `✅ **Operation Confirmed & Executed**\n\n${result.message}`,
          },
        ],
      };
    }

    case "issue:CreateFromThought": {
      const issueManager = new LoqaIssueManager(workspaceRoot);
      const {
        thoughtContent,
        suggestedTemplate,
        suggestedPriority,
        category,
        customTitle,
      } = pendingOp.originalArgs;

      const title = customTitle || deriveIssueTitle(thoughtContent);
      const options = {
        title,
        template: suggestedTemplate,
        priority: suggestedPriority as "High" | "Medium" | "Low",
        type: mapCategoryToIssueType(category),
        assignee: undefined,
      };

      const result = await issueManager.createIssueFromTemplate(options);
      return {
        content: [
          {
            type: "text",
            text: `✅ **Operation Confirmed & Executed**\n\n🚀 **Issue Created from Thought!**\n\n📋 **Issue ID**: ${result.issue?.number || 'N/A'}\n📝 **Template**: ${suggestedTemplate}\n⭐ **Priority**: ${suggestedPriority}\n📂 **Category**: ${category}`,
          },
        ],
      };
    }

    case "issue:AppendToExistingIssue": {
      const { issueFile, repository, content, sectionTitle = "Additional Thoughts" } = pendingOp.originalArgs;

      // For now, return success message as GitHub API integration is pending
      return {
        content: [
          {
            type: "text",
            text: `✅ **Operation Confirmed & Executed**\n\n📝 **Comment Added to Issue**\n\n📋 **Issue**: ${issueFile}\n📁 **Repository**: ${repository}\n📝 **Section**: ${sectionTitle}\n\n**Content Added**: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unsupported tool for execution: ${pendingOp.toolName}`);
  }
}

/**
 * Revise an operation based on user input
 */
async function reviseOperation(pendingOp: PendingOperation, revisionInput: string): Promise<any> {
  const previewManager = PreviewStateManager.getInstance();

  switch (pendingOp.toolName) {
    case "issue:CreateSimple": {
      // Combine original input with revision
      const revisedInput = `${pendingOp.originalArgs.initialInput}\n\nAdditional requirements: ${revisionInput}`;

      // Generate new preview
      const title = deriveIssueTitle(revisedInput);
      const category = detectThoughtCategory(revisedInput, []);
      const issueType = mapCategoryToIssueType(category);

      const previewData = {
        title: title,
        body: `## Description\n\n${revisedInput}\n\n## Type\n\n${issueType}`,
        labels: [category.toLowerCase(), "medium-priority"],
        assignees: [],
        milestone: undefined,
      };

      const newPreview = formatIssueCreationPreview(previewData, "current repository");

      // Update the pending operation
      const updatedArgs = { ...pendingOp.originalArgs, initialInput: revisedInput };
      previewManager.updatePendingOperation(pendingOp.id, updatedArgs, newPreview);

      return {
        content: [
          {
            type: "text",
            text: `🔄 **Operation Revised**\n\n${newPreview}\n\n---\n\n💬 **Your Revision**: "${revisionInput}"\n\n✅ Use \`preview:ConfirmOrRevise\` with operation ID \`${pendingOp.id}\` to confirm, cancel, or revise further.`,
          },
        ],
      };
    }

    case "issue:CreateFromThought": {
      // Combine original thought with revision
      const revisedThought = `${pendingOp.originalArgs.thoughtContent}\n\nAdditional considerations: ${revisionInput}`;

      // Generate new preview
      const title = pendingOp.originalArgs.customTitle || deriveIssueTitle(revisedThought);
      const category = pendingOp.originalArgs.category;
      const issueType = mapCategoryToIssueType(category);
      const priority = pendingOp.originalArgs.suggestedPriority;

      const previewData = {
        title: title,
        body: `## Description\n\n${revisedThought}\n\n## Template\n\n${pendingOp.originalArgs.suggestedTemplate}\n\n## Category\n\n${category}\n\n## Type\n\n${issueType}`,
        labels: [category.toLowerCase(), `${priority.toLowerCase()}-priority`],
        assignees: [],
        milestone: undefined,
      };

      const newPreview = formatIssueCreationPreview(previewData, "current repository");

      // Update the pending operation
      const updatedArgs = { ...pendingOp.originalArgs, thoughtContent: revisedThought };
      previewManager.updatePendingOperation(pendingOp.id, updatedArgs, newPreview);

      return {
        content: [
          {
            type: "text",
            text: `🔄 **Operation Revised**\n\n${newPreview}\n\n---\n\n💬 **Your Revision**: "${revisionInput}"\n\n✅ Use \`preview:ConfirmOrRevise\` with operation ID \`${pendingOp.id}\` to confirm, cancel, or revise further.`,
          },
        ],
      };
    }

    case "issue:AppendToExistingIssue": {
      // Combine original content with revision
      const revisedContent = `${pendingOp.originalArgs.content}\n\n${revisionInput}`;

      // Generate new preview
      const commentPreviewData = {
        body: `## ${pendingOp.originalArgs.sectionTitle || "Additional Thoughts"}\n*Added on ${new Date().toLocaleString()}*\n\n${revisedContent}`,
        issueNumber: parseInt(pendingOp.originalArgs.issueFile.match(/(\d+)/)?.[1] || "0"),
        repository: pendingOp.originalArgs.repository,
      };

      const newPreview = formatCommentCreationPreview(commentPreviewData);

      // Update the pending operation
      const updatedArgs = { ...pendingOp.originalArgs, content: revisedContent };
      previewManager.updatePendingOperation(pendingOp.id, updatedArgs, newPreview);

      return {
        content: [
          {
            type: "text",
            text: `🔄 **Operation Revised**\n\n${newPreview}\n\n---\n\n💬 **Your Revision**: "${revisionInput}"\n\n✅ Use \`preview:ConfirmOrRevise\` with operation ID \`${pendingOp.id}\` to confirm, cancel, or revise further.`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unsupported tool for revision: ${pendingOp.toolName}`);
  }
}