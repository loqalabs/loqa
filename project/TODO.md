## 🟥 P1 – Must-Fix Before Business MVP

> **📊 Track Progress**: View all issues and milestones in the [**Loqa MVP Roadmap Project**](https://github.com/orgs/loqalabs/projects/1)  
> **🎯 Business MVP Milestone**: [Due Dec 31, 2025](https://github.com/loqalabs/loqa/milestone/1)
> **🎯 Target Market**: Small business professionals (lawyers, doctors, therapists) requiring privacy-first voice AI
> **💻 Reference Platform**: Mac Mini M4 (16GB) - Complete system under $1000

### 🔧 Tech Stack Modernization & Dependency Updates **[NEW P1 PRIORITY]**
**🔗 GitHub Issues**: 
- [loqa#27 - Upgrade Go 1.23.0 → 1.25.1 across all services](https://github.com/loqalabs/loqa/issues/27)
- [loqa#28 - Standardize gRPC & Protobuf versions across all services](https://github.com/loqalabs/loqa/issues/28)
- [loqa#29 - ESLint 8 → 9 Migration (Breaking Changes)](https://github.com/loqalabs/loqa/issues/29)
- [loqa#30 - Tailwind CSS 3 → 4 Migration (Breaking Changes)](https://github.com/loqalabs/loqa/issues/30)
- [loqa#31 - Pinia 2 → 3 Migration (Breaking Changes)](https://github.com/loqalabs/loqa/issues/31)
- [loqa#32 - Vue.js Ecosystem Updates (Recommended)](https://github.com/loqalabs/loqa/issues/32)

**🎯 Strategic Shift**: Since this is a greenfield project, we should start with the latest versions of all technologies to avoid technical debt from day one. This applies until MVP is reached.

**🚨 Critical Security Updates (Complete First):**
- [ ] **Go 1.23.0 → 1.25.1**: All Go services (hub, device-service, relay, proto) **→ [Issue #27](https://github.com/loqalabs/loqa/issues/27)**
- [ ] **Standardize gRPC versions**: Fix version inconsistencies across services **→ [Issue #28](https://github.com/loqalabs/loqa/issues/28)**

**🔄 Major Framework Upgrades (Breaking Changes):**
- [ ] **ESLint 8 → 9 Migration** (loqa-commander, www-loqalabs-com) **→ [Issue #29](https://github.com/loqalabs/loqa/issues/29)**
- [ ] **Tailwind CSS 3 → 4 Migration** (loqa-commander, www-loqalabs-com) **→ [Issue #30](https://github.com/loqalabs/loqa/issues/30)**
- [ ] **Pinia 2 → 3 Migration** (loqa-commander) **→ [Issue #31](https://github.com/loqalabs/loqa/issues/31)**

**🔧 Framework Updates (Recommended):**
- [ ] **Vue.js ecosystem updates** (Vue, Vue Router, TypeScript, Prettier) **→ [Issue #32](https://github.com/loqalabs/loqa/issues/32)**

**📋 Exception Handling:**
- [ ] If a technology cannot be upgraded due to dependency constraints → Create tracking issue
- [ ] If upgrade requires significant refactoring → Create issue for post-MVP
- [ ] All major upgrades must pass quality checks and performance validation

### 🧠 Intent Parsing & Command Execution
**🔗 GitHub Issue**: [loqa-hub#18 - Multi-command intent parsing and chaining](https://github.com/loqalabs/loqa-hub/issues/18)

- [ ] Support multi-command chaining in parsed intent pipeline
  - [ ] Parse compound utterances (e.g., "Turn off the lights and play music")
  - [ ] Route sub-intents to appropriate skills in sequence
  - [ ] Ensure skill responses can be executed in order without overlap or conflict
  - [ ] Combine or sequence TTS responses for multiple results
  - [ ] If chaining fails, gracefully fallback to the first valid command

### 🖥️ Commander UI & API Surface
**🔗 GitHub Issue**: [loqa-commander#18 - Timeline filtering and event categorization](https://github.com/loqalabs/loqa-commander/issues/18)

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
- [ ] **UX Enhancement**: Implement "did you mean?" patterns for low-confidence commands
  - [ ] When confidence is below threshold but above minimum, suggest most likely intent
  - [ ] Use confidence gradient: "I heard..." vs "I think you said..." vs "Did you mean..."
  - [ ] Avoid default "I'm not sure what you want me to do" - always attempt interpretation
  - [ ] **Context**: Essential for professional UX differentiation from Siri/Alexa frustrations

### 🔀 Multi-Relay Collision Detection
**🔗 GitHub Issue**: [loqa-hub#19 - Multi-relay collision detection and arbitration](https://github.com/loqalabs/loqa-hub/issues/19)

- [ ] Implement basic collision detection for multiple relay wake word activation
  - [ ] Add ActiveStream tracking in AudioService with relay_id mapping
  - [ ] Implement simple "last relay to connect wins" arbitration logic
  - [ ] Send cancellation responses to losing relay devices via gRPC stream
  - [ ] Add proper stream cleanup when relay devices are cancelled or disconnect

### 🔊 Text-to-Speech (TTS)
**🔗 GitHub Issue**: [loqa-hub#21 - Integrate Kokoro-82M TTS for professional natural voices](https://github.com/loqalabs/loqa-hub/issues/21)

- [ ] **PRIORITY**: Integrate Kokoro-82M TTS system for natural, expressive voices
  - [ ] Replace/augment current TTS with Kokoro-82M (82M parameters, sub-0.3s processing)
  - [ ] Support 10+ simultaneous voice streams for multi-user environments
  - [ ] Optimize for Mac Mini M4 performance
  - [ ] Ensure voices sound natural and professional for business environments
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

### 🎙️ Home Assistant Voice PE Hardware Evaluation **[NEW P1 PRIORITY]**
**🔗 GitHub Issues**: 
- [loqa#33 - HA Voice PE Stock Firmware Evaluation & UX Documentation](https://github.com/loqalabs/loqa/issues/33)
- [loqa#34 - HA Voice PE Custom Firmware Development & Hardware Integration](https://github.com/loqalabs/loqa/issues/34)
- [loqa#35 - HA Voice PE Comparative Analysis & Business Feasibility Assessment](https://github.com/loqalabs/loqa/issues/35)

**📋 Context**: Evaluate Home Assistant Voice Preview Edition device as potential Loqa relay hardware to accelerate time-to-market vs custom hardware development. **Critical for MVP - need at least one production relay hardware option.**

**Phase 1: Stock Firmware Evaluation**
- [ ] **HA Voice PE Setup & Integration**: Install Home Assistant, configure test devices, set up Voice PE device
- [ ] **UX Documentation**: Document user experience, strengths, and weaknesses through comprehensive testing scenarios
- [ ] **Hardware Assessment**: Evaluate build quality, microphone array, speaker quality, LED ring, button responsiveness

**Phase 2: Custom Firmware Development**
- [ ] **Firmware Backup**: Create backup of original firmware (if modification requires replacement)
- [ ] **Hardware Reverse Engineering**: Investigate flashing capabilities (USB vs disassembly), LED ring control, button integration
- [ ] **Loqa Firmware Development**: Develop custom firmware integrating with Loqa gRPC protocol
- [ ] **Hardware Integration Testing**: Verify LED ring control, button functionality, audio quality with custom firmware

**Phase 3: Comparative Analysis & Business Decision**
- [ ] **Performance Comparison**: Test custom firmware vs stock firmware across identical scenarios
- [ ] **Feature Gap Analysis**: Identify areas where stock firmware excels and improve custom implementation
- [ ] **Business Feasibility Assessment**: Cost analysis, manufacturing scalability, regulatory compliance for custom hardware path
- [ ] **Go-to-Market Strategy**: Recommend hardware approach (custom firmware, hardware partnership, or full custom development)

### 📈 Business MVP Success Criteria
**🔗 GitHub Issues**: 
- [loqa#11 - MVP Success Criteria - Define and track measurable goals](https://github.com/loqalabs/loqa/issues/11)
- [loqa#16 - Business MVP Success Metrics & Hardware Validation](https://github.com/loqalabs/loqa/issues/16)

**🎯 Technical Performance:**
- [ ] 3-second end-to-end voice response time (reduced from 5s for professional use)
- [ ] 95% wake word detection accuracy  
- [ ] Support for 10+ simultaneous relays
- [ ] Zero voice data persistence by default
- [ ] Sub-100MB memory footprint per service
- [ ] **NEW**: Optimized performance on Mac Mini M4 (16GB)

**🏢 Business Requirements:**
- [ ] **NEW**: Professional setup time <30 minutes from unboxing to first command
- [ ] **NEW**: System uptime >99.5% for business reliability  
- [ ] **NEW**: HIPAA compliance audit readiness
- [ ] **NEW**: Natural, professional-quality TTS voices (no robotic speech)
- [ ] **NEW**: Silent operation suitable for professional offices

---

## 🟧 P2 – Business Enhancement Features

> **📊 Track Progress**: View all issues in the [**Loqa MVP Roadmap Project**](https://github.com/orgs/loqalabs/projects/1)  
> **🎯 v1.0 Business Platform**: [Due June 30, 2026](https://github.com/loqalabs/loqa/milestone/2)

### 💼 System-in-a-Box Implementation **[NEW P2 PRIORITY]**
**🔗 GitHub Issue**: [loqa#14 - Mac Mini M4 System-in-a-Box Implementation](https://github.com/loqalabs/loqa/issues/14)

- [ ] **Hardware Integration**: Optimize all services for Mac Mini M4 performance
- [ ] **Professional Installer**: Replace Docker Compose with guided setup for non-technical users  
- [ ] **Hardware Recommendations**: Document and test complete Mac Mini M4 configurations
- [ ] **Remote Management**: Admin dashboard for IT consultants managing multiple installations
- [ ] **Professional Packaging**: Create branded installation media and documentation
- [ ] **Performance Benchmarking**: Validate <3s response time on target hardware
- [ ] **Silent Operation**: Ensure system runs quietly in professional environments

### 🏥 Professional Market Features **[NEW P2 PRIORITY]**
**🔗 GitHub Issue**: [loqa#15 - Professional Market Features & Use Case Optimization](https://github.com/loqalabs/loqa/issues/15)

- [ ] **Professional Skills**: Legal dictation, medical terminology, business productivity skills
- [ ] **Multi-user Support**: Voice recognition and user profiles for shared office environments
- [ ] **Professional UI**: Simplified Commander interface for non-technical business users
- [ ] **Business Integrations**: Calendar systems, CRM integration, professional workflows
- [ ] **Compliance Reporting**: Generate audit reports for HIPAA, legal compliance reviews
- [ ] **Support Infrastructure**: Professional support portal and documentation

### 🖥️ Commander UI & API Surface
- [ ] Add drill-down breakdown of slow events (e.g., STT, LLM parse, skill handling)
- [ ] Add compact/toggle view mode for timeline events

### 🖥️ Commander UI & API Surface (P1)
- [ ] Ensure UI gracefully degrades when logs are ephemeral or redacted

### 🎛️ Skill Management UI
**🔗 GitHub Issue**: [loqa-commander#17 - Skills Management UI - Dashboard for installed plugins](https://github.com/loqalabs/loqa-commander/issues/17)

- [ ] Create a "Skills" tab in `loqa-commander` with list of installed plugins
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


### 🔐 Privacy, Logging & Compliance **[ELEVATED TO P1 FOR BUSINESS MARKET]**
**🔗 GitHub Issues**: 
- [loqa#13 - Privacy Compliance & HIPAA Readiness](https://github.com/loqalabs/loqa/issues/13) *(Epic)*
- [www-loqalabs-com#8 - HIPAA-conscious messaging](https://github.com/loqalabs/www-loqalabs-com/issues/8)
- [www-loqalabs-com#9 - Privacy comparison table](https://github.com/loqalabs/www-loqalabs-com/issues/9)

**🏥 HIPAA-Conscious Design Requirements:**
- [ ] **CRITICAL**: Do not store voice recordings by default (privacy-first default)
- [ ] **CRITICAL**: Store transcript and intent logs only ephemerally (in memory or temp)
- [ ] **CRITICAL**: Add sanitization layer to redact potential PHI from transcript logs
- [ ] Add skill manifest field: `sensitive: true` to suppress logging for medical/legal skills
- [ ] Add `LOG_TRANSCRIPTS`, `LOG_INTENTS_ONLY`, and `LOG_SANITIZE` environment flags
- [ ] CLI: `loqa export-logs --redact` support for compliance auditing
- [ ] **NEW**: Professional audit trail system for compliance reporting
- [ ] **NEW**: Role-based access controls for Commander UI
- [ ] **NEW**: Backup/restore with encryption for business continuity

### 🛠️ Developer Experience **[MOVED TO P3 - POST-BUSINESS MVP]**
**🔗 GitHub Issues**: 
- [loqa#12 - Developer Experience - CLI tools and skill development](https://github.com/loqalabs/loqa/issues/12) *(Epic)*
- [loqa-skills#7 - Skill testing framework with mock STT/TTS](https://github.com/loqalabs/loqa-skills/issues/7)

*Note: Moving to P3 to focus on business customer needs first. OSS developer community remains important but secondary to business viability.*

- [ ] Add `loqa skill init` command to scaffold new skills
- [ ] Create skill testing framework with mock STT/TTS
- [ ] Add hot-reload for skill development
- [ ] Publish skill development containers/templates

### 🖥️ Commander UI Evolution
**🔗 GitHub Issue**: [loqa-commander#19 - Plugin-based Commander widgets system](https://github.com/loqalabs/loqa-commander/issues/19)

- [ ] Plugin-based Commander widgets (skills can add their own UI components)
- [ ] Export Commander events to external monitoring tools
- [ ] Add Commander embedding capability for custom dashboards
- [ ] Progressive disclosure in Commander UI (beginner/advanced modes)

### 🧠 Enhanced Skills System
**🔗 GitHub Issue**: [loqa-skills#8 - Skill dependency management and versioning](https://github.com/loqalabs/loqa-skills/issues/8)

- [ ] Skill dependency management (skill A requires skill B)
- [ ] Skill marketplace integration hooks
- [ ] Skill versioning and rollback capabilities
- [ ] Skill performance profiling and optimization hints

### 🎛️ Production Readiness **[ELEVATED FOR BUSINESS DEPLOYMENT]**
- [ ] **CRITICAL**: Add `HEADLESS` mode flag to `loqa-hub` for professional server deployment
- [ ] **CRITICAL**: Professional backup/restore system for business continuity
- [ ] **CRITICAL**: Remote monitoring and health checks for IT support
- [ ] Skill auto-update and rollback (moved from P3 to reduce maintenance burden)
  - *See also: Privacy-First Update System in BACKLOG.md for broader architectural considerations*
- [ ] Voice training wizard for improved accuracy with professional terminology
- [ ] Confidence-based response variations ("I think you said..." vs "I heard...")
  - *See detailed "did you mean?" UX patterns in STT section (lines 65-69)*
- [ ] **NEW**: Performance monitoring dashboard for business SLA compliance
- [ ] **NEW**: Professional licensing and activation system
- [ ] **NEW**: Multi-location management for business chains/practices

### 🔄 Self-Healing Foundations **[NEW - SUPPORTS >99.5% UPTIME GOAL]**
**🔗 GitHub Issue**: [loqa#25 - Self-Healing Foundations for Business MVP - >99.5% Uptime Resilience](https://github.com/loqalabs/loqa/issues/25)

**🎯 MVP Resilience Goal**: Basic automatic recovery without user intervention to support business reliability requirements

**Smart Health & Recovery:**
- [ ] **Enhanced health check system** with automatic remediation triggers
- [ ] **Intelligent retry logic** with exponential backoff and jitter for all critical API calls
- [ ] **Basic circuit breaker patterns** to prevent cascade failures in STT/LLM/NATS calls
- [ ] **Service restart coordination** that preserves system state and user sessions

**Graceful Degradation:**
- [ ] **Fallback modes** for when non-critical components fail (e.g., continue without TTS if TTS fails)
- [ ] **Reduced functionality modes** that maintain core voice→action pipeline during partial failures
- [ ] **User communication** of degraded modes through Commander UI without alarming users

**Business Resilience Features:**
- [ ] **Connection persistence** for relay devices during Hub restarts
- [ ] **Voice pipeline continuity** during service recovery operations  
- [ ] **Professional status indicators** in Commander UI showing system health without technical complexity

**📅 Timeline**: Must complete before Business MVP (supports >99.5% uptime requirement)
**🔗 Dependencies**: 
- Performance monitoring dashboard integration (`TODO.md:204`)
- Remote monitoring and health checks (`TODO.md:200`)
- Commander UI status indicators

**📌 Related Work:**
- Builds on existing Docker health checks and NATS retry logic
- Integrates with professional backup/restore system for state preservation
- Foundation for comprehensive self-healing architecture (see BACKLOG.md)