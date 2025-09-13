/**
 * GitHub Advanced Features - Organized Module Exports
 *
 * This index file exports all GitHub advanced features organized by domain:
 * - Copilot Tools: AI-powered code review and issue analysis
 * - Security Tools: Advanced security scanning and vulnerability management
 * - Project Tools: Community management, epic tracking, and resource planning
 * - Integration Tools: Custom apps, webhooks, and CI/CD enhancements
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

// Import individual tool collections
import { githubCopilotTools } from './copilot-tools.js';
import { githubSecurityTools } from './security-tools.js';
import { githubProjectTools } from './project-tools.js';
import { githubIntegrationTools } from './integration-tools.js';

// Re-export individual tool collections
export { githubCopilotTools } from './copilot-tools.js';
export { githubSecurityTools } from './security-tools.js';
export { githubProjectTools } from './project-tools.js';
export { githubIntegrationTools } from './integration-tools.js';

// Re-export individual tools for direct access
export {
  // Copilot Tools
  githubCopilotCodeReview,
  githubCopilotIssueAnalysis,
  githubCopilotSmartIssueCreation,
  githubCopilotCodeGeneration
} from './copilot-tools.js';

export {
  // Security Tools
  githubAdvancedSecurityScan,
  githubSecurityPolicyAutomation,
  githubVulnerabilityTriage
} from './security-tools.js';

export {
  // Project Management Tools
  githubDiscussionsIntegration,
  githubCommunityHealthMetrics,
  githubContributorOnboarding,
  githubEpicManagement,
  githubRoadmapVisualization,
  githubResourcePlanning
} from './project-tools.js';


export {
  // Integration Tools
  githubCustomAppIntegration,
  githubAdvancedWebhooks,
  githubCicdEnhancement
} from './integration-tools.js';

// Master collection of all advanced GitHub tools
export const advancedGithubTools: Tool[] = [
  ...githubCopilotTools,
  ...githubSecurityTools,
  ...githubProjectTools,
  ...githubIntegrationTools
];