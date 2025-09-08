## 🟥 P1 – Must-Fix Before OSS MVP

> **📊 Track Progress**: View all issues and milestones in the [**Loqa OSS MVP Project**](https://github.com/orgs/loqalabs/projects/1)  
> **🎯 OSS MVP Milestone**: [Due Dec 31, 2025](https://github.com/loqalabs/loqa/milestone/1)
> **🎯 Target Community**: Developers, privacy enthusiasts, and self-hosting advocates who value autonomy and creative freedom
> **💻 Reference Platform**: Any modern machine (Docker/self-hosted) - Privacy-first by default

### 🔧 Tech Stack Modernization & Dependency Updates **[PRIORITY 1 - FOUNDATION FIRST]**
**🔗 GitHub Issues**: 
- [loqa#27 - Upgrade Go 1.23.0 → 1.25.1 across all services](https://github.com/loqalabs/loqa/issues/27)
- [loqa#28 - Standardize gRPC & Protobuf versions across all services](https://github.com/loqalabs/loqa/issues/28)
- [loqa#29 - ESLint 8 → 9 Migration (Breaking Changes)](https://github.com/loqalabs/loqa/issues/29)
- [loqa#30 - Tailwind CSS 3 → 4 Migration (Breaking Changes)](https://github.com/loqalabs/loqa/issues/30)
- [loqa#31 - Pinia 2 → 3 Migration (Breaking Changes)](https://github.com/loqalabs/loqa/issues/31)
- [loqa#32 - Vue.js Ecosystem Updates (Recommended)](https://github.com/loqalabs/loqa/issues/32)

**🎯 Strategic Shift**: Since this is a greenfield project, we should start with the latest versions of all technologies to avoid technical debt from day one. This applies until MVP is reached.

**🚨 Critical Security Updates (Complete First):**
- [ ] **Go 1.23.0 → 1.25.1**: All Go services (hub, relay, proto) **→ [Issue #27](https://github.com/loqalabs/loqa/issues/27)**
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

### 🔄 Basic Self-Healing Foundations **[PRIORITY 2 - RELIABILITY FOUNDATION]**
**🔗 GitHub Issue**: [loqa#25 - Self-Healing Foundations for Business MVP - >99.5% Uptime Resilience](https://github.com/loqalabs/loqa/issues/25)

**📋 Context**: Moved from P2 to P1 as >99.5% uptime is critical business requirement for professional deployment.

**Essential Reliability Features:**
- [ ] **Enhanced health check system** with automatic service restart capabilities
- [ ] **Intelligent retry logic** with exponential backoff for STT/LLM/NATS failures
- [ ] **Basic circuit breaker patterns** to prevent cascade failures
- [ ] **Graceful degradation modes** (continue core functionality when non-critical components fail)
- [ ] **Service restart coordination** that preserves system state and user sessions
- [ ] **Professional status indicators** in Commander UI without technical complexity

### 🎙️ Home Assistant Voice PE Hardware Evaluation **[PRIORITY 3 - PHYSICAL TESTING FOUNDATION]**
**🔗 GitHub Issues**: 
- [loqa#33 - HA Voice PE Stock Firmware Evaluation & UX Documentation](https://github.com/loqalabs/loqa/issues/33)
- [loqa#34 - HA Voice PE Custom Firmware Development & Hardware Integration](https://github.com/loqalabs/loqa/issues/34)
- [loqa#35 - HA Voice PE Comparative Analysis & Business Feasibility Assessment](https://github.com/loqalabs/loqa/issues/35)

**📋 Context**: Having physical hardware for testing is critical for validating voice pipeline features, wake word detection, audio quality, and real-world performance. **Priority elevated - physical testing foundation needed before developing voice components.**

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

### 🔒 Privacy-by-Design Architecture **[PRIORITY 4 - CORE DIFFERENTIATOR]**
**🔗 GitHub Issues**:
- [loqa#13 - Privacy-by-Design Architecture & User Autonomy](https://github.com/loqalabs/loqa/issues/13)

**📋 Context**: Privacy is a core value, not a compliance checkbox. Build privacy-preserving features that empower users to control their data completely.

**Local-First Privacy Foundation:**
- [ ] **Implement RAM-only voice processing by default** - no persistent audio storage
- [ ] **Add configurable data retention policies** (ephemeral by default, optional logging)
- [ ] **Create privacy transparency features** showing exactly what data exists and where
- [ ] **Develop privacy impact documentation** for self-hosting and data sovereignty
- [ ] **Add multiple privacy modes** (paranoid, balanced, convenient) based on user values

**Technical Implementation:**
- [ ] **Eliminate audio hash storage by default** for maximum privacy **→ [Issue #36](https://github.com/loqalabs/loqa/issues/36)**
- [ ] **Implement optional end-to-end encryption** for users who want additional protection
- [ ] **Add granular data controls** in Commander UI for complete user autonomy
- [ ] **Create secure backup/restore options** that preserve privacy principles
- [ ] **Implement optional transcript sanitization** layers for sensitive environments

**User Empowerment:**
- [ ] **Document privacy guarantees and limitations** with complete transparency
- [ ] **Provide privacy self-assessment tools** for different threat models
- [ ] **Create privacy-focused skill development guidelines** for community contributors
- [ ] **Develop privacy advocacy materials** for broader voice AI ecosystem
- [ ] **Establish privacy research collaboration** with academic and activist communities

### 🗣️ Speech-to-Text (STT) **[PRIORITY 5 - VOICE PIPELINE CORE]**
**🔗 GitHub Issue**: [loqa-hub#20 - STT confidence thresholds and wake word normalization](https://github.com/loqalabs/loqa-hub/issues/20)

- [ ] Strip wake word ("Hey Loqa") before passing to intent parser
- [ ] Normalize common misspellings of "Loqa" (e.g., "Luca") in post-STT
- [ ] Define and enforce default confidence threshold for rejecting low-quality transcriptions
- [ ] **Professional UX Enhancement**: Implement "did you mean?" patterns for low-confidence commands
  - [ ] Use confidence gradient: "I heard..." vs "I think you said..." vs "Did you mean..."
  - [ ] Avoid default "I'm not sure what you want me to do" - always attempt interpretation
  - [ ] **Context**: Essential for professional UX differentiation from consumer assistants

### 🔊 Text-to-Speech (TTS) **[PRIORITY 6 - VOICE PIPELINE CORE]**
**🔗 GitHub Issue**: [loqa-hub#21 - Integrate Kokoro-82M TTS for professional natural voices](https://github.com/loqalabs/loqa-hub/issues/21)

- [ ] **PRIORITY**: Integrate Kokoro-82M TTS system for natural, expressive voices
  - [ ] Replace/augment current TTS with Kokoro-82M (82M parameters, sub-0.3s processing)
  - [ ] Support 10+ simultaneous voice streams for multi-user environments
  - [ ] Optimize for Mac Mini M4 performance
  - [ ] Ensure voices sound natural and professional for business environments
- [ ] Play returned TTS phrase through speakers when using the test relay (must remain ephemeral and never stored to disk)

### 🧠 Intent Parsing & Command Execution **[PRIORITY 7 - LOGIC PIPELINE]**
**🔗 GitHub Issue**: [loqa-hub#18 - Multi-command intent parsing and chaining](https://github.com/loqalabs/loqa-hub/issues/18)

- [ ] Support multi-command chaining in parsed intent pipeline
  - [ ] Parse compound utterances (e.g., "Turn off the lights and play music")
  - [ ] Route sub-intents to appropriate skills in sequence
  - [ ] Ensure skill responses can be executed in order without overlap or conflict
  - [ ] Combine or sequence TTS responses for multiple results
  - [ ] If chaining fails, gracefully fallback to the first valid command

### 🧠 Skills & Plugin System **[PRIORITY 8 - EXTENSIBILITY FOUNDATION]**
**🔗 GitHub Issue**: [loqa-skills#9 - Built-in Timer Skill with local tracking](https://github.com/loqalabs/loqa-skills/issues/9)

- [ ] Add built-in "Set a timer" skill with local tracking and TTS countdown/complete response
  - [ ] Support professional durations ("set a 15-minute patient consultation timer")
  - [ ] Announce when timer expires via TTS playback
  - [ ] Store and cancel timers locally on the hub
- [ ] **CRITICAL**: Ensure manifest includes field for `sensitive: true` for privacy-tagged skills
- [ ] Add basic professional skills: "help", "version", "what can you do?"
- [ ] **Professional Skills Foundation**: Medical terminology, legal dictation basics

### 🖥️ Commander UI & API Surface **[PRIORITY 9 - USER INTERFACE]**
**🔗 GitHub Issue**: [loqa-commander#18 - Timeline filtering and event categorization](https://github.com/loqalabs/loqa-commander/issues/18)

- [ ] Add ability to filter timeline by success, failure, or low-confidence events
- [ ] **Simplified Professional UI**: Create non-technical interface for business administrators
- [ ] **Professional Status Indicators**: System health display without technical complexity

### ⚡ Innovation-First Performance & Emerging Tech **[PRIORITY 10 - OPTIMIZATION]**
**🔗 GitHub Issues**:
- [loqa#40 - Developer-First Installation & Setup Experience](https://github.com/loqalabs/loqa/issues/40)
- [loqa#37 - Speech-to-Speech Model Integration for Sub-200ms Responses](https://github.com/loqalabs/loqa/issues/37)
- [loqa#38 - Real-Time Streaming LLM Implementation](https://github.com/loqalabs/loqa/issues/38)

**📋 Context**: Prioritize innovation over convention. Explore emerging technologies that make Loqa a platform for experimentation, not just another voice assistant clone.

**Performance Baseline & Monitoring:**
- [ ] **Document current voice pipeline performance** across Mac Mini M4 and other hardware configurations
- [ ] **Implement automated performance regression testing** in CI/CD pipeline with alerts
- [ ] **Create real-time performance monitoring dashboard** with component-level metrics
- [ ] **Establish professional SLA targets** based on customer requirements (target: sub-2s response)
- [ ] **Benchmark against competitive solutions** where possible for market positioning

**Advanced AI Model Integration:**
- [ ] **Evaluate speech-to-speech models** (Ultravox v0.5, Google Moshi) for direct audio processing
- [ ] **Implement streaming LLM inference** for improved perceived performance and user engagement
- [ ] **Add WebRTC support evaluation** for real-time audio streaming optimization
- [ ] **Benchmark latest STT models** (AssemblyAI Slam-1, Deepgram Nova-2) vs current Whisper
- [ ] **A/B test performance improvements** with pilot customers for validation

**Resource Optimization:**
- [ ] **Optimize concurrent processing** and resource utilization patterns for Mac Mini M4
- [ ] **Implement intelligent request prioritization** and queuing strategies
- [ ] **Add performance profiling tools** for ongoing optimization and troubleshooting


### 🌟 Community Building & OSS Ecosystem Development **[PRIORITY 11 - COMMUNITY GROWTH]**
**🔗 GitHub Issues**:
- [loqa#41 - OSS Community Outreach & Developer Engagement Strategy](https://github.com/loqalabs/loqa/issues/41)
- [loqa#39 - GitHub Sponsors Setup & Community Funding](https://github.com/loqalabs/loqa/issues/39)
- [loqa#15 - Developer Community Features & Self-Hosting Optimization](https://github.com/loqalabs/loqa/issues/15)

**📋 Context**: OSS community engagement has highest impact on innovation velocity and market validation. Focus on developers, makers, and privacy advocates who value creative freedom and autonomy.

**Developer Community Engagement:**
- [ ] **Launch developer community outreach** (Reddit r/selfhosted, Hacker News, dev Twitter)
- [ ] **Create compelling OSS narrative** highlighting innovation-first approach and creative freedom
- [ ] **Establish feedback loops** with privacy enthusiasts and self-hosting communities
- [ ] **Document novel technical approaches** that differentiate from existing assistants
- [ ] **Showcase experimental features** and invite community contributions

**OSS Foundation & Documentation:**
- [ ] **Create comprehensive self-hosting guide** with Docker, installation automation
- [ ] **Develop contributor onboarding** with clear development workflows
- [ ] **Implement community feedback system** for feature requests and innovation ideas
- [ ] **Document extensibility patterns** for skills, integrations, and customization
- [ ] **Create example configurations** for different use cases and hardware setups

**Innovation & Differentiation:**
- [ ] **Highlight unique technical approaches** vs. Alexa/Siri/Home Assistant clones
- [ ] **Showcase emerging technology integration** (speech-to-speech, novel STT/TTS)
- [ ] **Position as experimentation platform** for voice AI research and development
- [ ] **Establish thought leadership** in local-first, privacy-preserving voice AI
- [ ] **Connect with AI research community** for cutting-edge model integration

### 📊 OSS MVP Success Criteria & Innovation Metrics **[PRIORITY 12 - SUCCESS FRAMEWORK]**
**🔗 GitHub Issues**: 
- [loqa#11 - MVP Success Criteria - Define and track measurable goals](https://github.com/loqalabs/loqa/issues/11)
- [loqa#16 - OSS MVP Success Metrics & Community Growth Validation](https://github.com/loqalabs/loqa/issues/16)

**🌟 Community Success Metrics (PRIMARY):**
- [ ] **Developer Engagement**: Active community of 100+ developers with regular contributions
- [ ] **Innovation Showcase**: Demonstrate 3+ novel approaches that differentiate from existing assistants
- [ ] **Self-Hosting Adoption**: 500+ successful self-hosted installations with feedback
- [ ] **Contribution Quality**: Regular external PRs with meaningful improvements and features
- [ ] **Technical Leadership**: Recognition in privacy/AI communities for innovative approaches
- [ ] **Creative Freedom**: Enable developers to build things impossible with cloud assistants
- [ ] **Community Stories**: Document compelling use cases that showcase autonomy and creativity

**🎯 Technical Performance Targets:**
- [ ] **Voice Response Time**: <2 seconds average (target: <1.5s) on Mac Mini M4 hardware
- [ ] **Component Latency**: STT <300ms, LLM <500ms, TTS <200ms, Network <100ms
- [ ] **Wake Word Accuracy**: >95% detection in professional office environments
- [ ] **Concurrent Users**: Support 5+ concurrent users without performance degradation
- [ ] **System Reliability**: >99.5% uptime during business hours
- [ ] **Memory Efficiency**: <500MB total system footprint on Mac Mini M4
- [ ] **Professional Audio Quality**: Natural TTS voices suitable for business environments

**🏢 Business Deployment Requirements:**
- [ ] **Professional Setup**: <30 minutes from unboxing to first successful command
- [ ] **HIPAA Compliance**: Full audit readiness with documentation and controls
- [ ] **Silent Operation**: Suitable for professional offices without noise disruption
- [ ] **Non-Technical Users**: Simplified Commander UI for business administrators
- [ ] **Professional Support**: Business-grade support response times and procedures
- [ ] **Integration Ready**: API compatibility with practice management systems

**📈 Success Timeline Targets:**
- [ ] **Q4 2024**: Customer interviews complete, pilot program launched
- [ ] **Q1 2025**: HIPAA compliance certified, professional installer ready
- [ ] **Q2 2025**: Business MVP feature complete with positive pilot feedback
- [ ] **Q3 2025**: 25+ paying customers, channel partnerships established

---

## 📅 Quarterly Implementation Roadmap

### Q4 2024 (October - December): OSS Foundation & Innovation
**🎯 Milestone**: OSS MVP Foundation Complete

**October 2024:**
- [ ] Complete Go 1.25+ upgrade and ESLint 8→9 migration
- [ ] Launch developer community outreach (Reddit, HN, dev Twitter)
- [ ] Implement streaming LLM responses for improved UX
- [ ] Document experimental performance approaches and benchmarks

**November 2024:**
- [ ] Complete HA Voice PE evaluation as development/testing hardware
- [ ] Launch OSS community with comprehensive self-hosting documentation
- [ ] Begin privacy-by-design architecture implementation
- [ ] Evaluate cutting-edge speech-to-speech models (Ultravox v0.5)

**December 2024:**
- [ ] OSS MVP feature complete with innovation showcases
- [ ] Privacy-first implementation 80% complete (RAM-only by default)
- [ ] Community feedback collection and innovation roadmap
- [ ] Developer-friendly installation and contribution system ready

### Q1 2025 (January - March): Community Growth & Innovation Leadership
**🎯 Milestone**: OSS Innovation Platform Ready

**January 2025:**
- [ ] Complete privacy-by-design architecture with transparency
- [ ] Developer-friendly installation automation and tutorials
- [ ] Community success stories documented and promoted
- [ ] Performance innovation (novel approaches achieving <1s response)

**February 2025:**
- [ ] Comprehensive developer documentation and contribution guides
- [ ] AI research community engagement and collaboration
- [ ] Advanced AI model integration (S2S, emerging techniques)
- [ ] Community metrics and innovation tracking implemented

**March 2025:**
- [ ] OSS thought leadership established in voice AI space
- [ ] Privacy advocacy materials and ecosystem positioning
- [ ] Multi-platform deployment options (not just Mac Mini)
- [ ] Optional monetization paths identified and documented

### Q2 2025 (April - June): OSS MVP Launch & Monetization
**🎯 Milestone**: OSS Success with Optional Business Model

**Target Outcomes:**
- [ ] 1000+ active self-hosted installations with community growth
- [ ] $10K+ Monthly Recurring Revenue from optional paid features
- [ ] Privacy leadership demonstrated to developer and maker communities
- [ ] Multiple installation/deployment options for diverse use cases
- [ ] Clear path to sustainable OSS development with optional revenue streams

---

## 🟧 P2 – Business Enhancement Features

> **📊 Track Progress**: View all issues in the [**Loqa MVP Roadmap Project**](https://github.com/orgs/loqalabs/projects/1)  
> **🎯 v1.0 Business Platform**: [Due June 30, 2026](https://github.com/loqalabs/loqa/milestone/2)
> **📋 Focus**: Features for scaling beyond initial market validation and expanding professional capabilities

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
- [ ] **CRITICAL**: Eliminate audio hash storage for RAM-only voice processing compliance **→ [Issue #36](https://github.com/loqalabs/loqa/issues/36)**
  - [ ] Remove `audio_hash` field from voice_events database schema
  - [ ] Update VoiceEvent struct to make audio hash calculation optional
  - [ ] Implement configurable voice event retention policies (ephemeral by default)
  - [ ] Add `VOICE_DATA_RETENTION` environment flag (0 = RAM-only, >0 = retention hours)
  - [ ] Update audio service to skip hash calculation in privacy-first mode
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

### 🏠 Home Assistant Skill Enhancement **[NEW P2 PRIORITY]**
**🔗 GitHub Issue**: [loqa-skills#10 - Enhanced HA Integration with Device State & Event Support](https://github.com/loqalabs/loqa-skills/issues/10)


- [ ] **WebSocket Integration**: Add WebSocket connection to HA for real-time state changes
- [ ] **Device State Queries**: Support voice queries like "What's the temperature?" and "Are the lights on?"  
- [ ] **Event-Driven Announcements**: React to HA events (motion sensors, door open, etc.) with proactive voice announcements
- [ ] **State Caching**: Maintain local cache of device states for quick queries
- [ ] **MQTT Bridge Support**: Optional MQTT integration for additional HA event sources

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