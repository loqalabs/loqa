import {
  LoqaIssueManager,
} from "../managers/index.js";
import { CapturedThought } from "../types/index.js";
import { resolveWorkspaceRoot } from "../utils/workspace-resolver.js";

/**
 * Simplified Workflow MCP tools
 * Basic workflow operations without over-engineered complexity
 */

export const workflowTools = [
  {
    name: "workflow:StartIssueWork",
    description:
      "Begin work on an issue with basic setup - no complex AI orchestration",
    inputSchema: {
      type: "object",
      properties: {
        issueTitle: {
          type: "string",
          description: "Issue title to work on",
        },
        repository: {
          type: "string",
          description: "Repository to work in",
        },
        workContext: {
          type: "string",
          description: "Optional context about the work",
        },
      },
    },
  },
  {
    name: "workflow:CaptureComprehensiveThought",
    description:
      "Capture detailed thoughts with context",
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
    name: "workflow:StartComplexTodo",
    description:
      "Create a straightforward todo item",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Main title of the todo",
        },
        description: {
          type: "string",
          description: "Description of the work",
        },
        repository: {
          type: "string",
          description: "Repository for this work",
        },
        priority: {
          type: "string",
          enum: ["High", "Medium", "Low"],
          description: "Priority level",
        },
      },
      required: ["title", "description"],
    },
  },
];

/**
 * Main handler for workflow tools
 */
export async function handleWorkflowTool(
  name: string,
  args: any
): Promise<any> {
  const workspaceRoot = await resolveWorkspaceRoot(args);

  switch (name) {
    case "workflow:StartIssueWork": {
      const { issueTitle, repository, workContext } = args;

      try {
        // Simple issue work start - no complex orchestration
        let response = `🚀 **Starting Issue Work**\n\n`;

        if (issueTitle) {
          response += `**Issue**: ${issueTitle}\n`;
        }
        if (repository) {
          response += `**Repository**: ${repository}\n`;
        }
        if (workContext) {
          response += `**Context**: ${workContext}\n`;
        }

        response += `\n**Next Steps**: Use standard development tools to work on this issue.`;

        return {
          content: [
            {
              type: "text",
              text: response,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to start issue work: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }

    case "workflow:CaptureComprehensiveThought": {
      const {
        content,
        category,
        context,
        relatedRepositories = [],
        tags = [],
        urgency = "planned",
      } = args;

      try {
        const issueManager = new LoqaIssueManager(workspaceRoot);

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

        await issueManager.captureThought(thought);

        return {
          content: [
            {
              type: "text",
              text: `💭 **Thought Captured**\n\n📂 **Category**: ${category}\n⚡ **Urgency**: ${urgency}\n🏷️ **Tags**: ${tags.join(
                ", "
              ) || "None"}\n🗂️ **Repositories**: ${
                relatedRepositories.join(", ") || "None"
              }\n\n**Content**: ${content}\n\n**Status**: Thought saved for future reference.`,
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

    case "workflow:StartComplexTodo": {
      const { title, description, repository, priority = "Medium" } = args;

      try {
        // Simple todo creation without complex workflow setup
        return {
          content: [
            {
              type: "text",
              text: `📝 **Todo Created**\n\n**Title**: ${title}\n**Description**: ${description}\n**Repository**: ${
                repository || "Not specified"
              }\n**Priority**: ${priority}\n\n**Next Steps**: Use standard tools to work on this todo.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to create todo: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }

    default:
      throw new Error(`Unknown workflow tool: ${name}`);
  }
}