# Cross-Repository Coordination System - Usage Guide

## Overview

The Loqa cross-repository coordination system provides automated management for changes that span multiple repositories in the microservice ecosystem. This guide covers how to use the system effectively for different types of coordinated work.

## Quick Start

### 1. When to Use Coordination

Use the coordination system for changes that:

- **Modify loqa-proto** (affects all gRPC consumers)
- **Change APIs** between services (hub ↔ commander, hub ↔ skills)
- **Require synchronized deployments** across multiple services
- **Introduce breaking changes** that affect multiple repositories
- **Update shared dependencies** or Docker configurations

### 2. Basic Workflow

1. **Create Coordination Issue**: Use the cross-repository template
2. **System Auto-Creates Child Issues**: In affected repositories
3. **Implement Changes**: Follow the coordination plan
4. **Monitor Progress**: Track status across all repositories
5. **Deploy Coordinated**: Follow the deployment sequence

## Coordination Types

### Protocol Changes

For changes to loqa-proto that affect gRPC consumers:

1. **Create Protocol Change Issue**:

   ```bash
   # Use the Protocol Change template
   gh issue create --template protocol_change.yml
   ```

2. **Fill Required Information**:

   - Breaking change analysis (yes/no/maybe)
   - Affected services (hub, relay, skills)
   - Migration strategy
   - Testing plan

3. **Automatic Actions**:
   - Child issues created in affected repositories
   - Integration testing issue created
   - Status synchronization enabled

**Example Protocol Change Flow**:

```
loqa-proto changes → Auto-creates issues in:
├── loqa-hub (update gRPC server)
├── loqa-relay (update gRPC client)
├── loqa-skills (update protocol usage)
└── loqa (integration testing)
```

### Breaking Changes

For changes that break backward compatibility:

1. **Detected Automatically**: System detects breaking changes in PRs
2. **Coordination Issue Created**: High-impact changes trigger auto-coordination
3. **Repository-Specific Issues**: Created with breaking change issues
4. **Coordinated Implementation**: Feature branches across repositories

**Breaking Change Detection Triggers**:

- Protocol buffer changes
- API endpoint changes
- Database schema changes
- Configuration format changes
- Dependency version major updates

### Feature Rollouts

For new features spanning multiple repositories:

1. **Create Cross-Repository Coordination Issue**:

   - Select "Feature Rollout" as change type
   - Check affected repositories
   - Describe feature scope and coordination needs

2. **Implementation Strategy**:

   - Feature flags for gradual rollout
   - Backward compatibility during transition
   - Coordinated testing across services

3. **Deployment Coordination**:
   - Sequential deployment based on dependencies
   - Health monitoring during rollout
   - Rollback procedures if needed

## Using the System

### Creating Coordination Issues

#### Method 1: GitHub Web Interface

1. Go to [loqalabs/loqa Issues](https://github.com/loqalabs/loqa/issues)
2. Click "New Issue"
3. Select appropriate template:
   - **Cross-Repository Coordination** - General coordination
   - **Protocol Change** - Protocol buffer changes
4. Fill out the template completely
5. Submit issue

#### Method 2: GitHub CLI

```bash
# Cross-repository coordination
gh issue create \
  --repo loqalabs/loqa \
  --title "[Cross-Repo] Add authentication to voice pipeline" \
  --body-file coordination-plan.md \
  --label "coordination,feature,high-priority"

# Protocol change
gh issue create \
  --repo loqalabs/loqa \
  --title "[Protocol] Add authentication metadata to AudioStream" \
  --body-file protocol-change.md \
  --label "protocol,breaking-change"
```

#### Method 3: MCP Server (via Claude Code)

```
/create-coordination-issue "Add JWT authentication" \
  --type=feature \
  --repos=loqa-proto,loqa-hub,loqa-relay,loqa-commander \
  --priority=high
```

### Monitoring Coordination Progress

#### Progress Dashboard

View coordination health and progress:

```bash
# Check coordination health
gh workflow run coordination-health-monitor.yml --repo loqalabs/loqa

# View active coordinations
gh issue list --repo loqalabs/loqa --label coordination --state open
```

#### Status Updates

The system provides automatic status updates:

- **Child issue creation** when coordination starts
- **Progress synchronization** across repositories
- **Deployment readiness** when all issues complete
- **Health monitoring** for stale or blocked coordinations

### Working with Child Issues

When a coordination issue is created, child issues are automatically created in affected repositories.

#### Child Issue Structure

Each child issue contains:

- **Repository-specific issues** based on the change type
- **Integration requirements** with other services
- **Testing checklist** for the specific repository
- **Definition of done** criteria

#### Updating Child Issues

1. **Mark issues complete** as you finish them
2. **Add status comments** for significant progress
3. **Report blockers** immediately in the child issue
4. **Coordinate timing** through the parent issue

#### Example Child Issues (loqa-hub)

```markdown
## Issues for loqa-hub

- [ ] Update gRPC service implementation
- [ ] Update HTTP API if needed
- [ ] Update database schema if needed
- [ ] Update configuration and environment variables

## Integration Testing

- [ ] Unit tests pass with changes
- [ ] Integration tests with other services pass
- [ ] Performance impact assessed

## Coordination

- [ ] Ready for coordinated deployment
```

### Deployment Coordination

#### Deployment Sequence

The system follows dependency order for deployments:

1. **loqa-proto** (foundation)
2. **loqa-hub** (central service)
3. **loqa-relay** (depends on hub)
4. **loqa-skills** (depends on hub and proto)
5. **loqa-commander** (depends on hub API)

#### Health Monitoring

Automated health checks monitor:

- **Service startup** and health endpoints
- **Integration connectivity** between services
- **Dependency compatibility** across repositories
- **Coordination coverage** for new changes

## Advanced Features

### MCP Server Integration

The coordination system integrates with the Loqa MCP server for Claude Code:

#### Available MCP Commands

```typescript
// Create coordination issues
/create-coordination-issue "title" --type=protocol --repos=hub,relay

// Analyze dependency impact
/analyze-dependency-impact loqa-hub --change-type=breaking

// Sync coordination status
/sync-coordination-status issue-123 --status=ready

// Get progress aggregation
/get-coordination-progress issue-123
```

#### Intelligent Workflow Generation

The MCP server can generate coordination workflows:

```typescript
/generate-coordination-workflow protocol \
  --repos=loqa-proto,loqa-hub,loqa-relay \
  --description="Add authentication metadata"
```

### Dependency Impact Analysis

Automated analysis detects coordination needs:

#### PR Impact Detection

When PRs are opened, the system analyzes:

- **File changes** for cross-repository impact
- **Dependency updates** affecting other services
- **API modifications** requiring frontend updates
- **Protocol changes** affecting gRPC consumers

#### Auto-Coordination Triggers

High-impact changes automatically create coordination issues:

- **Critical impact**: Protocol changes, breaking API changes
- **High impact**: Multiple repository dependencies
- **Medium impact**: Single service with integration points

### Custom Coordination Patterns

#### Feature Flags Strategy

For gradual rollouts:

```yaml
coordination_strategy:
  type: feature_flag
  rollout_percentage: [10, 25, 50, 100]
  health_checks:
    - response_time < 200ms
    - error_rate < 0.1%
    - cpu_usage < 80%
```

#### Rollback Procedures

Coordinated rollback for failed deployments:

```yaml
rollback_sequence:
  - stop_traffic_to_new_version
  - rollback_loqa_commander
  - rollback_loqa_skills
  - rollback_loqa_relay
  - rollback_loqa_hub
  - verify_system_health
```

## Best Practices

### Planning Phase

1. **Assess Impact Early**: Use dependency analysis before starting work
2. **Create Detailed Plans**: Include sequence, dependencies, and testing
3. **Communicate Broadly**: Notify all affected teams and stakeholders
4. **Set Clear Success Criteria**: Define what "done" means for coordination

### Implementation Phase

1. **Follow Dependency Order**: Implement changes in correct sequence
2. **Use Feature Branches**: Coordinate development across repositories
3. **Test Continuously**: Run integration tests throughout development
4. **Update Status Regularly**: Keep coordination issues current

### Deployment Phase

1. **Verify Readiness**: Ensure all repositories are ready before deployment
2. **Deploy Sequentially**: Follow the planned deployment sequence
3. **Monitor Health**: Watch system metrics during deployment
4. **Have Rollback Ready**: Prepare for quick rollback if needed

### Troubleshooting Common Issues

#### Stale Coordination Issues

**Problem**: Coordination issues become stale without updates
**Solution**:

- Weekly health monitoring flags stale issues
- Automated reminders to update progress
- Close coordination if no longer relevant

#### Dependency Conflicts

**Problem**: Repositories have conflicting dependency versions
**Solution**:

- Health monitoring detects version mismatches
- Coordination plan includes dependency alignment
- Use local replacements during development only

#### Integration Test Failures

**Problem**: Services fail integration tests during coordination
**Solution**:

- Each coordination includes integration testing issue
- Failed tests block deployment readiness
- Coordination status reflects integration health

#### Blocked Coordination

**Problem**: Coordination is blocked by external factors
**Solution**:

- Label coordination issues as "blocked"
- Health monitoring identifies blocked coordinations
- Escalation procedures for unblocking issues

## System Maintenance

### Health Monitoring

The system includes automated health monitoring:

- **Daily checks** for stale and blocked coordination
- **Weekly comprehensive checks** for dependency health
- **Automated alerts** for critical coordination issues

### Performance Metrics

Track coordination effectiveness:

- **Time to complete** coordination efforts
- **Success rate** of coordinated deployments
- **Issue resolution time** across repositories
- **System health** during coordination periods

### Continuous Improvement

Regular review and improvement:

- **Retrospectives** after major coordinations
- **Process updates** based on lessons learned
- **Tool improvements** for better automation
- **Documentation updates** based on usage patterns

## Getting Help

### Documentation

- **Architecture Overview**: `/docs/cross-repository-coordination.md`
- **Technical Details**: `/docs/coordination-system-technical.md`
- **MCP Integration**: `/project/loqa-assistant-mcp/README.md`

### Support Channels

- **GitHub Issues**: Create issues in loqalabs/loqa for system problems
- **Coordination Problems**: Use the coordination issue for specific coordination help
- **Urgent Issues**: Tag @annabarnes1138 in coordination issues

### Training Resources

- **Workshop Materials**: Available in `/docs/training/`
- **Video Tutorials**: Linked in coordination issue templates
- **Best Practices Guide**: This document and examples

## Conclusion

The cross-repository coordination system provides comprehensive support for managing complex changes across the Loqa ecosystem. By following this guide and using the automated tools, teams can coordinate effectively while maintaining system stability and quality.

The system continues to evolve based on usage patterns and feedback. Contribute improvements by creating issues or contributing to the coordination tools in the MCP server.
