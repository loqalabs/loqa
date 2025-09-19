# Error Handling and State Machines

This document defines the failure states, fallback policies, and recovery logic used throughout the Loqa platform.

---

## 🧭 Global Intent State Machine

```
[Idle] --> [Processing] --> [Succeeded]
             |     |
             |     +--> [Failed] --(retry limit)--> [Degraded]
             |                                \--> [Processing]
[Degraded] --(timer or manual reset)--> [Idle]
```

### Triggers

- `Processing → Failed`: timeout, crash, disconnect
- `Failed → Degraded`: retry_limit_exceeded or fatal class
- `Degraded → Idle`: after cooldown or manual restart

---

## ⚖️ Arbitration Fallback Logic

1. WakeCandidates collected in 80–120ms window
2. Winner gets `ArbGrant`; others get `ArbCancel`
3. If winner:
   - Sends no `UpAudioFrame` by 500ms, or
   - Drops before sending 1s of audio

→ Runner-up gets `ArbGrant`, new conversation ID started

If runner-up fails too → back to `Idle`, short earcon played

---

## 🔁 Audio Upload Drop

- Puck buffers ≤ 1s of audio frames
- On reconnect:
  - New conversation ID unless resume supported
  - Hub logs a degraded session
- STT session may be discarded unless complete segment exists

---

## ⏬ Audio Download Drop

- Puck reconnects via `resume_seq` param
- Hub attempts to replay audio/control frames
- If not possible, sends clean `DownAudioStart` to resume

---

## 🧠 LLM Failures

- Timeout: if no token by SLA (250/200ms), cancel request
- Fallback:
  - If Reflex fallback candidate exists → commit
  - Else → clarification prompt or "I didn't catch that"
- LLM cooldown: disable for 30s after timeout
- Log: `sys.error.llm.timeout` or `sys.error.llm.oom`

---

## 🔧 Skill Execution Failure

- Plan aborted on first failure (MVP default)
- TTS: “I couldn’t finish X. Want me to try again?”
- Transient error → 1 retry after 500ms
- No rollback or compensation yet

---

## 🧪 Network Reconnect Logic

- Upload:
  - Backoff: 1s → 2s → 4s → 8s → max 30s
  - After 30s offline, LED+earcon state change
- Download:
  - Same backoff and status
  - After reconnect, playback queue resumes if possible

---

## 📎 Related

- ADR-0008: Reliability & Degradation
- ADR-0001: Arbitration Scoring
- `tier-detection.md`
