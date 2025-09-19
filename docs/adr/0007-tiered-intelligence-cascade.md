# ADR-0007: Tiered Intent Parsing Cascade (Reflex + LLM + TTS)

**Status:** Accepted  
**Date:** 2025-09-18

---

## 🎯 Context

Low-latency interaction is critical to the user experience of a voice assistant. Relying on full LLM pipelines for every command introduces unacceptable lag. At the same time, users expect expressive, flexible phrasing and command chaining.

We need a way to be both **smart** and **fast**, tailored to hardware capabilities.

---

## ✅ Decision

We will use a 3-tier cascading pipeline to handle voice commands:

1. **Reflex Match**

   - Fast local phrase or regex matcher (YAML-defined)
   - Directly invokes a known skill
   - Used for top 20% of common requests

2. **Small LLM**

   - Local model (e.g., Llama 3B via Ollama)
   - Performs lightweight intent extraction + slot filling
   - Streams tokens to enable early TTS

3. **Large LLM**
   - Cloud or GPU-based fallback (GPT-4, Claude)
   - Handles novel or long-form requests
   - Only invoked if confidence is low or context is long

---

## 💡 Consequences

- ✅ Reflex response times in the 10–50ms range
- ✅ Local models provide natural language handling with <300ms latency
- ⚠️ Some skills may need to declare both fast and rich paths
- ✅ Easy to test and swap models depending on tier
- 🔐 Cloud use is opt-in via tier config

This enables fast interaction even on constrained hardware, while keeping complex reasoning capabilities accessible when needed.
