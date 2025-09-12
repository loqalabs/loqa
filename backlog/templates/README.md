# Backlog Task Templates

This directory contains standardized templates for common work patterns in the Loqa project. These templates ensure consistency, completeness, and proper context for different types of tasks.

## Available Templates

### 1. General Task Template (`general-task-template.md`)
**Use for:** Standard tasks, improvements, documentation, or any work that doesn't fit other specific patterns.

**Key Features:**
- Comprehensive acceptance criteria
- Component impact tracking
- Quality gates and definition of done

### 2. Bug Fix Template (`bug-fix-template.md`)
**Use for:** Fixing bugs, addressing issues, or resolving defects.

**Key Features:**
- Structured problem analysis
- Root cause investigation
- Rollback planning
- Regression testing requirements

### 3. Feature Template (`feature-template.md`)
**Use for:** New features, enhancements, or significant functionality additions.

**Key Features:**
- User story format
- Technical design section
- Launch planning
- Success metrics

### 4. Protocol Change Template (`protocol-change-template.md`)
**Use for:** Changes to gRPC protocols, API modifications, or service interface updates.

**Key Features:**
- Backward compatibility tracking
- Service coordination
- Migration planning
- Version management

### 5. Cross-Repository Work Template (`cross-repo-work-template.md`)
**Use for:** Work that spans multiple repositories requiring coordination.

**Key Features:**
- Dependency ordering
- Branch coordination strategy
- Quality gate sequencing
- Integration testing plan

## How to Use Templates

### 🚨 CRITICAL: ALWAYS Use Backlog CLI (NEVER Manual Creation)

**CORRECT Method - CLI Creation:**
```bash
# ⚠️ IMPORTANT: Run from TARGET REPOSITORY root directory
cd loqa-hub                 # For hub service tasks
cd loqa-commander          # For UI tasks
cd loqa-skills             # For skill development tasks

# Create task with template-specific details:
backlog task create "Your task title" \
  --description "Detailed description of what needs to be done" \
  --priority high \
  --ac "First acceptance criterion" \
  --ac "Second acceptance criterion" \
  --labels feature,backend

# Templates guide these parameters:
# - General: --labels general
# - Bug Fix: --labels bug-fix,priority-high  
# - Feature: --labels feature,enhancement
# - Protocol: --labels protocol,breaking-change
# - Cross-Repo: --labels cross-repo,coordination
```

**❌ NEVER DO - Manual File Creation:**
```bash
# DON'T copy template files manually
# DON'T create task files by hand
# DON'T bypass the CLI tool
```

**Why CLI-First is Critical:**
- ✅ Ensures proper task numbering and formatting
- ✅ Maintains database consistency
- ✅ Enables workflow automation
- ✅ Prevents duplicate IDs and broken references
- ✅ Follows official Backlog.md standards

### Advanced CLI Usage
```bash
# Create with implementation plan
backlog task create "Add authentication system" \
  --plan "1. Research JWT libraries\n2. Implement middleware\n3. Add tests"

# Create with dependencies
backlog task create "User dashboard" \
  --dep task-15,task-16

# Create as child task
backlog task create -p 20 "Add login form validation"
```

## Template Guidelines

### Required Sections
All templates include these mandatory sections:
- **Overview/Description:** Clear statement of what needs to be done
- **Acceptance Criteria:** Specific, measurable outcomes
- **Quality Gates:** Code review, testing, and quality requirements
- **Related Issues:** Links to GitHub issues and dependencies

### Component Tracking
Each template includes checkboxes for affected components:
- loqa-hub (Central service)
- loqa-commander (Admin dashboard)
- loqa-relay (Audio client)
- loqa-proto (Protocol definitions)
- loqa-skills (Plugin system)
- www-loqalabs-com (Website)

### Quality Standards
All templates enforce these quality requirements:
- Code review completion
- Test coverage maintenance
- Quality check execution (`make quality-check`)
- Documentation updates

## Best Practices

### When Creating Tasks
1. **Choose the right template** based on work type
2. **Fill in all sections** - don't skip context or acceptance criteria
3. **Be specific** in acceptance criteria and implementation approach
4. **Consider dependencies** and coordination needs
5. **Plan for testing** and quality validation

### Template Customization
- **Add project-specific sections** as needed
- **Modify checklists** to match your workflow
- **Include additional quality gates** for your environment
- **Adapt acceptance criteria** format to your needs

### Cross-Repository Coordination
For work affecting multiple repositories:
1. Use the Cross-Repository Work Template
2. Create matching feature branches
3. Coordinate quality checks and testing
4. Plan deployment order carefully

## Integration with Workflow

### GitHub Issues Integration
- Link backlog tasks to GitHub issues
- Use GitHub issue numbers in task IDs when possible
- Sync status between GitHub and backlog.md

### Branch Strategy
- Create feature branches matching task names
- Use consistent naming: `feature/task-001-description`
- Coordinate across repositories for cross-repo work

### Quality Integration
- Run quality checks before marking tasks complete
- Use `make quality-check` for Go services
- Use `npm run quality-check` for JavaScript services
- Ensure all tests pass before task completion

## Future Enhancements

### Planned MCP Commands
- `/add-todo --template=<type>` for interactive task creation
- `/capture-thought` for quick idea capture
- `/set-role` for specialized work contexts

### Template Evolution
Templates will be updated based on:
- Team feedback and usage patterns
- New work types and requirements
- Quality process improvements
- Tool integration opportunities