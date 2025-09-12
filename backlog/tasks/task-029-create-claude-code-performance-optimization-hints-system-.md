# Feature Template

## Feature Overview
**Feature Name:** Create Claude Code performance optimization hints system (

**Component(s):** [List affected services/components]
- [ ] loqa-hub
- [ ] loqa-commander  
- [ ] loqa-relay
- [ ] loqa-proto
- [ ] loqa-skills
- [ ] www-loqalabs-com

**Priority:** Medium

**Estimated Effort:** [Small/Medium/Large/XL]

## User Story
**As a** [type of user]
**I want** [goal/desire]
**So that** [benefit/value]

## Business Context
[Why is this feature needed? What problem does it solve?]

## Functional Requirements
- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

## Non-Functional Requirements
- [ ] Performance: [specific performance requirements]
- [ ] Security: [security considerations]
- [ ] Scalability: [scalability requirements]
- [ ] Compatibility: [compatibility requirements]

## Technical Design
### Architecture Overview
[High-level technical approach]

### API Changes
[Any new or modified APIs]

### Database Changes
[Any schema changes or new tables]

### Dependencies
[New dependencies or version updates needed]

## Implementation Tasks
- [ ] Design review and approval
- [ ] Backend implementation
- [ ] Frontend implementation (if applicable)
- [ ] API documentation
- [ ] Database migrations (if needed)
- [ ] Testing implementation

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
- [ ] All functional requirements met
- [ ] All non-functional requirements met
- [ ] Feature is fully tested
- [ ] Documentation is complete
- [ ] No breaking changes to existing functionality

## Launch Plan
- [ ] Feature flag configuration (if applicable)
- [ ] Rollout strategy defined
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented

## Related Issues
- GitHub Issue: #[issue_number]
- Dependencies: [list dependent issues/PRs]
- Blocked by: [list blocking issues]

## Success Metrics
[How will we measure the success of this feature?]

## Original Thought

Create Claude Code performance optimization hints system (.claude-code-hint.json) to help Claude Code focus on the most relevant files after splitting the monolith. This should include focus files, priority settings, and notes about the file structure changes.

## Additional Context

## Detailed Description

The current problem is that Claude Code struggles with large files (2,768-line task-management-tools.ts causes timeouts). After splitting into 5 smaller files, we need a way to tell Claude Code which files are most important to focus on. The desired end state is a .claude-code-hint.json file that guides Claude Code to prioritize the newly split task management files, improving performance and developer experience by reducing context switching between relevant files.

## Acceptance Criteria

1. The task is complete when: 1. .claude-code-hint.json file exists in the MCP server root directory 2. File includes all 5 newly split task management files in focus array 3. Priority is set to "performance" with explanatory notes 4. File follows JSON schema that could be adopted by Claude Code if they implement hints 5. Documentation explains the file purpose and future-proofing intent 6. Claude Code performance testing shows improved file loading times (<10 seconds for all files)

## Dependencies

- Prerequisites: 1. Emergency monolith split (task-027) must be completed first - need the 5 split files to exist 2. File structure must be finalized (exact file names and organization) 3. Performance baseline testing of individual files 4. Understanding of which files are most frequently edited. No external blockers, but depends on the file splitting being successful and the new structure being validated.


