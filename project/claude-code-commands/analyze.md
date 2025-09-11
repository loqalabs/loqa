---
description: "Analyze protocol and API changes across repositories with risk assessment and coordination planning"
allowed_tools: ["mcp__loqa-assistant__analyze_dependency_impact"]
---

# Analyze Protocol Changes

Analyze the impact of protocol and API changes across all Loqa services using an interactive workflow with risk assessment and coordination planning.

## Interactive Workflow

If parameters are provided via `$ARGUMENTS`, parse them directly and perform the analysis.

If no parameters are provided, use this interactive workflow:

1. **Ask about changes**: "Please describe the protocol or API changes you're planning or have made in your own words. What are you trying to accomplish?"

2. **AI Analysis**: Analyze the user's description to intelligently suggest:
   - **changeType**: Type of change (breaking/feature/bugfix/internal) based on described impact
   - **repository**: Source repository (loqa-proto/loqa-hub/etc.) based on mentioned components
   - **protoChanges**: Specific proto files likely affected based on described changes
   - **riskLevel**: Risk assessment based on scope and breaking nature of changes
   - **downstreamImpact**: Predicted impact on consuming services

3. **Guided questions**: Ask follow-up questions to refine the analysis:
   - "Are you adding new fields, removing existing ones, or changing field types?"
   - "Which services do you expect to be affected? (hub, commander, relay, skills)"
   - "Is this change backward compatible, or will it require updates to consuming services?"
   - "Do you have a timeline for rolling out these changes?"

4. **Impact preview**: Show preliminary analysis: "Based on your description, I expect this change to: [show predicted impacts]. Would you like me to perform a detailed analysis?"

5. **Perform analysis**: After confirmation, use the MCP function `mcp__loqa-assistant__analyze_dependency_impact` with the refined parameters.

## Parameters for MCP Function

- **changeType**: Type of change being made (breaking/feature/bugfix/internal, if provided as `--changeType=...`)
- **repository**: Repository with changes (if provided as `--repository=...`, defaults to "loqa-proto")
- **protoChanges**: Specific proto files changed (if provided as `--protoChanges=...`, auto-detected from git)
- **checkBreaking**: Check for breaking changes (if provided as `--checkBreaking=false`, defaults to true)
- **analyzeDownstream**: Analyze impact on consuming repositories (defaults to true)

This command automatically detects protocol changes and maps impact across all consuming services.

## Examples

Non-interactive usage:
- `/analyze --protoChanges=audio.proto,skills.proto` - Analyze specific files
- `/analyze --repository=loqa-proto --changeType=breaking` - Analyze breaking changes
- `/analyze --checkBreaking=false` - Skip breaking change detection

Interactive usage:
- `/analyze` (no parameters) → starts guided protocol analysis workflow