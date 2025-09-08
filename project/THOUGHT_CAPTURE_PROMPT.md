# Thought Capture Prompt Template

Use this prompt when you have an idea, concern, or thought that doesn't need immediate action but shouldn't be forgotten.

> **Note**: When thoughts lead to implementation, remember to follow the **critical workflow requirements** from our other prompt templates - always use feature branches, create PRs, and ensure all quality checks pass.

---

## Prompt Template

```
I want to capture a thought/idea for future consideration:

**The thought:** [Describe the idea, concern, or consideration]

**Context:** [What triggered this thought - meeting, code review, user feedback, technical discovery, etc.]

**Category:** [Choose one or describe custom]
- Technical Architecture (system design, technology choices, performance)
- Privacy/Security (data handling, compliance, threat modeling)
- User Experience (workflows, interfaces, accessibility)
- Business Strategy (market positioning, pricing, partnerships)
- Process/Workflow (development practices, team processes, tooling)
- Product Direction (features, roadmap, prioritization)
- Infrastructure (deployment, monitoring, scalability)
- Compliance/Legal (regulations, contracts, policies)

**Urgency/Timeline:** [When should this be revisited?]
- Next sprint planning
- Next quarter/milestone
- Next major release cycle
- When specific conditions are met: [describe trigger]
- Ongoing consideration (no specific deadline)

**Impact level:** [Choose one]
- Low (nice to have, minor improvement)
- Medium (could significantly improve something)
- High (addresses important gap or risk)
- Critical (potential blocker or major opportunity)

**Dependencies:** [What needs to happen before this can be addressed?]
- No dependencies, ready when prioritized
- Depends on: [specific milestones, decisions, or external factors]
- Need more research/information about: [specify what]

**Related work:** [Any existing issues, docs, or initiatives this connects to]

### Completion Criteria:
The thought capture is complete when:
- [ ] Thought is clearly documented in appropriate location
- [ ] Connected to related existing work
- [ ] Tagged/categorized for easy retrieval
- [ ] Review trigger or timeline is set
- [ ] Context preserved for future understanding

When I provide this prompt, please help me:

### Phase 1: Clarification & Context
1. **Ask clarifying questions** if needed to fully understand:
   - The specific scope and nature of the thought
   - Why it's important to capture now
   - Any missing context that would help with categorization

2. **Identify connections** to existing work:
   - Search TODO.md, BACKLOG.md for related items
   - Check for related GitHub issues across repositories
   - Note any strategic documents that should reference this

### Phase 2: Capture & Organization
3. **Determine best capture location**:
   - Add to TODO.md if it should influence current/next sprint planning
   - Add to BACKLOG.md if it's longer-term but definite work
   - Create GitHub issue if it needs tracking and collaboration
   - Document in project notes if it's pure research/consideration

4. **Structure the capture** with:
   - Clear, searchable title/description
   - Appropriate tags/labels for filtering
   - Context about when/why to revisit
   - Links to related work

### Phase 3: Integration
5. **Update related documents** if needed:
   - Cross-reference in strategic documents
   - Update project roadmap context if relevant
   - Note in repository README if it affects architecture

6. **Set review triggers** by:
   - Adding to appropriate planning documents
   - Setting up reminders tied to milestones
   - Linking to decision points or external triggers

### Best Practices to Follow:
- ✅ Preserve the original thought without over-engineering
- ✅ Make it easy to find and remember later
- ✅ Include enough context for future-you to understand
- ✅ Link to any reference materials or inspirations

### Avoid:
- ❌ Immediately turning thoughts into action items
- ❌ Creating duplicate entries for similar ideas
- ❌ Over-analyzing ideas that just need to be captured
- ❌ Losing track of where thoughts were documented
- ❌ Forgetting to set appropriate review triggers

```

---

## Example Usage

```
I want to capture a thought/idea for future consideration:

**The thought:** We need to think through how to handle updates to Loqa in a privacy/offline friendly way

**Context:** Realized during architecture review that our current update mechanism assumes internet connectivity and centralized distribution

**Category:** Privacy/Security + Technical Architecture

**Urgency/Timeline:** Next major release cycle - this affects our offline-first promises

**Impact level:** High - addresses important gap between our privacy promises and technical reality

**Dependencies:** 
- Need to research P2P update mechanisms
- Depends on finalizing our offline-first architecture decisions
- May need to understand regulatory requirements for medical device updates

**Related work:** Connected to offline-first initiative in TODO.md, privacy architecture docs

### Completion Criteria:
The thought capture is complete when:
- [x] Thought is clearly documented in appropriate location
- [x] Connected to related existing work
- [x] Tagged/categorized for easy retrieval
- [x] Review trigger or timeline is set
- [x] Context preserved for future understanding

When I provide this prompt, please help me:

### Phase 1: Clarification & Context
1. **Ask clarifying questions** if needed to fully understand:
   - The specific scope and nature of the thought
   - Why it's important to capture now
   - Any missing context that would help with categorization

2. **Identify connections** to existing work:
   - Search TODO.md, BACKLOG.md for related items
   - Check for related GitHub issues across repositories
   - Note any strategic documents that should reference this

### Phase 2: Capture & Organization
3. **Determine best capture location**:
   - Add to TODO.md if it should influence current/next sprint planning
   - Add to BACKLOG.md if it's longer-term but definite work
   - Create GitHub issue if it needs tracking and collaboration
   - Document in project notes if it's pure research/consideration

4. **Structure the capture** with:
   - Clear, searchable title/description
   - Appropriate tags/labels for filtering
   - Context about when/why to revisit
   - Links to related work

### Phase 3: Integration
5. **Update related documents** if needed:
   - Cross-reference in strategic documents
   - Update project roadmap context if relevant
   - Note in repository README if it affects architecture

6. **Set review triggers** by:
   - Adding to appropriate planning documents
   - Setting up reminders tied to milestones
   - Linking to decision points or external triggers

### Best Practices to Follow:
- ✅ Preserve the original thought without over-engineering
- ✅ Make it easy to find and remember later
- ✅ Include enough context for future-you to understand
- ✅ Link to any reference materials or inspirations

### Avoid:
- ❌ Immediately turning thoughts into action items
- ❌ Creating duplicate entries for similar ideas
- ❌ Over-analyzing ideas that just need to be captured
- ❌ Losing track of where thoughts were documented
- ❌ Forgetting to set appropriate review triggers
```

---

## Template Variations:

### 💡 Quick Ideas:
Use when you just want to jot down a thought without much analysis.

### 🔍 Research Questions:
Use when you've identified something that needs investigation before becoming actionable work.

### ⚠️ Risk Considerations:
Use when you've identified potential future problems or risks that need consideration.

### 🎯 Opportunity Ideas:
Use when you see potential improvements or new capabilities worth exploring.

### 🤔 Strategic Questions:
Use when you have questions about direction, priorities, or approach that need future consideration.

---

This template helps you systematically capture thoughts while ensuring they don't get lost and can be properly prioritized when the time is right! 💭