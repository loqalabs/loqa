# Create Claude Code performance optimization hints

## Feature Overview
**Feature Name:** Create Claude Code performance optimization hints

**Component(s):** Development tooling and Claude Code integration
- [ ] loqa-hub
- [ ] loqa-commander  
- [ ] loqa-relay
- [ ] loqa-proto
- [ ] loqa-skills
- [ ] www-loqalabs-com
- [x] loqa-assistant-mcp (MCP server)
- [x] Claude Code configuration

**Priority:** Medium

**Estimated Effort:** Small (2-4 hours)

## User Story
**As a** developer using Claude Code with the Loqa MCP server
**I want** Claude Code to focus on the split task management files for better performance
**So that** Claude Code can work efficiently with the new modular file structure

## Business Context
After splitting the monolithic file (Task 027), we need to help Claude Code understand which files to prioritize for analysis and modification to maintain optimal performance.

## Functional Requirements
- [ ] Create `.claude-code-hint.json` configuration file
- [ ] Specify the 5 split files as focus areas for Claude Code
- [ ] Set priority hints for performance optimization
- [ ] Documentation for future hint file maintenance

## Non-Functional Requirements
- [ ] Performance: [specific performance requirements]
- [ ] Security: [security considerations]
- [ ] Scalability: [scalability requirements]
- [ ] Compatibility: [compatibility requirements]

## Technical Design
### Architecture Overview
Simple JSON configuration file that Claude Code reads for performance hints

### Configuration Structure
```json
{
  "focus": [
    "src/tools/task-commands.ts",
    "src/tools/thought-analysis.ts",
    "src/tools/interview-system.ts",
    "src/tools/utilities.ts",
    "src/tools/handlers.ts"
  ],
  "priority": "performance",
  "context": "Split from monolithic task-management-tools.ts"
}
```

### File Location
`loqa/project/loqa-assistant-mcp/.claude-code-hint.json`

### Dependencies
None - pure configuration file

## Implementation Tasks
- [ ] Create `.claude-code-hint.json` file
- [ ] List all 5 split files in focus array
- [ ] Add performance priority configuration
- [ ] Test with Claude Code to verify hint recognition
- [ ] Document hint file format and maintenance
- [ ] Add to MCP server README

## Testing Strategy
- [ ] Unit tests for new functionality
- [ ] Integration tests
- [ ] End-to-end tests
- [ ] Performance testing (if applicable)
- [ ] Security testing (if applicable)

## Documentation Requirements
- [ ] API documentation updated
- [ ] User documentation created/updated
- [ ] Developer documentation updated
- [ ] README updates

## Quality Gates
- [ ] Design review completed
- [ ] Code review completed
- [ ] All tests passing
- [ ] Security review (if applicable)
- [ ] Performance testing passed (if applicable)
- [ ] Quality check passed: `make quality-check`

## Acceptance Criteria
- [ ] `.claude-code-hint.json` file created with correct format
- [ ] All 5 split files listed in focus array
- [ ] Claude Code recognizes and uses the hints
- [ ] Performance improvement measurable when working with split files
- [ ] Documentation explains hint file purpose and maintenance
- [ ] No impact on MCP server functionality

## Launch Plan
- [ ] Feature flag configuration (if applicable)
- [ ] Rollout strategy defined
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented

## Related Issues
- GitHub Issue: #[TBD - may not need separate issue]
- Dependencies: Task 027 (file split must be complete)
- Supports: Task 033 (validation of split effectiveness)
- Part of: Workflow redesign Phase 0

## Success Metrics
[How will we measure the success of this feature?]