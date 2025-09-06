# 🟨 P3 – Post-Business MVP Features

> **📊 Track Progress**: View all issues and milestones in the [**Loqa MVP Roadmap Project**](https://github.com/orgs/loqalabs/projects/1)  
> **🎯 Future Milestones**: [v2.0 Enterprise - Dec 31, 2026](https://github.com/loqalabs/loqa/milestone/3)

## 🛠️ Developer Experience **[MOVED FROM P2]**
_Moved to P3 to prioritize business market success first, then return focus to OSS developer community_

**🔗 GitHub Issues**: 
- [loqa#12 - Developer Experience - CLI tools and skill development](https://github.com/loqalabs/loqa/issues/12) *(Epic)*
- [loqa-skills#7 - Skill testing framework with mock STT/TTS](https://github.com/loqalabs/loqa-skills/issues/7)

- [ ] Add `loqa skill init` command to scaffold new skills
- [ ] Create skill testing framework with mock STT/TTS
- [ ] Add hot-reload for skill development
- [ ] Publish skill development containers/templates
- [ ] Community skill marketplace with optional monetization
- [ ] Advanced skill debugging and profiling tools
- [ ] Skill SDK/Wizard for non-coders

---

---

### 🔍 Backend & Observability
_Advanced observability features for enterprise deployments. Basic compliance features moved to P1._

- [ ] Add encrypted transcript log format (per-event encryption)
- [ ] Add signed audit trail support (tamper-evident logs)  
- [ ] Add local emergency wipe command / red button
- [ ] Add integration tests for streaming STT pipeline
- [ ] Add drill-down debugger mode for voice pipeline (NLU → Skill → Response)
- [ ] **Enterprise**: Multi-tenant observability across business locations
- [ ] **Enterprise**: Advanced performance analytics and capacity planning
- [ ] **Enterprise**: Integration with business monitoring systems (Datadog, etc.)

---

### 🖥️ Commander UI & API Surface
_These tasks aim to increase flexibility by making the Commander UI more modular and optionally deployable, improving API accessibility and usability._

- [ ] Commander UI settings panel: toggle log retention, sanitization, redaction, etc.
- [ ] Treat Commander as optional dependency in Docker
- [ ] Document `/api` as public interface (OpenAPI or Markdown)
- [ ] Ensure all Commander features work via HTTP only
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
_Post-business MVP TTS enhancements. Note: Kokoro-82M integration is now P1 priority._

- [ ] Benchmark Kokoro-82M vs Piper vs Bark (Kokoro-82M integration moved to P1)
- [ ] Allow skill authors to select `tts_mode: expressive | fast`
- [ ] Add fallback voices for lower-end devices
- [ ] Simulate simple emotion via pitch/speed modulation
- [ ] Voice cloning for personalized business environments
- [ ] Multi-language support for international business use

---

### 🧹 MVP Cleanup & Scope
_These items serve as guardrails and structural decisions to maintain clarity and focus for the OSS MVP and prepare for future plugin sandboxing and licensing._

- [ ] Commander UI: gracefully degrade when log retention = 0 or sanitization = true
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
- [ ] Add Commander UI component to manage sync status and pairing
---

### 🧭 Messaging & Positioning
_These tasks focus on refining external messaging, public perception, and product framing to better communicate the platform's value and positioning._

- [ ] Highlight privacy differentiators vs Home Assistant Voice
- [ ] Emphasize "HIPAA-conscious by design" in docs and landing
- [ ] Add homepage tagline: "A voice assistant that does more than 'turn on the lights'"
- [ ] Add privacy log policy to README: no voice storage, ephemeral logs, transcript redaction
- [ ] Clarify "voice assistant" vs "voice platform"
- [ ] Improve messaging across README, SPONSOR.md, homepage
- [ ] Write short pitches tailored to developers, privacy users, smart home fans
- [ ] UX test homepage messaging with real users

### 🎯 Enhanced Positioning & Target Audiences
_Expand messaging to reach additional high-value market segments._

**🔗 GitHub Issues**: 
- [www-loqalabs-com#8 - HIPAA-conscious messaging and healthcare positioning](https://github.com/loqalabs/www-loqalabs-com/issues/8)
- [www-loqalabs-com#9 - Privacy comparison table and Privacy First documentation](https://github.com/loqalabs/www-loqalabs-com/issues/9)

- [ ] **Healthcare professionals** messaging (HIPAA compliance angle)
- [ ] **Enterprise privacy officers** positioning (compliance-ready platform)
- [ ] **IoT developers** focus (extensible voice control platform)
- [ ] **Smart home enthusiasts** beyond basic control
- [ ] Add privacy comparison table vs major competitors
- [ ] Create "Privacy First" documentation section
- [ ] Add privacy audit checklist for skill developers
- [ ] Strengthen competitive angles:
  - [ ] "Voice assistant that doesn't phone home"
  - [ ] "HIPAA-conscious by design"
  - [ ] "Skill marketplace without vendor lock-in"
  - [ ] "Your voice data stays in your house"

---

### 🏢 Enterprise Readiness
_Features for large-scale deployments and enterprise compliance requirements._

- [ ] Multi-tenant skill isolation
- [ ] Role-based access control for Commander UI
- [ ] Backup/restore automation for hub data
- [ ] Performance benchmarking tools
- [ ] Audit trail export for compliance reporting
- [ ] Enterprise SSO integration
- [ ] Centralized policy management across multiple hubs

### 💡 Future Exploratory Ideas
_This section collects longer-term, blue-sky ideas to explore once the core system has achieved stability and maturity._

- [ ] Configurable hotword behavior and alternate triggers
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
- [ ] Commander as full config dashboard
- [ ] Swappable LLMs with privacy warnings
- [ ] Time-aware skills and scheduling
- [ ] Explainability UX: "Why did you do that?"
- [ ] Mobile app as thin client
- [ ] Evaluate Docker Model Runner as alternative to Ollama

### 🔀 Advanced Multi-Relay Features
_Long-term enhancements for sophisticated multi-device voice coordination and spatial awareness._

- [ ] Acoustic beamforming for directional voice detection across multiple relay devices
- [ ] User presence detection and automatic room-based relay preference learning
- [ ] Multi-room voice handoff (start command in kitchen, continue in living room)
- [ ] Relay clustering and load balancing for large deployments
- [ ] Voice fingerprinting for automatic user identification across relay devices
- [ ] Spatial audio responses (route TTS to appropriate room/relay)