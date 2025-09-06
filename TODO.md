## 🟥 P1 – Must-Fix Before MVP

> **📊 Track Progress**: View all issues and milestones in the [**Loqa MVP Roadmap Project**](https://github.com/orgs/loqalabs/projects/1)  
> **🎯 MVP Milestone**: [Due Dec 31, 2025](https://github.com/loqalabs/loqa/milestone/1)

### 🧠 Intent Parsing & Command Execution
**🔗 GitHub Issue**: [loqa-hub#18 - Multi-command intent parsing and chaining](https://github.com/loqalabs/loqa-hub/issues/18)

- [ ] Support multi-command chaining in parsed intent pipeline
  - [ ] Parse compound utterances (e.g., "Turn off the lights and play music")
  - [ ] Route sub-intents to appropriate skills in sequence
  - [ ] Ensure skill responses can be executed in order without overlap or conflict
  - [ ] Combine or sequence TTS responses for multiple results
  - [ ] If chaining fails, gracefully fallback to the first valid command

### 🖥️ Observer UI & API Surface
**🔗 GitHub Issue**: [loqa-observer#14 - Timeline filtering and event categorization](https://github.com/loqalabs/loqa-observer/issues/14)

- [x] Fix "Active Relays" count to reflect disconnections (e.g., when relay exits unexpectedly)
- [ ] Add ability to filter timeline by success, failure, or low-confidence events
- [x] Make event boxes more compact or collapsed by default

### 🗣️ Speech-to-Text (STT)
**🔗 GitHub Issue**: [loqa-hub#20 - STT confidence thresholds and wake word normalization](https://github.com/loqalabs/loqa-hub/issues/20)

- [x] Remove Whisper.cpp fallback
  - [x] Remove whisper.cpp code from STT pipeline
  - [x] Remove whisper model download logic
  - [x] Clean up WHISPER_MODEL_PATH
  - [x] Remove whisper-models volume from Docker
- [ ] Strip wake word ("Hey Loqa") before passing to intent parser
- [ ] Normalize common misspellings of "Loqa" (e.g., "Luca") in post-STT
- [ ] Define and enforce default confidence threshold for rejecting low-quality transcriptions
- [ ] Fallback: Ask user to repeat command if confidence is too low

### 🔀 Multi-Relay Collision Detection
**🔗 GitHub Issue**: [loqa-hub#19 - Multi-relay collision detection and arbitration](https://github.com/loqalabs/loqa-hub/issues/19)

- [ ] Implement basic collision detection for multiple relay wake word activation
  - [ ] Add ActiveStream tracking in AudioService with relay_id mapping
  - [ ] Implement simple "last relay to connect wins" arbitration logic
  - [ ] Send cancellation responses to losing relay devices via gRPC stream
  - [ ] Add proper stream cleanup when relay devices are cancelled or disconnect

### 🔊 Text-to-Speech (TTS)
- [ ] Play returned TTS phrase through speakers when using the test relay (must remain ephemeral and never stored to disk)

### 🧠 Skills & Plugin System
**🔗 GitHub Issue**: [loqa-skills#9 - Built-in Timer Skill with local tracking](https://github.com/loqalabs/loqa-skills/issues/9)

- [ ] Add built-in "Set a timer" skill with local tracking and TTS countdown/complete response
  - [ ] Support durations like "set a timer for 5 minutes"
  - [ ] Handle multiple timers if possible (e.g., "set a tea timer for 3 minutes and an oven timer for 10 minutes")
  - [ ] Announce when timer expires via TTS playback
  - [ ] Store and cancel timers locally on the hub
- [x] Add built-in "What time is it?" skill using hub local time
- [ ] Ensure manifest includes field for `sensitive: true` for privacy-tagged skills

### 📈 MVP Success Criteria
**🔗 GitHub Issue**: [loqa#11 - MVP Success Criteria - Define and track measurable goals](https://github.com/loqalabs/loqa/issues/11)

- [ ] 5-second end-to-end voice response time
- [ ] 95% wake word detection accuracy  
- [ ] Support for 10+ simultaneous relays
- [ ] Zero voice data persistence by default
- [ ] Sub-100MB memory footprint per service

---

## 🟧 P2 – High-Impact UX Improvements

> **📊 Track Progress**: View all issues in the [**Loqa MVP Roadmap Project**](https://github.com/orgs/loqalabs/projects/1)  
> **🎯 v1.0 Milestone**: [Due June 30, 2026](https://github.com/loqalabs/loqa/milestone/2)

### 🖥️ Observer UI & API Surface
- [ ] Add drill-down breakdown of slow events (e.g., STT, LLM parse, skill handling)
- [ ] Add compact/toggle view mode for timeline events

### 🖥️ Observer UI & API Surface (P1)
- [ ] Ensure UI gracefully degrades when logs are ephemeral or redacted

### 🎛️ Skill Management UI
**🔗 GitHub Issue**: [loqa-observer#13 - Skills Management UI - Dashboard for installed plugins](https://github.com/loqalabs/loqa-observer/issues/13)

- [ ] Create a "Skills" tab in `loqa-observer` with list of installed plugins
- [ ] Show skill name, description, version, and enabled status
- [ ] Add toggles to enable/disable skills
- [ ] Link to skill config editor (if `config` hook is present)
- [ ] Add visual indicator for skills generating events
- [ ] Add modal to show raw manifest JSON
- [ ] Provide logs/debug link per skill (reuse from Timeline)
- [ ] Persist skill enable/disable state across restarts

### 🗣️ Speech-to-Text (STT)
- [ ] Expose confidence thresholds as user-configurable setting (via config or UI)
- [ ] Emit partial transcription results in near-realtime (ephemeral only, must not be persisted or logged)
- [ ] Add YAML-based STT config format

### 🧠 Skills & Plugin System
- [ ] Add minimal built-in skills like "help", "version", "ping", "what can you do?"

### 🔀 Smart Multi-Relay Arbitration
- [ ] Implement intelligent wake word arbitration for multiple relay scenarios
  - [ ] Add signal strength comparison (strongest signal wins)
  - [ ] Add temporal window arbitration (500ms window with first-wins logic)
  - [ ] Add location context awareness (prefer relay in user's current room)
  - [ ] Store relay-to-room mappings in configuration
  - [ ] Add arbitration logging and metrics for debugging


### 🔐 Privacy, Logging & Compliance
- [ ] Do not store voice recordings by default (privacy-first default)
- [ ] Store transcript and intent logs only ephemerally (in memory or temp)
- [ ] Add sanitization layer to redact potential PHI from transcript logs
- [ ] Add skill manifest field: `sensitive: true` to suppress logging
- [ ] Add `LOG_TRANSCRIPTS`, `LOG_INTENTS_ONLY`, and `LOG_SANITIZE` environment flags
- [ ] CLI: `loqa export-logs --redact` support (moved from P3 for compliance)

### 🛠️ Developer Experience
**🔗 GitHub Issues**: 
- [loqa#12 - Developer Experience - CLI tools and skill development](https://github.com/loqalabs/loqa/issues/12) *(Epic)*
- [loqa-skills#7 - Skill testing framework with mock STT/TTS](https://github.com/loqalabs/loqa-skills/issues/7)

- [ ] Add `loqa skill init` command to scaffold new skills
- [ ] Create skill testing framework with mock STT/TTS
- [ ] Add hot-reload for skill development
- [ ] Publish skill development containers/templates

### 🖥️ Observer UI Evolution
**🔗 GitHub Issue**: [loqa-observer#15 - Plugin-based Observer widgets system](https://github.com/loqalabs/loqa-observer/issues/15)

- [ ] Plugin-based Observer widgets (skills can add their own UI components)
- [ ] Export Observer events to external monitoring tools
- [ ] Add Observer embedding capability for custom dashboards
- [ ] Progressive disclosure in Observer UI (beginner/advanced modes)

### 🧠 Enhanced Skills System
**🔗 GitHub Issue**: [loqa-skills#8 - Skill dependency management and versioning](https://github.com/loqalabs/loqa-skills/issues/8)

- [ ] Skill dependency management (skill A requires skill B)
- [ ] Skill marketplace integration hooks
- [ ] Skill versioning and rollback capabilities
- [ ] Skill performance profiling and optimization hints

### 🎛️ Production Readiness
- [ ] Add `HEADLESS` mode flag to `loqa-hub` (moved from P3 for production deployments)
- [ ] Skill auto-update and rollback (moved from P3 to reduce maintenance burden)
- [ ] Voice training wizard for improved accuracy
- [ ] Confidence-based response variations ("I think you said..." vs "I heard...")