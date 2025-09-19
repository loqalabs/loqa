# ADR-0005: Playback Queueing and Resume Semantics

**Status:** Accepted  
**Date:** 2025-09-18 23:54:24

---

## 🎯 Context

Puck devices must manage audio playback queues from the hub. These can include overlapping play requests from multiple categories (e.g. reminder, music, assistant reply).

---

## ✅ Decision

- Hub sends `DownAudioStart` with `category`, `priority`, and `play_id`
- Relay devices:
  - Play the **highest-priority** item
  - Pause lower-priority items if barge-in occurs
  - Resume previously paused items if still valid after barge-in completes

The hub ensures that:

- `AssistantResponse` preempts all
- `Timer`, `Reminder`, `Notification` can be resumed
- `DownAudioStop` terminates a `play_id` definitively

---

## 💡 Consequences

- ✅ Relays only need a **two-lane** scheduler (active + paused)
- ✅ Categories define the queue logic
- ⚠️ If multiple timers are queued, last in wins (no merging)
