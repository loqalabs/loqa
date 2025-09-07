# Add TODO Item Prompt Template

Use this prompt when you want to add a new task, feature, improvement, or bug fix to the Loqa project's TODO.md and related documentation.

---

## Prompt Template

```
I need to add a new TODO item to the Loqa project. Here are the details:

**Category:** [Choose one or describe custom]
- Feature
- Bug fix
- Technical debt
- Documentation
- DevOps/Infrastructure
- Research/Exploration
- Security/Compliance
- Internal tools

**Priority level:** [Choose one]
- P1 (Urgent - core MVP, major blockers)
- P2 (Important - roadmap items)
- P3 (Nice-to-have, backlog, long-term ideas)

**Description:** [One-sentence summary of the task]

**Context:** [Optional - what led to this? Is it tied to a strategic shift, user request, dependency, etc.?]

**Dependencies or blockers:** [List related components or issues, or "none"]

**Acceptance criteria:** [What does 'done' look like? List bullet points.]

**Suggested assignee or owner:** [Optional]

**Estimated effort:** [Optional - e.g. 1 day, 2 weeks, unknown]

### Completion Criteria:
- If the estimated effort is more than a few days, or if the task contains multiple sub-tasks or concepts, consider breaking it into smaller TODOs for clarity and parallel work
- The TODO item is considered properly added when:
  - [ ] The item is appropriately scoped (consider breaking into multiple items if needed)
  - [ ] The task is listed in TODO.md in the appropriate section
  - [ ] A GitHub Issue is created and linked (if applicable)
  - [ ] Related backlog or roadmap documents are updated (BACKLOG.md, PROJECT.md)
  - [ ] Task includes clear acceptance criteria

---

## Example Usage

```
I need to add a new TODO item to the Loqa project. Here are the details:

**Category:** Feature
**Priority level:** P1
**Description:** Add support for multi-command parsing in a single utterance
**Context:** This is a key differentiator for Loqa; surfaced during architecture review
**Dependencies or blockers:** Requires updating intent parser and sequencing logic
**Acceptance criteria:**
- [ ] User can say “Turn off the kitchen lights and set a timer for 10 minutes”
- [ ] Loqa correctly parses and executes both commands
- [ ] Timeline view displays both events clearly
**Suggested assignee or owner:** Anna
**Estimated effort:** 3–5 days

### Completion Criteria:
- If the estimated effort is more than a few days, or if the task contains multiple sub-tasks or concepts, consider breaking it into smaller TODOs for clarity and parallel work
- The TODO item is considered properly added when:
    - [x] The item is appropriately scoped (consider breaking into multiple items if needed)
    - [x] The task is listed in TODO.md in the appropriate section
    - [x] A GitHub Issue is created and linked
    - [x] Related backlog or roadmap documents are updated (BACKLOG.md, PROJECT.md)
    - [x] Task includes clear acceptance criteria
```