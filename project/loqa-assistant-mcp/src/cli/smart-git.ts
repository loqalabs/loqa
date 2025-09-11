#!/usr/bin/env node

import { SmartGitHelpers } from '../utils/smart-git-helpers.js';
import { executeGitCommand } from '../utils/git-repo-detector.js';

/**
 * CLI wrapper for smart git operations with enhanced command mapping
 * Usage: node smart-git.js <command> [args...]
 */

interface CommandHandler {
  description: string;
  handler: (args: string[]) => Promise<void>;
  usage?: string;
}

const commands: Record<string, CommandHandler> = {
  // Enhanced status command
  'status': {
    description: 'Show smart git status with repository context',
    handler: async (_args) => {
      const result = await SmartGitHelpers.getSmartStatus();
      if (result.success) {
        console.log(`📁 Repository: ${result.repoRoot}`);
        console.log(`📍 Current path: ${result.relativePath || '(root)'}`);
        console.log(`🌿 Branch: ${result.currentBranch}`);
        console.log(`📝 Has changes: ${result.hasChanges ? 'Yes' : 'No'}`);
        if (result.status) {
          console.log('\n📋 Changes:');
          console.log(result.status);
        }
      } else {
        console.error(`❌ Error: ${result.error}`);
        process.exit(1);
      }
    }
  },

  // Enhanced branch creation
  'branch': {
    description: 'Create and switch to a new feature branch (fetches latest main)',
    usage: 'smart-git branch <branch-name>',
    handler: async (args) => {
      if (!args[0]) {
        console.error('Usage: smart-git branch <branch-name>');
        process.exit(1);
      }
      const result = await SmartGitHelpers.createFeatureBranch(args[0]);
      if (result.success) {
        console.log(`✅ Created and switched to branch: ${result.branchName}`);
        console.log(`📁 Repository: ${result.repoRoot}`);
      } else {
        console.error(`❌ Error: ${result.error}`);
        process.exit(1);
      }
    }
  },

  // Enhanced commit
  'commit': {
    description: 'Smart commit from any subdirectory',
    usage: 'smart-git commit <message> [file1] [file2] ...',
    handler: async (args) => {
      if (!args[0]) {
        console.error('Usage: smart-git commit <message> [file1] [file2] ...');
        process.exit(1);
      }
      const message = args[0];
      const files = args.slice(1);
      const result = await SmartGitHelpers.smartCommit(message, files.length > 0 ? files : undefined);
      if (result.success) {
        console.log(`✅ Committed: ${result.commitHash?.substring(0, 8)}`);
        console.log(`📁 Repository: ${result.repoRoot}`);
      } else {
        console.error(`❌ Error: ${result.error}`);
        process.exit(1);
      }
    }
  },

  // Common git commands with smart execution
  'add': {
    description: 'Stage files for commit (executes from repo root)',
    usage: 'smart-git add <file1> [file2] ... | smart-git add .',
    handler: gitCommandHandler(['add'])
  },

  'push': {
    description: 'Push commits to remote (executes from repo root)',
    usage: 'smart-git push [remote] [branch]',
    handler: gitCommandHandler(['push'])
  },

  'pull': {
    description: 'Pull changes from remote (executes from repo root)',
    usage: 'smart-git pull [remote] [branch]',
    handler: gitCommandHandler(['pull'])
  },

  'fetch': {
    description: 'Fetch changes from remote (executes from repo root)',
    usage: 'smart-git fetch [remote]',
    handler: gitCommandHandler(['fetch'])
  },

  'checkout': {
    description: 'Switch branches or checkout files (executes from repo root)',
    usage: 'smart-git checkout <branch-name> | smart-git checkout <file>',
    handler: gitCommandHandler(['checkout'])
  },

  'log': {
    description: 'Show commit history (executes from repo root)',
    usage: 'smart-git log [options]',
    handler: gitCommandHandler(['log'])
  },

  'diff': {
    description: 'Show differences (executes from repo root)',
    usage: 'smart-git diff [file] | smart-git diff --cached',
    handler: gitCommandHandler(['diff'])
  },

  'merge': {
    description: 'Merge branches (executes from repo root)',
    usage: 'smart-git merge <branch-name>',
    handler: gitCommandHandler(['merge'])
  },

  'rebase': {
    description: 'Rebase current branch (executes from repo root)',
    usage: 'smart-git rebase <branch-name>',
    handler: gitCommandHandler(['rebase'])
  },

  'reset': {
    description: 'Reset changes (executes from repo root)',
    usage: 'smart-git reset [--soft|--hard] [commit]',
    handler: gitCommandHandler(['reset'])
  },

  'stash': {
    description: 'Stash uncommitted changes (executes from repo root)',
    usage: 'smart-git stash [push|pop|list|show]',
    handler: gitCommandHandler(['stash'])
  },

  'tag': {
    description: 'Create, list, or verify tags (executes from repo root)',
    usage: 'smart-git tag [-l] [tag-name]',
    handler: gitCommandHandler(['tag'])
  },

  'remote': {
    description: 'Manage remote repositories (executes from repo root)',
    usage: 'smart-git remote [-v] [add|remove] [name] [url]',
    handler: gitCommandHandler(['remote'])
  },

  'show': {
    description: 'Show commit details (executes from repo root)',
    usage: 'smart-git show [commit-hash]',
    handler: gitCommandHandler(['show'])
  },

  'blame': {
    description: 'Show line-by-line history (executes from repo root)',
    usage: 'smart-git blame <file>',
    handler: gitCommandHandler(['blame'])
  }
};

function gitCommandHandler(gitArgs: string[]) {
  return async (userArgs: string[]) => {
    const result = await executeGitCommand([...gitArgs, ...userArgs]);
    if (result.success) {
      if (result.stdout) console.log(result.stdout);
      console.error(`📁 (executed from: ${result.repoRoot})`);
    } else {
      if (result.stderr) console.error(result.stderr);
      console.error(`❌ Command failed in: ${result.repoRoot || 'unknown'}`);
      process.exit(1);
    }
  };
}

async function main() {
  const [,, command, ...args] = process.argv;

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log('🚀 Smart Git - Enhanced git commands with automatic repository detection');
    console.log('');
    console.log('Usage: smart-git <command> [args...]');
    console.log('');
    console.log('📋 Enhanced Commands:');
    console.log('  status              - Show smart git status with repository context');
    console.log('  branch <name>       - Create feature branch (fetches latest main)');
    console.log('  commit <msg> [files]- Smart commit from any subdirectory');
    console.log('');
    console.log('🔧 Common Git Commands (executed from repo root):');
    console.log('  add, push, pull, fetch, checkout, log, diff, merge,');
    console.log('  rebase, reset, stash, tag, remote, show, blame');
    console.log('');
    console.log('💡 Examples:');
    console.log('  smart-git status                    # Enhanced status');
    console.log('  smart-git branch feature/new-ui    # Create feature branch');
    console.log('  smart-git add .                     # Stage all changes');
    console.log('  smart-git commit "Fix bug"          # Commit from anywhere');
    console.log('  smart-git push origin main          # Push to remote');
    console.log('');
    console.log('🎯 Any other git command will be executed from the repository root');
    process.exit(0);
  }

  try {
    // Check if we have a specific handler for this command
    if (commands[command]) {
      await commands[command].handler(args);
    } else {
      // Execute any other git command from the repository root
      const result = await executeGitCommand([command, ...args]);
      if (result.success) {
        if (result.stdout) console.log(result.stdout);
        console.error(`📁 (executed from: ${result.repoRoot})`);
      } else {
        if (result.stderr) console.error(result.stderr);
        console.error(`❌ Command failed in: ${result.repoRoot || 'unknown'}`);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(`❌ Unexpected error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();