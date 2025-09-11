#!/usr/bin/env node

// Simple test script to verify our task prioritization logic works
import { LoqaTaskManager } from './dist/managers/task-manager.js';
import { promises as fs } from 'fs';
import { join, dirname, basename } from 'path';

const workspaceRoot = '/Users/anna/Projects/loqalabs';
const knownRepositories = [
  'loqa',
  'loqa-hub', 
  'loqa-commander',
  'loqa-relay',
  'loqa-proto', 
  'loqa-skills',
  'www-loqalabs-com',
  'loqalabs-github-config'
];

async function testTaskDetection() {
  console.log('🧪 Testing Multi-Repository Task Detection\n');
  
  const allTasks = [];
  
  // Collect tasks from repositories
  for (const repoName of knownRepositories) {
    const repoPath = join(workspaceRoot, repoName);
    console.log(`🔍 Checking repository: ${repoName}`);
    console.log(`   Path: ${repoPath}`);
    
    try {
      await fs.access(join(repoPath, '.git'));
      console.log(`   ✅ Git repository found`);
      
      // Create a task manager for this specific repository
      const repoTaskManager = new LoqaTaskManager(repoPath);
      const taskList = await repoTaskManager.listTasks();
      
      console.log(`   📝 Tasks found: ${taskList.tasks.length}`);
      console.log(`   📋 Drafts found: ${taskList.drafts.length}`);
      
      if (taskList.tasks.length > 0) {
        console.log(`   📄 Task files: ${taskList.tasks.slice(0, 3).join(', ')}${taskList.tasks.length > 3 ? '...' : ''}`);
        
        // Parse task files to get metadata
        for (const taskFile of taskList.tasks.slice(0, 2)) { // Limit for testing
          try {
            const taskPath = join(repoPath, 'backlog', 'tasks', taskFile);
            const content = await fs.readFile(taskPath, 'utf-8');
            
            // Parse YAML frontmatter
            let task = {};
            if (content.startsWith('---')) {
              const frontmatterEnd = content.indexOf('---', 3);
              if (frontmatterEnd !== -1) {
                const frontmatter = content.slice(4, frontmatterEnd);
                // Simple YAML parsing for basic fields
                const lines = frontmatter.split('\n');
                for (const line of lines) {
                  const colonIndex = line.indexOf(':');
                  if (colonIndex > 0) {
                    const key = line.slice(0, colonIndex).trim();
                    const value = line.slice(colonIndex + 1).trim().replace(/'/g, '');
                    
                    if (key === 'id') task.id = value;
                    else if (key === 'title') task.title = value;
                    else if (key === 'status') task.status = value;
                    else if (key === 'priority') task.priority = value;
                  }
                }
              }
            }
            
            // Fill in defaults and normalize
            task = {
              id: task.id || taskFile.replace('.md', ''),
              title: task.title || taskFile,
              priority: task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium',
              status: task.status || 'To Do',
              type: 'Task',
              repository: repoName,
              path: taskPath,
              content: content.slice(0, 100) + '...' // Truncate for display
            };
            
            console.log(`     🎯 Task: ${task.title} [${task.priority}] (${task.status})`);
            allTasks.push(task);
            
          } catch (error) {
            console.log(`     ❌ Failed to parse ${taskFile}: ${error.message}`);
          }
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Repository not found or no git: ${error.message}`);
    }
    
    console.log();
  }
  
  console.log(`🎯 **Summary**:`);
  console.log(`   Total tasks found: ${allTasks.length}`);
  console.log(`   Repositories with tasks: ${[...new Set(allTasks.map(t => t.repository))].join(', ')}`);
  
  if (allTasks.length > 0) {
    console.log(`\n📋 **All Tasks**:`);
    allTasks.forEach(task => {
      console.log(`   • ${task.title} (${task.repository}) [${task.priority}] - ${task.status}`);
    });
  }
}

testTaskDetection().catch(console.error);