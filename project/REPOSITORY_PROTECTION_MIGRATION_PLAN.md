# Repository Protection Migration Plan
## From Rulesets to Branch Protection Rules

**Issue**: [#51 - GitHub Repository Protection Migration: Rulesets → Branch Protection](https://github.com/loqalabs/loqa/issues/51)

**Date**: September 2025  
**Status**: Phase 1 - Pilot Testing Ready

---

## 🚨 Critical Problem Statement

**Current Issue**: Repository rulesets require complex status check naming (`"WorkflowName / ReusableWorkflowJobName"`) causing systematic "stuck PR" issues where developers must bypass security checks.

**Solution**: Migrate to branch protection rules that use intuitive naming (`"WorkflowName"`) eliminating naming complexity.

**Evidence**: From `RULESET_PATTERNS.md:43-48`, JavaScript services show problematic naming:
- `"Check Commit Messages / Check Commit Messages"`  
- `"Test & Lint / Lint, Format, Build, and Upload Dist"`

---

## 📋 Current State Analysis

### Repository Protection Status (September 2025)
- ✅ **loqa**: No active branch protection  
- ✅ **loqa-hub**: No active branch protection
- ✅ **loqa-commander**: No active branch protection  
- ✅ **loqa-proto**: No active branch protection
- ✅ **loqa-relay**: No active branch protection
- ✅ **loqa-skills**: No active branch protection

### Existing Ruleset Configuration
- **Config Location**: `loqalabs-github-config/Loqa Labs Ruleset.json`
- **Template**: Standardized across all repositories
- **Status Checks**: Repository-specific but follow patterns in `RULESET_PATTERNS.md`

---

## 🎯 Phase 1: Pilot Testing (Week 1) - loqa-proto

### Target Repository Selection
**Repository**: `loqa-proto` 
**Rationale**: 
- Least complex workflows (per Issue #51)
- Critical but isolated (affects all services but predictable impact)
- Good test case for status check naming resolution

### Phase 1 Implementation Steps

#### Step 1.1: Create Feature Branch
```bash
cd /Users/anna/Projects/loqalabs/loqa-proto
git checkout -b feature/51-branch-protection-migration
```

#### Step 1.2: Analyze Current Workflows
```bash
# Examine current workflow files to understand status check names
ls -la .github/workflows/
# Document actual workflow job names vs required status check names
```

#### Step 1.3: Design Branch Protection Template  
Based on `Loqa Labs Ruleset.json`, create equivalent branch protection:

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Commit Check",
      "Generate Protocol Buffer Bindings"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

#### Step 1.4: Test Implementation
```bash
# Create test branch protection rule using GitHub CLI
gh api -X PUT "repos/loqalabs/loqa-proto/branches/main/protection" \
  --input branch-protection-template.json

# Test with sample PR to verify status checks work correctly
# Document any naming mismatches and resolve them
```

#### Step 1.5: Validation Checklist
- [ ] Status checks match actual workflow job names
- [ ] PRs can merge without bypass when checks pass  
- [ ] PRs are blocked appropriately when checks fail
- [ ] Code owner review requirement works correctly
- [ ] No systematic "stuck PR" issues

---

## 🔧 Phase 2: Template Development (Week 2)

### Template Creation
Create standardized templates in `loqalabs-github-config/branch-protection-templates/`:

#### `go-service-protection.json`
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Commit Check", "Test", "Build"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

#### `js-service-protection.json`
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Commit Check", "Test & Lint"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

#### `proto-service-protection.json`  
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Commit Check", "Generate Protocol Buffer Bindings"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

#### `docs-repo-protection.json`
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Commit Check", "Validate Documentation"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

### Migration Script Development
Create `migrate-to-branch-protection.sh`:
```bash
#!/bin/bash
# Script to migrate from rulesets to branch protection
# Usage: ./migrate-to-branch-protection.sh <repo> <template>

REPO=$1
TEMPLATE=$2

echo "Migrating $REPO to branch protection using $TEMPLATE template..."

# Apply branch protection
gh api -X PUT "repos/loqalabs/$REPO/branches/main/protection" \
  --input "branch-protection-templates/$TEMPLATE"

echo "Migration complete for $REPO"
```

---

## ⚡ Phase 3: Phased Migration (Week 3-4)

### Migration Order (Risk-Based)
Per Issue #51 guidance:

1. **✅ loqa-proto** (completed in Phase 1) - critical but isolated
2. **loqa** - documentation repo, lowest risk
3. **loqa-hub, loqa-relay, loqa-skills** - Go services, standardized workflows
4. **loqa-commander, www-loqalabs-com** - JavaScript services, complex reusable workflows

### Implementation Schedule

#### Week 3: Low-Risk Migration
```bash
# Documentation repo
cd ../loqa  
git checkout -b feature/51-branch-protection-migration
./migrate-to-branch-protection.sh loqa docs-repo-protection.json

# Go services  
cd ../loqa-hub
git checkout -b feature/51-branch-protection-migration  
./migrate-to-branch-protection.sh loqa-hub go-service-protection.json

cd ../loqa-relay
git checkout -b feature/51-branch-protection-migration
./migrate-to-branch-protection.sh loqa-relay go-service-protection.json

cd ../loqa-skills  
git checkout -b feature/51-branch-protection-migration
./migrate-to-branch-protection.sh loqa-skills go-service-protection.json
```

#### Week 4: High-Risk Migration (JavaScript Services)
```bash
# JavaScript services with reusable workflow complexity
cd ../loqa-commander
git checkout -b feature/51-branch-protection-migration  
./migrate-to-branch-protection.sh loqa-commander js-service-protection.json

cd ../www-loqalabs-com
git checkout -b feature/51-branch-protection-migration
./migrate-to-branch-protection.sh www-loqalabs-com js-service-protection.json
```

---

## 🧹 Phase 4: Validation & Cleanup (Week 5)

### Validation Steps
1. **Test all repositories** with real PRs to ensure no "stuck PR" issues
2. **Verify security enforcement** maintained across all repositories  
3. **Document status check naming** that works vs. failed patterns
4. **Create troubleshooting guide** for any remaining issues

### Cleanup Tasks
1. **Remove ruleset configurations** from all repositories
2. **Update loqalabs-github-config documentation**
3. **Archive RULESET_PATTERNS.md** with historical note  
4. **Create BRANCH_PROTECTION_PATTERNS.md** with new standards

### Success Validation
- [ ] **Zero bypass necessity**: No PRs require admin bypass due to naming issues
- [ ] **Intuitive configuration**: Status checks are immediately understandable
- [ ] **Faster PR throughput**: No time wasted waiting for misnamed status checks  
- [ ] **Maintained security**: All protection rules preserved

---

## 🔄 Rollback Plan

If migration encounters unexpected issues:

### Immediate Rollback
```bash
# Re-enable rulesets for affected repository
gh api -X POST "repos/loqalabs/{repo}/rulesets" \
  --input "Loqa Labs Ruleset.json"

# Remove branch protection  
gh api -X DELETE "repos/loqalabs/{repo}/branches/main/protection"
```

### Analysis & Recovery
1. **Document specific issues** encountered during migration
2. **Analyze root causes** (workflow naming, status check mismatches, etc.)
3. **Consider hybrid approach** (selective migration based on workflow complexity)
4. **Escalate to GitHub support** if fundamental ruleset issues persist

---

## 📊 Success Metrics (30-day measurement)

### Target Outcomes
- **PR bypass frequency**: 0/month (currently: frequent)
- **Status check config time**: <5 minutes (currently: hours)  
- **Developer frustration**: 0 naming-related issues
- **Security effectiveness**: 100% enforcement without workarounds

### Monitoring
- Track PR bypass usage in GitHub insights
- Monitor developer feedback on workflow friction  
- Measure time from PR creation to merge for status check issues
- Document any regression in security enforcement

---

## 🔗 Related Documentation

- **Current Ruleset Config**: `loqalabs-github-config/Loqa Labs Ruleset.json`
- **Status Check Patterns**: `loqalabs-github-config/RULESET_PATTERNS.md`  
- **Issue Reference**: [GitHub Issue #51](https://github.com/loqalabs/loqa/issues/51)
- **Evaluation Document**: `project/GITHUB_REPOSITORY_PROTECTION_EVALUATION.md`

---

**Next Action**: Begin Phase 1 pilot testing with loqa-proto repository