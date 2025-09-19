# Loqa Benchmark Plan

This document defines the performance and resilience benchmarks that must be validated before finalizing MVP claims for Loqa, particularly around timing SLAs, memory safety, and fallback behavior.

---

## 📈 Core Objectives

- Validate local LLM first-token latency under real-world load
- Verify ESP32-S3 memory stability under audio streaming
- Test arbitration and puck coordination under stress
- Confirm skill execution isolation and fault tolerance

---

## 🧮 Benchmark Reference System

All timing SLAs and tier performance claims assume this baseline hardware unless otherwise stated:

| Device           | CPU Cores | RAM   | Tier     | Notes                                  |
| ---------------- | --------- | ----- | -------- | -------------------------------------- |
| Mac Mini M2      | 8-core    | 8GB   | Standard | Primary benchmark target for MVP       |
| Mac Mini M2 Pro  | 10-core   | 16GB  | Pro      | Used to validate Pro-tier SLA targets  |
| Mac Studio Ultra | 24-core   | 64GB+ | N/A      | For future R&D (multi-turn, NSL, etc.) |

- Model year: 2023
- OS: macOS 14.x or later
- Network: Wired Ethernet or stable Wi-Fi 6

This reference setup is used to validate claimed SLAs such as first-token LLM latency and audio roundtrip times.

---

## ✅ Benchmarks to Run

### 1. Local LLM Token Latency

| Config                    | Model    | Warm Start | Cold Start | System Load | Notes           |
| ------------------------- | -------- | ---------- | ---------- | ----------- | --------------- |
| Mac Mini (M2)             | Llama 3B | ✅         | ✅         | ✅          | baseline        |
| x86 NUC                   | Llama 3B | ✅         | ✅         | ✅          |                 |
| x86 NUC                   | Llama 8B | ✅         | ✅         | ✅          | target Pro tier |
| Optional: Mac M1, Ryzen 5 |          |            |            |             |                 |

- Measure: Time to first token (ms) after STT → intent
- Record: 10 trials each, with and without other workloads
- Goal: Compare against claimed SLAs in ADR-0003 (≤250ms, ≤200ms)

---

### 2. ESP32-S3 Audio Streaming Stability

- Run uplink and downlink streams simultaneously over HTTP/1.1
- Use:
  - TLS + chunked binary frame
  - PCM16 audio at 16kHz mono, 20ms frames
- Duration: 30 minutes continuous
- Track:
  - Heap usage (min/max/avg)
  - Audio frame drop rate
  - Uptime/reconnects

---

### 3. Arbitration Edge Case Handling

Simulate 3–5 pucks firing within 100ms.

Test cases:

- [ ] Winner fails to send audio → verify runner-up fallback
- [ ] Tie-breaker tie → verify scoring precedence
- [ ] One puck drops mid-stream → verify no duplicate grants
- [ ] High latency puck wins → verify local STT continues correctly

---

### 4. Skill Isolation & Failure Resilience

| Scenario                                | Expected Behavior                  |
| --------------------------------------- | ---------------------------------- |
| Go plugin crashes during tool execution | Hub remains stable                 |
| Plugin exceeds memory limit             | Error surfaced, no global crash    |
| Invalid args bypass schema              | Invocation rejected                |
| Plugin logs excessive output            | Output captured, does not stall    |
| Multi-step plan → one step fails        | Plan aborts with user notification |

---

## 📎 Related Specs

- ADR-0002: Tiered Performance
- ADR-0008: Reliability & Degradation
- ADR-0009: Skill Security
- ADR-0010: Transport & Framing

---

## 🧪 Benchmark Notes

- Record test environment specs (CPU, RAM, OS)
- Run cold-start and warm-start tests separately
- Use JSONL recorder or structured logs to track latencies
- Consider CI integration for regression

---

All benchmarks must pass before claiming timing or performance guarantees in public materials.
