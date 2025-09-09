# GitHub Issue Work Prompt Template

Use this template when asking Claude to work on a specific GitHub issue.

```
## 🚨 CRITICAL WORKFLOW REQUIREMENTS

**BEFORE YOU START:**
- [ ] **NEVER push directly to main branch** - Always create feature branches
- [ ] **ALWAYS create PRs** for review, even for simple changes
- [ ] **ALL quality checks must PASS** - No exceptions for linting, tests, builds
- [ ] **If a tool you need to finish a task is not installed, ALWAYS ask to install it and NEVER skip it
- [ ] **End-to-end verification is REQUIRED** - Never assume functionality works
- [ ] **When blocked, ASK** - Never make assumptions or work around errors
- [ ] **If a task cannot be completed in this session, ALWAYS make sure it is tracked in TODO.md or BACKLOG.md

**MULTI-REPOSITORY REMINDER:**
- [ ] This is a **multi-repo architecture** - each service is a separate Git repository
- [ ] **Coordinate changes** across repositories when needed
- [ ] **Follow dependency order**: loqa-proto → loqa-skills → loqa-hub → loqa-relay → loqa-commander

I want you to work on [REPO]#[NUMBER] - [ISSUE TITLE]

**Issue Link:** [GitHub Issue URL]

**Context:**
- Current branch: [main/feature-name]
- Any blockers or dependencies: [none/describe]
- Preferred approach: [any specific technical preferences]

**Scope & Approach Guidance:**
- **Scope boundaries:** [What's in/out of scope, or "ask me if unclear"]
- **Technical approach:** [Preferred method, or "propose options if multiple paths exist"]
- **Issue complexity:** [Keep as single issue / Break down if >1 week / Ask me to decide]
- **Dependencies:** [None known / Check for X,Y,Z / Stop and ask if you find blockers]
- **Cross-repository impact:** [Single repo / Multiple repos with simple changes / Complex multi-repo coordination needed]
- **Testing requirements:** [Unit tests required / Integration tests needed / Ask me about test coverage expectations]

**Requirements:**
- Update project status as you work
- **ALWAYS create feature branches** - Never push to main
- **ALWAYS create PRs** when ready for review
- **ALL quality checks must pass** before declaring complete

**Cross-Repository Workflow:**
- **MANDATORY: Feature branches for ALL changes** - No exceptions
  - Changes are experimental or might be rejected
  - Feature is complex and might need coordinated rollback
  - Changes are tightly coupled and need coordinated testing
  - Multiple repositories have significant changes
- **Branch naming:** Use consistent names across repos (e.g., `feature/21-kokoro-tts-integration`)

**Additional Notes:**
[Any other specific considerations, constraints, or preferences]

**Follow-up Actions (NON-NEGOTIABLE):**
- [ ] **ALL quality checks must PASS** - make quality-check, go test ./..., etc.
- [ ] **Docker builds must SUCCEED** - docker build . must work
- [ ] **End-to-end functionality must be VERIFIED** - never assume it works
- [ ] **Create feature branch** - git checkout -b feature/issue-name
- [ ] **Create PR with proper description** - gh pr create with detailed body
- [ ] **Wait for review and approval** before merging

```

---

## 📋 Specific Examples for Each Area:

### 🎯 Scope Clarification:

Scope boundaries: Only implement basic collision detection, exclude advanced arbitration features for now  
Scope boundaries: Ask me if unclear - not sure if this should include UI changes

### 🛠️ Technical Approach:

Technical approach: Use existing AudioService pattern, don't create new architecture  
Technical approach: Propose options if multiple paths exist - I want to see alternatives

### 📊 Issue Complexity:

Issue complexity: Break down if >1 week - this might be bigger than it looks  
Issue complexity: Keep as single issue - I want this done in one focused PR

### 🔗 Dependencies:

Dependencies: Check if this requires changes to loqa-relay first  
Dependencies: Stop and ask if you find blockers - don't work around missing APIs

### 🌐 Cross-Repository Impact:

Cross-repository impact: Single repo - all changes contained within loqa-hub  
Cross-repository impact: Multiple repos with simple changes - expect documentation and config updates  
Cross-repository impact: Complex multi-repo coordination needed - protocol changes, coordinated feature branches required

### 🧪 Testing Requirements:

Testing requirements: Unit tests required, integration tests with mock relays  
Testing requirements: Ask me about test coverage expectations - this touches critical path

---

## 🎯 Complete Example with All Clarifications:

```
I want you to work on loqa-hub#19 - Multi-relay collision detection and arbitration

Issue Link: https://github.com/loqalabs/loqa-hub/issues/19

Context:
- Current branch: main
- No known blockers
- This is part of our MVP milestone

Scope & Approach Guidance:
- **Scope boundaries:** Only implement basic "last relay wins" logic, exclude advanced arbitration (signal strength, location) for now
- **Technical approach:** Extend existing AudioService, don't create separate arbitration service
- **Issue complexity:** Break down if >1 week - this might need sub-issues for different arbitration strategies
- **Dependencies:** Check if this requires protocol changes in loqa-relay first
- **Cross-repository impact:** Complex multi-repo coordination needed - likely requires protocol changes and coordinated testing
- **Testing requirements:** Unit tests required, integration tests with multiple mock relay connections

Requirements:
- Update project status as you work
- Create PR when ready for review

Additional Notes:
Focus on preventing zombie connections - that's the biggest issue right now. Performance is secondary to correctness.
```

---

## 🔧 Quick Reference Guide:

For Ambiguous Issues:

Scope boundaries: Ask me if unclear - the acceptance criteria seem broad

For Complex Technical Decisions:

Technical approach: Propose 2-3 options with pros/cons - I want to choose the best path

For Large Issues:

Issue complexity: Break down if >3 days - create sub-issues and ask me to prioritize them

For Risky Dependencies:

Dependencies: Stop and ask before making breaking changes to shared interfaces

For Critical Path Code:

Testing requirements: Comprehensive test coverage required - this is core functionality

---

## 🎯 Template Variations:

### 🚀 Fast/Simple Issues:

Scope boundaries: Well-defined, proceed without clarification  
Technical approach: Use obvious/standard approach  
Issue complexity: Keep as single issue  
Dependencies: None expected  
Cross-repository impact: Single repo - all changes contained  
Testing requirements: Basic unit tests sufficient

### 🤔 Exploratory/Research Issues:

Scope boundaries: Explore broadly, then ask me to narrow focus  
Technical approach: Research multiple options, present findings  
Issue complexity: Investigation only, don't implement yet  
Dependencies: Document what you find, don't resolve  
Cross-repository impact: Unknown - document findings across all repos  
Testing requirements: Not applicable for research

### 🔥 Urgent Bug Fixes:

Scope boundaries: Minimal fix only, don't refactor  
Technical approach: Fastest safe approach  
Issue complexity: Keep as single focused fix  
Dependencies: Work around if possible, note for later  
Cross-repository impact: Prefer single repo fix, avoid cross-repo changes unless critical  
Testing requirements: Regression test to prevent reoccurrence

---

This gives you complete control over how I approach each issue while ensuring I ask the right questions when I hit uncertainties! 🎯
