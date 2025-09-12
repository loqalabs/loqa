# Emergency Fix: Split 2,768-line task-management-tools.ts monolith

## Task Overview
**Task Title:** Emergency Fix: Split 2,768-line task-management-tools.ts monolith

**Type:** Refactoring

**Priority:** High

**Effort:** Medium (20 hours)

**Assignee:** Claude Code Developer

## Description
Split the monolithic `loqa/project/loqa-assistant-mcp/src/tools/task-management-tools.ts` file (2,768 lines) into 5 focused modules to resolve Claude Code timeout issues that are blocking developer productivity.

## Context
The task-management-tools.ts file has grown to 2,768 lines, causing Claude Code to timeout when trying to analyze or modify it. This is the root cause of current development workflow issues and needs emergency resolution. This is Phase 0 of the workflow redesign - focused solely on restoring Claude Code functionality without over-engineering.

## Acceptance Criteria
- [ ] File split into 5 focused modules (each < 600 lines)
- [ ] All existing functionality preserved
- [ ] All tests passing
- [ ] Claude Code can analyze individual files without timeout
- [ ] Proper TypeScript imports/exports maintained

## Implementation Approach
Simple file split without over-engineering:
1. Analyze the current 2,768-line file structure
2. Split into 5 logical modules based on functionality
3. Update imports/exports to maintain functionality
4. Test to ensure no regressions

## Dependencies
- **Depends on:** None (emergency fix)
- **Blocks:** Task 030 (file size enforcement), Task 033 (validation)

## Affected Components
- [x] loqa-assistant-mcp (MCP server)
- [ ] loqa-hub
- [ ] loqa-commander  
- [ ] loqa-relay
- [ ] loqa-proto
- [ ] loqa-skills
- [ ] www-loqalabs-com
- [ ] Documentation
- [x] Infrastructure (development workflow)

## Tasks Breakdown
- [ ] Analyze current file structure and identify logical boundaries
- [ ] Create `src/tools/task-commands.ts` - Main command handlers
- [ ] Create `src/tools/thought-analysis.ts` - Thought processing and categorization
- [ ] Create `src/tools/interview-system.ts` - Task creation interview logic
- [ ] Create `src/tools/utilities.ts` - Shared utilities and helpers
- [ ] Create `src/tools/handlers.ts` - Lower-level handlers and validation
- [ ] Update all imports across the MCP server codebase
- [ ] Remove original monolithic file
- [ ] Testing - Verify all MCP functionality works
- [ ] Documentation - Update any references to file structure

## Testing Requirements
- [ ] Unit tests (verify all MCP functions still work)
- [ ] Integration tests (test MCP server startup and basic operations)
- [ ] Manual testing (test task creation, thought capture, etc.)
- [ ] Performance testing (verify Claude Code timeout resolution)

## Documentation Updates
- [ ] Code comments (minimal, focus on import/export structure)
- [ ] API documentation (update if any MCP interfaces change)
- [ ] User documentation (none needed for internal refactoring)
- [ ] README updates (update MCP server development docs if needed)

## Quality Gates
- [ ] Code review completed (self-review focused on no functional changes)
- [ ] All tests passing (critical - no regressions allowed)
- [ ] Quality check passed: `npm run build` and `npm test`
- [ ] Claude Code timeout issue resolved

## Definition of Done
- [ ] All acceptance criteria met
- [ ] 5 files created, original removed
- [ ] All imports updated and working
- [ ] Tests passing
- [ ] Claude Code can work with files efficiently again
- [ ] Team productivity restored

## Notes
- **CRITICAL**: This is emergency productivity restoration, not architecture improvement
- Do NOT add new features or "improvements" - just split the file
- Success measured by Claude Code performance, not code elegance  
- If successful, Task 033 will validate results and decide on Phase 1

## Related Issues
- GitHub Issue: #96
- Blocks: Task 030 (file size enforcement)
- Blocks: Task 033 (validation and decision point)