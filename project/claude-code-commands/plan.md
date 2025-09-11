---
description: "Plan major architectural, technology, or strategic changes across the Loqa ecosystem"
allowed_tools: ["mcp__loqa-assistant__plan_strategic_shift"]
---

# Plan Strategic Changes

Plan significant architectural, technology, or strategic changes across the Loqa ecosystem:

$ARGUMENTS

Please use the MCP function `mcp__loqa-assistant__plan_strategic_shift` with the following parameters parsed from the arguments above:

- **shiftTitle**: Title of the strategic shift (required, if provided as `--title=...`)
- **description**: Detailed description of the strategic change (required, if provided as `--description=...`)
- **shiftType**: Type of shift (technology/architecture/approach/focus, if provided as `--type=...`)
- **riskLevel**: Risk level assessment (low/medium/high/critical, if provided as `--risk=...`)
- **scope**: Repositories or components affected (if provided as `--scope=...`)
- **timeline**: Expected timeline (if provided as `--timeline=...`)

This command provides 5-phase strategic planning with multi-repository coordination and risk analysis.

Examples:
- `/plan --title="Migrate to gRPC" --type=technology --description="Replace REST APIs with gRPC for better performance"`
- `/plan --title="Microservice refactoring" --type=architecture --risk=high --timeline="3 months"`