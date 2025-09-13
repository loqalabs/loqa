/**
 * Simple test to verify IssueProvider architecture works correctly
 */

import { IssueProviderManager } from '../managers/issue-provider-manager.js';
import { GitHubIssueProvider } from '../providers/github-issue-provider.js';
import {
  IssueProvider,
  IssuePriority,
  IssueCreationOptions,
  IssueStatus
} from '../types/issue-provider.js';

/**
 * Test IssueProvider architecture end-to-end
 */
async function testIssueProviders(): Promise<void> {
  console.log('🧪 Testing IssueProvider Architecture...\n');
  
  // Test 1: Individual provider initialization
  console.log('1️⃣ Testing individual provider initialization...');
  
  try {
    const githubProvider = new GitHubIssueProvider();
    
    console.log('✅ GitHubIssueProvider initialized');
    
    // Test provider capabilities
    const githubCaps = githubProvider.getCapabilities();
    
    console.log(`   GitHub capabilities: create=${githubCaps.canCreate}, update=${githubCaps.canUpdate}, labels=${githubCaps.canLabel}`);
    
  } catch (error) {
    console.error('❌ Provider initialization failed:', error);
    return;
  }
  
  // Test 2: IssueProviderManager initialization
  console.log('\n2️⃣ Testing IssueProviderManager initialization...');
  
  let manager: IssueProviderManager;
  try {
    manager = new IssueProviderManager({
      preferredProvider: IssueProvider.GITHUB,
      fallbackEnabled: true,
      healthCheckInterval: 1 // 1 minute for testing
    });
    
    console.log('✅ IssueProviderManager initialized');
    
    // Test health checks
    const healthStatus = await manager.getAllProviderHealth();
    console.log('   Health status:');
    for (const [provider, health] of healthStatus) {
      console.log(`     ${provider}: ${health.available ? '✅ Available' : '❌ Unavailable'}${health.error ? ` (${health.error})` : ''}`);
    }
    
  } catch (error) {
    console.error('❌ IssueProviderManager initialization failed:', error);
    return;
  }
  
  // Test 3: Issue creation with different scenarios
  console.log('\n3️⃣ Testing issue creation scenarios...');
  
  const testIssues: IssueCreationOptions[] = [
    {
      title: 'Test GitHub Integration Issue',
      description: 'This issue should prefer GitHub provider',
      priority: IssuePriority.HIGH,
      type: 'Feature',
      preferredProvider: IssueProvider.GITHUB,
      labels: ['test', 'github-integration'],
      fallbackToOtherProvider: true
    },
    {
      title: 'Test GitHub Bug Fix Issue',
      description: 'This issue should use GitHub provider for bug tracking',
      priority: IssuePriority.MEDIUM,
      type: 'Bug Fix',
      preferredProvider: IssueProvider.GITHUB,
      template: 'bug-fix',
      fallbackToOtherProvider: true
    },
    {
      title: 'Test Auto-Selection Cross-Repo Issue',
      description: 'This issue should auto-select GitHub due to cross-repo nature',
      priority: IssuePriority.HIGH,
      type: 'Feature',
      template: 'cross-repo',
      fallbackToOtherProvider: true
    }
  ];
  
  for (let i = 0; i < testIssues.length; i++) {
    const issueOptions = testIssues[i];
    console.log(`\n   Test ${i + 1}: ${issueOptions.title}`);
    
    try {
      const result = await manager.createIssue(issueOptions);
      
      if (result.success && result.issue) {
        console.log(`   ✅ Created successfully!`);
        console.log(`      Provider: ${result.providerUsed}${result.fallbackUsed ? ' (fallback)' : ''}`);
        console.log(`      Issue ID: ${result.issue.id}`);
        console.log(`      Status: ${result.issue.status}`);
        console.log(`      Labels: ${result.issue.labels.join(', ')}`);
        
        if (result.issue.url) {
          console.log(`      URL: ${result.issue.url}`);
        }
        
      } else {
        console.log(`   ❌ Creation failed: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Creation threw error: ${error instanceof Error ? error.message : error}`);
    }
  }
  
  // Test 4: Issue listing and filtering
  console.log('\n4️⃣ Testing issue listing...');
  
  try {
    const allIssues = await manager.listIssues();
    console.log(`   Found ${allIssues.length} total issues across all providers`);
    
    // Test filtering by provider
    const githubIssues = await manager.listIssues({ provider: [IssueProvider.GITHUB] });
    
    console.log(`   GitHub issues: ${githubIssues.length}`);
    
    // Show sample issues
    if (allIssues.length > 0) {
      console.log('\n   Sample issues:');
      allIssues.slice(0, 3).forEach((issue, index) => {
        console.log(`     ${index + 1}. [${issue.provider}] ${issue.title} (${issue.status})`);
      });
    }
    
  } catch (error) {
    console.log(`   ❌ Listing failed: ${error instanceof Error ? error.message : error}`);
  }
  
  // Test 5: Provider selection logic
  console.log('\n5️⃣ Testing provider selection logic...');
  
  const selectionTests = [
    {
      name: 'High priority issue',
      criteria: { priority: IssuePriority.HIGH, issueType: 'feature' }
    },
    {
      name: 'Cross-repo issue',
      criteria: { issueType: 'cross-repo', requiredFeatures: ['collaboration'] }
    },
    {
      name: 'Simple GitHub issue',
      criteria: { priority: IssuePriority.LOW, preferredProvider: IssueProvider.GITHUB }
    }
  ];
  
  for (const test of selectionTests) {
    try {
      const selectedProvider = await manager.selectProvider(test.criteria, 'create');
      
      if (selectedProvider) {
        console.log(`   ✅ ${test.name}: Selected ${selectedProvider.providerType}`);
      } else {
        console.log(`   ❌ ${test.name}: No provider selected`);
      }
    } catch (error) {
      console.log(`   ❌ ${test.name}: Selection failed - ${error instanceof Error ? error.message : error}`);
    }
  }
  
  // Test 6: Template availability
  console.log('\n6️⃣ Testing template availability...');
  
  try {
    const availableTemplates = await manager.getAvailableTemplates();
    
    console.log(`   Found templates from ${availableTemplates.length} providers:`);
    for (const providerTemplates of availableTemplates) {
      console.log(`     ${providerTemplates.provider}: ${providerTemplates.templates.length} templates`);
      
      if (providerTemplates.templates.length > 0) {
        const sampleTemplate = providerTemplates.templates[0];
        console.log(`       Sample: ${sampleTemplate.name} - ${sampleTemplate.description}`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Template listing failed: ${error instanceof Error ? error.message : error}`);
  }
  
  // Cleanup
  console.log('\n🧹 Cleaning up...');
  manager.shutdown();
  console.log('✅ IssueProviderManager shutdown complete');
  
  console.log('\n🎉 IssueProvider architecture test completed!');
}

/**
 * Run a quick integration test
 */
async function quickIntegrationTest(): Promise<void> {
  console.log('⚡ Running quick integration test...\n');
  
  const manager = new IssueProviderManager();
  
  // Test simple issue creation
  try {
    const result = await manager.createIssue({
      title: 'Quick Integration Test Issue',
      description: 'Testing the new IssueProvider architecture',
      priority: IssuePriority.MEDIUM,
      type: 'Feature',
      fallbackToOtherProvider: true
    });
    
    if (result.success) {
      console.log(`✅ Integration test passed!`);
      console.log(`   Provider used: ${result.providerUsed}`);
      console.log(`   Issue created: ${result.issue?.title}`);
      console.log(`   Issue ID: ${result.issue?.id}`);
    } else {
      console.log(`❌ Integration test failed: ${result.error}`);
    }
    
  } catch (error) {
    console.log(`❌ Integration test error: ${error instanceof Error ? error.message : error}`);
  } finally {
    manager.shutdown();
  }
}

// Export test functions
export {
  testIssueProviders,
  quickIntegrationTest
};

// If run directly, execute the full test suite
if (import.meta.url === `file://${process.argv[1]}`) {
  testIssueProviders().catch(console.error);
}