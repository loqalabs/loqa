# Loqa Workflow Implementation Plan

## Overview
Implementation of improved AI development workflow based on research into Agent OS, Claude-Flow, Symphony, and Backlog.md approaches. This plan transforms our current workflow from ad-hoc task management to structured, role-based AI orchestration with multi-repository coordination.

## Implementation Phases

### Phase 1A: Rule Enforcement (Week 1) ✅ **COMPLETED**
**Goal:** Ensure consistent application of workflow rules across all development work

#### Tasks:
- [x] **Task 1A-1: Create MCP Server for Rule Validation**
  - **Context:** Current workflow rules exist in CLAUDE.md and .claude-code.json but are inconsistently applied
  - **Implementation:** 
    - Build custom MCP server that validates commits, PRs, and code
    - Include checks for: no AI attribution, proper branch naming, quality gates
    - Add validation hooks that run during Claude Code sessions
  - **Acceptance Criteria:**
    - MCP server prevents commits with AI attribution
    - Validates branch naming conventions (feature/, bugfix/, etc.)
    - Reminds about quality checks before declaring work complete
  - **Dependencies:** None
  - **Estimated Effort:** 4-6 hours

- [x] **Task 1A-2: Add Pre-commit Hooks for Rule Enforcement**
  - **Context:** Rules need to be enforced automatically before code reaches Git
  - **Implementation:**
    - Create pre-commit hooks for each repository
    - Integrate with existing quality-check commands
    - Add rule validation to git workflow
  - **Acceptance Criteria:**
    - Pre-commit hooks block commits that violate rules
    - Integrates with existing make quality-check commands
    - Works across all Loqa repositories
  - **Dependencies:** Task 1A-1
  - **Estimated Effort:** 2-3 hours per repository

- [x] **Task 1A-3: Update .claude-code.json with Rule Validation**
  - **Context:** Existing .claude-code.json files need rule validation integration
  - **Implementation:**
    - Add rule validation configuration to all .claude-code.json files
    - Define repository-specific rule sets
    - Test rule enforcement across all services
  - **Acceptance Criteria:**
    - All .claude-code.json files include rule validation config
    - Repository-specific rules are properly defined
    - Claude Code sessions enforce rules automatically
  - **Dependencies:** Task 1A-1
  - **Estimated Effort:** 1 hour per repository

### Phase 1B: Foundation + Interactive Commands (Week 1) ✅ **COMPLETED**
**Goal:** Establish task management foundation and interactive command system

#### Tasks:
- [x] **Task 1B-1: Install and Configure Backlog.md**
  - **Context:** Need persistent, AI-friendly task management across all repositories
  - **Implementation:**
    - Install backlog.md in all Loqa repositories
    - Configure backlog/ directories with proper .gitignore rules
    - Set up terminal and web interfaces
  - **Acceptance Criteria:**
    - `backlog init` completed in all repositories
    - Terminal Kanban board works (`backlog board view`)
    - Web interface accessible (`backlog browser`)
  - **Dependencies:** None
  - **Estimated Effort:** 1 hour per repository

- [x] **Task 1B-2: Create Task Templates for Common Work Patterns**
  - **Context:** Standardize task creation for different types of work
  - **Implementation:**
    - Create templates for: bug fixes, features, protocol changes, cross-repo work
    - Include context requirements, acceptance criteria, testing requirements
    - Add templates to each repository's backlog/ directory
  - **Acceptance Criteria:**
    - Templates exist for all common work patterns
    - Templates include proper context and acceptance criteria
    - Templates are Git-tracked and available in all repositories
  - **Dependencies:** Task 1B-1
  - **Estimated Effort:** 3-4 hours

- [x] **Task 1B-3: Build Custom MCP Commands**
  - **Context:** Need interactive commands instead of copying/pasting templates
  - **Implementation:**
    - Create MCP server with commands: /add-todo, /capture-thought, /set-role
    - Integrate with Backlog.md for task creation
    - Add guided prompts for task creation
  - **Acceptance Criteria:**
    - /add-todo opens interactive task creation with templates
    - /capture-thought quickly captures ideas with proper tagging
    - /set-role allows manual role override for specialized work
  - **Dependencies:** Task 1B-2
  - **Estimated Effort:** 6-8 hours

- [x] **Task 1B-4: Update CLAUDE.md with Integration Instructions**
  - **Context:** Document new workflow for team adoption
  - **Implementation:**
    - Add Backlog.md workflow documentation to CLAUDE.md
    - Include interactive command usage
    - Document GitHub Issues ↔ Backlog.md hybrid workflow
  - **Acceptance Criteria:**
    - CLAUDE.md includes complete Backlog.md workflow documentation
    - Interactive commands are documented with examples
    - Hybrid GitHub/Backlog.md workflow is clearly explained
  - **Dependencies:** Task 1B-3
  - **Estimated Effort:** 2 hours

### Phase 2: Role Specialization (Week 2) ✅ **COMPLETED**
**Goal:** Implement role-based AI agent specialization with automatic detection

#### Tasks:
- [x] **Task 2-1: Develop Role-Specific .claude-code.json Configurations**
  - **Context:** Different types of work need different AI approaches and context
  - **Implementation:**
    - Create configurations for: Architect, Developer, DevOps, QA roles
    - Define role-specific rules, context, and tooling
    - Add role detection patterns for automatic selection
  - **Acceptance Criteria:**
    - Role-specific .claude-code.json configs exist for each role
    - Each role has appropriate context and tool restrictions
    - Role detection patterns accurately identify work types
  - **Dependencies:** None
  - **Estimated Effort:** 4-6 hours

- [x] **Task 2-2: Create Specialized Prompt Libraries**
  - **Context:** Each role needs specialized prompt templates and approaches
  - **Implementation:**
    - Build prompt libraries for each role type
    - Include best practices and common patterns
    - Create role-specific workflow templates
  - **Acceptance Criteria:**
    - Prompt libraries exist for all roles
    - Libraries include common patterns and best practices
    - Templates are easily accessible during development
  - **Dependencies:** Task 2-1
  - **Estimated Effort:** 6-8 hours

- [x] **Task 2-3: Implement Automatic Role Detection**
  - **Context:** Reduce friction by automatically selecting appropriate roles
  - **Implementation:**
    - Build pattern matching for role detection based on task description
    - Add keyword and context analysis for role selection
    - Include manual override capabilities
  - **Acceptance Criteria:**
    - Role detection works for common work patterns
    - Manual override available via /set-role command
    - Detection accuracy > 80% for standard work types
  - **Dependencies:** Task 2-1, Task 1B-3
  - **Estimated Effort:** 4-6 hours

- [x] **Task 2-4: Add Model Selection Heuristics**
  - **Context:** Different complexity levels need different Claude models
  - **Implementation:**
    - Define complexity heuristics for model selection
    - Map roles and tasks to appropriate models (Sonnet 4, Haiku)
    - Add automatic model switching based on task analysis
  - **Acceptance Criteria:**
    - Complex architecture work uses Sonnet 4
    - Simple tasks use appropriate lighter models
    - Manual override available when needed
  - **Dependencies:** Task 2-3
  - **Estimated Effort:** 3-4 hours

- [x] **Task 2-5: Update Workflow Templates with Role Selection**
  - **Context:** Existing workflow templates need role-based approaches
  - **Implementation:**
    - Update ISSUE_WORK_PROMPT.md with role selection
    - Add role-specific sections to workflow templates
    - Include role transition guidance for complex work
  - **Acceptance Criteria:**
    - All workflow templates include role guidance
    - Role transitions are clearly documented
    - Templates work with automatic role detection
  - **Dependencies:** Task 2-3
  - **Estimated Effort:** 2-3 hours

### Phase 2B: Enhanced Interactive Commands (Week 2) ✅ **COMPLETED**
**Goal:** Replace copy-paste templates with comprehensive interactive commands

#### Tasks:
- [x] **Task 2B-1: Design Enhanced MCP Commands**
  - **Context:** Users want to eliminate copy-paste workflow from templates
  - **Implementation:**
    - Analyze existing template functionality and workflow guidance
    - Design comprehensive interactive commands that provide same guidance
    - Plan integration with role specialization system
  - **Acceptance Criteria:**
    - All template functionality mapped to interactive commands
    - Role specialization integration planned
    - User experience designed for zero copy-paste workflow
  - **Dependencies:** Task 2-5
  - **Estimated Effort:** 2-3 hours

- [x] **Task 2B-2: Implement `/start-issue-work` Command**
  - **Context:** Replace ISSUE_WORK_PROMPT.md with interactive workflow
  - **Implementation:**
    - Build comprehensive GitHub issue workflow command
    - Include role detection and specialization
    - Provide scope guidance, testing requirements, and workflow steps
  - **Acceptance Criteria:**
    - Interactive prompts for all issue workflow parameters
    - Automatic role detection and optimization
    - Complete workflow guidance with critical reminders
    - Integration with cross-repository coordination
  - **Dependencies:** Task 2B-1
  - **Estimated Effort:** 3-4 hours

- [x] **Task 2B-3: Implement `/plan-strategic-shift` Command**
  - **Context:** Replace STRATEGIC_SHIFT_PROMPT.md with interactive planning
  - **Implementation:**
    - Build comprehensive strategic shift planning command
    - Include 5-phase planning process with role optimization
    - Provide constraint analysis and multi-repo coordination
  - **Acceptance Criteria:**
    - Interactive strategic shift planning with all phases
    - Role-specific planning considerations
    - Comprehensive documentation and implementation roadmap
    - Multi-repository coordination planning
  - **Dependencies:** Task 2B-1
  - **Estimated Effort:** 3-4 hours

- [x] **Task 2B-4: Implement Enhanced Thought Capture**
  - **Context:** Extend thought capture with comprehensive workflow
  - **Implementation:**
    - Build `/capture-comprehensive-thought` command
    - Include categorization, impact assessment, and integration planning
    - Add role-based processing and review triggers
  - **Acceptance Criteria:**
    - Comprehensive thought structure with workflow integration
    - Role-based categorization and processing
    - Integration planning for backlog.md system and GitHub issues
    - Automatic review trigger setting
  - **Dependencies:** Task 2B-1
  - **Estimated Effort:** 2-3 hours

- [x] **Task 2B-5: Implement Complex TODO Creation**
  - **Context:** Replace TODO_ITEM_PROMPT.md with enhanced task planning
  - **Implementation:**
    - Build `/start-complex-todo` command with comprehensive planning
    - Include complexity analysis and breakdown recommendations
    - Add role-specific task structuring and quality gates
  - **Acceptance Criteria:**
    - Interactive complex task creation with planning
    - Complexity analysis and breakdown suggestions
    - Role-specific task structuring and quality gates
    - Integration with existing task management system
  - **Dependencies:** Task 2B-1
  - **Estimated Effort:** 2-3 hours

- [x] **Task 2B-6: Update Documentation and Remove Template References**
  - **Context:** Complete migration from templates to interactive commands
  - **Implementation:**
    - Create comprehensive INTERACTIVE_COMMANDS.md documentation
    - Update project README and documentation to reference new commands
    - Mark old templates as deprecated with migration guidance
  - **Acceptance Criteria:**
    - Complete interactive commands documentation
    - All project documentation updated
    - Clear migration path from old templates
    - Legacy templates marked as deprecated
  - **Dependencies:** Tasks 2B-2, 2B-3, 2B-4, 2B-5
  - **Estimated Effort:** 2 hours

### Phase 3: Session Management + Advanced Orchestration **[RE-EVALUATED - September 2025]**
**Goal:** Multi-repository coordination with persistent session context

**Re-evaluation Results:**
Based on analysis of current workflow capabilities and 8-repository workspace structure, Phase 3 tasks have been re-evaluated:

#### Current Capabilities Assessment:
- ✅ **Context Management**: Backlog.md provides persistent task context across sessions
- ✅ **Multi-repo Coordination**: Interactive commands handle cross-repository workflows
- ✅ **Workspace Awareness**: 8 repositories with integrated backlog.md systems
- ✅ **Quality Orchestration**: make quality-check standardized across all repositories

#### Gap Analysis:
- **Session Context**: Backlog.md adequately replaces dedicated session files
- **Workspace Scripts**: Basic git status across repos still valuable for coordination
- **Git Worktrees**: Not essential given current workflow efficiency
- **Quality Orchestration**: Could benefit from cross-repo automation

#### Revised Phase 3 Implementation:

**COMPLETED Tasks:**
- [x] **Task 3-3R: Build Multi-Repository Status Commands** ✅
  - **Context:** Simple git status across 8 repositories for coordination visibility
  - **Implementation:** 
    - ✅ Added `workspace_status` MCP command for git status across all repos
    - ✅ Added `workspace_health` command for backlog.md status across repos
    - ✅ Integrated with existing MCP server architecture
  - **Acceptance Criteria:**
    - ✅ Single command shows git status across all 8 repositories
    - ✅ Workspace health command shows backlog task summary
    - ✅ Full integration with existing MCP server
  - **Dependencies:** None
  - **Actual Effort:** 2 hours

- [x] **Task 3-5R: Cross-Repository Quality Automation** ✅
  - **Context:** Automate quality checks across multiple repositories in dependency order
  - **Implementation:**
    - ✅ Added `run_quality_checks` MCP command
    - ✅ Implemented dependency ordering (proto → skills → hub → relay → commander)
    - ✅ Added parallel execution capabilities and proper error reporting
  - **Acceptance Criteria:**
    - ✅ Single command runs quality checks across affected repositories
    - ✅ Proper dependency ordering with loqa-proto first
    - ✅ Clear reporting of results and failures with timing
  - **Dependencies:** Task 3-3R
  - **Actual Effort:** 3 hours

**REJECTED Tasks (Superseded by Current Implementation):**
- ❌ **Task 3-1: Session Context Files** - Backlog.md provides superior persistent context
- ❌ **Task 3-2: Session Context Management** - Interactive commands handle context adequately  
- ❌ **Task 3-4: Git Worktrees** - Current workflow efficiency makes this unnecessary

### Phase 4: Optimization (Ongoing) ✅ **STARTED**
**Goal:** Continuous refinement and custom tooling development

#### Identified Automation Opportunities:
Based on Phase 3 implementation experience, the following automation opportunities have been identified:

**High-Priority Automation (Next Sprint):**
- [ ] **Task 4-1A: Automated Branch Creation from Backlog Tasks**
  - **Context:** Streamline feature branch creation with task-based naming
  - **Implementation:** Add MCP command to create branches directly from backlog task IDs
  - **Value:** Eliminate manual branch naming and ensure consistency
  - **Estimated Effort:** 2-3 hours

- [ ] **Task 4-1B: Integration Testing Automation**
  - **Context:** Automate end-to-end testing across multi-repository changes
  - **Implementation:** Add Docker Compose orchestration for integration testing
  - **Value:** Catch cross-service issues before PR merge
  - **Estimated Effort:** 4-6 hours

**Medium-Priority Automation (Next Month):**
- [ ] **Task 4-2A: Automated PR Creation with Task Linking**
  - **Context:** Create PRs automatically from feature branches with backlog task references
  - **Implementation:** Extend workspace commands with GitHub integration
  - **Value:** Streamline PR workflow and maintain task traceability
  - **Estimated Effort:** 3-4 hours

- [ ] **Task 4-2B: Dependency Change Impact Analysis**
  - **Context:** Automatically analyze impact of changes in loqa-proto across consuming services
  - **Implementation:** Parse .proto files and identify affected repositories
  - **Value:** Prevent breaking changes and coordinate multi-repo updates
  - **Estimated Effort:** 5-7 hours

**Long-term Optimization (Future Consideration):**
- [ ] **Task 4-3A: Intelligent Task Prioritization**
  - **Context:** Use AI to analyze backlog tasks and suggest optimal work order
  - **Implementation:** ML-based priority scoring considering dependencies and impact
  - **Value:** Improve development velocity and reduce context switching
  - **Estimated Effort:** 8-12 hours

- [ ] **Task 4-3B: Cross-Repository Code Generation**
  - **Context:** Automatically generate boilerplate code when protocols change
  - **Implementation:** Template-based code generation for service stubs and clients
  - **Value:** Reduce manual work and ensure consistency
  - **Estimated Effort:** 10-15 hours

#### Current Implementation Tasks:
- [x] **Task 4-1: Usage Pattern Analysis and Refinement** ✅ **ONGOING**
  - **Context:** Learn from actual usage to improve workflow
  - **Implementation:** Monitor workflow usage through MCP command analytics, identify bottlenecks
  - **Dependencies:** All previous phases
  - **Status:** Data collection started with Phase 3 implementation

- [x] **Task 4-2: Automation for Repetitive Tasks** ✅ **IN PROGRESS**
  - **Context:** Identify and automate common repetitive patterns
  - **Implementation:** Automated workspace status/health checks and quality orchestration completed
  - **Dependencies:** Task 4-1
  - **Status:** Phase 3 automation completed, additional opportunities identified

- [ ] **Task 4-3: Custom MCP Tools Development**
  - **Context:** Develop Loqa-specific tools as needs are identified
  - **Implementation:** Create custom MCP tools for domain-specific workflows
  - **Dependencies:** Task 4-1
  - **Status:** Framework established, specific tools planned based on usage patterns

## Success Metrics

### Achieved (Phase 1A, 1B, 2, 2B):
- **✅ Consistency:** Workflow rules consistently applied through automated pre-commit hooks and MCP rule validation
- **✅ Efficiency:** Task creation time dramatically reduced through interactive commands (eliminated copy-paste workflow entirely)
- **✅ Role Specialization:** AI agents automatically detect and optimize for specific development roles (Architect, Developer, DevOps, QA, General)
- **✅ Quality Integration:** Role-specific quality gates and comprehensive workflow guidance built into interactive commands
- **✅ Template Elimination:** Zero copy-paste workflow achieved through comprehensive interactive command system

### Ongoing Evaluation Needed:
- **Coordination:** Cross-repository work coordination (partially addressed through interactive commands, full evaluation pending)
- **Context:** Context management effectiveness through backlog.md + interactive commands vs dedicated session management

## Risk Mitigation
- **Incremental Adoption:** Each phase builds on previous, allowing rollback
- **Parallel Implementation:** Can work on multiple phases simultaneously
- **Existing Workflow Preservation:** All changes enhance rather than replace existing workflow
- **Validation:** Each task includes acceptance criteria for validation

## Implementation Status & Next Steps

### Completed Implementation ✅
- **Phase 1A: Rule Enforcement** - Automated pre-commit hooks across all 8 repositories
- **Phase 1B: Foundation + Interactive Commands** - Backlog.md integration, task templates, comprehensive MCP commands
- **Phase 2: Role Specialization** - 5 specialized roles with automatic detection and model selection
- **Phase 2B: Enhanced Interactive Commands** - Complete template replacement with interactive workflow system
- **Phase 3: Multi-Repository Coordination** - Workspace status, health monitoring, and quality automation

### Current Status
**Phase 3 Implementation Complete:** All high-value multi-repository coordination features have been successfully implemented and integrated into the MCP server. The revised Phase 3 delivered maximum value with minimal complexity.

**Phase 3 Results:**
- ✅ **workspace_status**: Git status across all 8 repositories with branch and change tracking
- ✅ **workspace_health**: Backlog.md status and activity monitoring across all repositories  
- ✅ **run_quality_checks**: Automated quality checks with dependency ordering and parallel execution
- ✅ **Full Integration**: All commands integrated into existing MCP server architecture

**Key Achievements:**
- Multi-repository coordination without complex session management
- Quality automation with proper dependency ordering (loqa-proto → skills → hub → relay → commander)
- Workspace health monitoring for task management visibility
- Eliminated need for git worktrees through improved workflow efficiency

### Next Steps (Phase 4 Active)
1. ✅ **Phase 4 Started**: Continuous optimization based on implementation experience
2. **High-Priority**: Automated branch creation and integration testing (next sprint)
3. **Medium-Priority**: PR automation and dependency impact analysis (next month)
4. **Long-term**: AI-powered task prioritization and code generation (future consideration)

### Success Criteria Evolution
**All Core Goals Exceeded:** The workflow implementation has successfully transformed ad-hoc task management into a structured, role-based AI orchestration system with comprehensive multi-repository coordination. Phase 3's lean approach delivered practical automation without over-engineering.