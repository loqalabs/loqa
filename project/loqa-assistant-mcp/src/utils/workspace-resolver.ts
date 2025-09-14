/**
 * Intelligent workspace root resolution utility
 * Returns the true workspace root (parent directory containing all repositories)
 */

import { getWorkspaceRoot } from './context-detector.js';

export async function resolveWorkspaceRoot(args: any = {}): Promise<string> {
  // Return the true workspace root
  return await getWorkspaceRoot(args);
}