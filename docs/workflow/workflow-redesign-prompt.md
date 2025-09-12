# Prompt: Reimagine the Loqa Developer Workflow System

> ⚙️ Use this file as a blueprint for rethinking the entire developer workflow.  
> 🗂️ Start by reviewing [`workflow-current-state.md`](./workflow-current-state.md) — it provides the full system baseline.  
> 🧠 Your task is to redesign the system for modularity, persistence, reuse, and Claude-native intelligence.

---

## 🎯 Goals

1. **Persistent Workflow Enforcement**

   - The workflow should always be active when working inside the Loqa workspace — not just when slash commands are used.
   - PRs should always be created through our custom `pr` function, never manually.
   - All git operations must go through our `smart-git` MCP tools, never `git` directly.
   - Task creation should always use our templated tools (`/add-todo`, `backlog-aggregator.sh`, etc).

2. **Modularization & Maintainability**

   - Break up large files like `task-management-tools.ts` into smaller, purpose-driven modules.
   - Ensure all logic is understandable and testable in isolation.
   - Keep everything Claude-code-readable in scope and file size.

3. **Reusability Across Projects**

   - The workflow system (or at least major parts of it) should be portable to other Claude-integrated projects.
   - Consider moving parts (e.g. the MCP server) into separate reusable packages or even its own repository.

4. **Hybrid Enforcement via Agents and Hooks**

   - Evaluate the appropriate roles of agents, slash commands, Git hooks, and the MCP server.
   - Some workflows may be better suited for passive enforcement (file watchers, git hook guards).
   - Others may benefit from agent interactivity (prompt-based flow, slash-command chaining).

5. **Claude-Native, AI-First Experience**
   - This system should feel seamless inside Claude Code.
   - Slash commands, roles, prompt scaffolding, auto context detection, and multi-agent delegation should all be leveraged.

---

## 🔧 Concrete Refactoring Target

The file: `loqa/project/loqa-assistant-mcp/src/tools/task-management-tools.ts` is too large and tightly coupled for Claude Code to effectively operate on.

Please provide a **refactoring strategy** that:

- Identifies logical boundaries for modularization
- Proposes a new file structure for this tool group
- Defines how tool interfaces should be split (e.g. file generation vs YAML parsing vs template resolution)

---

## ❓ Key Architectural Questions

- Would it make sense for _all_ workflow functionality to be agents — or should some remain in the MCP server?
- If we retain the MCP server:
  - Should it be containerized and run remotely (e.g., via Docker)?
  - Should it be moved into its own repository for better reuse across Claude projects?
- Should slash commands trigger enforcement — or should enforcement happen implicitly via:
  - File watching?
  - Git hook logic?
  - Claude Code events or inferred intent?
- How can we design this to **scale across other Claude-powered repositories**?
  - E.g., multiple tool modules, agent registries, reuse of task templates, etc.

---

## 🧠 Agent Usage Guidance

You are encouraged to use **multiple Claude agents** if it helps:

- Parallelize the analysis of large tools
- Compare agent-based vs command-based enforcement strategies
- Reason about role-based workflows (e.g. developer vs architect)
- Merge and synthesize findings into a unified architecture

---

## ✅ Deliverables

Please return your results in a **Markdown file** named `workflow-redesign.md`, with the following sections:

- 📐 **Proposed Architecture**  
  A bullet list or diagram outlining the recommended new workflow design

- 🧠 **Current Workflow Issues**  
  Analysis of the shortcomings in the existing system (complexity, fragility, overcoupling)

- 🔧 **Refactoring Strategy**  
  Detailed plan for breaking up `task-management-tools.ts` and other monoliths

- ✅ **Recommended Design**  
  Your top architectural recommendation with justification

- 🔁 **Alternative Design**  
  A viable backup plan with tradeoff notes (pros/cons)

- 🪜 (Optional) **Migration Plan**  
  If applicable, suggest a step-by-step strategy for migrating to the new system

---

## 📎 Reference Materials

- [`workflow-current-state.md`](./workflow-current-state.md) — full current state audit
- `CLAUDE.md` — Claude Code guidance and project architecture
- `.claude-code.json` — permission and tooling rules for Claude
- MCP server (`/loqa/project/loqa-assistant-mcp/`) — current command router and tool logic
