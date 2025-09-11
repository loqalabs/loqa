import { LoqaRoleManager } from '../managers/index.js';

/**
 * Role Management MCP tools
 * Handles role detection, configuration, and template recommendations
 */

export const roleManagementTools = [
  {
    name: "set_role",
    description: "Set the current working role context for specialized workflows",
    inputSchema: {
      type: "object",
      properties: {
        roleId: {
          type: "string",
          description: "Role ID to set (architect, developer, devops, qa, general)",
          enum: ["architect", "developer", "devops", "qa", "general"]
        },
        context: {
          type: "string", 
          description: "Optional context about why this role was selected"
        }
      },
      required: ["roleId"]
    }
  },
  {
    name: "detect_role",
    description: "Automatically detect the most appropriate role based on context",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Task or work title"
        },
        description: {
          type: "string",
          description: "Detailed description of the work"
        },
        filePaths: {
          type: "array",
          items: { type: "string" },
          description: "File paths involved in the work"
        },
        repositoryType: {
          type: "string",
          description: "Type of repository (see repositories.ts for valid options)"
        }
      }
    }
  },
  {
    name: "get_role_config",
    description: "Get detailed configuration for a specific role",
    inputSchema: {
      type: "object",
      properties: {
        roleId: {
          type: "string",
          description: "Role ID to get configuration for"
        }
      },
      required: ["roleId"]
    }
  },
  {
    name: "list_roles",
    description: "List all available roles and their descriptions",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_role_templates",
    description: "Get recommended task templates for a specific role",
    inputSchema: {
      type: "object",
      properties: {
        roleId: {
          type: "string",
          description: "Role ID to get templates for"
        }
      },
      required: ["roleId"]
    }
  }
];

export async function handleRoleManagementTool(name: string, args: any): Promise<any> {
  const roleManager = new LoqaRoleManager();

  switch (name) {
    case "set_role": {
      const { roleId, context } = args;
      
      try {
        const roleConfig = await roleManager.getRoleConfig(roleId);
        if (!roleConfig) {
          return {
            content: [{
              type: "text",
              text: `❌ Role '${roleId}' not found. Use 'list_roles' to see available roles.`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: `✅ Role set to: **${roleConfig.role_name}**\n\n📋 **Description**: ${roleConfig.role_description}\n🛠️ **Capabilities**: ${roleConfig.capabilities?.join(', ') || 'Standard development capabilities'}\n🤖 **Preferred Model**: ${roleConfig.model_preference}\n📝 **Preferred Templates**: ${roleConfig.task_templates_preferred?.join(', ') || 'General templates'}\n\n${context ? `**Context**: ${context}` : ''}\n\n**Next Steps**: The role context is now active for specialized workflows.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to set role: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "detect_role": {
      const { title, description, filePaths, repositoryType } = args;
      
      try {
        const result = await roleManager.detectRole({
          title,
          description,
          filePaths,
          repositoryType
        });

        const alternativesText = result.alternatives.length > 0 
          ? `\n\n**Alternatives**:\n${result.alternatives.map(alt => `• ${alt.role} (${(alt.confidence * 100).toFixed(0)}% confidence)`).join('\n')}`
          : '';

        return {
          content: [{
            type: "text",
            text: `🎯 **Role Detection Results**\n\n**Detected Role**: ${result.detectedRole}\n**Confidence**: ${(result.confidence * 100).toFixed(0)}%\n**Reasoning**: ${result.reasoning.join(', ') || 'General context analysis'}${alternativesText}\n\n**Next Steps**: Use 'set_role' to activate this role or choose from alternatives.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to detect role: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "get_role_config": {
      const { roleId } = args;
      
      try {
        const roleConfig = await roleManager.getRoleConfig(roleId);
        if (!roleConfig) {
          return {
            content: [{
              type: "text",
              text: `❌ Role '${roleId}' not found. Use 'list_roles' to see available roles.`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              role: roleConfig,
              message: `📋 Role configuration for ${roleConfig.role_name}`
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to get role config: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "list_roles": {
      try {
        const roles = await roleManager.listRoles();
        const rolesList = roles.map(role => 
          `• **${role.role_name}** (${role.role_id}): ${role.role_description}`
        ).join('\n');

        return {
          content: [{
            type: "text",
            text: `👥 **Available Roles** (${roles.length} found)\n\n${rolesList}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to list roles: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    case "get_role_templates": {
      const { roleId } = args;
      
      try {
        const templates = await roleManager.getTemplatesForRole(roleId);
        const templatesList = templates.join(', ');

        return {
          content: [{
            type: "text",
            text: `📝 **Recommended Templates for Role '${roleId}'**:\n\n${templatesList}\n\n**Next Steps**: Use these templates when creating tasks for this role.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Failed to get role templates: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }

    default:
      throw new Error(`Unknown role management tool: ${name}`);
  }
}