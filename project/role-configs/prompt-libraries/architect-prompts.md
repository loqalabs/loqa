# Architect Role Prompt Library

## Core Architectural Thinking Patterns

### System Design Approach
```
When designing systems, always consider:
1. **Scalability**: How will this scale to 10x, 100x usage?
2. **Maintainability**: How easy is this to modify and extend?
3. **Fault Tolerance**: What happens when components fail?
4. **Performance**: What are the latency and throughput requirements?
5. **Security**: What are the attack vectors and mitigations?
6. **Cost**: What are the operational and development costs?

Framework: Analyze -> Design -> Validate -> Document -> Iterate
```

### Cross-Service Integration Patterns
```
For microservice integrations:
1. **Define clear boundaries**: What does each service own?
2. **Design APIs first**: Contract-driven development
3. **Plan for failure**: Circuit breakers, retries, fallbacks
4. **Consider data consistency**: Eventual vs strong consistency
5. **Monitor everything**: Observability from day one

Questions to ask:
- How do services discover each other?
- What happens during partial failures?
- How do we handle data synchronization?
- What are the performance characteristics?
```

### Protocol Design Guidelines
```
When designing protocols (gRPC, REST APIs):
1. **Versioning strategy**: How will we evolve the protocol?
2. **Backward compatibility**: What changes are safe?
3. **Error handling**: How are errors communicated?
4. **Performance**: Serialization costs, payload size
5. **Security**: Authentication, authorization, encryption

Protocol review checklist:
- [ ] Clear service contracts defined
- [ ] Versioning and migration strategy
- [ ] Error handling patterns
- [ ] Performance characteristics documented
- [ ] Security requirements addressed
```

## Architecture Decision Record (ADR) Template
```
# ADR-{number}: {Short Title}

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue that we're trying to solve? What are the constraints?

## Decision
What is the change that we're proposing and/or have agreed to implement?

## Consequences
What becomes easier or more difficult to do because of this change?

### Positive
- Benefit 1
- Benefit 2

### Negative  
- Risk 1
- Mitigation for Risk 1

### Neutral
- Architectural constraint 1
- Implementation requirement 1

## Implementation Notes
Key implementation details, migration strategy, rollout plan

## Alternatives Considered
Other options that were evaluated and why they were rejected
```

## Common Architecture Patterns for Loqa

### Microservice Communication Patterns
```
1. **Request-Response**: gRPC for synchronous communication
   - Use for: Real-time voice processing, immediate feedback
   - Trade-offs: Higher latency coupling, simpler error handling

2. **Event-Driven**: NATS for asynchronous messaging  
   - Use for: Skill execution results, status updates
   - Trade-offs: Eventual consistency, more complex error handling

3. **Data Streaming**: For continuous data flows
   - Use for: Audio streams, real-time monitoring
   - Trade-offs: Higher throughput, stateful processing complexity
```

### Scalability Patterns
```
1. **Horizontal Scaling**: Multiple instances of services
   - Loqa-hub: Load balance across multiple instances
   - State management: Externalize to Redis/database

2. **Vertical Scaling**: More powerful hardware
   - STT/TTS services: GPU acceleration
   - LLM processing: High-memory instances

3. **Caching Strategies**: 
   - STT results: Cache frequent queries
   - Skill responses: Cache deterministic results
   - Protocol buffers: Connection pooling
```

## Technology Evaluation Framework

### Evaluation Criteria
```
For each technology choice, evaluate:

**Functional Requirements**
- [ ] Meets current needs
- [ ] Supports growth requirements
- [ ] Integrates with existing stack

**Non-Functional Requirements**  
- [ ] Performance characteristics
- [ ] Reliability and availability
- [ ] Security posture
- [ ] Operational complexity

**Strategic Alignment**
- [ ] Fits team expertise
- [ ] Community support and longevity
- [ ] License and cost considerations
- [ ] Migration and rollback options
```

### Technology Decision Matrix
```
| Criteria | Weight | Option A | Option B | Option C |
|----------|--------|----------|----------|----------|
| Performance | 9 | 8 | 6 | 9 |
| Complexity | 7 | 6 | 9 | 4 |
| Cost | 6 | 7 | 8 | 5 |
| Team Fit | 8 | 9 | 5 | 7 |
| **Weighted Score** | | **7.8** | **6.9** | **6.7** |
```

## Performance Design Guidelines

### Latency Budgets
```
Voice Assistant Response Times:
- Wake word detection: < 100ms
- STT processing: < 500ms  
- Intent processing: < 200ms
- Skill execution: < 1000ms
- TTS generation: < 300ms
- **Total budget: < 2.1 seconds**

Design implications:
- Local processing preferred over cloud
- Aggressive caching strategies
- Parallel processing where possible
- Graceful degradation under load
```

### Throughput Planning
```
Expected Load Patterns:
- Peak concurrent users: 100 (future: 10,000)
- Voice commands per user/hour: 20
- Background processing: Continuous
- Batch operations: Off-peak hours

Resource Planning:
- CPU: Voice processing is CPU-intensive
- Memory: LLM models require significant RAM
- Network: Audio streaming bandwidth
- Storage: Conversation history, models
```

## Security Architecture Patterns

### Defense in Depth
```
1. **Network Level**: Firewalls, VPNs, network segmentation
2. **Application Level**: Authentication, authorization, input validation  
3. **Data Level**: Encryption at rest and in transit
4. **Operational Level**: Logging, monitoring, incident response

For Loqa specifically:
- No cloud dependencies = reduced attack surface
- Local processing = data never leaves premises
- Microservice isolation = containment of breaches
- Encrypted inter-service communication
```

### Privacy by Design
```
Data Minimization:
- Only collect necessary voice data
- Automatic deletion of processed audio
- Local storage with encryption

User Control:
- Opt-in for all data collection
- Easy data deletion mechanisms
- Transparent processing explanations

Technical Safeguards:
- No persistent audio storage
- Encrypted communication channels
- Access controls on all services
```

## Common Architectural Anti-Patterns to Avoid

### Distributed Monolith
```
❌ Anti-pattern: Services that must be deployed together
✅ Solution: True service independence with async communication

❌ Anti-pattern: Synchronous chains of service calls
✅ Solution: Event-driven architecture with saga patterns
```

### Data Consistency Issues
```
❌ Anti-pattern: Shared databases between services
✅ Solution: Service-owned data with event sourcing

❌ Anti-pattern: Distributed transactions across services  
✅ Solution: Eventual consistency with compensation
```

### Performance Bottlenecks
```
❌ Anti-pattern: Chatty interfaces between services
✅ Solution: Coarse-grained APIs with batch operations

❌ Anti-pattern: Synchronous processing of everything
✅ Solution: Async processing with status tracking
```

## Architecture Review Checklist

### Pre-Implementation Review
- [ ] Clear problem statement and constraints
- [ ] Multiple alternatives considered
- [ ] Performance and scalability analysis
- [ ] Security and privacy implications
- [ ] Operational complexity assessment
- [ ] Migration and rollback strategy
- [ ] Monitoring and observability plan

### Post-Implementation Review
- [ ] Performance metrics meet requirements
- [ ] Error handling works as designed
- [ ] Monitoring provides useful insights
- [ ] Documentation is complete and accurate
- [ ] Team can operate and maintain the system
- [ ] Lessons learned documented