# ADR-0001: Arbitration via Wake Candidate Scoring

**Status:** Accepted  
**Date:** 2025-09-18 23:43:50

---

## 🎯 Context

Multiple puck devices may detect a wake word simultaneously. To avoid duplicate audio streams or commands, we need to select a **single winner**.

This decision must:

- Resolve within a configurable 80–120ms arbitration window after the first `WakeCandidate`
- Favor the **best audio quality**
- Be **room-aware** and consistent across uses

---

## ✅ Decision

We will use a **scoring algorithm** in the hub to rank `WakeCandidate` messages, using the following tie-breaker order:

1. Earliest `start_ts`
2. Highest SNR
3. Highest wake confidence
4. Room stickiness (last winner)
5. Lowest relay ID (as final tie-breaker)

Top-scoring candidate is granted with `ArbGrant`. Others receive `ArbCancel`.

- If the winner fails to send `UpAudioFrame` within 500ms, the runner-up candidate (if still valid) is granted instead.
- The hub will send `ArbGrant` to the runner-up and `ArbCancel` to the original winner.
- A new `conversation_id` is assigned for the runner-up session.
- The winner’s partial audio buffers (if any) are discarded.
- If the runner-up also fails, the system falls back to `Idle` with a short earcon played to signal failure.
- This avoids midstream audio splicing and ensures clean recovery.

---

## 💡 Consequences

- 🧠 Arbitration is centralized and deterministic
- 🧪 Easy to log, debug, and tune scoring behavior
- 🚫 Relays never arbitrate among themselves
- 🔄 Grace period fallback to runner-up if winner fails to send `UpAudioFrame` within 500ms
- 🧠 Runner-up fallback uses a clean handoff with new session state and audio buffer reset
