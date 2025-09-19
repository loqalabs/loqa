# ADR-0004: Category-Based Barge-In and Playback Policy

**Status:** Accepted  
**Date:** 2025-09-18 23:54:24

---

## 🎯 Context

Loqa must support overlapping voice requests, timers, and music playback. A consistent policy is needed for what happens when a new wake word fires during playback.

---

## ✅ Decision

We will use **category-based barge-in behavior**. On new wake:

| Current Playback Category | Action           |
| ------------------------- | ---------------- |
| `AssistantResponse`       | STOP             |
| `Music`, `Timer`, etc     | PAUSE_AND_RESUME |

Paused audio is resumed **after** the new command completes, if still relevant.

---

## 💡 Consequences

- 🎯 Consistent UX across skills
- 🧠 Barge-in logic lives in the **hub**, not the puck
- ✅ Easy to test via state machine simulation
