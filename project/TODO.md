## 🟥 P1 – Must-Fix Before OSS MVP

> **📊 Track Progress**: View all issues and milestones in the [**Loqa MVP Roadmap**](https://github.com/orgs/loqalabs/projects/1)  
> **🎯 OSS MVP Milestone**: [Due Dec 31, 2025](https://github.com/loqalabs/loqa/milestone/1)
> **🎯 Target Community**: Developers, privacy enthusiasts, and self-hosting advocates who value autonomy and creative freedom
> **💻 Reference Platform**: Any modern machine (Docker/self-hosted) - Privacy-first by default

### 🔐 Security CI/CD Workflow & Branch Protection **[PRIORITY 1 - FOUNDATION SECURITY]**
**🔗 GitHub Issues**: 
- [loqa#42 - Security CI/CD Workflow Improvements (Epic)](https://github.com/loqalabs/loqa/issues/42)
- [loqa#43 - Branch Protection & PR Requirements Audit (Epic)](https://github.com/loqalabs/loqa/issues/43)

**📋 Context**: Security and development workflow foundation must be established before major feature work to prevent rework and ensure quality gates are enforced consistently.

**🔐 Security CI/CD Workflow Improvements:** ✅ **COMPLETED**
- [x] **Separate Security Workflows**: Create dedicated security workflows per repository (separate from main CI) ✅ **COMPLETED**
- [x] **Go Security Scanning**: Implement gosec and govulncheck for Go services (hub, relay, proto) ✅ **COMPLETED**
- [x] **Dependency Scanning**: Add npm audit and vulnerability scanning for Vue.js services (commander, website) ✅ **COMPLETED**
- [x] **Secret Scanning**: Implement GitLeaks or similar for preventing credential commits ✅ **COMPLETED**
- [x] **Weekly Security Scans**: Schedule comprehensive security scans with proper failure isolation ✅ **COMPLETED**
- [x] **Security-Specific Permissions**: Configure granular permissions for security workflows ✅ **COMPLETED**

**🔒 Branch Protection & PR Requirements:** ✅ **COMPLETED**
- [x] **Audit PR Merge Requirements**: Review and standardize required status checks across all repositories ✅ **COMPLETED**
- [x] **Enforce Quality Gates**: Ensure build, test, and lint checks are required before merge ✅ **COMPLETED**
- [x] **Security Check Requirements**: Configure which security scans must pass vs. can be informational ✅ **COMPLETED**
- [x] **Review Requirements**: Standardize code review requirements (number of approvals, dismiss stale reviews) ✅ **COMPLETED**
- [x] **Branch Protection Rules**: Ensure consistent branch protection across all repositories ✅ **COMPLETED**
- [x] **Admin Override Policies**: Document when and how to bypass checks for emergency fixes ✅ **COMPLETED**

### 🔧 Tech Stack Modernization & Dependency Updates **[PRIORITY 2 - FOUNDATION UPGRADES]**
**🔗 GitHub Issues**: 
- [loqa#29 - ESLint 8 → 9 Migration (Breaking Changes)](https://github.com/loqalabs/loqa/issues/29)
- [loqa#30 - Tailwind CSS 3 → 4 Migration (Breaking Changes)](https://github.com/loqalabs/loqa/issues/30)
- [loqa#31 - Pinia 2 → 3 Migration (Breaking Changes)](https://github.com/loqalabs/loqa/issues/31)
- [loqa#32 - Vue.js Ecosystem Updates (Recommended)](https://github.com/loqalabs/loqa/issues/32)

**🎯 Strategic Shift**: Since this is a greenfield project, we should start with the latest versions of all technologies to avoid technical debt from day one. This applies until MVP is reached.

**🚨 Critical Security Updates (Complete First):**
- [x] **Go 1.23.0 → 1.25.1**: All Go services (hub, relay, proto) **→ [Issue #27](https://github.com/loqalabs/loqa/issues/27)** ✅ **COMPLETED**
- [x] **Standardize gRPC versions**: Fix version inconsistencies across services **→ [Issue #28](https://github.com/loqalabs/loqa/issues/28)** ✅ **COMPLETED**

**🚀 Protocol Development Workflow Improvements:**
- [x] **Phase 1 - Development Mode Toggle**: Implemented local proto testing without GitHub releases ✅ **COMPLETED**
- [x] **Phase 2 - Automated Proto Releases**: Implement automated proto releases on main branch pushes ✅ **COMPLETED** **→ [PR #17](https://github.com/loqalabs/loqa-proto/pull/17)**
- [x] **Phase 2 - Proto Validation CI**: Add proto validation CI that tests against consuming services ✅ **COMPLETED** **→ [PR #17](https://github.com/loqalabs/loqa-proto/pull/17)** 
- [x] **Phase 2 - Integration Test Matrix**: Create integration test matrix across service combinations ✅ **COMPLETED** **→ [PR #17](https://github.com/loqalabs/loqa-proto/pull/17)**
- [x] **Phase 2 - Workflow Cleanup**: Remove troubleshooting artifacts and consolidate workflows ✅ **COMPLETED** **→ [PR #18](https://github.com/loqalabs/loqa-proto/pull/18)**
- [x] **Phase 3 - Go Workspace Approach**: Consider Go workspace approach for tighter integration ✅ **COMPLETED** **→ [Loqa Workspace](https://github.com/loqalabs/loqa/commit/4d9a79d)**
- [x] **Phase 3 - Semantic Versioning**: Implement semantic versioning based on proto changes ✅ **COMPLETED** **→ [PR #19](https://github.com/loqalabs/loqa-proto/pull/19)**
- [x] **Phase 3 - Breaking Change Detection**: Add breaking change detection and alerts ✅ **COMPLETED** **→ [PR #19](https://github.com/loqalabs/loqa-proto/pull/19)**

### 🏗️ Unified System Versioning Architecture **[PRIORITY 3 - FOUNDATIONAL ARCHITECTURE]**
**🔗 GitHub Issue**: [loqa#48 - Architecture Decision: Unified System Versioning Strategy](https://github.com/loqalabs/loqa/issues/48)

**💭 Core Insight**: *"I want a way to unify versioning across the services. I am picturing a future nightmare where you have to know that service x requires v19, service y requires v32, and service z requires v1"*

**📋 Context**: Past microservices experience shows version coordination becomes exponentially complex. With Loqa's multi-repository microservice architecture, this pain point will emerge as the system matures, affecting development velocity, deployment reliability, and user experience.

**🎯 Vision**: Unified "Loqa v2.1.0" releases where entire system versions are coordinated, tested, and released together.

**🚨 Pain Points to Prevent:**
- **Development Complexity**: Developers needing to track compatibility matrices between services
- **Deployment Orchestration**: Ensuring compatible service versions are deployed together  
- **Debugging**: Troubleshooting issues across service boundaries with version mismatches
- **Customer Communication**: Clear, simple version story for users and deployments

**🔍 Architecture Decision Required:**
- [ ] **Research unified versioning approaches** for microservices (monorepo, release trains, compatibility matrices)
- [ ] **Evaluate Go workspace approach** for tighter version coordination **→ [Connects to Phase 3 above]**
- [ ] **Design system-wide version schema** (semantic versioning at system level vs service level)
- [ ] **Create version compatibility framework** with automated validation
- [ ] **Define deployment orchestration strategy** ensuring compatible versions deploy together
- [ ] **Plan migration path** from current individual service versioning

**📊 Decision Framework:**
- **Developer Experience**: How easy is it to know which versions work together?
- **Deployment Reliability**: Can incompatible versions accidentally be deployed?
- **Release Velocity**: Does unified versioning slow down or speed up releases?
- **System Complexity**: Is the coordination overhead worth the benefits?
- **OSS Community**: How do contributors understand system version story?

**🔗 Related Work:**
- **Protocol Semantic Versioning** (Phase 3) - Foundation for system versioning
- **BACKLOG.md Line 93**: "Single-version releases vs individual microservice versioning strategy" 
- **BACKLOG.md Line 99**: "Hub, relay, commander service versioning and coordination"
- **Multi-repository structure** - Current architecture that creates the version coordination challenge

**📅 Review Triggers:**
- **Before OSS MVP** (Dec 2025) - Community needs clear version story
- **When 5+ services exist** - Complexity becomes unmanageable without coordination
- **Before customer deployments** (Q2 2026) - Production deployments need version reliability
- **After Phase 3 protocol work** - Build on top of protocol versioning foundation

**🎯 Success Criteria:**
- Single "Loqa vX.Y.Z" version number represents entire system capability
- Developers can determine service compatibility from system version alone
- Deployment tools prevent incompatible service version combinations
- Clear migration path from current per-service versioning


**🔄 Major Framework Upgrades (Breaking Changes):**
- [x] **ESLint 8 → 9 Migration** (loqa-commander, www-loqalabs-com) **→ [Issue #29](https://github.com/loqalabs/loqa/issues/29)** ✅ **COMPLETED**
- [x] **Tailwind CSS 3 → 4 Migration** (loqa-commander, www-loqalabs-com) **→ [Issue #30](https://github.com/loqalabs/loqa/issues/30)** ✅ **COMPLETED**
- [x] **Pinia 2 → 3 Migration** (loqa-commander) **→ [Issue #31](https://github.com/loqalabs/loqa/issues/31)** ✅ **COMPLETED**

**🔧 Framework Updates (Recommended):**
- [x] **Vue.js ecosystem updates** (Vue, Vue Router, TypeScript, Prettier) **→ [Issue #32](https://github.com/loqalabs/loqa/issues/32)** ✅ **COMPLETED**

**📋 Exception Handling:**
- [ ] If a technology cannot be upgraded due to dependency constraints → Create tracking issue
- [ ] If upgrade requires significant refactoring → Create issue for post-MVP
- [ ] All major upgrades must pass quality checks and performance validation

### 🔧 GitHub Repository Protection Strategy Evaluation ✅ **COMPLETED**
**🔗 GitHub Issue**: [loqa#51 - GitHub Repository Protection Migration: Rulesets → Branch Protection](https://github.com/loqalabs/loqa/issues/51)

**📋 Context**: The Phase 2 Protocol automation experienced significant friction with repository-level rulesets and required status check naming. Analysis revealed systematic "stuck PR" issues due to opaque naming requirements.

**🚨 Critical Technical Issue Identified:**
- **Repository rulesets** (not organization rulesets as initially assumed) require complex naming: `"Test & Build / Test & Build"`
- **Branch protection** uses intuitive naming: `"Test & Build"`  
- **Result**: PRs get stuck waiting for status checks that never match due to naming complexity
- **Impact**: Developers must frequently bypass security checks, defeating their purpose
- **Evidence**: loqa-commander PR #28 shows actual status check names like `"Test & Lint / Lint, Format, Build, and Upload Dist"`

**✅ Evaluation Complete:**
- [x] **Comprehensive analysis**: `project/GITHUB_REPOSITORY_PROTECTION_EVALUATION.md`
- [x] **Root cause identified**: Ruleset status check naming opacity vs branch protection transparency
- [x] **Migration plan developed**: 5-week phased approach starting with pilot repository
- [x] **Templates designed**: Branch protection configurations for each repository type
- [x] **Success metrics defined**: Zero bypass necessity, intuitive configuration, maintained security

**🎯 **RECOMMENDATION**: Migrate from Repository-Level Rulesets to Branch Protection Rules**

**Key Benefits**:
- **Eliminate "stuck PR" issues**: Intuitive workflow job name mapping
- **End systematic bypassing**: Developers won't need admin bypass for naming issues  
- **Maintain security**: All current protection rules preserved
- **Improve developer experience**: GitHub autocomplete for status checks

**📅 Implementation Status**: Ready for Phase 1 pilot testing in `loqa-proto` repository

### 🔍 Security-Aware Observability for Failed Intents **[PRIORITY 2 - PRIVACY-FIRST DEBUGGING]**
**🔗 GitHub Issue**: [loqa#49 - Architecture Decision: Security-Aware Observability for Intent Debugging](https://github.com/loqalabs/loqa/issues/49)

**💭 Core Insight**: *"We are moving away from storing voice recordings and transcripts due to security concerns, but that poses challenges for observability and debugging. What if in particular cases (like Loqa didn't understand an intent) we log extra information (but in a secure way) so that a developer can understand what happened and try to fix it."*

**📋 Context**: Past microservices experience shows that debugging production issues becomes exponentially harder without observability data. With Loqa's privacy-first approach removing traditional logging (voice recordings, full transcripts), we need novel approaches that preserve debugging capability without compromising security principles.

**🎯 Vision**: Intelligent failure logging that provides actionable debugging information while maintaining zero-trust privacy guarantees.

**🚨 Problem Being Solved:**
- **Development Blindness**: When intents fail in production, developers have no insight into what went wrong
- **Privacy vs Observability Tension**: Traditional logging conflicts with HIPAA/security requirements
- **Community Support Difficulty**: Hard to help community users troubleshoot without diagnostic data
- **Quality Assurance Gaps**: No systematic way to detect and fix recognition patterns

**🔍 Security-Aware Debugging Approaches:**
- [ ] **Failure Event Metadata Logging** - Store failure context without sensitive content:
  - Confidence scores, processing times, component failures
  - Intent classification attempts (without original text)
  - Skill routing decisions and error codes
  - Audio quality metrics (SNR, duration, etc.)
- [ ] **Hashed Pattern Recognition** - Anonymous pattern detection:
  - One-way hashes of failed utterances for pattern clustering
  - Statistical failure analysis without content exposure
  - Community-aggregate failure patterns (opt-in only)
- [ ] **Development Mode Enhanced Logging** - Secure debugging environment:
  - Explicit developer opt-in with clear data retention policies
  - Encrypted logs accessible only with developer keys
  - Automatic expiration and secure deletion
- [ ] **Sanitized Transcript Logging** - Redacted content for analysis:
  - PII/PHI redaction with placeholder tokens
  - Intent-relevant keywords preserved, context removed
  - Optional community contribution to improve recognition

**🔗 Integration with Existing Privacy Architecture:**
- Builds on **TODO.md:242-273** (Privacy-by-design foundation)
- Connects to **BACKLOG.md:33** (Drill-down debugger mode for voice pipeline)
- Extends **BACKLOG.md:28-30** (Encrypted logging and audit trails)
- Supports **TODO.md:276** (Skill manifest `sensitive: true` field)

**📊 Implementation Framework:**
- [ ] **Privacy Impact Assessment** - Evaluate each logging approach against privacy principles
- [ ] **Configurable Privacy Levels** - Multiple debugging modes based on user trust/security requirements
  - Paranoid: Metadata only, no content logging
  - Balanced: Hashed patterns + sanitized keywords
  - Development: Full logging with explicit consent + encryption
- [ ] **Community Feedback System** - Allow users to contribute anonymized failure patterns to improve system
- [ ] **Developer Tooling** - Create secure debugging dashboards and analysis tools

**🎯 Success Criteria:**
- Developers can diagnose 80%+ of intent failures without accessing sensitive data
- Privacy principles maintained: no clear-text voice content or full transcripts stored
- Community can contribute to system improvement without compromising personal privacy
- Debugging capability improvement measurable through reduced time-to-resolution

**📅 Review Triggers:**
- **Before Privacy Architecture Finalization** - Must influence core privacy design decisions
- **When Intent Recognition Issues Emerge** - Real-world debugging needs become apparent
- **Before Community Release** - Community needs support without privacy compromise
- **Before Business Deployments** - Professional environments require audit-compliant debugging

**🔗 Related Work:**
- **Privacy-by-design architecture** (current TODO.md work)
- **Advanced skill debugging tools** (BACKLOG.md)
- **HIPAA compliance requirements** (TODO.md business deployment needs)
- **Community support infrastructure** (OSS community engagement)

### 🔄 Basic Self-Healing Foundations **[PRIORITY 4 - RELIABILITY FOUNDATION]**
**🔗 GitHub Issue**: [loqa#25 - Self-Healing Foundations for Community Reliability](https://github.com/loqalabs/loqa/issues/25)

**📋 Context**: >99.5% uptime is critical community requirement for reliable self-hosted deployment.

**Essential Reliability Features:**
- [ ] **Enhanced health check system** with automatic service restart capabilities **→ [Issue #44](https://github.com/loqalabs/loqa/issues/44)**
- [ ] **Intelligent retry logic** with exponential backoff for STT/LLM/NATS failures **→ [Issue #45](https://github.com/loqalabs/loqa/issues/45)**
- [ ] **Basic circuit breaker patterns** to prevent cascade failures **→ [Issue #45](https://github.com/loqalabs/loqa/issues/45)**
- [ ] **Graceful degradation modes** (continue core functionality when non-critical components fail)
- [ ] **Service restart coordination** that preserves system state and user sessions **→ [Issue #44](https://github.com/loqalabs/loqa/issues/44)**
- [ ] **Community status indicators** in Commander UI without technical complexity

### 🎙️ Home Assistant Voice PE Hardware Evaluation **[PRIORITY 4 - PHYSICAL TESTING FOUNDATION]**
**🔗 GitHub Issues**: 
- [loqa#33 - HA Voice PE Stock Firmware Evaluation & UX Documentation](https://github.com/loqalabs/loqa/issues/33)
- [loqa#34 - HA Voice PE Custom Firmware Development & Hardware Integration](https://github.com/loqalabs/loqa/issues/34)
- [loqa#35 - HA Voice PE Comparative Analysis & Community Feasibility Assessment](https://github.com/loqalabs/loqa/issues/35)

**📋 Context**: Having physical hardware for testing is critical for validating voice pipeline features, wake word detection, audio quality, and real-world performance.

**Phase 1: Stock Firmware Evaluation**
- [ ] **HA Voice PE Setup & Integration**: Install Home Assistant, configure test devices, set up Voice PE device
- [ ] **UX Documentation**: Document user experience, strengths, and weaknesses through comprehensive testing scenarios
- [ ] **Hardware Assessment**: Evaluate build quality, microphone array, speaker quality, LED ring, button responsiveness

**Phase 2: Custom Firmware Development**
- [ ] **Firmware Backup**: Create backup of original firmware (if modification requires replacement)
- [ ] **Hardware Reverse Engineering**: Investigate flashing capabilities (USB vs disassembly), LED ring control, button integration
- [ ] **Loqa Firmware Development**: Develop custom firmware integrating with Loqa gRPC protocol
- [ ] **Hardware Integration Testing**: Verify LED ring control, button functionality, audio quality with custom firmware

**Phase 3: Comparative Analysis & Community Decision**
- [ ] **Performance Comparison**: Test custom firmware vs stock firmware across identical scenarios
- [ ] **Feature Gap Analysis**: Identify areas where stock firmware excels and improve custom implementation
- [ ] **Community Feasibility Assessment**: Cost analysis, manufacturing scalability, regulatory compliance for custom hardware path
- [ ] **OSS Strategy**: Recommend hardware approach (custom firmware, community partnership, or full open development)

### 🔒 Privacy-by-Design Architecture **[PRIORITY 5 - CORE DIFFERENTIATOR]**
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

### 🗣️ Speech-to-Text (STT) **[PRIORITY 6 - VOICE PIPELINE CORE]**
**🔗 GitHub Issue**: [loqa-hub#20 - STT confidence thresholds and wake word normalization](https://github.com/loqalabs/loqa-hub/issues/20)

- [ ] Strip wake word ("Hey Loqa") before passing to intent parser
- [ ] Normalize common misspellings of "Loqa" (e.g., "Luca") in post-STT
- [ ] Define and enforce default confidence threshold for rejecting low-quality transcriptions
- [ ] **Community UX Enhancement**: Implement "did you mean?" patterns for low-confidence commands
  - [ ] Use confidence gradient: "I heard..." vs "I think you said..." vs "Did you mean..."
  - [ ] Avoid default "I'm not sure what you want me to do" - always attempt interpretation
  - [ ] **Context**: Essential for community UX differentiation from consumer assistants

### 🔊 Text-to-Speech (TTS) **[PRIORITY 7 - VOICE PIPELINE CORE]**
**🔗 GitHub Issue**: [loqa-hub#26 - Integrate Kokoro-82M TTS for professional natural voices](https://github.com/loqalabs/loqa-hub/issues/26)

- [x] **PRIORITY**: Integrate Kokoro-82M TTS system for natural, expressive voices ✅ **COMPLETED**
  - [x] Replace/augment current TTS with Kokoro-82M (82M parameters, sub-0.3s processing) ✅ **COMPLETED**
  - [x] Support 10+ simultaneous voice streams for multi-user environments ✅ **COMPLETED**
  - [x] Optimize for Mac Mini M4 performance ✅ **COMPLETED**  
  - [x] Ensure voices sound natural and professional for community environments ✅ **COMPLETED**
- [ ] Play returned TTS phrase through speakers when using the test relay (must remain ephemeral and never stored to disk)

### 🧠 Intent Parsing & Command Execution **[PRIORITY 8 - LOGIC PIPELINE]**
**🔗 GitHub Issue**: [loqa-hub#27 - Multi-command intent parsing and chaining](https://github.com/loqalabs/loqa-hub/issues/27)

- [ ] Support multi-command chaining in parsed intent pipeline
  - [ ] Parse compound utterances (e.g., "Turn off the lights and play music")
  - [ ] Route sub-intents to appropriate skills in sequence
  - [ ] Ensure skill responses can be executed in order without overlap or conflict
  - [ ] Combine or sequence TTS responses for multiple results
  - [ ] If chaining fails, gracefully fallback to the first valid command

### 🧠 Skills & Plugin System **[PRIORITY 9 - EXTENSIBILITY FOUNDATION]**
**🔗 GitHub Issue**: [loqa-skills#9 - Built-in Timer Skill with local tracking](https://github.com/loqalabs/loqa-skills/issues/9)

- [ ] Add built-in "Set a timer" skill with local tracking and TTS countdown/complete response
  - [ ] Support community durations ("set a 15-minute meeting timer")
  - [ ] Announce when timer expires via TTS playback
  - [ ] Store and cancel timers locally on the hub
- [ ] **List Management Skill with Multi-Item Support** (Pain point identified from Siri usage feedback)
  - [ ] **Batch list commands**: "Add milk, eggs, flour, and oil to my shopping list"
  - [ ] **Interactive list building**: "I want to add items to my shopping list" → conversational item collection
  - [ ] **List persistence**: Local SQLite storage with privacy-first design (ephemeral by default)
  - [ ] **Voice confirmation**: Read back items added, support corrections ("Remove milk")
  - [ ] **Multiple list types**: Shopping, todo, reminders, notes
  - [ ] **Integration-ready**: Design for future sync with external apps (Home Assistant, task managers)
- [ ] **CRITICAL**: Ensure manifest includes field for `sensitive: true` for privacy-tagged skills
- [ ] Add basic community skills: "help", "version", "what can you do?" **→ [Issue #11](https://github.com/loqalabs/loqa-skills/issues/11)**
- [ ] **Community Skills Foundation**: Medical terminology, legal dictation basics **→ [Issue #11](https://github.com/loqalabs/loqa-skills/issues/11)**

### 🖥️ Commander UI & API Surface **[PRIORITY 10 - USER INTERFACE]**
**🔗 GitHub Issue**: [loqa-commander#14 - Timeline filtering and event categorization](https://github.com/loqalabs/loqa-commander/issues/14)

- [ ] Add ability to filter timeline by success, failure, or low-confidence events
- [ ] **Simplified Community UI**: Create non-technical interface for community administrators
- [ ] **Community Status Indicators**: System health display without technical complexity

### ⚡ Innovation-First Performance & Emerging Tech **[PRIORITY 11 - OPTIMIZATION]**
**🔗 GitHub Issues**:
- [loqa#40 - Developer-First Installation & Setup Experience](https://github.com/loqalabs/loqa/issues/40)
- [loqa#37 - Speech-to-Speech Model Integration for Sub-200ms Responses](https://github.com/loqalabs/loqa/issues/37)
- [loqa#38 - Real-Time Streaming LLM Implementation](https://github.com/loqalabs/loqa/issues/38)

**📋 Context**: Prioritize innovation over convention. Explore emerging technologies that make Loqa a platform for experimentation, not just another voice assistant clone.

**Performance Baseline & Monitoring:**
- [ ] **Document current voice pipeline performance** across Mac Mini M4 and other hardware configurations
- [ ] **Implement automated performance regression testing** in CI/CD pipeline with alerts
- [ ] **Create real-time performance monitoring dashboard** with component-level metrics
- [ ] **Establish community SLA targets** based on community requirements (target: sub-2s response)
- [ ] **Benchmark against competitive solutions** where possible for innovation positioning

**Advanced AI Model Integration:**
- [ ] **Evaluate speech-to-speech models** (Ultravox v0.5, Google Moshi) for direct audio processing
- [ ] **Implement streaming LLM inference** for improved perceived performance and user engagement
- [ ] **Add WebRTC support evaluation** for real-time audio streaming optimization
- [ ] **Benchmark latest STT models** (AssemblyAI Slam-1, Deepgram Nova-2) vs current Whisper
- [ ] **A/B test performance improvements** with community members for validation

**Resource Optimization:**
- [ ] **Optimize concurrent processing** and resource utilization patterns for Mac Mini M4
- [ ] **Implement intelligent request prioritization** and queuing strategies
- [ ] **Add performance profiling tools** for ongoing optimization and troubleshooting


### 🌟 Community Building & OSS Ecosystem Development **[PRIORITY 12 - COMMUNITY GROWTH]**
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

### 📊 OSS MVP Success Criteria & Innovation Metrics **[PRIORITY 13 - SUCCESS FRAMEWORK]**
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
- [ ] **NEW**: Multi-location management for community deployments

### 🔄 Self-Healing Foundations **[NEW - SUPPORTS >99.5% UPTIME GOAL]**
**🔗 GitHub Issue**: [loqa#25 - Self-Healing Foundations for Community Reliability](https://github.com/loqalabs/loqa/issues/25)

**🎯 MVP Resilience Goal**: Basic automatic recovery without user intervention to support community reliability requirements

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