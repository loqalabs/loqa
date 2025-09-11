#!/usr/bin/env node

import { SmartGitHelpers } from '../utils/smart-git-helpers.js';
import { executeGitCommand } from '../utils/git-repo-detector.js';

/**
 * CLI wrapper for smart git operations
 * Usage: node smart-git.js <command> [args...]
 */

async function main() {
  const [,, command, ...args] = process.argv;

  if (!command) {
    console.error('Usage: smart-git <command> [args...]');
    console.error('');
    console.error('Commands:');
    console.error('  status              - Show smart git status');
    console.error('  branch <name>       - Create feature branch');
    console.error('  commit <message>    - Smart commit');
    console.error('  <git-command>       - Execute any git command from repo root');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'status': {
        const result = await SmartGitHelpers.getSmartStatus();
        if (result.success) {
          console.log(`Repository: ${result.repoRoot}`);
          console.log(`Current path: ${result.relativePath || '(root)'}`);
          console.log(`Branch: ${result.currentBranch}`);
          console.log(`Has changes: ${result.hasChanges}`);
          if (result.status) {
            console.log('Changes:');
            console.log(result.status);
          }
        } else {
          console.error(`Error: ${result.error}`);
          process.exit(1);
        }
        break;
      }

      case 'branch': {
        if (!args[0]) {
          console.error('Usage: smart-git branch <branch-name>');
          process.exit(1);
        }
        const result = await SmartGitHelpers.createFeatureBranch(args[0]);
        if (result.success) {
          console.log(`✅ Created and switched to branch: ${result.branchName}`);
          console.log(`Repository: ${result.repoRoot}`);
        } else {
          console.error(`❌ Error: ${result.error}`);
          process.exit(1);
        }
        break;
      }

      case 'commit': {
        if (!args[0]) {
          console.error('Usage: smart-git commit <message> [file1] [file2] ...');
          process.exit(1);
        }
        const message = args[0];
        const files = args.slice(1);
        const result = await SmartGitHelpers.smartCommit(message, files.length > 0 ? files : undefined);
        if (result.success) {
          console.log(`✅ Committed: ${result.commitHash?.substring(0, 8)}`);
          console.log(`Repository: ${result.repoRoot}`);
        } else {
          console.error(`❌ Error: ${result.error}`);
          process.exit(1);
        }
        break;
      }

      default: {
        // Execute any git command from the repository root
        const result = await executeGitCommand([command, ...args]);
        if (result.success) {
          if (result.stdout) console.log(result.stdout);
          console.error(`(executed from: ${result.repoRoot})`);
        } else {
          if (result.stderr) console.error(result.stderr);
          console.error(`❌ Command failed in: ${result.repoRoot || 'unknown'}`);
          process.exit(1);
        }
        break;
      }
    }
  } catch (error) {
    console.error(`❌ Unexpected error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();