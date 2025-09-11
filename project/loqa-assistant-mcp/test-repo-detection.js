#!/usr/bin/env node

/**
 * Test script to demonstrate repository detection and conditional tool availability
 * This runs the MCP server logic without the stdio transport to test the functionality
 */

import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';

class LoqaRulesValidator {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.git = simpleGit(this.workspaceRoot);
  }

  async detectLoqaRepository(repoPath) {
    try {
      // Check for Loqa-specific files
      const loqaIndicators = [
        '.claude-code.json',
        'CLAUDE.md',
        'go.mod', // Go services
        'package.json', // JS services
        'docker-compose.yml',
        'Dockerfile'
      ];

      const files = await fs.readdir(repoPath);
      const hasLoqaIndicators = loqaIndicators.some(indicator => files.includes(indicator));

      // Check if it's specifically a Loqa service by looking at package.json or go.mod
      if (hasLoqaIndicators) {
        try {
          // Check package.json for Loqa-related content
          if (files.includes('package.json')) {
            const packageJson = JSON.parse(await fs.readFile(`${repoPath}/package.json`, 'utf8'));
            if (packageJson.name && (
              packageJson.name.includes('loqa') || 
              packageJson.description?.toLowerCase().includes('loqa') ||
              JSON.stringify(packageJson).toLowerCase().includes('loqa')
            )) {
              return true;
            }
          }

          // Check go.mod for Loqa-related content
          if (files.includes('go.mod')) {
            const goMod = await fs.readFile(`${repoPath}/go.mod`, 'utf8');
            if (goMod.toLowerCase().includes('loqa')) {
              return true;
            }
          }

          // Check for CLAUDE.md which is specific to Loqa repos
          if (files.includes('CLAUDE.md')) {
            const claudeMd = await fs.readFile(`${repoPath}/CLAUDE.md`, 'utf8');
            if (claudeMd.toLowerCase().includes('loqa')) {
              return true;
            }
          }

        } catch (error) {
          // If we can't read files, fall back to basic detection
          console.warn(`Could not read project files: ${error.message}`);
        }
      }

      return false;
    } catch (error) {
      console.error(`Error detecting repository: ${error.message}`);
      return false;
    }
  }

  async getRepositoryInfo(path = this.workspaceRoot) {
    try {
      const git = simpleGit(path);
      const status = await git.status();
      const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
      const isLoqaRepository = await this.detectLoqaRepository(path);

      return {
        path,
        currentBranch,
        hasUncommittedChanges: !status.isClean(),
        isLoqaRepository
      };
    } catch (error) {
      throw new Error(`Failed to get repository info: ${error}`);
    }
  }
}

async function testRepositoryDetection() {
  console.log('🧪 Testing Repository Detection and Conditional Tool Availability\n');

  const validator = new LoqaRulesValidator();
  
  // Test current directory (should be Loqa MCP server repo)
  console.log('📁 Testing current directory:');
  try {
    const currentRepoInfo = await validator.getRepositoryInfo();
    console.log(`   Path: ${currentRepoInfo.path}`);
    console.log(`   Branch: ${currentRepoInfo.currentBranch}`);
    console.log(`   Clean: ${!currentRepoInfo.hasUncommittedChanges}`);
    console.log(`   Is Loqa Repo: ${currentRepoInfo.isLoqaRepository ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test parent directories to see different repo types
  console.log('\n📁 Testing parent directories:');
  const testPaths = [
    '..',
    '../..',
    '../../..'
  ];

  for (const testPath of testPaths) {
    try {
      const repoInfo = await validator.getRepositoryInfo(testPath);
      console.log(`   ${testPath}: ${repoInfo.isLoqaRepository ? '✅ Loqa' : '❌ Non-Loqa'} (${repoInfo.path})`);
    } catch (error) {
      console.log(`   ${testPath}: ❌ Not a git repo or error`);
    }
  }

  // Simulate tool availability based on detection
  console.log('\n🔧 Simulated Tool Availability:');
  
  const baseTools = ['get_repository_info'];
  const loqaTools = [
    'validate_commit_message',
    'validate_branch_name', 
    'validate_pre_commit',
    'validate_quality_gates',
    'add_todo',
    'capture_thought',
    'list_templates',
    'list_tasks',
    'set_role'
  ];

  try {
    const currentRepo = await validator.getRepositoryInfo();
    const availableTools = currentRepo.isLoqaRepository ? [...baseTools, ...loqaTools] : baseTools;
    
    console.log(`   Available tools (${availableTools.length}):`);
    availableTools.forEach(tool => {
      const isLoqaTool = loqaTools.includes(tool);
      console.log(`     ${isLoqaTool ? '🎯' : '🔧'} ${tool}`);
    });
    
    console.log(`\n   ${currentRepo.isLoqaRepository ? '✅' : '❌'} Loqa-specific tools ${currentRepo.isLoqaRepository ? 'enabled' : 'disabled'}`);
    
  } catch (error) {
    console.log(`   ❌ Error testing tool availability: ${error.message}`);
  }

  console.log('\n🎉 Repository detection test completed!');
}

// Run the test
testRepositoryDetection().catch(console.error);