# Add file size enforcement with Makefile integration

## Feature Overview
**Feature Name:** Add file size enforcement with Makefile integration

**Component(s):** Development tooling and workflow
- [ ] loqa-hub
- [ ] loqa-commander  
- [ ] loqa-relay
- [ ] loqa-proto
- [ ] loqa-skills
- [ ] www-loqalabs-com
- [x] loqa-assistant-mcp (MCP server)
- [x] Development workflow

**Priority:** Medium

**Estimated Effort:** Small (4-6 hours)

## User Story
**As a** developer working with the Loqa codebase
**I want** automated file size enforcement in the development workflow
**So that** files never grow too large and cause Claude Code performance issues again

## Business Context
After splitting the 2,768-line monolith (Task 027), we need preventive measures to ensure files don't grow too large again. This prevents future Claude Code timeout issues and maintains developer productivity.

## Functional Requirements
- [ ] Makefile target `check-task-tool-size` that fails if files exceed 2000 lines
- [ ] Pre-commit git hook integration for automatic checking
- [ ] Clear error messages suggesting file splitting when limits exceeded
- [ ] Integration with existing `make quality-check` workflow

## Non-Functional Requirements
- [ ] Performance: [specific performance requirements]
- [ ] Security: [security considerations]
- [ ] Scalability: [scalability requirements]
- [ ] Compatibility: [compatibility requirements]

## Technical Design
### Architecture Overview
Simple shell script checking using `wc -l` with integration into existing Makefile and git hooks

### Makefile Target
```makefile
check-task-tool-size:
	@line_count=$$(wc -l < src/tools/task-management-tools.ts); \
	if [ "$$line_count" -gt 2000 ]; then \
		echo "❌ task-management-tools.ts too large ($$line_count lines)!"; \
		echo "   Consider splitting into smaller, focused modules"; \
		exit 1; \
	else \
		echo "✅ task-management-tools.ts is OK ($$line_count lines)"; \
	fi
```

### Git Hook Integration
Add to existing pre-commit hooks in MCP server

### Dependencies
None - uses standard shell tools

## Implementation Tasks
- [ ] Create Makefile target `check-task-tool-size`
- [ ] Test Makefile target with various file sizes
- [ ] Update existing pre-commit hooks to include file size check
- [ ] Integrate with `make quality-check` command
- [ ] Update developer documentation with file size guidelines
- [ ] Test complete workflow integration

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
- [ ] Makefile target correctly identifies files over 2000 lines
- [ ] Pre-commit hooks prevent commits with oversized files
- [ ] Error messages are clear and actionable
- [ ] Integration with existing quality checks works seamlessly
- [ ] No disruption to normal development workflow
- [ ] Documentation updated with file size best practices

## Launch Plan
- [ ] Feature flag configuration (if applicable)
- [ ] Rollout strategy defined
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented

## Related Issues
- GitHub Issue: #97
- Dependencies: Task 027 (file split completion)
- Blocks: Future file size violations
- Related: Task 033 (validation of overall approach)

## Success Metrics
[How will we measure the success of this feature?]