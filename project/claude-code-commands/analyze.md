---
description: "Analyze protocol and API changes across repositories with risk assessment and coordination planning"
allowed_tools: ["mcp__loqa-assistant__analyze_dependency_impact"]
---

# Analyze Protocol Changes

Analyze the impact of protocol and API changes across all Loqa services with risk assessment and coordination planning:

$ARGUMENTS

Please use the MCP function `mcp__loqa-assistant__analyze_dependency_impact` with the following parameters parsed from the arguments above:

- **changeType**: Type of change being made (breaking/feature/bugfix/internal, if provided as `--changeType=...`)
- **repository**: Repository with changes (if provided as `--repository=...`, defaults to "loqa-proto")
- **protoChanges**: Specific proto files changed (if provided as `--protoChanges=...`, auto-detected from git)
- **checkBreaking**: Check for breaking changes (if provided as `--checkBreaking=false`, defaults to true)
- **analyzeDownstream**: Analyze impact on consuming repositories (defaults to true)

This command automatically detects protocol changes and maps impact across all consuming services.

Examples:
- `/analyze` - Analyze recent protocol changes
- `/analyze --protoChanges=audio.proto,skills.proto` - Analyze specific files
- `/analyze --repository=loqa-proto --changeType=breaking` - Analyze breaking changes