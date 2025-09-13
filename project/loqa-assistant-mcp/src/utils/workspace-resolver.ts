/**
 * Intelligent workspace root resolution utility
 * Handles auto-detection of git repositories and workspace context
 */

import { resolveWorkspaceRootWithContext } from './context-detector.js';

export async function resolveWorkspaceRoot(args: any = {}): Promise<string> {
  // Use the new context-aware resolver
  const result = await resolveWorkspaceRootWithContext(args);
  return result.path;
}