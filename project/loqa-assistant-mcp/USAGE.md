# Loqa Assistant MCP Server - Usage Guide

Comprehensive guide for using the Loqa Assistant MCP Server with Claude Code for streamlined development workflows, GitHub integration, and intelligent issue creation.

## 🎯 Intelligent Interview System

### **Creating Comprehensive GitHub Issues**

The intelligent interview system revolutionizes GitHub issue creation by guiding users through natural conversation to gather all necessary details for professional, actionable issues.

#### **Starting an Interview**

**Natural Language (Recommended)**:
```bash
# Simply tell Claude Code what you want to work on
"Start an interview to create a GitHub issue for implementing user authentication"
"I need to create an issue for adding rate limiting to the API"
"Help me create a comprehensive issue for fixing the memory leak in voice processing"
```

**Direct MCP Tool**:
```typescript
{
  "name": "issue:StartInterview",
  "arguments": {
    "initialInput": "Add comprehensive error handling to gRPC services",
    "skipKnownAnswers": true
  }
}
```

#### **Responding to Interview Questions**

Once an interview starts, simply respond conversationally to each question:

```bash
# The system asks: "What is the title of this task?"
"JWT Authentication System with Session Management"

# The system asks: "Describe what needs to be done in detail:"
"Implement JWT-based authentication with secure session management, token expiration, and refresh token functionality. Should integrate with existing user database and provide middleware for protecting API endpoints."

# The system asks: "What type of work is this?"
"feature"

# Continue responding naturally to each question...
```

#### **Interview Question Flow**

The system will guide you through these 7 essential questions:

1. **Title** - Concise, descriptive issue title
2. **Description** - Detailed explanation of requirements and scope
3. **Type** - Classification: `feature`, `bug-fix`, `protocol-change`, `cross-repo`, `general`
4. **Priority** - Impact level: `High`, `Medium`, `Low` with reasoning
5. **Repository** - Target repository from available options
6. **Acceptance Criteria** - Specific, testable requirements defining "done"
7. **Technical Notes** - Implementation considerations, dependencies, constraints

#### **Managing Active Interviews**

**View Active Interviews**:
```bash
# Natural language
"Show me my active interviews"
"List any interviews I can resume"

# Direct MCP tool
{
  "name": "issue:ListActiveInterviews",
  "arguments": {}
}
```

**Resume an Interview**:
```bash
# Interviews automatically resume when you respond
# Just answer the next question conversationally
```

**Process Any Conversational Response**:
```bash
# The system automatically handles conversational flow
{
  "name": "issue:ProcessConversationalResponse",
  "arguments": {
    "message": "Yes, this should include OAuth2 integration as well"
  }
}
```

#### **Generated Issue Structure**

Each completed interview creates a comprehensive GitHub issue with:

```markdown
# [Issue Title]

## Description
[Detailed explanation from interview responses]

## Acceptance Criteria
[Specific, testable requirements]
- First requirement with clear success criteria
- Second requirement with measurable outcomes
- Third requirement with validation steps

## Technical Notes
[Implementation considerations and constraints]
- Dependencies and integration points
- Performance considerations
- Security requirements

## Metadata
- **Type**: feature
- **Priority**: High
- **Repository**: loqa-hub
- **Created from**: [Original input]
- **Interview ID**: uuid-reference
```

**Automatic Labels Applied**:
- `type: feature` / `type: bug-fix` / etc.
- `priority: high` / `priority: medium` / `priority: low`
- `needs-technical-review` (when technical notes provided)
- `scope: cross-repo` (when multiple repositories affected)
- `type: breaking-change` (when breaking changes identified)

### **Advanced Interview Features**

#### **Smart Analysis**

The system automatically analyzes your initial input to:
- **Detect Issue Type**: "Fix memory leak" → `bug-fix`, "Add authentication" → `feature`
- **Suggest Priority**: "Critical security vulnerability" → `High`, "UI polish" → `Low`
- **Pre-fill Answers**: Short, clear inputs may auto-populate the title

#### **Context Awareness**

The interview system intelligently:
- **Distinguishes Commands from Answers**: Recognizes when you're asking for help vs. answering
- **Handles Interruptions**: Maintains state if you need to ask questions mid-interview
- **Provides Guidance**: Offers help when responses don't match expected patterns

#### **Cross-Repository Coordination**

For multi-repository work:
- **Automatic Detection**: Identifies when work affects multiple services
- **Dependency Tracking**: Records relationships between related issues
- **Coordination Notes**: Adds warnings about deployment coordination needs

### **Storage and Persistence**

#### **Interview Storage Location**
```
{workspace-root}/.loqa-assistant/interviews/interviews.json
```

#### **Storage Format**
```json
[
  {
    "id": "uuid-of-interview",
    "originalInput": "User's initial request",
    "currentQuestion": "Next question to ask",
    "questionIndex": 2,
    "answers": {
      "title": "User's title response",
      "description": "User's description response"
    },
    "interviewComplete": false,
    "createdAt": "2025-09-14T10:30:00Z",
    "updatedAt": "2025-09-14T10:35:00Z",
    "issueType": "feature",
    "priority": "High"
  }
]
```

#### **Automatic Cleanup**
- Completed interviews are automatically cleaned up after GitHub issue creation
- Failed interviews are preserved for manual recovery
- Storage is optimized to prevent accumulation of stale data

### **Integration with Existing Workflows**

#### **GitHub MCP Integration**
The interview system seamlessly integrates with:
- **GitHub Issues**: Direct creation with proper formatting and labels
- **GitHub Projects**: Automatic project integration where configured
- **Cross-Repository Linking**: Automatic issue linking for coordinated work

#### **Quality Gates Integration**
- **Template Validation**: Ensures all required sections are completed
- **Label Consistency**: Applies standardized labels across all repositories
- **Review Requirements**: Adds appropriate labels for technical review needs

## 🚀 Quick Start Examples

### **Common Scenarios**

#### **New Feature Development**
```bash
"Start an interview for adding real-time notifications to the dashboard"
# System guides through feature-specific questions
# Result: Comprehensive feature issue with UI/UX considerations
```

#### **Bug Fix Documentation**
```bash
"Create an issue for the audio cutting out after 30 seconds"
# System focuses on reproduction steps and debugging info
# Result: Detailed bug report with technical context
```

#### **Cross-Repository Changes**
```bash
"I need to update the gRPC protocol and all consuming services"
# System detects cross-repo impact
# Result: Coordinated issues with dependency tracking
```

#### **Security Issues**
```bash
"Create an issue for implementing rate limiting across all API endpoints"
# System recognizes security implications
# Result: Security-focused issue with priority escalation
```

### **Best Practices**

#### **For Effective Interviews**
- ✅ **Be Descriptive**: Provide context in your initial input
- ✅ **Answer Completely**: Give comprehensive responses to each question
- ✅ **Include Technical Details**: Mention dependencies, constraints, performance considerations
- ✅ **Specify Acceptance Criteria**: Think about what "done" means before starting

#### **for Repository Selection**
- ✅ **Know Your Architecture**: Understand which service handles what functionality
- ✅ **Consider Dependencies**: Think about which repositories will be affected
- ✅ **Plan Coordination**: Mention if multiple repositories need simultaneous changes

#### **For Priority Setting**
- ✅ **Consider Impact**: How many users are affected?
- ✅ **Assess Urgency**: Is this blocking other work?
- ✅ **Think About Resources**: What's the development cost vs. benefit?

## 🎯 Intelligent Issue Prioritization

### **Discovering High-Priority Work**

The intelligent prioritization system scans all GitHub repositories in the Loqa ecosystem to find and rank issues based on priority, complexity, and your role context.

#### **Basic Usage**

**Natural Language (Recommended)**:
```bash
# Via Claude Code - most user-friendly
"What are the highest priority GitHub issues right now?"
"Show me high-priority issues I should work on today"
"What issues should a developer focus on this week?"
```

**Direct MCP Tool**:
```typescript
{
  "name": "workspace:IntelligentIssuePrioritization",
  "arguments": {
    "timeframe": "today",    // today, week, sprint, month
    "role": "developer"      // developer, qa, devops, architect
  }
}
```

#### **Example Response**

```
🎯 Intelligent Issue Prioritization

📊 Analysis Summary:
- Total issues found: 43
- Eligible issues: 43
- Context: developer role, today timeframe, all repository focus

⭐ Recommended Issue:
- **🛠️ Developer-First Installation & Setup Experience** (loqa)
- Priority: High, Status: open, Score: 4/10

🔄 Alternative Issues:
- **💰 GitHub Sponsors Setup & Community Funding** (loqa) - Score: 4/10
- **🌊 Real-Time Streaming LLM Implementation** (loqa) - Score: 4/10

🧠 Enhanced Analysis:
📈 Work Focus: Moderate - focused on specific area
🏥 Project Health: Stable - normal issue distribution
⏰ Timeline Insight: Flexible timeline allows smart selection

💡 Optimization Recommendations:
• High volume of high-priority issues - consider re-evaluating priorities

🚀 Next Steps:
• Use: "Create a feature branch for issue #[number]"
• Or: smart-git_branch(branchName: "feature/[issue-name]")
```

#### **Advanced Filtering**

**Role-Based Prioritization**:
```bash
# Get issues optimized for your role
"Show me QA-focused issues this sprint"
"What should a DevOps engineer work on this week?"
"Find architecture-related issues for this month"
```

**Repository-Specific Focus**:
```bash
# Focus on specific repositories
"Show high-priority issues in loqa-hub"
"What are the critical issues in loqa-commander?"
```

#### **Integration with Workflow**

**Creating Feature Branches from Prioritized Issues**:
```bash
# After finding a priority issue, create a branch
"Create a feature branch for issue #40"

# Or use smart git tools
smart-git_branch(branchName: "feature/developer-first-setup")
```

**Cross-Repository Coordination**:
```bash
# Find issues that affect multiple repositories
"Show me cross-repository issues that need coordination"
"What breaking changes are planned across repositories?"
```

### **Troubleshooting**

#### **Interview Not Starting**
- Ensure Claude Code has the MCP server configured
- Check that the server is running and accessible
- Verify workspace root detection is working

#### **Responses Not Being Recognized**
- Try more complete sentences instead of single words
- Avoid starting responses with command-like patterns (`/`, `#`, etc.)
- If stuck, use `issue:ListActiveInterviews` to check status

#### **Storage Issues**
- Check that workspace root is correctly detected
- Ensure write permissions to `.loqa-assistant` directory
- Verify JSON file integrity if interviews aren't persisting

### **Migration from Manual Issue Creation**

If you're used to creating GitHub issues manually:

**Old Way**:
```bash
gh issue create --title "Add auth" --body "Need authentication" --label "feature"
```

**New Way with Interview**:
```bash
"Start an interview to create a GitHub issue for adding authentication"
# System guides through comprehensive requirements gathering
# Result: Professional issue with acceptance criteria, technical notes, proper labels
```

**Benefits of Interview Approach**:
- ✅ **Comprehensive Requirements**: Never forget important details
- ✅ **Consistent Structure**: All issues follow professional format
- ✅ **Proper Labels**: Automatic, consistent labeling system
- ✅ **Cross-Repo Awareness**: Automatic coordination detection
- ✅ **Quality Assurance**: Built-in validation and completeness checking

## 🔗 Related Documentation

- **[README.md](README.md)**: Installation and setup guide
- **[CLAUDE.md](../../../CLAUDE.md)**: Full project documentation for Claude Code
- **[GitHub Issues Templates](../../.github/ISSUE_TEMPLATE/)**: Standard issue templates for manual creation
- **[MCP Server Architecture](src/)**: Technical implementation details

## 🛠️ Advanced Usage

For developers and power users who want to extend or integrate with the interview system:

### **Custom Interview Templates**
The interview system can be extended with custom question flows for specific project needs.

### **Integration Points**
- GitHub API integration for issue creation
- Workspace detection and repository resolution
- Cross-repository coordination and linking
- Label management and consistency enforcement

### **API Reference**
See the TypeScript interfaces in `src/utils/` for detailed API documentation.