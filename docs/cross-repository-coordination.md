# Cross-Repository Coordination System for Loqa

## Overview

The Loqa ecosystem consists of 8 interconnected repositories that require sophisticated coordination for changes that span multiple services. This system provides automated dependency tracking, status synchronization, and coordinated workflows.

## Repository Dependency Matrix

### Primary Dependencies

```
loqa-proto (Foundation)
    ↓
├── loqa-hub (depends on loqa-proto)
├── loqa-relay (depends on loqa-proto)
└── loqa-skills/homeassistant-skill (depends on loqa-hub, which depends on loqa-proto)

loqa-hub (Central Orchestrator)
    ↓
├── loqa-commander (depends on loqa-hub HTTP API)
└── loqa-skills/* (skills depend on loqa-hub interfaces)

loqa (Orchestration & Documentation)
    ↓
└── All services (via docker-compose.yml and docs)

www-loqalabs-com (Independent)
loqalabs-github-config (Shared GitHub workflows)
```

### Coordination Requirements by Change Type

| Change Type | Affected Repos | Coordination Strategy |
|-------------|----------------|----------------------|
| **Protocol Changes** | loqa-proto → loqa-hub, loqa-relay, loqa-skills | Sequential: proto first, then consumers |
| **Breaking Changes** | Multiple repos | Parallel feature branches + coordinated PRs |
| **Feature Rollouts** | loqa-hub, loqa-commander, loqa-skills | Feature flags + progressive deployment |
| **Bug Fixes** | Varies | Auto-propagation to dependent repos if needed |
| **Security Updates** | All repos | Parallel updates with shared tracking |

## Coordination Architecture

### 1. Issue Linking Strategy

#### Cross-Repository Issue References
- **Parent Issue**: Created in primary repository (e.g., loqa-proto for protocol changes)
- **Child Issues**: Auto-created in dependent repositories
- **Linking Format**: `Relates to: loqalabs/loqa-proto#123`
- **Status Labels**: `coordination:parent`, `coordination:child`, `coordination:ready`

#### Issue Lifecycle
1. **Creation**: Parent issue triggers child issue creation
2. **Planning**: Dependencies mapped and tracked
3. **Development**: Status sync across linked issues
4. **Testing**: Integration testing coordination
5. **Deployment**: Coordinated release sequence

### 2. Dependency Management

#### Automated Dependency Detection
- Parse `go.mod`, `package.json`, `docker-compose.yml`
- Track repository references in documentation
- Monitor cross-service API dependencies
- Detect breaking changes via semantic analysis

#### Dependency Health Monitoring
- **Stale Dependencies**: Alert when dependencies are outdated
- **Circular Dependencies**: Prevent and alert on detection
- **Version Conflicts**: Track incompatible version requirements
- **Integration Points**: Monitor service communication health

### 3. Status Synchronization

#### Status Propagation Rules
```yaml
parent_status_change:
  "In Progress" → triggers child issues to "Ready for Development"
  "Blocked" → propagates "Blocked" to all children
  "Done" → enables children to proceed (removes blocks)
  "Closed" → checks if all children are resolved

child_status_aggregation:
  all_children_done → parent can be marked "Ready for Integration"
  any_child_blocked → parent shows "Coordination Blocked"
  integration_complete → parent marked "Done"
```

#### Progress Aggregation
- **Weighted Progress**: Based on repository complexity/effort
- **Critical Path**: Identify bottleneck repositories
- **Milestone Tracking**: Align milestones across repositories
- **Release Readiness**: Aggregate readiness signals

## Implementation

### 1. Enhanced Issue Templates

#### Cross-Repository Work Template
```yaml
name: Cross-Repository Work
description: For changes affecting multiple repositories
title: "[Cross-Repo]: "
labels: ["coordination", "cross-repo", "triage"]

body:
  - type: dropdown
    id: change_type
    attributes:
      label: Change Type
      options:
        - Protocol Change (loqa-proto → consumers)
        - Breaking Change (multiple repos)
        - Feature Rollout (coordinated deployment)
        - Security Update (all repos)
        - Bug Fix (cross-repo impact)

  - type: checkboxes
    id: affected_repos
    attributes:
      label: Affected Repositories
      options:
        - label: loqa-proto
        - label: loqa-hub
        - label: loqa-relay
        - label: loqa-skills
        - label: loqa-commander
        - label: loqa
        - label: www-loqalabs-com
        - label: loqalabs-github-config

  - type: textarea
    id: coordination_plan
    attributes:
      label: Coordination Plan
      description: Describe the sequence and dependencies
      placeholder: |
        1. Update loqa-proto with new fields
        2. Update loqa-hub to use new protocol
        3. Update loqa-relay to send new data
        4. Test integration across all services
        5. Update documentation

  - type: textarea
    id: integration_tests
    attributes:
      label: Integration Testing Strategy
      description: How will cross-repository changes be tested?

  - type: dropdown
    id: coordination_priority
    attributes:
      label: Coordination Priority
      options:
        - Low - can proceed independently
        - Medium - requires loose coordination
        - High - requires tight coordination
        - Critical - blocking other work
```

#### Protocol Change Template
```yaml
name: Protocol Change
description: Changes to loqa-proto affecting multiple services
title: "[Protocol]: "
labels: ["protocol", "breaking-change", "coordination"]

body:
  - type: dropdown
    id: breaking_change
    attributes:
      label: Breaking Change?
      options:
        - "Yes - requires coordinated updates"
        - "No - backward compatible"
        - "Maybe - needs analysis"

  - type: checkboxes
    id: affected_services
    attributes:
      label: Affected Services
      options:
        - label: loqa-hub (gRPC server)
        - label: loqa-relay (gRPC client)
        - label: loqa-skills (may use protocol types)

  - type: textarea
    id: migration_strategy
    attributes:
      label: Migration Strategy
      description: How will services be updated to use the new protocol?

  - type: checkboxes
    id: coordination_checklist
    attributes:
      label: Coordination Checklist
      options:
        - label: Protocol changes implemented and tested
        - label: Go bindings generated and verified
        - label: loqa-hub updated and tested
        - label: loqa-relay updated and tested
        - label: Skills compatibility verified
        - label: Integration tests passing
        - label: Documentation updated
```

### 2. GitHub Actions for Coordination

#### Cross-Repository Status Sync
```yaml
name: Cross-Repository Status Sync
on:
  issues:
    types: [labeled, unlabeled, closed, reopened]
  issue_comment:
    types: [created]

jobs:
  sync_status:
    if: contains(github.event.issue.labels.*.name, 'coordination')
    runs-on: ubuntu-latest
    steps:
      - name: Parse Cross-Repo References
        id: parse
        run: |
          # Extract referenced issues from issue body
          REFERENCES=$(echo "${{ github.event.issue.body }}" | grep -E "loqalabs/[^#]+#[0-9]+" || echo "")
          echo "references=$REFERENCES" >> $GITHUB_OUTPUT

      - name: Update Linked Issues
        if: steps.parse.outputs.references != ''
        run: |
          # For each referenced issue, update status
          echo "${{ steps.parse.outputs.references }}" | while read -r ref; do
            if [[ $ref =~ loqalabs/([^#]+)#([0-9]+) ]]; then
              REPO="${BASH_REMATCH[1]}"
              ISSUE="${BASH_REMATCH[2]}"
              
              # Update status based on parent issue state
              gh issue edit "$ISSUE" --repo "loqalabs/$REPO" \
                --add-label "coordination:sync" \
                --body "Status sync from loqalabs/${{ github.repository }}#${{ github.event.issue.number }}"
            fi
          done
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Dependency Impact Analysis
```yaml
name: Dependency Impact Analysis
on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - 'go.mod'
      - 'package.json'
      - 'proto/**'
      - 'api/**'

jobs:
  analyze_impact:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5
        with:
          fetch-depth: 2

      - name: Detect Breaking Changes
        id: breaking
        run: |
          BREAKING=false
          
          # Check for protocol changes
          if git diff HEAD~1 --name-only | grep -E "\.(proto)$"; then
            echo "Protocol files changed - potential breaking change"
            BREAKING=true
          fi
          
          # Check for API changes
          if git diff HEAD~1 --name-only | grep -E "api/"; then
            echo "API files changed - potential breaking change"
            BREAKING=true
          fi
          
          # Check go.mod version changes
          if git diff HEAD~1 go.mod | grep -E "^\+.*v[0-9]+\.[0-9]+\.[0-9]+"; then
            echo "Version dependencies changed"
            BREAKING=true
          fi
          
          echo "breaking=$BREAKING" >> $GITHUB_OUTPUT

      - name: Create Coordination Issue
        if: steps.breaking.outputs.breaking == 'true'
        run: |
          gh issue create \
            --title "[Auto] Coordination needed for PR #${{ github.event.pull_request.number }}" \
            --body "This PR contains changes that may affect other repositories.

          **PR**: #${{ github.event.pull_request.number }}
          **Changes**: ${{ github.event.pull_request.title }}
          
          **Potentially Affected Repositories**:
          - [ ] loqa-hub
          - [ ] loqa-relay
          - [ ] loqa-skills
          - [ ] loqa-commander
          
          **Next Steps**:
          1. Review changes for breaking compatibility
          2. Create issues in affected repositories if needed
          3. Coordinate testing across repositories
          4. Plan deployment sequence" \
            --label "coordination,auto-created,breaking-change"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. Repository-Specific Coordination Hooks

#### loqa-proto Coordination
```yaml
# .github/workflows/proto-coordination.yml
name: Protocol Change Coordination
on:
  push:
    branches: [main]
    paths: ['proto/**']

jobs:
  coordinate_consumers:
    runs-on: ubuntu-latest
    steps:
      - name: Create Consumer Issues
        run: |
          REPOS=("loqa-hub" "loqa-relay" "loqa-skills")
          COMMIT_MSG="${{ github.event.head_commit.message }}"
          
          for repo in "${REPOS[@]}"; do
            gh issue create \
              --repo "loqalabs/$repo" \
              --title "[Protocol Update] Update for loqa-proto changes" \
              --body "Protocol changes from loqalabs/loqa-proto require updates.
              
              **Source**: loqalabs/loqa-proto@${{ github.sha }}
              **Changes**: $COMMIT_MSG
              
              **Tasks**:
              - [ ] Update to new protocol version
              - [ ] Test compatibility
              - [ ] Update dependencies
              - [ ] Verify integration tests
              
              **Coordination**: This issue is part of coordinated protocol update.
              Related: loqalabs/loqa-proto#[PARENT_ISSUE]" \
              --label "protocol-update,coordination,auto-created"
          done
        env:
          GH_TOKEN: ${{ secrets.COORDINATION_TOKEN }}
```

#### loqa-hub Coordination
```yaml
# .github/workflows/hub-coordination.yml
name: Hub Change Coordination
on:
  push:
    branches: [main]
    paths: 
      - 'api/**'
      - 'cmd/skills-cli/**'

jobs:
  coordinate_dependents:
    runs-on: ubuntu-latest
    steps:
      - name: Check API Changes
        id: api_changes
        run: |
          if git diff HEAD~1 --name-only | grep -E "api/"; then
            echo "api_changed=true" >> $GITHUB_OUTPUT
          fi

      - name: Create Commander Issue
        if: steps.api_changes.outputs.api_changed == 'true'
        run: |
          gh issue create \
            --repo "loqalabs/loqa-commander" \
            --title "[API Update] Update for loqa-hub API changes" \
            --body "API changes in loqa-hub may require frontend updates.
            
            **Source**: loqalabs/loqa-hub@${{ github.sha }}
            
            **Tasks**:
            - [ ] Review API changes
            - [ ] Update frontend API calls if needed
            - [ ] Test integration with new hub version
            - [ ] Update API documentation" \
            --label "api-update,coordination"
        env:
          GH_TOKEN: ${{ secrets.COORDINATION_TOKEN }}
```

### 4. MCP Server Integration

I'll now create the MCP server tools for coordination management:

```typescript
// In loqa/project/loqa-assistant-mcp/src/tools/coordination.ts
export interface CrossRepoCoordination {
  // Cross-repository issue creation and linking
  createCoordinationIssue(params: {
    title: string;
    changeType: 'protocol' | 'breaking' | 'feature' | 'security' | 'bugfix';
    affectedRepos: string[];
    coordinationPlan: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<{ parentIssue: string; childIssues: string[] }>;

  // Dependency impact analysis
  analyzeDependencyImpact(params: {
    repository: string;
    changeType: 'breaking' | 'feature' | 'bugfix' | 'internal';
    filePaths?: string[];
  }): Promise<{
    affectedRepos: string[];
    impactLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  }>;

  // Status synchronization
  syncCoordinationStatus(params: {
    parentIssue: string;
    status: 'planning' | 'in_progress' | 'testing' | 'blocked' | 'ready' | 'done';
  }): Promise<{ updatedIssues: string[] }>;

  // Progress aggregation
  getCoordinationProgress(params: {
    parentIssue: string;
  }): Promise<{
    overallProgress: number;
    childrenStatus: Array<{
      repo: string;
      issue: string;
      status: string;
      progress: number;
    }>;
    criticalPath: string[];
    blockers: string[];
  }>;
}
```

### 5. Monitoring and Alerting

#### Coordination Health Dashboard
```yaml
# .github/workflows/coordination-health.yml
name: Coordination Health Monitor
on:
  schedule:
    - cron: '0 8 * * 1-5'  # Daily on weekdays
  workflow_dispatch:

jobs:
  health_check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Stale Coordinations
        run: |
          # Find coordination issues older than 7 days
          STALE_ISSUES=$(gh search issues \
            --repo "loqalabs/loqa-hub" \
            --repo "loqalabs/loqa-relay" \
            --repo "loqalabs/loqa-proto" \
            --repo "loqalabs/loqa-skills" \
            --repo "loqalabs/loqa-commander" \
            "label:coordination is:open created:<$(date -d '7 days ago' +%Y-%m-%d)" \
            --json number,title,repository)
          
          if [[ $(echo "$STALE_ISSUES" | jq length) -gt 0 ]]; then
            echo "⚠️ Found stale coordination issues"
            echo "$STALE_ISSUES" | jq -r '.[] | "- \(.repository.name)#\(.number): \(.title)"'
          fi

      - name: Check Broken Dependencies
        run: |
          # Check for dependency version mismatches
          REPOS=("loqa-hub" "loqa-relay" "loqa-skills/homeassistant-skill")
          
          for repo in "${REPOS[@]}"; do
            echo "Checking $repo dependencies..."
            if gh api "/repos/loqalabs/$repo/contents/go.mod" --jq .content | base64 -d | grep -E "loqa-proto.*v[0-9]"; then
              echo "✅ $repo has loqa-proto dependency"
            else
              echo "⚠️ $repo missing or malformed loqa-proto dependency"
            fi
          done

      - name: Create Health Report Issue
        if: failure()
        run: |
          gh issue create \
            --repo "loqalabs/loqa" \
            --title "[Health] Coordination system health issues detected" \
            --body "Automated health check found coordination issues.
            
            **Issues Found**:
            - Stale coordination issues
            - Broken dependencies
            - Version mismatches
            
            **Actions Needed**:
            - Review and close stale coordination issues
            - Update dependency versions
            - Verify cross-repository integration
            
            **Auto-generated**: $(date)" \
            --label "health,coordination,auto-created"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 6. Integration Testing Coordination

#### Cross-Repository Integration Tests
```yaml
# .github/workflows/integration-coordination.yml
name: Cross-Repository Integration Tests
on:
  workflow_call:
    inputs:
      coordination_issue:
        description: 'Coordination issue number for tracking'
        required: true
        type: string

jobs:
  setup_test_environment:
    runs-on: ubuntu-latest
    outputs:
      test_matrix: ${{ steps.matrix.outputs.repos }}
    steps:
      - name: Determine Test Matrix
        id: matrix
        run: |
          # Get affected repositories from coordination issue
          AFFECTED_REPOS=$(gh issue view "${{ inputs.coordination_issue }}" \
            --repo "loqalabs/loqa" \
            --json body | jq -r '.body' | \
            grep -E "- \[x\].*loqa-" | \
            sed 's/.*\(loqa-[a-z-]*\).*/\1/')
          
          echo "repos=$(echo "$AFFECTED_REPOS" | jq -R . | jq -s .)" >> $GITHUB_OUTPUT

  integration_test:
    needs: setup_test_environment
    strategy:
      matrix:
        repo: ${{ fromJson(needs.setup_test_environment.outputs.test_matrix) }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout coordination repo
        uses: actions/checkout@v5
        with:
          repository: loqalabs/loqa
          path: loqa

      - name: Checkout test repo
        uses: actions/checkout@v5
        with:
          repository: loqalabs/${{ matrix.repo }}
          path: ${{ matrix.repo }}

      - name: Run Integration Tests
        run: |
          cd loqa
          # Start test environment with updated service
          docker-compose -f docker-compose.yml \
            -f docker-compose.test.yml \
            --profile testing up -d
          
          # Run cross-service tests
          make test-integration REPO=${{ matrix.repo }}

      - name: Update Coordination Status
        if: always()
        run: |
          STATUS="✅ passed"
          if [[ ${{ job.status }} != "success" ]]; then
            STATUS="❌ failed"
          fi
          
          gh issue comment "${{ inputs.coordination_issue }}" \
            --repo "loqalabs/loqa" \
            --body "Integration test for ${{ matrix.repo }}: $STATUS"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 7. Documentation and Workflow Guidelines

#### Coordination Workflow Documentation
```markdown
# Cross-Repository Coordination Workflow

## When to Use Coordination

Use the coordination system for changes that:
- Modify loqa-proto (affects all gRPC consumers)
- Change APIs between services
- Require synchronized deployments
- Affect multiple repositories for a single feature

## Workflow Steps

### 1. Planning Phase
1. Create coordination issue using cross-repository template
2. System auto-creates child issues in affected repositories
3. Plan implementation sequence and dependencies
4. Set up feature branches in all affected repositories

### 2. Development Phase
1. Implement changes in dependency order (proto → hub → relay → skills → commander)
2. Link PRs to coordination issue
3. Status automatically syncs across repositories
4. Run integration tests continuously

### 3. Testing Phase
1. Trigger cross-repository integration tests
2. Verify end-to-end functionality
3. Check backward compatibility
4. Validate deployment sequence

### 4. Deployment Phase
1. Merge PRs in dependency order
2. Deploy services with health checks
3. Monitor cross-service integration
4. Close coordination issue when all services are updated

## Best Practices

### Protocol Changes
- Always version protocol changes
- Maintain backward compatibility when possible
- Update all consumers before removing old methods
- Test with both old and new protocol versions

### Breaking Changes
- Create feature flags for gradual rollout
- Coordinate communication with all affected teams
- Plan rollback strategy for each service
- Document migration steps clearly

### Emergency Coordination
- Use high-priority coordination for security fixes
- Create hotfix branches in all affected repositories
- Coordinate simultaneous deployment
- Monitor system health during emergency changes
```