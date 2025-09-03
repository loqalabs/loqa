# 🟨 P3 – Optional / Post-MVP Features

---

### 🔍 Backend & Observability
_This section focuses on enhancing deeper inspection tools and strengthening test infrastructure to improve backend reliability and observability._

- [ ] Add integration tests for streaming STT pipeline
- [ ] Add drill-down debugger mode for voice pipeline (NLU → Skill → Response)

---

### 🖥️ Observer UI & API Surface
_These tasks aim to increase flexibility by making the observer UI more modular and optionally deployable, improving API accessibility and usability._

- [ ] Treat observer as optional dependency in Docker
- [ ] Document `/api` as public interface (OpenAPI or Markdown)
- [ ] Ensure all observer features work via HTTP only
- [ ] Add `HEADLESS` mode flag to `loqa-hub`
- [ ] Optional: Add reverse proxy (e.g., Caddy or Traefik) for clean UI endpoint

---

### 🗣️ Speech-to-Text (STT)
_These post-MVP expansions focus on making the STT system more extensible, pluggable, and compatible with cloud-based HTTP engines._

- [ ] Document STT plugin development guide
- [ ] Support HTTP-based STT engines (e.g., OpenAI, Google Cloud)
- [ ] Add auth config for STT APIs (keys, OAuth, etc.)
- [ ] Add streaming chunked upload support for HTTP STT
- [ ] Implement sample integrations for OpenAI, Google, Azure
- [ ] Remove Whisper.cpp fallback
  - [ ] Remove whisper.cpp code from STT pipeline
  - [ ] Remove whisper model download logic
  - [ ] Clean up WHISPER_MODEL_PATH
  - [ ] Remove whisper-models volume from Docker

---

### 🔊 Text-to-Speech (TTS)
_This group of tasks aims to improve voice quality and provide more expressive and flexible TTS options for skill authors and devices._

- [ ] Benchmark Piper vs Bark
- [ ] Allow skill authors to select `tts_mode: expressive | fast`
- [ ] Add fallback voices for lower-end devices
- [ ] Simulate simple emotion via pitch/speed modulation

---

### 🧹 MVP Cleanup & Scope
_These items serve as guardrails and structural decisions to maintain clarity and focus for the OSS MVP and prepare for future plugin sandboxing and licensing._

- [ ] Remove or toggle features not included in OSS MVP
- [ ] Implement WASM or subprocess sandboxing for plugins
- [ ] Hide premium features behind `config.license` flag
- [ ] Create `MVP.md` to define MVP boundaries
- [ ] Implement skill-level permissions (trust zones)

---

### 🪪 Feature Tiering & Licensing
_This section adds structured feature tiers to clearly distinguish between free open-source capabilities and licensed premium functionality._

- [ ] Create `FEATURE_TIERS.md` (OSS / Licensed / Coming Soon)
- [ ] Tag source with `// OSS_ONLY` or `// LICENSED_FEATURE`
- [ ] CLI: Add `loqa features` command to print current tier

---

### 🧭 Messaging & Positioning
_These tasks focus on refining external messaging, public perception, and product framing to better communicate the platform’s value and positioning._

- [ ] Clarify “voice assistant” vs “voice platform”
- [ ] Improve messaging across README, SPONSOR.md, homepage
- [ ] Write short pitches tailored to developers, privacy users, smart home fans
- [ ] UX test homepage messaging with real users

---

### 💡 Future Exploratory Ideas
_This section collects longer-term, blue-sky ideas to explore once the core system has achieved stability and maturity._

- [ ] Configurable hotword behavior and alternate triggers
- [ ] Skill auto-update and rollback
- [ ] Guest mode / temporary user profiles
- [ ] Community-curated skill marketplace with optional monetization
- [ ] Intent chaining (multi-command parsing)
- [ ] Replay / Simulation mode for event testing
- [ ] Composable voice macros (e.g., “Good morning” routines)
- [ ] Voice-based configuration (e.g., “Enable search mode”)
- [ ] On-device memory layer (e.g., reminders, preferences)
- [ ] Local speaker recognition for personalization
- [ ] Simple on-device fine-tuning of LLMs
- [ ] Skill SDK / Wizard for non-coders
- [ ] Prompt remixing for varied responses
- [ ] Observer as full config dashboard
- [ ] Swappable LLMs with privacy warnings
- [ ] Time-aware skills and scheduling
- [ ] Explainability UX: “Why did you do that?”
- [ ] Mobile app as thin client
- [ ] Fully headless mode support
- [ ] Evaluate Docker Model Runner as alternative to Ollama