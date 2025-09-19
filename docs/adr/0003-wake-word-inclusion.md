# ADR-0003: Always Send Wake Word Audio to Hub

**Status:** Accepted  
**Date:** 2025-09-18 23:43:50

---

## 🎯 Context

There was discussion about whether to strip the wake word ("loqa") before sending audio to the hub. Removing it would reduce payload size and avoid accidental LLM confusion. However, it could also lose valuable context.

---

## ✅ Decision

Puck devices will **always include the wake word** in streamed audio.  
Metadata (`WakeMeta`) will annotate the hotword location and confidence.

ASR post-processing will **remove** the wake word **before intent parsing**.

---

## 💡 Consequences

- ✅ Improved timestamp alignment
- 🔁 Easier to debug false positives
- 🎯 Allows future use of hotword for domain routing (e.g. "Hey Loqa, tell ChatGPT...")
- ⚖️ Slight increase in upstream audio size (minimal for 200–300ms)
