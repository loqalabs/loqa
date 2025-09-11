---
description: "Plan major architectural, technology, or strategic changes across the Loqa ecosystem"
allowed_tools: ["mcp__loqa-assistant__plan_strategic_shift"]
---

# Plan Strategic Changes

Plan significant architectural, technology, or strategic changes across the Loqa ecosystem using an interactive workflow.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly and create the strategic plan.

If no parameters are provided, use this interactive workflow:

1. **Ask for change description**: "Please describe the strategic change you're planning in your own words. What do you want to accomplish and why?"

2. **AI Analysis**: Analyze the user's description to intelligently suggest:
   - **shiftTitle**: Clear, descriptive title for the strategic shift
   - **description**: Well-structured description with rationale and benefits
   - **shiftType**: Best type classification (technology/architecture/approach/focus)
   - **riskLevel**: Risk assessment (low/medium/high/critical) based on scope and complexity
   - **scope**: Affected repositories and components based on described changes
   - **timeline**: Realistic timeline estimate based on complexity and dependencies

3. **Guided questions**: Ask follow-up questions to refine the plan:
   - "What's driving this change? (performance, scalability, maintainability, etc.)"
   - "Which parts of the system will be affected?"
   - "What are your main concerns or potential risks?"
   - "Do you have any timeline constraints?"

4. **Confirmation**: Present comprehensive plan: "Based on your description, I suggest this strategic shift plan: [show all parameters]. Would you like to proceed with this plan, or would you like to modify any aspects?"

5. **Create plan**: Only after user confirmation, use the MCP function `mcp__loqa-assistant__plan_strategic_shift` with the final parameters.

## Parameters for MCP Function

- **shiftTitle**: Title of the strategic shift (required, if provided as `--title=...`)
- **description**: Detailed description of the strategic change (required, if provided as `--description=...`)
- **shiftType**: Type of shift (technology/architecture/approach/focus, if provided as `--type=...`)
- **riskLevel**: Risk level assessment (low/medium/high/critical, if provided as `--risk=...`)
- **scope**: Repositories or components affected (if provided as `--scope=...`)
- **timeline**: Expected timeline (if provided as `--timeline=...`)

This command provides 5-phase strategic planning with multi-repository coordination and risk analysis.

## Examples

Non-interactive usage:
- `/plan --title="Migrate to gRPC" --type=technology --description="Replace REST APIs with gRPC for better performance"`
- `/plan --title="Microservice refactoring" --type=architecture --risk=high --timeline="3 months"`

Interactive usage:
- `/plan` (no parameters) → starts guided strategic planning workflow