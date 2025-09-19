# ADR-0002: Tiered System Profiles for Performance Scaling

**Status:** Accepted  
**Date:** 2025-09-18 23:43:50

---

## 🎯 Context

Loqa must run on a wide range of local hardware — from Raspberry Pi-class devices to GPU workstations. To support this, we need a scalable architecture that:

- Automatically tunes **model size** to available resources
- Provides consistent **UX expectations**
- Allows users to opt-in to cloud-enhanced performance

---

## ✅ Decision

We define three system **tiers**:

| Tier     | Hardware Target    | STT       | LLM                                                             | TTS        |
| -------- | ------------------ | --------- | --------------------------------------------------------------- | ---------- |
| Basic    | CPU-only / low-end | base.en   | Reflex only (LLM disabled unless explicitly enabled via config) | Piper      |
| Standard | Mac M1/M2, Ryzen   | small.en  | Reflex + Llama 3 3B (proposed first token SLA ≤ 250ms)          | Kokoro-82M |
| Pro      | M2 Pro, RTX 3060+  | medium.en | Reflex + Llama 3 8B (proposed first token SLA ≤ 200ms)          | Bark/Dia   |

Each tier maps to a `tier_profile.yaml` that sets default config values.

| Tier     | Reflex SLA | Local LLM SLA (proposed; must be validated) | Hard Timeout |
| -------- | ---------- | ------------------------------------------- | ------------ |
| Basic    | ≤50ms      | Off (optional)                              | 450ms        |
| Standard | ≤50ms      | ≤250ms                                      | 350ms        |
| Pro      | ≤50ms      | ≤200ms                                      | 300ms        |

---

## 💡 Consequences

- 🔁 Config is now driven by hardware detection (`--tier=auto`)
- 📉 Lower-end users get privacy + function, not just "unsupported" errors
- 💻 Dev and prod environments can run the same code at different speeds
- Basic tier does not run LLMs by default; Reflex-only is fully supported
- Timing SLAs are targets, not guarantees. Each tier must be benchmarked before claims are finalized. Hybrid tier is deferred post-MVP.
- Timing SLAs are targets, not guarantees. Each tier must be benchmarked before claims are finalized.
