# 🟨 P3 – Optional / Post-MVP Features

---

### 🔍 Backend & Observability
_This section focuses on enhancing deeper inspection tools and strengthening test infrastructure to improve backend reliability and observability._

- [ ] CLI: `loqa export-logs --redact` support
- [ ] Add encrypted transcript log format (per-event encryption)
- [ ] Add signed audit trail support (tamper-evident logs)
- [ ] Add local emergency wipe command / red button
- [ ] Add integration tests for streaming STT pipeline
- [ ] Add drill-down debugger mode for voice pipeline (NLU → Skill → Response)

---

### 🖥️ Observer UI & API Surface
_These tasks aim to increase flexibility by making the observer UI more modular and optionally deployable, improving API accessibility and usability._

- [ ] Observer UI settings panel: toggle log retention, sanitization, redaction, etc.
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

- [ ] Observer UI: gracefully degrade when log retention = 0 or sanitization = true
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

### 🧺 Shopping List Sync (Paid Feature)
_This section outlines a privacy-preserving, cloud-assisted mobile sync feature for shopping lists — designed as a showcase paid-tier skill._

- [ ] Create shopping-list skill with local SQLite persistence
- [ ] Add gRPC and HTTP API endpoints for list manipulation
- [ ] Define encrypted sync blob format (JSON + age or AES-GCM)
- [ ] Build ephemeral QR-based pairing system (Hub ↔ Mobile)
- [ ] Implement Loqa Relay microservice (stateless E2EE message routing)
- [ ] Add pairing state + public key registry to loqa-hub
- [ ] Build minimal PWA or native mobile app to sync and view list
- [ ] Gate feature behind `config.license` or `--paid` flag
- [ ] Add Observer UI component to manage sync status and pairing
---

### 🧭 Messaging & Positioning
_These tasks focus on refining external messaging, public perception, and product framing to better communicate the platform’s value and positioning._

- [ ] Highlight privacy differentiators vs Home Assistant Voice
- [ ] Emphasize "HIPAA-conscious by design" in docs and landing
- [ ] Add homepage tagline: "A voice assistant that does more than 'turn on the lights'"
- [ ] Add privacy log policy to README: no voice storage, ephemeral logs, transcript redaction
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
- [ ] Replay / Simulation mode for event testing (⚠️ must not use stored real voice data; only simulated or redacted input allowed)
- [ ] Composable voice macros (e.g., "Good morning" routines)
- [ ] Voice-based configuration (e.g., "Enable search mode")
- [ ] On-device memory layer (e.g., reminders, preferences)
- [ ] Local speaker recognition for personalization
- [ ] Simple on-device fine-tuning of LLMs
- [ ] Skill SDK / Wizard for non-coders
- [ ] Prompt remixing for varied responses
- [ ] Observer as full config dashboard
- [ ] Swappable LLMs with privacy warnings
- [ ] Time-aware skills and scheduling
- [ ] Explainability UX: "Why did you do that?"
- [ ] Mobile app as thin client
- [ ] Fully headless mode support
- [ ] Evaluate Docker Model Runner as alternative to Ollama

### 🔀 Advanced Multi-Relay Features
_Long-term enhancements for sophisticated multi-device voice coordination and spatial awareness._

- [ ] Acoustic beamforming for directional voice detection across multiple relay devices
- [ ] User presence detection and automatic room-based relay preference learning
- [ ] Multi-room voice handoff (start command in kitchen, continue in living room)
- [ ] Relay clustering and load balancing for large deployments
- [ ] Voice fingerprinting for automatic user identification across relay devices
- [ ] Spatial audio responses (route TTS to appropriate room/relay)