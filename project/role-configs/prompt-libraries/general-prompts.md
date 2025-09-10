# General Role Prompt Library

## Versatile Problem-Solving Approach

### Universal Problem-Solving Framework
```
1. **Understand**: Clarify the problem and requirements
   - Ask questions to fill knowledge gaps
   - Identify stakeholders and their needs
   - Understand success criteria and constraints

2. **Analyze**: Break down the problem into components
   - Identify root causes vs symptoms
   - Consider multiple perspectives
   - Evaluate available resources and constraints

3. **Plan**: Design approach and gather resources
   - Consider multiple solution approaches
   - Plan for testing and validation
   - Identify potential risks and mitigation

4. **Execute**: Implement solution systematically
   - Start with smallest viable increment
   - Monitor progress and adjust as needed
   - Document decisions and learnings

5. **Validate**: Test and refine the solution
   - Verify against original requirements
   - Gather feedback from stakeholders
   - Plan for maintenance and evolution
```

### Cross-Functional Collaboration
```
Working with Specialists:
- **With Architects**: Understand system design principles and constraints
- **With Developers**: Collaborate on implementation details and code review
- **With DevOps**: Coordinate deployment and operational requirements
- **With QA**: Ensure testability and quality standards
- **With Product**: Align on user needs and business requirements

Communication Best Practices:
- Use clear, jargon-free language
- Provide context for technical decisions
- Ask clarifying questions when uncertain
- Document agreements and decisions
- Follow up on action items consistently
```

## Documentation Excellence

### Technical Documentation Standards
```
Documentation Hierarchy:
1. **Overview**: High-level purpose and context
2. **Getting Started**: Quick setup and basic usage
3. **Detailed Guide**: Comprehensive functionality
4. **Reference**: API docs, configuration options
5. **Troubleshooting**: Common issues and solutions
6. **Contributing**: How others can help improve

Writing Principles:
- Write for your audience (beginner vs expert)
- Use clear, concise language
- Include examples and code snippets
- Keep documentation up-to-date with code
- Test all examples and procedures
```

### README Template
```markdown
# Project Name

Brief description of what this project does and why it exists.

## Features

- Key feature 1
- Key feature 2  
- Key feature 3

## Quick Start

```bash
# Installation
npm install project-name

# Basic usage
npm start
```

## Prerequisites

- Node.js 18+
- Docker (for development)
- Any other requirements

## Installation

Detailed installation steps...

## Configuration

Environment variables and configuration options...

## Usage Examples

Common use cases with code examples...

## API Documentation

Link to full API docs or inline documentation...

## Contributing

Guidelines for contributors...

## License

License information...
```

### API Documentation Best Practices
```
RESTful API Documentation:
- Clear endpoint descriptions
- Request/response examples
- Error codes and messages
- Authentication requirements
- Rate limiting information

Example:
## GET /api/transcriptions

Retrieves a list of voice transcriptions.

**Parameters:**
- `limit` (integer, optional): Number of results (default: 50, max: 100)
- `offset` (integer, optional): Skip number of results (default: 0)
- `status` (string, optional): Filter by status (`processing`, `completed`, `failed`)

**Response:**
```json
{
  "transcriptions": [
    {
      "id": "trans_123",
      "text": "Turn on the lights",
      "confidence": 0.95,
      "duration": 1.2,
      "created_at": "2024-01-15T10:30:00Z",
      "status": "completed"
    }
  ],
  "total": 1,
  "has_more": false
}
```

**Error Responses:**
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error
```

## Code Review and Maintenance

### General Code Review Checklist
```
**Functionality**
- [ ] Code does what it's supposed to do
- [ ] Handles edge cases appropriately
- [ ] Error handling is present and meaningful
- [ ] No obvious bugs or logic errors

**Code Quality**
- [ ] Code is readable and well-structured
- [ ] Functions/methods are appropriately sized
- [ ] Variable and function names are descriptive
- [ ] No unnecessary code duplication

**Documentation**
- [ ] Complex logic is explained with comments
- [ ] Public APIs are documented
- [ ] README is updated if needed
- [ ] Configuration changes are documented

**Testing**
- [ ] Adequate test coverage for new code
- [ ] Tests are clear and maintainable
- [ ] No tests were removed without justification
- [ ] Tests actually test the intended behavior

**Security & Performance**
- [ ] No hardcoded secrets or credentials
- [ ] Input validation where appropriate
- [ ] No obvious performance bottlenecks
- [ ] Resource usage is reasonable
```

### Maintenance Activities
```
Regular Maintenance Tasks:
1. **Dependency Updates**: Keep libraries current and secure
2. **Code Refactoring**: Improve code structure and readability
3. **Documentation Updates**: Keep docs in sync with code
4. **Performance Monitoring**: Track and optimize performance
5. **Security Reviews**: Regular security assessments
6. **Technical Debt**: Address accumulated shortcuts

Monthly Maintenance Checklist:
- [ ] Update dependencies to latest secure versions
- [ ] Review and update documentation
- [ ] Check for broken links and outdated information
- [ ] Analyze performance metrics and optimize bottlenecks
- [ ] Review error logs for recurring issues
- [ ] Update development and deployment documentation
```

## Configuration Management

### Environment Configuration
```
Configuration Best Practices:
- Use environment variables for runtime configuration
- Provide sensible defaults for optional settings
- Validate configuration on startup
- Document all configuration options
- Use different configs for different environments

Example Configuration Structure:
```javascript
// config.js
const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'sqlite://./data.db',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,
  },
  
  // Feature flags
  features: {
    voiceRecognition: process.env.ENABLE_VOICE_RECOGNITION === 'true',
    advancedLogging: process.env.ENABLE_ADVANCED_LOGGING === 'true',
  },
  
  // Validation
  validate() {
    if (!this.database.url) {
      throw new Error('DATABASE_URL is required');
    }
    if (this.port < 1 || this.port > 65535) {
      throw new Error('PORT must be between 1 and 65535');
    }
  }
};

config.validate();
module.exports = config;
```

## Testing and Quality Assurance

### Basic Testing Principles
```
Testing Pyramid Application:
- **Unit Tests (70%)**: Test individual functions/methods
- **Integration Tests (20%)**: Test component interactions
- **E2E Tests (10%)**: Test complete user workflows

General Testing Guidelines:
- Write tests for critical business logic
- Test both happy path and error conditions
- Keep tests simple and focused
- Make tests independent of each other
- Use descriptive test names

Example Test Structure:
```javascript
describe('Voice Command Parser', () => {
  describe('when parsing valid commands', () => {
    it('should extract intent from simple command', () => {
      const result = parseCommand('turn on lights');
      expect(result.intent).toBe('lighting');
      expect(result.action).toBe('on');
      expect(result.target).toBe('lights');
    });
  });
  
  describe('when parsing invalid commands', () => {
    it('should handle empty input gracefully', () => {
      const result = parseCommand('');
      expect(result.intent).toBe('unknown');
      expect(result.error).toBeTruthy();
    });
  });
});
```

## Project Coordination

### Task Estimation and Planning
```
Estimation Techniques:
1. **Story Points**: Relative sizing (1, 2, 3, 5, 8, 13, 21)
2. **T-Shirt Sizes**: XS, S, M, L, XL for rough estimates
3. **Time Boxing**: Set fixed time limits for exploration
4. **Historical Data**: Use past similar tasks as reference

Planning Considerations:
- Include time for testing and documentation
- Account for code review and revision cycles
- Consider integration and deployment complexity
- Plan for unexpected issues and learning curve
- Include buffer time for critical path tasks
```

### Communication Templates
```
Status Update Template:
**Progress This Week:**
- Completed: [list of finished tasks]
- In Progress: [current work items]
- Blocked: [any obstacles or dependencies]

**Plans for Next Week:**
- Priority 1: [most important tasks]
- Priority 2: [secondary tasks]
- Dependencies: [what you're waiting for]

**Risks and Concerns:**
- [Any issues that might impact timeline]
- [Resource or skill gaps]
- [Technical challenges]

**Questions/Support Needed:**
- [Specific help requests]
- [Decisions needed from stakeholders]

Issue Report Template:
**Issue:** Brief description of the problem
**Impact:** Who/what is affected and how severely
**Steps to Reproduce:** Clear reproduction steps
**Expected vs Actual:** What should happen vs what does
**Workaround:** Temporary solution if available
**Priority:** Critical/High/Medium/Low based on impact
**Next Steps:** What action will be taken and by whom
```

## Learning and Adaptation

### Continuous Learning Approach
```
Learning Strategies:
1. **Learning by Doing**: Implement small projects to understand concepts
2. **Code Reading**: Study well-written open source projects
3. **Documentation Deep Dives**: Thoroughly read official documentation
4. **Community Engagement**: Participate in forums and discussions
5. **Experimentation**: Try different approaches and compare results

Knowledge Management:
- Keep notes on new concepts and techniques
- Document solutions to problems you've solved
- Create reference materials for future use
- Share learnings with team members
- Regular review and update of knowledge base
```

### Technology Evaluation
```
Evaluation Framework:
1. **Problem Fit**: Does it solve the actual problem?
2. **Learning Curve**: How much effort to become productive?
3. **Community Support**: Active development and community?
4. **Integration**: How well does it work with existing tools?
5. **Long-term Viability**: Will it be maintained and evolved?

Decision Matrix Example:
| Criteria | Weight | Option A | Option B | Option C |
|----------|--------|----------|----------|----------|
| Solves Problem | 9 | 8 | 9 | 7 |
| Easy to Learn | 7 | 9 | 6 | 8 |
| Good Support | 6 | 7 | 8 | 6 |
| Integrates Well | 8 | 6 | 8 | 9 |
| Future Proof | 7 | 8 | 7 | 7 |

Weighted scores help make objective decisions.
```

## Common Patterns and Anti-Patterns

### Design Patterns
```
**Observer Pattern**: For event handling
- Use when: Multiple components need to react to state changes
- Example: UI updates when data model changes

**Factory Pattern**: For object creation
- Use when: Creating objects with complex initialization
- Example: Creating different types of voice processors

**Strategy Pattern**: For algorithmic variations
- Use when: Multiple ways to perform the same operation
- Example: Different audio processing algorithms

**Decorator Pattern**: For extending functionality
- Use when: Adding features without modifying existing code
- Example: Adding logging to existing services
```

### Common Anti-Patterns to Avoid
```
**God Object**: Class that knows/does too much
❌ Problem: Hard to test, maintain, and understand
✅ Solution: Break into smaller, focused classes

**Copy-Paste Programming**: Duplicating code instead of reusing
❌ Problem: Multiple places to fix bugs, inconsistent behavior  
✅ Solution: Extract common functionality into shared functions

**Magic Numbers**: Hard-coded values without explanation
❌ Problem: Unclear meaning, hard to modify
✅ Solution: Use named constants with explanatory comments

**Premature Optimization**: Optimizing before measuring
❌ Problem: Complex code for unclear benefit
✅ Solution: Measure first, optimize bottlenecks
```

## Troubleshooting Methodology

### Systematic Debugging Process
```
1. **Reproduce**: Can you make it happen consistently?
2. **Isolate**: Narrow down to smallest failing case
3. **Understand**: What should happen vs what does happen?
4. **Hypothesize**: What could cause this behavior?
5. **Test**: Try to prove/disprove your hypothesis
6. **Fix**: Implement the minimal necessary change
7. **Verify**: Confirm fix works and doesn't break anything else
8. **Prevent**: Add tests or monitoring to catch similar issues

Common Debugging Techniques:
- Add logging/print statements to trace execution
- Use debugger to step through code
- Check logs for error messages and patterns
- Test with minimal reproducible case
- Compare working vs broken configurations
- Ask rubber duck (explain problem out loud)
```

### Log Analysis
```
Effective Logging Practices:
- Use appropriate log levels (ERROR, WARN, INFO, DEBUG)
- Include context (user ID, request ID, timestamps)
- Log both successes and failures
- Use structured logging (JSON) for machine processing
- Include relevant data but avoid sensitive information

Log Analysis Approach:
1. **Timeline**: When did the issue start/stop?
2. **Frequency**: How often does it occur?
3. **Patterns**: Are there common characteristics?
4. **Correlation**: What other events happened around the same time?
5. **Context**: What was different about failing cases?

Example Log Analysis:
```
ERROR 2024-01-15T10:30:15Z [req:abc123] [user:456] Voice processing failed: 
  error="STT service timeout" duration=5.2s retries=3
INFO  2024-01-15T10:30:10Z [req:abc123] [user:456] Processing voice command: 
  audio_length=2.1s sample_rate=16000
WARN  2024-01-15T10:30:12Z [stt-service] High CPU usage: cpu=95% memory=2.1GB
```

This shows a correlation between high STT service CPU usage and processing failures.
```