/**
 * MCP Tools Index
 * Central export point for all modular MCP tool handlers
 */

// Export all tool definitions
export { validationTools, handleValidationTool } from './validation-tools.js';
export { taskManagementTools, handleTaskManagementTool } from './task-management-tools.js';
export { roleManagementTools, handleRoleManagementTool } from './role-management-tools.js';
export { modelSelectionTools, handleModelSelectionTool } from './model-selection-tools.js';
export { workspaceTools, handleWorkspaceTool } from './workspace-tools.js';
export { workflowTools, handleWorkflowTool } from './workflow-tools.js';
export { smartGitTools, handleSmartGitTool } from './smart-git-tool-definitions.js';
export { gitPreferenceTools, handleGitPreferenceTool } from './git-preference-tool.js';

/**
 * Get all available tools as a single array
 */
export async function getAllTools() {
  const { validationTools } = await import('./validation-tools.js');
  const { taskManagementTools } = await import('./task-management-tools.js');
  const { roleManagementTools } = await import('./role-management-tools.js');
  const { modelSelectionTools } = await import('./model-selection-tools.js');
  const { workspaceTools } = await import('./workspace-tools.js');
  const { workflowTools } = await import('./workflow-tools.js');
  const { smartGitTools } = await import('./smart-git-tool-definitions.js');
  const { gitPreferenceTools } = await import('./git-preference-tool.js');
  
  return [
    ...validationTools,
    ...taskManagementTools,
    ...roleManagementTools,
    ...modelSelectionTools,
    ...workspaceTools,
    ...workflowTools,
    ...smartGitTools,
    ...gitPreferenceTools
  ];
}

/**
 * Get tools filtered by repository type (Loqa vs non-Loqa)
 */
export async function getToolsForRepository(isLoqaRepository: boolean) {
  const { validationTools } = await import('./validation-tools.js');
  const { taskManagementTools } = await import('./task-management-tools.js');
  const { roleManagementTools } = await import('./role-management-tools.js');
  const { modelSelectionTools } = await import('./model-selection-tools.js');
  const { workspaceTools } = await import('./workspace-tools.js');
  const { workflowTools } = await import('./workflow-tools.js');
  const { smartGitTools } = await import('./smart-git-tool-definitions.js');
  const { gitPreferenceTools } = await import('./git-preference-tool.js');
  
  const baseTools = [
    ...validationTools,
    ...smartGitTools,  // Smart git tools available for all repositories
    ...gitPreferenceTools  // Git guidance available for all repositories
  ];
  
  const loqaTools = [
    ...taskManagementTools,
    ...roleManagementTools,
    ...modelSelectionTools,
    ...workspaceTools,
    ...workflowTools
  ];
  
  return isLoqaRepository ? [...baseTools, ...loqaTools] : baseTools;
}

/**
 * Route tool calls to appropriate handlers
 */
export async function handleToolCall(name: string, args: any, workspaceManager?: any): Promise<any> {
  // Load all tool definitions dynamically
  const { validationTools } = await import('./validation-tools.js');
  const { taskManagementTools } = await import('./task-management-tools.js');
  const { roleManagementTools } = await import('./role-management-tools.js');
  const { modelSelectionTools } = await import('./model-selection-tools.js');
  const { workspaceTools } = await import('./workspace-tools.js');
  const { workflowTools } = await import('./workflow-tools.js');
  const { smartGitTools } = await import('./smart-git-tool-definitions.js');
  const { gitPreferenceTools } = await import('./git-preference-tool.js');
  
  // Validation tools
  if (validationTools.find((tool: any) => tool.name === name)) {
    const { handleValidationTool } = await import('./validation-tools.js');
    return handleValidationTool(name, args);
  }
  
  // Smart git tools
  if (smartGitTools.find((tool: any) => tool.name === name)) {
    const { handleSmartGitTool } = await import('./smart-git-tool-definitions.js');
    return handleSmartGitTool(name, args);
  }
  
  // Git preference tools
  if (gitPreferenceTools.find((tool: any) => tool.name === name)) {
    const { handleGitPreferenceTool } = await import('./git-preference-tool.js');
    return handleGitPreferenceTool(name, args);
  }
  
  // Task management tools
  if (taskManagementTools.find((tool: any) => tool.name === name)) {
    const { handleTaskManagementTool } = await import('./task-management-tools.js');
    return handleTaskManagementTool(name, args);
  }
  
  // Role management tools
  if (roleManagementTools.find((tool: any) => tool.name === name)) {
    const { handleRoleManagementTool } = await import('./role-management-tools.js');
    return handleRoleManagementTool(name, args);
  }
  
  // Model selection tools
  if (modelSelectionTools.find((tool: any) => tool.name === name)) {
    const { handleModelSelectionTool } = await import('./model-selection-tools.js');
    return handleModelSelectionTool(name, args);
  }
  
  // Workspace tools (require workspace manager)
  if (workspaceTools.find((tool: any) => tool.name === name)) {
    const { handleWorkspaceTool } = await import('./workspace-tools.js');
    return handleWorkspaceTool(name, args, workspaceManager);
  }
  
  // Workflow tools
  if (workflowTools.find((tool: any) => tool.name === name)) {
    const { handleWorkflowTool } = await import('./workflow-tools.js');
    return handleWorkflowTool(name, args);
  }
  
  throw new Error(`Unknown tool: ${name}`);
}

/**
 * Get tool information by name
 */
export async function getToolInfo(name: string) {
  const allTools = await getAllTools();
  return allTools.find((tool: any) => tool.name === name);
}