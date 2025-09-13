import { LoqaModelSelector } from "../managers/index.js";
import { ModelSelectionContext } from "../types/index.js";
import { resolveWorkspaceRoot } from "../utils/workspace-resolver.js";

/**
 * Model Selection MCP tools
 * Handles AI model recommendation and capability queries
 */

export const modelSelectionTools = [
  {
    name: "model:Select",
    description:
      "Get intelligent AI model recommendation based on issue complexity and context",
    inputSchema: {
      type: "object",
      properties: {
        roleId: {
          type: "string",
          description: "Current role context",
        },
        issueTitle: {
          type: "string",
          description: "Title of the issue",
        },
        issueDescription: {
          type: "string",
          description: "Detailed description of the issue",
        },
        complexity: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Manual complexity override",
        },
        filePaths: {
          type: "array",
          items: { type: "string" },
          description: "File paths involved in the issue",
        },
        repositoryType: {
          type: "string",
          description:
            "Type of repository (see repositories.ts for valid options)",
        },
        manualOverride: {
          type: "string",
          description: "Manual model selection override",
        },
      },
    },
  },
  {
    name: "model:GetCapabilities",
    description:
      "Get detailed capabilities and use cases for available AI models",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

export async function handleModelSelectionTool(
  name: string,
  args: any
): Promise<any> {
  // Intelligently resolve the workspace root
  const workspaceRoot = await resolveWorkspaceRoot(args);
  const modelSelector = new LoqaModelSelector(workspaceRoot);

  switch (name) {
    case "model:Select": {
      const {
        roleId,
        issueTitle,
        issueDescription,
        complexity,
        filePaths,
        repositoryType,
        manualOverride,
      } = args;

      const context: ModelSelectionContext = {
        roleId,
        issueTitle: issueTitle,
        issueDescription: issueDescription,
        complexity: complexity as "low" | "medium" | "high",
        filePaths,
        repositoryType,
        manualOverride,
      };

      try {
        const recommendation = await modelSelector.selectModel(context);

        const alternativesText =
          recommendation.alternatives.length > 0
            ? `\n\n**Alternatives**:\n${recommendation.alternatives
                .map(
                  (alt) =>
                    `• ${alt.model} (${(alt.score * 100).toFixed(0)}% score): ${
                      alt.reasoning
                    }`
                )
                .join("\n")}`
            : "";

        return {
          content: [
            {
              type: "text",
              text: `🤖 **Model Recommendation**\n\n**Selected Model**: ${
                recommendation.model
              }\n**Confidence**: ${(recommendation.confidence * 100).toFixed(
                0
              )}%\n**Reasoning**: ${recommendation.reasoning.join(
                "; "
              )}${alternativesText}\n\n**Next Steps**: Use the recommended model for optimal performance on this issue.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to select model: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }

    case "model:GetCapabilities": {
      try {
        const capabilities = modelSelector.getModelCapabilities();

        let capabilitiesText = "";
        for (const [model, info] of Object.entries(capabilities)) {
          capabilitiesText += `\n**${model.toUpperCase()}**\n`;
          capabilitiesText += `• **Strengths**: ${info.strengths.join(", ")}\n`;
          capabilitiesText += `• **Use Cases**: ${info.useCases.join(", ")}\n`;
          capabilitiesText += `• **Performance**: ${info.performance}\n`;
        }

        return {
          content: [
            {
              type: "text",
              text: `🤖 **Available AI Models & Capabilities**${capabilitiesText}\n\n**Next Steps**: Use 'select_model' for intelligent recommendations based on your specific issue.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to get model capabilities: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
        };
      }
    }

    default:
      throw new Error(`Unknown model selection tool: ${name}`);
  }
}
