import { LoqaModelSelector } from '../managers/index.js';
import { ModelSelectionContext } from '../types/index.js';

/**
 * Model Selection MCP tools
 * Handles AI model recommendation and capability queries
 */

export const modelSelectionTools = [
  {
    name: "select_model",
    description: "Get intelligent AI model recommendation based on task complexity and context",
    inputSchema: {
      type: "object",
      properties: {
        roleId: {
          type: "string",
          description: "Current role context"
        },
        taskTitle: {
          type: "string", 
          description: "Title of the task"
        },
        taskDescription: {
          type: "string",
          description: "Detailed description of the task"
        },
        complexity: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Manual complexity override"
        },
        filePaths: {
          type: "array",
          items: { type: "string" },
          description: "File paths involved in the task"
        },
        repositoryType: {
          type: "string",
          description: "Type of repository (see repositories.ts for valid options)"
        },
        manualOverride: {
          type: "string",
          description: "Manual model selection override"
        }
      }
    }
  },
  {
    name: "get_model_capabilities",
    description: "Get detailed capabilities and use cases for available AI models",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

export async function handleModelSelectionTool(name: string, args: any): Promise<any> {
  const modelSelector = new LoqaModelSelector();

  switch (name) {
    case "select_model": {
      const { roleId, taskTitle, taskDescription, complexity, filePaths, repositoryType, manualOverride } = args;
      
      const context: ModelSelectionContext = {
        roleId,
        taskTitle,
        taskDescription,
        complexity: complexity as "low" | "medium" | "high",
        filePaths,
        repositoryType,
        manualOverride
      };

      try {
        const recommendation = await modelSelector.selectModel(context);
        
        const alternativesText = recommendation.alternatives.length > 0
          ? `\n\n**Alternatives**:\n${recommendation.alternatives.map(alt => 
              `• ${alt.model} (${(alt.score * 100).toFixed(0)}% score): ${alt.reasoning}`
            ).join('\n')}`
          : '';

        return {
          content: [{
            type: "text",
            text: `🤖 **Model Recommendation**\n\n**Selected Model**: ${recommendation.model}\n**Confidence**: ${(recommendation.confidence * 100).toFixed(0)}%\n**Reasoning**: ${recommendation.reasoning.join('; ')}${alternativesText}\n\n**Next Steps**: Use the recommended model for optimal performance on this task.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to select model: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "get_model_capabilities": {
      try {
        const capabilities = modelSelector.getModelCapabilities();
        
        let capabilitiesText = '';
        for (const [model, info] of Object.entries(capabilities)) {
          capabilitiesText += `\n**${model.toUpperCase()}**\n`;
          capabilitiesText += `• **Strengths**: ${info.strengths.join(', ')}\n`;
          capabilitiesText += `• **Use Cases**: ${info.useCases.join(', ')}\n`;
          capabilitiesText += `• **Performance**: ${info.performance}\n`;
        }

        return {
          content: [{
            type: "text",
            text: `🤖 **Available AI Models & Capabilities**${capabilitiesText}\n\n**Next Steps**: Use 'select_model' for intelligent recommendations based on your specific task.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to get model capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    default:
      throw new Error(`Unknown model selection tool: ${name}`);
  }
}