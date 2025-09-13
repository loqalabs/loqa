/**
 * MCP Tools Index
 * Central export point for all modular MCP tool handlers
 */

// Export all tool definitions
export { validationTools, handleValidationTool } from './validation-tools.js';
export { issueManagementTools, handleIssueManagementTool } from './issue-management-tools.js';
// roleManagementTools removed - role system now works automatically
export { modelSelectionTools, handleModelSelectionTool } from './model-selection-tools.js';
export { workspaceTools, handleWorkspaceTool } from './workspace-tools.js';
export { workflowTools, handleWorkflowTool } from './workflow-tools.js';
export { smartGitTools, handleSmartGitTool } from './smart-git-tool-definitions.js';
export { gitPreferenceTools, handleGitPreferenceTool } from './git-preference-tool.js';
export { enhancedGitHubTools, handleEnhancedGitHubTool } from './github-enhanced-tools.js';
export { githubMcpIntegrationTools, handleGitHubMcpIntegration } from './github-mcp-integration.js';
export { advancedGithubTools } from './github-advanced-features.js';
export { advancedGithubHandlers } from './github-advanced-handlers.js';
export { qualityGateTools, handleQualityGateTools } from './quality-gate-tools.js';
export { githubIssueTemplateTools, handleGitHubIssueTemplateTools } from './github-issue-templates.js';
export { crossRepoCoordinationTools, handleCrossRepoCoordinationTools } from './cross-repo-coordination-tools.js';

/**
 * Get all available tools as a single array
 */
export async function getAllTools() {
  const { validationTools } = await import('./validation-tools.js');
  const { issueManagementTools } = await import('./issue-management-tools.js');
  // roleManagementTools removed - role system now works automatically
  const { modelSelectionTools } = await import('./model-selection-tools.js');
  const { workspaceTools } = await import('./workspace-tools.js');
  const { workflowTools } = await import('./workflow-tools.js');
  const { smartGitTools } = await import('./smart-git-tool-definitions.js');
  const { gitPreferenceTools } = await import('./git-preference-tool.js');
  const { enhancedGitHubTools } = await import('./github-enhanced-tools.js');
  const { githubMcpIntegrationTools } = await import('./github-mcp-integration.js');
  const { advancedGithubTools } = await import('./github-advanced-features.js');
  const { qualityGateTools } = await import('./quality-gate-tools.js');
  const { githubIssueTemplateTools } = await import('./github-issue-templates.js');
  const { crossRepoCoordinationTools } = await import('./cross-repo-coordination-tools.js');

  return [
    ...validationTools,
    ...issueManagementTools,
    // roleManagementTools removed
    ...modelSelectionTools,
    ...workspaceTools,
    ...workflowTools,
    ...smartGitTools,
    ...gitPreferenceTools,
    ...enhancedGitHubTools,
    ...githubMcpIntegrationTools,
    ...advancedGithubTools,
    ...qualityGateTools,
    ...githubIssueTemplateTools,
    ...crossRepoCoordinationTools
  ];
}

/**
 * Get tools filtered by repository type (Loqa vs non-Loqa)
 */
export async function getToolsForRepository(isLoqaRepository: boolean) {
  const { validationTools } = await import('./validation-tools.js');
  const { issueManagementTools } = await import('./issue-management-tools.js');
  // roleManagementTools removed - role system now works automatically
  const { modelSelectionTools } = await import('./model-selection-tools.js');
  const { workspaceTools } = await import('./workspace-tools.js');
  const { workflowTools } = await import('./workflow-tools.js');
  const { smartGitTools } = await import('./smart-git-tool-definitions.js');
  const { gitPreferenceTools } = await import('./git-preference-tool.js');
  const { advancedGithubTools } = await import('./github-advanced-features.js');
  
  const baseTools = [
    ...validationTools,
    ...smartGitTools,  // Smart git tools available for all repositories
    ...gitPreferenceTools,  // Git guidance available for all repositories
    ...advancedGithubTools  // Advanced GitHub features available for all repositories
  ];
  
  const loqaTools = [
    ...issueManagementTools,
    // roleManagementTools removed
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
  const { issueManagementTools } = await import('./issue-management-tools.js');
  // roleManagementTools removed - role system now works automatically
  const { modelSelectionTools } = await import('./model-selection-tools.js');
  const { workspaceTools } = await import('./workspace-tools.js');
  const { workflowTools } = await import('./workflow-tools.js');
  const { smartGitTools } = await import('./smart-git-tool-definitions.js');
  const { gitPreferenceTools } = await import('./git-preference-tool.js');
  
  // Load quality gate, GitHub template, and cross-repo coordination tools
  const { qualityGateTools } = await import('./quality-gate-tools.js');
  const { githubIssueTemplateTools } = await import('./github-issue-templates.js');
  const { crossRepoCoordinationTools } = await import('./cross-repo-coordination-tools.js');

  // Cross-repository coordination tools (check first for multi-repo workflow features)
  if (crossRepoCoordinationTools.find((tool: any) => tool.name === name)) {
    const { handleCrossRepoCoordinationTools } = await import('./cross-repo-coordination-tools.js');
    return handleCrossRepoCoordinationTools(name, args);
  }

  // GitHub issue template tools (check for template features)
  if (githubIssueTemplateTools.find((tool: any) => tool.name === name)) {
    const { handleGitHubIssueTemplateTools } = await import('./github-issue-templates.js');
    return handleGitHubIssueTemplateTools(name, args);
  }

  // Quality gate tools (check for pragmatic workflow features)
  if (qualityGateTools.find((tool: any) => tool.name === name)) {
    const { handleQualityGateTools } = await import('./quality-gate-tools.js');
    return handleQualityGateTools(name, args);
  }

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
  
  // Issue management tools
  if (issueManagementTools.find((tool: any) => tool.name === name)) {
    const { handleIssueManagementTool } = await import('./issue-management-tools.js');
    return handleIssueManagementTool(name, args);
  }
  
  // Role management tools removed - role system now works automatically
  
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
  
  
  // Advanced GitHub tools
  const { advancedGithubTools } = await import('./github-advanced-features.js');
  if (advancedGithubTools.find((tool: any) => tool.name === name)) {
    const { advancedGithubHandlers } = await import('./github-advanced-handlers.js');
    if (advancedGithubHandlers[name as keyof typeof advancedGithubHandlers]) {
      return advancedGithubHandlers[name as keyof typeof advancedGithubHandlers](args);
    }
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