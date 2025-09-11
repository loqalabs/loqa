#!/usr/bin/env node

// Test both list_tasks and intelligent_task_prioritization logic
import { LoqaTaskManager } from './dist/managers/task-manager.js';
import { promises as fs } from 'fs';
import { join, dirname, basename } from 'path';

const workspaceRoot = '/Users/anna/Projects/loqalabs';
const knownRepositories = [
  'loqa', 'loqa-hub', 'loqa-commander', 'loqa-relay',
  'loqa-proto', 'loqa-skills', 'www-loqalabs-com', 'loqalabs-github-config'
];

async function testListTasks() {
  console.log('🧪 Testing Multi-Repository list_tasks Logic\n');
  
  // Simulate the enhanced list_tasks logic
  const actualWorkspaceRoot = knownRepositories.includes(basename(workspaceRoot)) 
    ? dirname(workspaceRoot) 
    : workspaceRoot;
    
  console.log(`📂 Workspace Root: ${workspaceRoot}`);
  console.log(`📂 Actual Workspace Root: ${actualWorkspaceRoot}\n`);
  
  let allTasks = [];
  let allDrafts = [];
  let repoSummaries = [];
  
  for (const repoName of knownRepositories) {
    try {
      const repoPath = join(actualWorkspaceRoot, repoName);
      const repoTaskManager = new LoqaTaskManager(repoPath);
      const result = await repoTaskManager.listTasks();
      
      if (result.tasks.length > 0 || result.drafts.length > 0) {
        repoSummaries.push(`**${repoName}**: ${result.tasks.length} tasks, ${result.drafts.length} drafts`);
        
        // Add repo prefix to tasks and drafts
        allTasks.push(...result.tasks.map(task => `${task} (${repoName})`));
        allDrafts.push(...result.drafts.map(draft => `${draft} (${repoName})`));
        
        console.log(`✅ ${repoName}: ${result.tasks.length} tasks, ${result.drafts.length} drafts`);
      }
    } catch (error) {
      // Repository doesn't exist or no backlog - skip silently
      console.log(`⚪ ${repoName}: No backlog or repository not found`);
    }
  }
  
  console.log(`\n📋 **Summary**:`);
  console.log(`   Total Tasks: ${allTasks.length}`);
  console.log(`   Total Drafts: ${allDrafts.length}`);
  console.log(`   Active Repos: ${repoSummaries.length}`);
  
  console.log(`\n🏢 **Repository Summary**:`);
  repoSummaries.forEach(summary => console.log(`   ${summary}`));
}

async function testIntelligentPrioritization() {
  console.log('\n\n🧪 Testing Multi-Repository intelligent_task_prioritization Logic\n');
  
  const actualWorkspaceRoot = workspaceRoot; // Assuming we're at workspace root
  const allTasks = [];
  
  console.log(`📂 Workspace Root: ${actualWorkspaceRoot}\n`);
  
  // Collect tasks from repositories (matches the enhanced logic)
  for (const repoName of knownRepositories) {
    const repoPath = join(actualWorkspaceRoot, repoName);
    try {
      await fs.access(join(repoPath, '.git'));
      // Create a task manager for this specific repository
      const repoTaskManager = new LoqaTaskManager(repoPath);
      const taskList = await repoTaskManager.listTasks();
      
      console.log(`🔍 ${repoName}: ${taskList.tasks.length} tasks found`);
      
      // Parse a few task files to get metadata (sample)
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
            path: taskPath
          };
          
          // Apply filters (skip completed)
          if (task.status.toLowerCase().includes('done') || task.status.toLowerCase().includes('completed')) {
            continue;
          }
          
          allTasks.push(task);
          
        } catch (error) {
          console.log(`     ❌ Failed to parse ${taskFile}: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`⚪ ${repoName}: Repository not found or no git`);
    }
  }
  
  // Score tasks based on various criteria (sample)
  const scoredTasks = allTasks.map(task => {
    let score = 0;
    
    // Priority scoring
    if (task.priority.toLowerCase() === 'high') score += 3;
    else if (task.priority.toLowerCase() === 'medium') score += 2;
    else score += 1;
    
    return { ...task, score };
  });
  
  // Sort by score descending
  scoredTasks.sort((a, b) => b.score - a.score);
  
  const recommendedTask = scoredTasks.length > 0 ? scoredTasks[0] : undefined;
  const alternativeTasks = scoredTasks.slice(1, 4);
  
  console.log(`\n🎯 **Prioritization Results**:`);
  console.log(`   Total Tasks Analyzed: ${allTasks.length}`);
  console.log(`   Eligible Tasks: ${scoredTasks.length}`);
  
  if (recommendedTask) {
    console.log(`\n⭐ **Recommended Task**:`);
    console.log(`   • ${recommendedTask.title} (${recommendedTask.repository}) [${recommendedTask.priority}] - Score: ${recommendedTask.score}`);
  }
  
  if (alternativeTasks.length > 0) {
    console.log(`\n🔄 **Alternative Tasks**:`);
    alternativeTasks.forEach(task => {
      console.log(`   • ${task.title} (${task.repository}) [${task.priority}] - Score: ${task.score}`);
    });
  }
}

async function runTests() {
  await testListTasks();
  await testIntelligentPrioritization();
}

runTests().catch(console.error);