# ADR-0008: Reliability & Graceful Degradation

**Status:** Accepted  
**Date:** 2025-09-19 14:31:40

---

## 🎯 Context

As Loqa becomes increasingly modular and real-time, we must prepare for runtime failures in STT, TTS, skills, networking, and relays. A resilient voice assistant must handle these gracefully — preserving core functionality (Reflex commands, basic responses) even in degraded conditions.

---

## ✅ Decision

We will implement a set of **circuit breakers, fallbacks, and timeout policies** to ensure Loqa remains usable and predictable when components fail or degrade.

### ✅ Core Strategies

- **Circuit Breakers**:

  - STT / TTS / LLM components will time out and trip after `N` failures
  - Exponential backoff and retry windows per module

- **Fallback Modes**:

  - If LLM misses first-token SLA → fallback to Reflex or prompt user
  - If skill invocation fails (timeout, crash) → respond with generic error
  - If playback fails → skip to next queued item
  - If Commander UI disconnects → no effect on pipeline
  - If LLM OOMs or is under memory pressure → log failure to `sys.error.llm` and disable LLM temporarily
  - If multi-step plan fails partway through → abort plan and optionally notify user of partial success
  - If WebSocket or HTTP uplink is dropped during a stream → replayable skills may be retried, otherwise plan is aborted

- **Offline Mode**:

  - If STT or LLM is unavailable → system falls back to Reflex-only mode
  - UI or TTS says: "Sorry, I’m offline but still listening for basic commands"
  - If network partition occurs or hub becomes unreachable → relay should indicate offline state via LED or earcon and buffer minimal cancel/stop reflexes locally for up to 10s

- **Runner-Up Arbitration**:

  - If ArbGrant winner fails to stream audio within 500ms, the runner-up candidate is auto-granted

- **Message Queue Handling**:
  - NATS subjects use bounded queues
  - Low-priority subjects (e.g. telemetry) drop if overflowed
  - Critical messages (intent, playback) trigger retry if undelivered

---

## 💡 Consequences

- ✅ The system remains responsive during component failures
- ✅ Users always get some feedback (earcon, error phrase, retry)
- ✅ Developers can observe, reproduce, and fix issues without mystery
- 🧪 Testing must simulate timeouts, TTS failures, and relay disconnects
- 🧪 Benchmarking must include: LLM token latency, relay connection stability, and resource exhaustion edge cases
- 🔒 JSONL recorder must be explicitly enabled and support encryption, max retention, and optional in-memory mode

This allows Loqa to fail gracefully rather than hang, timeout silently, or confuse the user.
