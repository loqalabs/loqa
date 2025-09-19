# Tier Detection Specification

This document defines how the Loqa hub determines its hardware tier and adjusts system behavior accordingly.

---

## 🎯 Purpose

Tier detection allows Loqa to optimize:

- Model selection (e.g. Llama 3B vs. Llama 8B)
- Feature flags (e.g. TTS openers, reflex-only mode)
- Timeout and SLA expectations
- Skill routing behavior

---

## 🧠 Tier Levels

| Tier     | Default Behavior           |
| -------- | -------------------------- |
| Basic    | Reflex-only (LLM disabled) |
| Standard | Reflex + Local LLM (3B)    |
| Pro      | Reflex + Local LLM (8B)    |

### 📊 Example Device Mapping

These example machines are used to guide real-world tier detection and align benchmark expectations:

| Device           | Cores | RAM  | Detected Tier | Notes                         |
| ---------------- | ----- | ---- | ------------- | ----------------------------- |
| Mac Mini M2      | 8     | 8GB  | Standard      | Baseline MVP benchmark target |
| Mac Mini M2 Pro  | 10    | 16GB | Pro           | Used for Pro-tier validation  |
| Mac Studio Ultra | 24    | 64GB | Future R&D    | For NSL, chaining, etc.       |

---

## ⚙️ Detection Algorithm

Default mode: `--tier=auto`  
User can override via CLI: `--tier=basic|standard|pro`

### Inputs

- CPU: core count, frequency, architecture
- Memory: total system RAM
- GPU: CUDA / Metal availability (optional in MVP)

### Scoring

```go
score := 0
if cores >= 8 { score += 2 } else if cores >= 4 { score += 1 }
if baseGHz >= 3.2 { score += 2 } else if baseGHz >= 2.4 { score += 1 }
if memGB >= 32 { score += 2 } else if memGB >= 16 { score += 1 }
if hasGPU { score += 1 }

switch {
  case score <= 2: tier = Basic
  case score <= 4: tier = Standard
  default:         tier = Pro
}
```

---

## 🔁 Fallback Logic

- If detection fails → tier = Basic
- If user specifies `--tier` → that value is final
- Commander shows both detected + overridden tier

---

## 🔌 Tier Controls

- **Basic**:
  - LLM = OFF unless `enable_llm=true` in config
  - TTS openers disabled
- **Standard/Pro**:
  - LLM enabled
  - Timeouts follow ADR-0003 proposed SLAs
  - Fallback to Reflex if SLA missed

---

## 📎 Related

- ADR-0002: Tiered Performance
- `BENCHMARKS.md`
- `error-handling-state-machines.md`
