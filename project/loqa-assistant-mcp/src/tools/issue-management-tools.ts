/**
 * Issue Management Tools - Modular Implementation
 * 
 * This file now serves as the main entry point for issue management functionality,
 * importing from focused modules instead of containing a monolithic implementation.
 * 
 * Emergency Fix: Split 2,768-line monolith to resolve Claude Code timeout issues
 * Issue: issue-27 - Emergency-fix-split-2768-line-issue-management-tools-ts-monolith
 */

// Re-export all functionality from the modular implementation
export {
  issueManagementTools,
  handleIssueManagementTool,
} from './issue-commands.js';

// Re-export types and utilities for backward compatibility
export type { ThoughtEvaluation } from './thought-analysis.js';