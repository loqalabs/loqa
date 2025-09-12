/**
 * Test script to validate AI-powered prioritization improvements
 * Tests the exact task-027 scenario that was under-prioritized
 */

import { analyzeTaskPriorityWithAI } from './dist/tools/ai-prioritization.js';

async function testTask027Scenario() {
  console.log('🧪 Testing AI-Powered Prioritization with Task-027 Scenario\n');
  
  // Exact task-027 content that was under-prioritized
  const task027Content = `
    Emergency Fix: Split 2,768-line task-management-tools.ts monolith
    
    The task-management-tools.ts file has grown to 2,768 lines, causing Claude Code to timeout 
    when trying to analyze or modify it. This is the root cause of current development workflow 
    issues and needs emergency resolution. This is Phase 0 of the workflow redesign - focused 
    solely on restoring Claude Code functionality without over-engineering.
    
    Split the monolithic file into 5 focused modules to resolve Claude Code timeout issues 
    that are blocking developer productivity.
  `;
  
  console.log('📋 **Testing Task Content:**');
  console.log(task027Content.trim());
  console.log('\n' + '='.repeat(80) + '\n');
  
  try {
    // Test with architect role (the scenario where it failed)
    console.log('🏗️ **AI Analysis for Architect Role:**');
    const architectAnalysis = await analyzeTaskPriorityWithAI(
      task027Content,
      "Emergency Fix: Split 2,768-line task-management-tools.ts monolith", 
      "architect",
      "Voice assistant microservice project with focus on developer experience"
    );
    
    console.log(`Priority: ${architectAnalysis.priority.toUpperCase()}`);
    console.log(`Score: ${architectAnalysis.score}/100`);
    console.log(`Reasoning: ${architectAnalysis.reasoning}`);
    console.log(`Architectural Impact: ${architectAnalysis.architecturalImpact}%`);
    console.log(`Technical Debt Level: ${architectAnalysis.technicalDebtLevel}%`);
    console.log(`Productivity Impact: ${architectAnalysis.productivityImpact}%`);
    console.log(`Urgency Factors: ${architectAnalysis.urgencyFactors.join(', ') || 'None'}`);
    console.log('\n**Role Alignment:**');
    console.log(`- Architect: ${architectAnalysis.roleAlignment.architect}%`);
    console.log(`- Developer: ${architectAnalysis.roleAlignment.developer}%`);
    console.log(`- DevOps: ${architectAnalysis.roleAlignment.devops}%`);
    console.log(`- QA: ${architectAnalysis.roleAlignment.qa}%`);
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Test with developer role for comparison
    console.log('👩‍💻 **AI Analysis for Developer Role:**');
    const developerAnalysis = await analyzeTaskPriorityWithAI(
      task027Content,
      "Emergency Fix: Split 2,768-line task-management-tools.ts monolith",
      "developer",
      "Voice assistant microservice project with focus on developer experience"
    );
    
    console.log(`Priority: ${developerAnalysis.priority.toUpperCase()}`);
    console.log(`Score: ${developerAnalysis.score}/100`);
    console.log(`Role-specific improvements: ${(architectAnalysis.score - developerAnalysis.score > 0) ? '✅ Architect gets higher priority' : '❌ No role-specific boost'}`);
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Validation
    console.log('✅ **Validation Results:**');
    
    const validations = [
      {
        test: 'Should be HIGH/CRITICAL priority for architects',
        result: architectAnalysis.priority === 'critical' || architectAnalysis.priority === 'high',
        expected: 'HIGH/CRITICAL',
        actual: architectAnalysis.priority.toUpperCase()
      },
      {
        test: 'Should detect emergency/blocking patterns',
        result: architectAnalysis.urgencyFactors.length > 0,
        expected: '> 0 urgency factors',
        actual: `${architectAnalysis.urgencyFactors.length} factors`
      },
      {
        test: 'Should identify productivity impact',
        result: architectAnalysis.productivityImpact > 60,
        expected: '> 60% productivity impact',
        actual: `${architectAnalysis.productivityImpact}%`
      },
      {
        test: 'Should recognize technical debt',
        result: architectAnalysis.technicalDebtLevel > 50,
        expected: '> 50% technical debt',
        actual: `${architectAnalysis.technicalDebtLevel}%`
      },
      {
        test: 'Should be higher for architects vs developers',
        result: architectAnalysis.score > developerAnalysis.score,
        expected: 'Architect score > Developer score',
        actual: `${architectAnalysis.score} vs ${developerAnalysis.score}`
      }
    ];
    
    validations.forEach(validation => {
      console.log(`${validation.result ? '✅' : '❌'} ${validation.test}`);
      console.log(`   Expected: ${validation.expected}, Got: ${validation.actual}`);
    });
    
    const passedTests = validations.filter(v => v.result).length;
    console.log(`\n📊 **Overall: ${passedTests}/${validations.length} tests passed**`);
    
    if (passedTests === validations.length) {
      console.log('🎉 **SUCCESS: AI-powered prioritization fixes the task-027 scenario!**');
    } else {
      console.log('⚠️ **NEEDS IMPROVEMENT: Some validations failed**');
    }
    
  } catch (error) {
    console.error('❌ Error testing AI prioritization:', error);
  }
}

// Run the test
testTask027Scenario();