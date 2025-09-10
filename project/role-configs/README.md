# Role-Based Specialization System

This directory contains role-specific configurations for Claude Code AI agents, implementing specialized contexts and capabilities for different types of development work.

## Available Roles

### 🏗️ Architect (`architect.claude-code.json`)
**Focus**: System design, architecture decisions, cross-service integration
- **Capabilities**: Protocol design, API specification, scalability planning
- **Model Preference**: Sonnet 4 (high complexity)
- **Templates**: Protocol change, cross-repo work, feature templates
- **Detection Keywords**: architecture, design, system, integration, protocol, api

### 💻 Developer (`developer.claude-code.json`) 
**Focus**: Code implementation, debugging, testing, feature development
- **Capabilities**: Feature implementation, bug fixing, unit testing, code review
- **Model Preference**: Sonnet 4 (medium-high complexity)
- **Templates**: Feature, bug fix, general templates
- **Detection Keywords**: implement, code, function, bug, fix, feature, algorithm

### 🚀 DevOps (`devops.claude-code.json`)
**Focus**: Infrastructure, deployment, monitoring, operational excellence
- **Capabilities**: CI/CD, containerization, infrastructure as code, monitoring
- **Model Preference**: Sonnet 4 (high complexity)
- **Templates**: General, cross-repo work templates
- **Detection Keywords**: deploy, infrastructure, ci/cd, docker, kubernetes, monitoring

### 🧪 QA (`qa.claude-code.json`)
**Focus**: Testing strategy, quality assurance, validation processes
- **Capabilities**: Test planning, automation, performance testing, bug validation
- **Model Preference**: Haiku (medium complexity)
- **Templates**: Bug fix, general, feature templates
- **Detection Keywords**: test, testing, quality, qa, validation, verify, bug

### 🔧 General (`general.claude-code.json`)
**Focus**: Multi-disciplinary work, default fallback role
- **Capabilities**: General development, documentation, basic testing
- **Model Preference**: Haiku (low complexity)
- **Templates**: General, feature, bug fix templates
- **Detection Keywords**: general, basic, documentation, maintenance

## How It Works

### Automatic Role Detection
1. **Pattern Matching**: Analyzes task titles, descriptions, and file paths
2. **Confidence Scoring**: Uses detection keywords to score role relevance
3. **Threshold**: Requires 60% confidence to auto-select a role
4. **Fallback**: Defaults to 'general' role when confidence is low

### Manual Role Selection
```bash
# Via MCP commands in Claude Code
/set-role architect --context="Designing new microservice architecture"
/set-role developer --context="Implementing user authentication"
/set-role devops --context="Setting up CI/CD pipeline"
/set-role qa --context="Creating test automation framework"
```

### Model Selection Heuristics
- **Sonnet 4**: Complex architecture, development, and infrastructure work
- **Haiku**: Testing, documentation, maintenance, and general tasks
- **Auto-Selection**: Based on role complexity and task analysis

## Configuration Structure

### Base Configuration Extension
All roles extend the base `.claude-code.json` configuration with additional:
- **Role-specific rules**: Specialized guidance for the role
- **Capabilities**: What the role is optimized to handle
- **Code focus**: Primary/secondary areas and what to avoid
- **Quality gates**: Role-specific validation requirements
- **Detection patterns**: Keywords for automatic role detection

### Template Integration
Each role has preferred task templates from the backlog.md system:
- Templates are automatically suggested based on role
- Role-specific acceptance criteria and quality gates
- Specialized workflow guidance for different work types

## Usage Examples

### Architecture Work
```bash
/set-role architect
/add-todo "Design gRPC protocol for voice streaming" --template=protocol-change
```

### Development Work  
```bash
/set-role developer
/add-todo "Implement voice command parsing" --template=feature --priority=High
```

### Infrastructure Work
```bash
/set-role devops  
/add-todo "Set up monitoring for loqa-hub service" --template=general
```

### Testing Work
```bash
/set-role qa
/add-todo "Create integration test suite" --template=bug-fix
```

## Integration Points

### MCP Server Integration
- Extended `loqa-rules-mcp` server with role management
- Commands: `/set-role`, `/detect-role`, `/list-roles`
- Session persistence and context switching

### Backlog.md Integration
- Role-specific template recommendations
- Quality gates adapted to role requirements
- Specialized acceptance criteria frameworks

### Claude Code Integration
- Automatic context switching based on work type
- Role-appropriate tool restrictions and preferences
- Specialized prompt libraries (Phase 2-2)

## Future Enhancements

### Phase 2 Roadmap
- **Prompt Libraries**: Role-specific prompt templates and approaches
- **Learning System**: Adaptation based on usage patterns
- **Cross-Role Coordination**: Hand-offs between different role contexts
- **Performance Metrics**: Track role effectiveness and accuracy

### Advanced Features
- **Multi-Role Tasks**: Tasks requiring multiple role perspectives
- **Role Transitions**: Smooth context switching during complex work
- **Skill Assessment**: Automatic capability assessment and role suggestions
- **Team Coordination**: Role assignments for collaborative work

## Configuration Management

### Adding New Roles
1. Create new `{role}.claude-code.json` file
2. Update `role-system.json` with role metadata
3. Add detection patterns and model preferences
4. Test role detection and capabilities

### Modifying Existing Roles
1. Update role-specific configuration files
2. Test changes don't break existing functionality
3. Update documentation and examples
4. Consider backward compatibility impacts

This role system transforms Claude Code from a general-purpose AI into specialized agents optimized for different aspects of software development, improving both efficiency and quality of outputs.