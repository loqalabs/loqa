# Strategic Shift Prompt Template

Use this prompt when you need to make a major change in focus, technology, approach, or design philosophy for Loqa.

---

## Prompt Template

```
## 🚨 CRITICAL WORKFLOW REQUIREMENTS

**BEFORE IMPLEMENTING ANY STRATEGIC SHIFT:**
- [ ] **NEVER push directly to main branch** - Always create feature branches
- [ ] **ALWAYS create PRs** for review, even for strategic changes
- [ ] **ALL quality checks must PASS** - No exceptions for linting, tests, builds
- [ ] **End-to-end verification is REQUIRED** - Never assume functionality works
- [ ] **When blocked, ASK** - Never make assumptions or work around errors

**STRATEGIC CHANGES REQUIRE EXTRA CARE:**
- [ ] **Multi-repo coordination is CRITICAL** - Strategic shifts often affect multiple services
- [ ] **Feature branches across ALL affected repos** - Coordinate changes carefully
- [ ] **Document the impact** - Update all relevant documentation and guides
- [ ] **Test extensively** - Strategic changes can have unexpected side effects

I need to make a strategic shift in the Loqa project. Here are the details:

**Type of shift:** [Choose one or describe custom]
- Focus shift (e.g., target market change, feature priority rebalancing)
- Technology shift (e.g., language change, architecture change, infrastructure change)
- Approach shift (e.g., development methodology, deployment strategy, business model)
- Design philosophy shift (e.g., privacy model, user experience paradigm, system architecture)
- Branding/positioning shift (e.g., market positioning, messaging, target audience)

**Current state:** [Describe what we're shifting away from]

**Desired future state:** [Describe what we're shifting toward]

**Motivation/drivers:** [Why this shift is needed - business reasons, technical debt, market changes, etc.]

**Urgency level:** [Choose one]
- Critical (drop everything, implement immediately)
- High (prioritize over current work)
- Medium (plan and sequence appropriately)
- Low (incorporate into future planning)

**Scope constraints:** [Any limitations]
- Budget constraints: [if any]
- Timeline constraints: [if any]
- Resource constraints: [if any]
- Technical constraints: [if any]

### Completion Criteria:
The strategic shift is complete when:
- [ ] All strategic documents are updated (TODO.md, BACKLOG.md)
- [ ] GitHub Issues and Projects reflect new priorities
- [ ] Repository structure supports new direction
- [ ] Branding/messaging aligned (if applicable)
- [ ] Implementation roadmap is clear and actionable
- [ ] Success criteria are measurable and tracked

When I provide this prompt, please follow this comprehensive process:

### Phase 1: Discovery & Analysis
1. **Ask clarifying questions** to fully understand:
   - Specific scope and boundaries of the shift
   - Impact on existing roadmap and priorities
   - Dependencies and potential blockers
   - Risk tolerance and mitigation preferences

2. **Analyze current state** by reviewing:
   - Current TODO.md and BACKLOG.md priorities
   - Active GitHub Issues and Projects
   - Repository structure and codebase architecture
   - Documentation and messaging (www-loqalabs-com)

3. **Assess impact** across:
   - Technical architecture and code changes needed
   - Project timeline and milestone adjustments
   - Resource allocation and skill requirements
   - External dependencies and integrations

### Phase 2: Strategic Planning
4. **Create transition plan** including:
   - Immediate actions (what changes today)
   - Short-term actions (next 2-4 weeks)
   - Medium-term actions (next 2-3 months)
   - Long-term implications (6+ months)

5. **Update strategic documents**:
   - Revise TODO.md priorities and sections
   - Update BACKLOG.md with new/modified items
   - Adjust success criteria and milestones

### Phase 3: Project Management Updates
6. **GitHub Issues management**:
   - Close issues that are no longer relevant
   - Update issue priorities and labels
   - Create new issues for shift-related work
   - Modify epic issues for coordination

7. **GitHub Projects updates**:
   - Update project milestones and timelines
   - Reassign issue priorities within project
   - Add new columns/workflows if needed

8. **Repository organization**:
   - Identify repos that need structural changes
   - Plan any new repositories needed
   - Archive repositories that are no longer relevant

### Phase 4: Implementation Coordination
9. **Branding and messaging updates** (if applicable):
   - Update www-loqalabs-com content
   - Revise positioning and value propositions
   - Adjust technical messaging and documentation

10. **Create implementation roadmap**:
    - Sequence the changes logically
    - Identify critical path dependencies
    - Establish checkpoints and review gates

### Phase 5: Documentation & Communication
11. **Document the shift**:
    - Update README files across repositories
    - Revise technical documentation
    - Update loqa/config/CLAUDE.md with any new commands, architecture, or workflow changes
    - Create migration guides if needed

12. **Commit strategy**:
    - Plan git workflow for major changes
    - Consider branching strategy for transition

### Best Practices to Follow:
- ✅ Maintain HIPAA compliance requirements

### Avoid:
- ❌ Losing sight of core business objectives during transition

```

---

## Example Usage

```
I need to make a strategic shift in the Loqa project. Here are the details:

**Type of shift:** Technology shift
**Current state:** Python-based microservices with REST APIs
**Desired future state:** Rust-based microservices with gRPC
**Motivation/drivers:** Performance requirements for real-time processing, memory safety concerns, better resource utilization
**Urgency level:** Medium
**Scope constraints:** 6-month timeline, cannot break existing client integrations during transition
**Success criteria:** 50% reduction in memory usage, 3x improvement in processing latency, zero downtime migration

### Completion Criteria:
The strategic shift is complete when:
- [x] All strategic documents are updated (TODO.md, BACKLOG.md)
- [x] GitHub Issues and Projects reflect new priorities
- [x] Repository structure supports new direction
- [x] Branding/messaging aligned (if applicable)
- [x] Implementation roadmap is clear and actionable
- [x] Success criteria are measurable and tracked

When I provide this prompt, please follow this comprehensive process:

### Phase 1: Discovery & Analysis
1. **Ask clarifying questions** to fully understand:
   - Specific scope and boundaries of the shift
   - Impact on existing roadmap and priorities
   - Dependencies and potential blockers
   - Risk tolerance and mitigation preferences

2. **Analyze current state** by reviewing:
   - Current TODO.md and BACKLOG.md priorities
   - Active GitHub Issues and Projects
   - Repository structure and codebase architecture
   - Documentation and messaging (www-loqalabs-com)

3. **Assess impact** across:
   - Technical architecture and code changes needed
   - Project timeline and milestone adjustments
   - Resource allocation and skill requirements
   - External dependencies and integrations

### Phase 2: Strategic Planning
4. **Create transition plan** including:
   - Immediate actions (what changes today)
   - Short-term actions (next 2-4 weeks)
   - Medium-term actions (next 2-3 months)
   - Long-term implications (6+ months)

5. **Update strategic documents**:
   - Revise TODO.md priorities and sections
   - Update BACKLOG.md with new/modified items
   - Adjust success criteria and milestones

### Phase 3: Project Management Updates
6. **GitHub Issues management**:
   - Close issues that are no longer relevant
   - Update issue priorities and labels
   - Create new issues for shift-related work
   - Modify epic issues for coordination

7. **GitHub Projects updates**:
   - Update project milestones and timelines
   - Reassign issue priorities within project
   - Add new columns/workflows if needed

8. **Repository organization**:
   - Identify repos that need structural changes
   - Plan any new repositories needed
   - Archive repositories that are no longer relevant

### Phase 4: Implementation Coordination
9. **Branding and messaging updates** (if applicable):
   - Update www-loqalabs-com content
   - Revise positioning and value propositions
   - Adjust technical messaging and documentation

10. **Create implementation roadmap**:
    - Sequence the changes logically
    - Identify critical path dependencies
    - Establish checkpoints and review gates

### Phase 5: Documentation & Communication
11. **Document the shift**:
    - Update README files across repositories
    - Revise technical documentation
    - Update loqa/config/CLAUDE.md with any new commands, architecture, or workflow changes
    - Create migration guides if needed

12. **Commit strategy**:
    - Plan git workflow for major changes
    - Consider branching strategy for transition

### Best Practices to Follow:
- ✅ Maintain HIPAA compliance requirements

### Avoid:
- ❌ Losing sight of core business objectives during transition
```
