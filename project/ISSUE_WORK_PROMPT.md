# GitHub Issue Work Prompt Template

Use this template when asking Claude to work on a specific GitHub issue.


```
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
- **Testing requirements:** [Unit tests required / Integration tests needed / Ask me about test coverage expectations]

**Requirements:**
- Follow the git workflow we established
- Create feature branch with proper naming
- Reference issue numbers in commits
- No AI attribution in commit messages
- Update project status as you work
- Check all repos for documentation that may need updating
- Create PR when ready for review

**Additional Notes:**
[Any other specific considerations, constraints, or preferences]

**Follow-up Actions:**
- [ ] Run lint/typecheck commands when implementation complete
- [ ] Verify no breaking changes to existing functionality
- [ ] Update cross-repository documentation if needed
- [ ] Update loqa/config/CLAUDE.md if new commands, architecture, or workflows added

## Repository Structure Context
The loqalabs project structure is:

loqalabs/                              # Container folder (not a git repo)
├── loqa/                              # Main repo
├── loqa-hub/                          # Hub service repo  
├── loqa-commander/                     # Commander UI repo
├── loqa-relay/                        # Relay client repo
├── loqa-device-service/               # Device service repo
├── loqa-proto/                        # Protocol definitions repo
├── loqa-skills/                       # Skills system repo
├── loqalabs-github-config/            # Special: .github org repo
└── www-loqalabs-com/                  # Website repo

Each subfolder is an individual git repository. The folder names match their GitHub repo names except `loqalabs-github-config` which contains the `.github` org-level repository.
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
- **Testing requirements:** Unit tests required, integration tests with multiple mock relay connections

Requirements:
- Follow the git workflow we established
- Create feature branch with proper naming
- Reference issue numbers in commits
- No AI attribution in commit messages
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
Testing requirements: Basic unit tests sufficient

### 🤔 Exploratory/Research Issues:

Scope boundaries: Explore broadly, then ask me to narrow focus  
Technical approach: Research multiple options, present findings  
Issue complexity: Investigation only, don't implement yet  
Dependencies: Document what you find, don't resolve  
Testing requirements: Not applicable for research

### 🔥 Urgent Bug Fixes:

Scope boundaries: Minimal fix only, don't refactor  
Technical approach: Fastest safe approach  
Issue complexity: Keep as single focused fix  
Dependencies: Work around if possible, note for later  
Testing requirements: Regression test to prevent reoccurrence

---

This gives you complete control over how I approach each issue while ensuring I ask the right questions when I hit uncertainties! 🎯