# 🟨 P3 – Post-Business MVP Features

> **📊 Track Progress**: View all issues and milestones in the [**Loqa MVP Roadmap Project**](https://github.com/orgs/loqalabs/projects/1)  
> **🎯 Future Milestones**: [v2.0 Enterprise - Dec 31, 2026](https://github.com/loqalabs/loqa/milestone/3)

## 🛠️ Advanced Developer Experience **[ENHANCED FOR OSS]**
_Advanced tooling for power users and contributors - core developer experience is P1_

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
- [ ] Add drill-down debugger mode for voice pipeline (NLU → Skill → Response) **→ [Related: TODO.md - Security-Aware Observability, Issue #49](https://github.com/loqalabs/loqa/issues/49)**
- [ ] **Enterprise**: Multi-tenant observability across business locations
- [ ] **Enterprise**: Advanced performance analytics and capacity planning
- [ ] **Enterprise**: Integration with business monitoring systems (Datadog, etc.)

---

### 🖥️ Commander UI & API Surface
_These tasks aim to increase flexibility by making the Commander UI more modular and optionally deployable, improving API accessibility and usability._

- [ ] Commander UI settings panel: toggle log retention, sanitization, redaction, etc.
  - *See also: Personality types (lines 352-358) for personality configuration in settings panel*
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
  - *See also: Empathetic AI responses (lines 345-350) for content-level emotional intelligence*
- [ ] Voice cloning for personalized business environments
- [ ] Multi-language support for international business use

---

### 🧹 MVP Cleanup & Scope
_These items serve as guardrails and structural decisions to maintain clarity and focus for the OSS MVP._

- [ ] Commander UI: gracefully degrade when log retention = 0 or sanitization = true
- [ ] Remove or toggle features not included in OSS MVP
- [ ] Hide premium features behind `config.license` flag
- [ ] Create `MVP.md` to define MVP boundaries
- *Note: Security items moved to "🔐 Skill Security & Trust Architecture" section*

---

### 🔄 Privacy-First Update System
_Comprehensive update mechanism design that preserves offline-first architecture and privacy commitments for medical/professional deployments._

**🔗 GitHub Issue**: [To be created - Privacy-compatible update distribution system]

**📋 Key Questions to Resolve:**
- [ ] **Research Phase**: Survey P2P update distribution mechanisms (BitTorrent-like, gossip protocols, mesh networking)
- [ ] **Architecture Decision**: Single-version releases vs individual microservice versioning strategy **→ [MOVED TO TODO.md - Unified System Versioning Architecture]**
- [ ] **Compliance Research**: Medical environment update requirements and audit trails
- [ ] **Offline Strategy**: Determine acceptable balance of online vs purely offline update paths

**🎯 Core Requirements:**
- [ ] **Docker-based updates** that don't require internet connectivity for isolated deployments
- [ ] **System updates**: Hub, relay, commander service versioning and coordination **→ [Related: TODO.md - Unified System Versioning Architecture]**
- [ ] **Skills updates**: Plugin/skill distribution without central dependency
- [ ] **HIPAA compatibility**: Update mechanism that preserves audit trails and data isolation
- [ ] **Rollback capability**: Safe update rollback for business continuity

**🔍 Technical Exploration:**
- [ ] Evaluate P2P distribution protocols (IPFS, BitTorrent, custom gossip)
- [ ] Design encrypted update bundles with signature verification
- [ ] USB/removable media distribution workflow for air-gapped environments
- [ ] Local network update propagation (hub-to-hub sync within organization)
- [ ] Update coordination across microservices (orchestration vs independent updates)

**📅 Timeline**: Next major release cycle (affects offline-first commitments)
**🔗 Dependencies**: 
- Privacy architecture finalization (`TODO.md:152-168`)
- Production readiness decisions (`TODO.md:197-206`)
- Enterprise deployment patterns (`BACKLOG.md:143-152`)

**📌 Related Work:**
- Connects to skill auto-update system (`TODO.md:201`)
- Builds on encrypted audit trail work (`BACKLOG.md:28-30`)
- Supports enterprise backup/restore needs (`TODO.md:199`)

---

### 🔐 Skill Security & Trust Architecture
_Comprehensive security framework for skill distribution, execution, and trust management in medical/enterprise environments._

**🔗 GitHub Issue**: [To be created - Skill signing and trust architecture]

**🎯 Core Security Goals:**
- **User Trust**: Clear indicators of skill verification status
- **Enterprise Compliance**: Auditable skill approval process for medical/legal environments  
- **Threat Mitigation**: Protection against malicious skills accessing sensitive data
- **Developer Experience**: Security that doesn't impede legitimate skill development

**📋 Key Architectural Questions:**
- [ ] **Signing Scope**: Define what gets signed (manifests, code, permissions, all of above?)
- [ ] **Trust Model**: Official-only vs Official + Vetted + Community skills?
- [ ] **Key Management**: How are signing keys distributed and rotated?
- [ ] **Verification Points**: When/where is signature verification performed?

**🔒 Security Framework Components:**

**Content Signing & Verification:**
- [ ] **Skill manifest signing** for tamper detection and publisher verification
- [ ] **Signature verification** at skill installation and runtime
- [ ] **Certificate chain management** for official vs vetted vs community skills
- [ ] **Revocation mechanism** for compromised or malicious skills

**Trust Zones & Permissions:**
- [ ] **Implement skill-level permissions (trust zones)** *(moved from MVP Cleanup section)*
  - Zone 1: Basic skills (timers, weather) - no sensitive data access
  - Zone 2: Productivity skills - limited system access
  - Zone 3: Medical/enterprise skills - full system access with audit logging
- [ ] **Permission manifests** that declare required access levels
- [ ] **Runtime permission enforcement** integrated with trust zones

**Technical Enforcement:**
- [ ] **Implement WASM or subprocess sandboxing for plugins** *(moved from MVP Cleanup section)*
- [ ] **Sandbox escape detection** and automatic skill termination
- [ ] **Resource limits** (CPU, memory, network) per trust zone
- [ ] **API access controls** mapped to trust zone permissions

**Enterprise & Compliance Features:**
- [ ] **Skill approval workflows** for enterprise deployments
- [ ] **Audit logging** for all skill installations, updates, and permission grants
- [ ] **Policy enforcement** (e.g., "only official skills in medical mode")
- [ ] **Compliance reporting** for security audits and regulatory requirements

**📅 Timeline**: Architecture foundation for future marketplace (next major release cycle)
**🔗 Dependencies**: 
- Privacy-First Update System (signature verification for updates)
- Enterprise deployment requirements (`TODO.md:197-206`)
- HIPAA compliance architecture (`TODO.md:152-168`)

**📌 Related Work:**
- Builds on manifest `sensitive: true` field (`TODO.md:66`, `TODO.md:162`)
- Integrates with encrypted audit trails (`BACKLOG.md:29`)
- Supports update bundle signing (`BACKLOG.md:104`)

---

### 🤖 Comprehensive Self-Healing Architecture
_Advanced self-healing system implementing full monitoring, diagnosis, automated remediation, and learning capabilities for enterprise deployments._

**🔗 GitHub Issue**: [loqa#26 - Comprehensive Self-Healing Architecture - AI-Driven Enterprise Resilience](https://github.com/loqalabs/loqa/issues/26)

**🎯 Advanced Self-Healing Goals:**
- **Predictive Resilience**: Detect and prevent failures before they impact users
- **Intelligent Recovery**: AI-driven root cause analysis and contextual remediation
- **Continuous Learning**: System improves healing strategies over time through feedback loops
- **Enterprise Scalability**: Multi-site redundancy and advanced failover capabilities

**📋 Self-Healing Principles Implementation:**

**Monitoring and Detection:**
- [ ] **Comprehensive metrics collection** with time-series database (Prometheus/InfluxDB equivalent)
- [ ] **Behavioral baseline modeling** for each service to establish normal operation patterns
- [ ] **AI/ML anomaly detection** system to identify deviations from baseline behavior
- [ ] **Multi-dimensional correlation analysis** across services, performance, and business metrics
- [ ] **Predictive failure modeling** using historical patterns and leading indicators

**Diagnosis and Root Cause Analysis:**
- [ ] **Automated diagnosis engine** with decision trees and correlation analysis
- [ ] **Contextual analysis system** that understands service relationships and dependencies
- [ ] **Cross-service failure correlation** to identify cascade failure patterns
- [ ] **Historical pattern matching** against previous incidents and resolutions
- [ ] **Impact assessment automation** to understand business and user effects

**Automated Remediation:**
- [ ] **Intelligent remediation strategy engine** with pluggable response patterns
- [ ] **Advanced circuit breaker patterns** with adaptive thresholds and recovery logic
- [ ] **Dynamic resource scaling** and load rebalancing during performance degradation
- [ ] **Automated failover orchestration** with state preservation and migration
- [ ] **Self-healing pattern library**: Retry, Bulkhead, Timeout, Fallback, and Recovery strategies

**Verification and Learning:**
- [ ] **Automated post-remediation testing** to verify healing success
- [ ] **Healing effectiveness measurement** with success/failure metrics and user impact analysis
- [ ] **Machine learning feedback loops** to improve future remediation strategies
- [ ] **Continuous strategy optimization** based on environmental changes and failure patterns
- [ ] **Knowledge base evolution** capturing successful and failed healing attempts

**Enterprise Architectural Features:**
- [ ] **Multi-level redundancy** with intelligent load distribution and failover
- [ ] **Service mesh integration** for advanced routing, circuit breaking, and observability
- [ ] **Distributed consensus mechanisms** for coordinated healing across multiple nodes
- [ ] **Cross-datacenter resilience** with automated geographic failover
- [ ] **Business continuity integration** with backup/restore and disaster recovery systems

**Resilience Level Deployment Options:**

**Level 1 - Basic** (MVP Foundation):
- Enhanced health checks, circuit breakers, graceful degradation
- Single-instance deployment with intelligent restart strategies

**Level 2 - Professional**:
- Service redundancy, automated failover, performance monitoring
- Advanced health dashboards with predictive warnings

**Level 3 - Enterprise**:
- Full self-healing architecture with AI-driven intelligence
- Multi-site redundancy, advanced business continuity features
- Comprehensive compliance reporting and audit trails

**📅 Timeline**: Post-Business MVP (v1.1+ roadmap)
**🔗 Dependencies**: 
- MVP Self-Healing Foundations completion (`TODO.md:209-239`)
- Advanced monitoring infrastructure
- Enterprise deployment patterns and requirements
- AI/ML infrastructure for intelligent decision-making

**📌 Related Work:**
- Builds on MVP Self-Healing Foundations from TODO.md
- Integrates with Skill Security & Trust Architecture for holistic system resilience
- Supports Privacy-First Update System with coordinated update healing
- Enhances Enterprise Readiness features with automated reliability management

---

### 🪪 Optional Premium Features & Monetization
_Optional paid features that enhance the core OSS experience without limiting basic functionality._

- [ ] Create `MONETIZATION.md` (Core OSS / Optional Premium / Community Sponsored)
- [ ] Tag source with `// CORE_OSS` or `// OPTIONAL_PREMIUM`
- [ ] CLI: Add `loqa premium` command to show available enhancements

---

### 🧺 Cloud Sync & Mobile Integration (Optional Premium)
_Privacy-preserving, encrypted sync features as an optional enhancement to the local-first core._

- [ ] Create encrypted cross-device sync skill with local SQLite persistence
- [ ] Add secure gRPC and HTTP API endpoints for data synchronization
- [ ] Define end-to-end encrypted sync format (user-controlled keys)
- [ ] Build privacy-preserving QR-based pairing system (Hub ↔ Mobile)
- [ ] Implement optional Loqa Cloud Relay (zero-knowledge message routing)
- [ ] Add user-controlled key management and pairing registry
- [ ] Build minimal PWA or native mobile app for encrypted sync
- [ ] Gate behind optional `--premium-sync` flag (not license requirement)
- [ ] Add Commander UI for sync management with full transparency
---

### 🧭 OSS-First Messaging & Positioning
_Focus on developer autonomy, creative freedom, and privacy as core values rather than compliance requirements._

- [ ] Highlight creative freedom vs constrained cloud assistants (Alexa, Google)
- [ ] Emphasize "Privacy by choice, not compliance" in all messaging
- [ ] Add homepage tagline: "A voice assistant that respects your autonomy and unleashes creativity"
- [ ] Add privacy philosophy to README: local-first, user-controlled, transparent by design
- [ ] Position as "voice platform for makers" vs "voice assistant for consumers"
- [ ] Improve messaging for developers, makers, self-hosters, privacy advocates
- [ ] Write compelling OSS narrative around innovation vs imitation
- [ ] Community-test messaging with target developer audiences

### 🎯 Community-Driven Positioning & Target Audiences
_Expand messaging to reach diverse maker and developer communities._

**🔗 GitHub Issues**: 
- [www-loqalabs-com#8 - Developer-centric messaging and maker community positioning](https://github.com/loqalabs/www-loqalabs-com/issues/8)
- [www-loqalabs-com#9 - Privacy-by-design philosophy and community documentation](https://github.com/loqalabs/www-loqalabs-com/issues/9)

- [ ] **Maker community** messaging (creative freedom and experimentation)
- [ ] **Privacy advocates** positioning (autonomy-first platform)
- [ ] **IoT developers** focus (extensible, hackable voice control platform)
- [ ] **Self-hosting enthusiasts** beyond basic home automation
- [ ] Add innovation comparison table vs existing voice assistants
- [ ] Create "Autonomy First" documentation section
- [ ] Add creative freedom checklist for skill developers
- [ ] Strengthen differentiation angles:
  - [ ] "Voice assistant that unleashes creativity, not constraints"
  - [ ] "Privacy by choice, not compliance"
  - [ ] "Open ecosystem without vendor lock-in"
  - [ ] "Your voice, your rules, your innovation"

---

### 🏢 Advanced Self-Hosting & Community Scale
_Features for power users, communities, and organizations who value autonomy._

- [ ] Multi-instance skill isolation and sandboxing
- [ ] Granular privacy controls for Commander UI
- [ ] Encrypted backup/restore with user key control
- [ ] Performance benchmarking and optimization tools
- [ ] Privacy-preserving usage analytics (opt-in only)
- [ ] Decentralized authentication options (no SSO dependency)
- [ ] Community-driven configuration sharing and templates

### 🎙️ Hardware Architecture & Manufacturing Strategy
_Long-term hardware decisions building on Home Assistant Voice PE evaluation results._

**🔗 Dependencies**: 
- [loqa#33 - HA Voice PE Stock Firmware Evaluation](https://github.com/loqalabs/loqa/issues/33)
- [loqa#34 - HA Voice PE Custom Firmware Development](https://github.com/loqalabs/loqa/issues/34)
- [loqa#35 - HA Voice PE Comparative Analysis & Business Feasibility](https://github.com/loqalabs/loqa/issues/35)

**Hardware Partnership vs Custom Development:**
- [ ] **Evaluate hardware partnership opportunities** based on HA Voice PE analysis
- [ ] **Custom hardware development roadmap** if modification/partnership isn't viable
- [ ] **Manufacturing scalability assessment** for direct hardware production
- [ ] **Regulatory compliance strategy** for different hardware approaches (FCC/CE certification)

**Advanced Relay Hardware Features:**
- [ ] **Multi-microphone array optimization** for professional environments
- [ ] **LED ring customization** for branding and professional appearance
- [ ] **Enterprise-grade materials** evaluation for business durability requirements
- [ ] **Silent operation hardware** design for professional office environments

### 🏗️ Architecture Evolution & Simplification
_Strategic architectural decisions to reduce complexity and improve maintainability._

**Device Service Sunset Decision:**
- **✅ Decided**: Sunset loqa-device-service in favor of enhanced skill-based integrations
- **Rationale**: Separate device service adds unnecessary complexity for MVP without clear user benefit
- **Alternative**: Enhance Home Assistant skill with bidirectional integration ([loqa-skills#10](https://github.com/loqalabs/loqa-skills/issues/10))
- **Benefits**: Simpler setup, lower latency, fewer moving parts, easier deployment

**Future Integration Patterns:**
- [ ] **Skill-based integrations**: Each platform (HA, Zigbee, etc.) gets dedicated skill
- [ ] **Direct protocol integration**: Skills connect directly to their respective platforms
- [ ] **Shared utilities**: Common device control utilities in skills framework
- [ ] **Cross-skill communication**: Event bus for skills to share device state if needed

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
  - *See also: Personality types (lines 352-358) for user-specific personality preferences*
- [ ] Simple on-device fine-tuning of LLMs
- [ ] Skill SDK / Wizard for non-coders
- [ ] Prompt remixing for varied responses
  - *See also: Personality types (lines 352-358) for personality-aware response patterns*
- [ ] Commander as full config dashboard
  - *See also: Personality types (lines 352-358) for personality configuration interface*
- [ ] Swappable LLMs with privacy warnings
- [ ] Time-aware skills and scheduling
- [ ] Explainability UX: "Why did you do that?"
- [ ] **Empathetic AI responses for abstract/emotional requests**
  - [ ] Handle abstract concepts and emotional states ("I'm feeling sad", "I need motivation")  
  - [ ] Intelligent response selection: helpful advice vs actionable suggestions (play soothing music)
  - [ ] Context-aware emotional intelligence with learned user preferences
  - [ ] Integration with existing skills for follow-through actions (music, lighting, reminders)
  - *Related: TTS emotion simulation (line 67), personalization (lines 336-337), prompt remixing (line 340)*
- [ ] **Configurable personality types and response patterns**
  - [ ] Pre-defined personality profiles: "Tell it like it is", "Empathetic", "Encouraging", "Skeptical", "Practical", "Playful", "Sarcastic", "Innovative"
  - [ ] User-selectable personality modes with consistent response styling across all interactions
  - [ ] Personality-aware prompt engineering for LLM responses and skill interactions
  - [ ] Integration with Commander UI settings panel for easy personality switching
  - [ ] Per-user personality preferences with speaker recognition integration
  - *Related: Prompt remixing (line 341), personalization (line 338), Commander config dashboard (line 342), empathetic AI (lines 345-350)*
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