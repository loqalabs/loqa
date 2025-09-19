# ADR-0009: Skill Execution Security Model

**Status:** Accepted  
**Date:** 2025-09-19

---

## 🎯 Context

Loqa supports multiple ways to execute skills:

- As Go plugins (loaded dynamically at runtime)
- As separate MCP-style microservices (language-agnostic subprocesses)

Each model has different trust and security implications. We must define defaults, sandboxing, and safe execution modes to align with Loqa’s privacy-first goals.

---

## ✅ Decision

**Note:** For MVP, only **Go plugins** are supported. MCP is disabled by default and treated as experimental. This simplifies the trust model and reduces runtime complexity.

We define **three trust tiers** for skill execution, each with specific constraints.

### 1. Paranoid Tier (default for privacy-first deployments)

- Go plugins: DISABLED
- Only built-in system skills (e.g., `system.cancel`, `audio.play`, `timer.set`) are available if compiled in; all dynamic plugins are disabled
- MCP subprocesses:
  - Launched with `--no-net` (no external network access)
  - Limited CPU and memory (via `ulimit` or container policy)
  - Per-call timeout (e.g., 1.5s)
  - JSON schema args validation before invocation

### 2. Trusted Tier

- Go plugins: ENABLED
- MCP subprocesses:
  - May have network access
  - Still sandboxed by resource limits and timeout

### 3. Convenient Tier (developer/testing only)

- All execution models enabled
- MCP subprocesses run without restriction
- Logging enabled for all input/output

---

## 🧩 Skill Manifest Requirements

Each skill must provide a manifest:

{
"name": "timer.set",
"trusted": false,
"args_schema": {
"type": "object",
"properties": {
"duration": {"type": "string"},
"label": {"type": "string"}
},
"required": ["duration"]
}
}

The hub uses this manifest to:

- Validate arguments before execution
- Decide if the skill is allowed under current trust tier
- Inform UI which skills are disabled in Paranoid mode

---

## 💡 Consequences

- ✅ Users can run Loqa in a strict, locked-down mode (Paranoid tier)
- ✅ Developers can prototype freely in Convenient tier
- ✅ Skill sandboxing makes cloud-free Loqa deployments safer
- ⚠️ Misconfigured skills will be rejected at load or invocation time
- ⚠️ MCP is not included in the MVP release. It remains in the architecture for future extensibility but is not supported in production builds.
- ⚠️ In Paranoid mode, only built-in compiled skills are usable. All dynamically loaded plugins and MCP skills are blocked.
