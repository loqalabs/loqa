---
description: "Capture technical thoughts, concerns, and insights with intelligent task creation suggestions"
allowed_tools: ["mcp__loqa-assistant__capture_thought", "mcp__loqa-assistant__capture_comprehensive_thought", "mcp__loqa-assistant__start_comprehensive_task_creation"]
---

# Capture Technical Thought

Capture a technical thought, concern, or insight using an interactive workflow.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly and capture the thought.

If no parameters are provided, use this interactive workflow:

1. **Ask for thought description**: "Please describe your technical thought, concern, or insight in your own words. What technical issue, observation, or idea do you want to capture?"

2. **AI Analysis**: Analyze the user's description to intelligently suggest:
   - **content**: Clear, well-structured version of their technical thought
   - **context**: Inferred context (e.g., "code review observation", "performance analysis", "architecture consideration")
   - **tags**: Relevant technical tags based on the thought nature (e.g., performance, security, technical-debt, architecture, refactoring)
   - **category**: Defaults to "technical-architecture"

3. **Confirmation**: Present suggestions to user: "Based on your description, I suggest capturing this technical thought with the following details: [show suggestions]. Would you like to save the thought with these parameters, or would you like to modify any of them?"

4. **Intelligent evaluation**: The system will analyze the thought against current project priorities and suggest task creation if warranted.

5. **Task creation suggestion**: If the thought aligns with project goals, you'll see:
   ```
   🚀 Priority Assessment: This thought appears to align with current project goals!
   
   Why it matters: [reasoning based on current project state]
   
   💪 Suggested Action: Create a comprehensive task with:
   • Template: feature
   • Priority: High
   • Category: architecture
   
   Ready to create a fully-scoped task? Use:
   /create-task "your thought content"
   ```

6. **Capture thought**: Use the appropriate MCP function based on complexity:
   - `mcp__loqa-assistant__capture_thought` for simple thoughts
   - `mcp__loqa-assistant__capture_comprehensive_thought` for complex thoughts with full context

## Parameters for MCP Functions

### Basic Thought Capture (`mcp__loqa-assistant__capture_thought`)
- **content**: The thought content (required)
- **context**: Optional context about where this thought came from
- **tags**: Optional tags to categorize the thought

### Comprehensive Thought Capture (`mcp__loqa-assistant__capture_comprehensive_thought`)
- **content**: The detailed thought content (required)
- **category**: Category of the thought (technical-debt, architecture, bug-insight, optimization, etc.)
- **context**: Context about where this thought originated
- **relatedRepositories**: Repositories this thought relates to
- **tags**: Custom tags for categorization
- **urgency**: Urgency level (immediate, next-sprint, backlog, future)

## Smart Features

- **Dynamic Priority Assessment**: Analyzes thoughts against current project state and active tasks
- **Repository Detection**: Suggests relevant repositories based on thought content
- **Gap Analysis**: Identifies if the thought addresses underserved areas of the project
- **Workload Balancing**: Considers current task distribution when suggesting priorities
- **Intelligent Task Creation**: Direct path from valuable thoughts to actionable tasks

This command is for technical concerns, architecture insights, and development observations. For feature ideas, use `/idea` instead.

## Examples

Non-interactive usage:
- `/thought "Need to investigate memory leaks in audio processing"`
- `/thought --content="Consider using NATS for inter-service communication" --context="Performance review"`
- `/thought "Authentication middleware needs refactoring" --tags=technical-debt,security`

Interactive usage:
- `/thought` (no parameters) → starts interactive workflow