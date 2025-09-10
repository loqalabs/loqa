# Developer Role Prompt Library

## Core Development Principles

### Clean Code Guidelines
```
SOLID Principles:
- Single Responsibility: Each function/class has one reason to change
- Open/Closed: Open for extension, closed for modification
- Liskov Substitution: Subtypes must be substitutable for base types
- Interface Segregation: Many specific interfaces > one general interface
- Dependency Inversion: Depend on abstractions, not concretions

Code Quality Checklist:
- [ ] Functions are small and focused (< 20 lines ideal)
- [ ] Variable names are descriptive and unambiguous
- [ ] Complex logic is broken down into smaller functions
- [ ] Edge cases and error conditions are handled
- [ ] Comments explain "why", not "what"
```

### Test-Driven Development (TDD)
```
TDD Cycle: Red -> Green -> Refactor

1. **Red**: Write a failing test first
   - Test should be specific and focused
   - Should test one behavior/requirement
   - Should have a clear assertion

2. **Green**: Write minimal code to pass
   - Don't over-engineer the solution
   - Focus on making the test pass
   - Hardcode values if needed initially

3. **Refactor**: Improve code while keeping tests green
   - Extract common patterns
   - Improve naming and structure
   - Optimize performance if needed
```

## Language-Specific Best Practices

### Go Development (loqa-hub, loqa-relay, loqa-skills)
```
Go Idioms:
- Use interfaces for behavior, structs for data
- Handle errors explicitly, don't ignore them
- Use channels for communication, mutexes for state
- Keep interfaces small (1-3 methods ideal)
- Use context.Context for cancellation and timeouts

Error Handling Pattern:
if err != nil {
    return fmt.Errorf("operation failed: %w", err)
}

Testing Patterns:
func TestFeature(t *testing.T) {
    tests := []struct {
        name     string
        input    InputType
        expected ExpectedType
        wantErr  bool
    }{
        // test cases
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // test implementation
        })
    }
}
```

### JavaScript/TypeScript (loqa-commander, www-loqalabs-com)
```
Modern JavaScript Patterns:
- Use const/let instead of var
- Prefer arrow functions for callbacks
- Use async/await instead of promises chains
- Destructure objects and arrays for cleaner code
- Use optional chaining (?.) for safe property access

Vue.js 3 Composition API:
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

onMounted(() => {
  // component initialization
})
</script>

Testing with Vitest:
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

describe('Component', () => {
  it('should render correctly', () => {
    const wrapper = mount(Component, { props: {} })
    expect(wrapper.text()).toContain('expected text')
  })
})
```

## Debugging Methodologies

### Systematic Debugging Process
```
1. **Reproduce**: Can you consistently reproduce the issue?
2. **Isolate**: Narrow down to the smallest failing case
3. **Hypothesize**: What could be causing this behavior?
4. **Test**: Validate or disprove your hypothesis
5. **Fix**: Implement the minimal fix
6. **Verify**: Ensure fix works and doesn't break anything else
7. **Prevent**: Add tests to prevent regression

Debugging Tools:
- Go: delve debugger, pprof profiler, race detector
- JavaScript: Browser dev tools, Node.js inspector
- General: Logging, distributed tracing, metrics
```

### Common Bug Categories
```
**Logic Errors**
- Off-by-one errors in loops and arrays
- Incorrect boolean logic (AND vs OR)
- Missing edge case handling

**Concurrency Issues** 
- Race conditions in shared state
- Deadlocks from incorrect lock ordering
- Resource leaks from unclosed channels/connections

**Integration Problems**
- API version mismatches
- Network timeouts and retries
- Data serialization/deserialization issues

**Performance Issues**
- N+1 database queries
- Memory leaks from retained references
- Inefficient algorithms or data structures
```

## Code Review Best Practices

### Review Checklist
```
**Functionality**
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled appropriately
- [ ] Error handling is comprehensive
- [ ] Performance is acceptable

**Code Quality**
- [ ] Code is readable and well-structured
- [ ] Functions are appropriately sized
- [ ] Variable names are descriptive
- [ ] No code duplication

**Testing**
- [ ] Unit tests cover new functionality
- [ ] Tests are clear and maintainable
- [ ] Integration tests if needed
- [ ] No tests were broken or removed without justification

**Security & Safety**
- [ ] Input validation is present
- [ ] No hardcoded secrets or credentials
- [ ] SQL injection and XSS prevention
- [ ] Proper error messages (don't leak internals)
```

### Giving Effective Code Review Feedback
```
**Be Specific and Constructive**
❌ "This is bad"
✅ "Consider extracting this 50-line function into smaller, focused functions"

**Explain the Why**
❌ "Use a map here"
✅ "A map would be more efficient for lookups (O(1) vs O(n))"

**Offer Alternatives**
❌ "This won't work"
✅ "This approach might have issues with X. What about trying Y instead?"

**Distinguish Must-Fix vs Nice-to-Have**
- 🚨 CRITICAL: Security vulnerabilities, broken functionality
- ⚠️  IMPORTANT: Performance issues, maintainability problems  
- 💡 SUGGESTION: Style improvements, minor optimizations
```

## Performance Optimization

### Profiling and Measurement
```
"Premature optimization is the root of all evil" - Donald Knuth

Process:
1. **Measure first**: Use profiling tools to identify bottlenecks
2. **Focus on hotspots**: 80/20 rule - optimize the 20% that matters
3. **Benchmark changes**: Measure before and after improvements
4. **Consider trade-offs**: Performance vs maintainability vs complexity

Go Profiling:
import _ "net/http/pprof"
// go tool pprof http://localhost:6060/debug/pprof/profile

JavaScript Profiling:
- Chrome DevTools Performance tab
- Node.js --prof flag
- Memory usage with heapdump
```

### Common Optimization Patterns
```
**Algorithmic Improvements**
- Use appropriate data structures (map vs slice for lookups)
- Cache expensive computations
- Batch operations to reduce overhead
- Use streaming for large datasets

**Database Optimizations**
- Add indexes for frequently queried columns
- Use prepared statements to avoid SQL parsing
- Batch inserts/updates when possible
- Consider read replicas for heavy read workloads

**Network Optimizations**
- Connection pooling for HTTP clients
- Compression for large payloads
- CDN for static assets
- Caching at multiple levels
```

## Error Handling Patterns

### Go Error Handling
```
// Wrap errors for context
func processFile(filename string) error {
    file, err := os.Open(filename)
    if err != nil {
        return fmt.Errorf("failed to open file %s: %w", filename, err)
    }
    defer file.Close()
    
    // ... processing
    
    if err := process(data); err != nil {
        return fmt.Errorf("failed to process data: %w", err)
    }
    
    return nil
}

// Custom error types for different handling
type ValidationError struct {
    Field string
    Value interface{}
}

func (e ValidationError) Error() string {
    return fmt.Sprintf("invalid value %v for field %s", e.Value, e.Field)
}
```

### JavaScript Error Handling
```
// Async/await error handling
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw new Error(`Unable to load user ${userId}: ${error.message}`);
  }
}

// Error boundaries in Vue.js
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue error:', error, info);
  // Send to error reporting service
};
```

## API Design Guidelines

### RESTful API Design
```
Resource-oriented URLs:
✅ GET /api/users/123
✅ POST /api/users
✅ PUT /api/users/123
✅ DELETE /api/users/123

❌ GET /api/getUser/123
❌ POST /api/createUser
❌ POST /api/deleteUser/123

HTTP Status Codes:
- 200: Success with response body
- 201: Created successfully
- 204: Success with no response body
- 400: Bad request (client error)
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Internal server error
```

### gRPC Service Design
```
Service Definition Best Practices:
- Use clear, descriptive service and method names
- Version your APIs (v1, v2) for breaking changes
- Include proper error handling with status codes
- Use streaming for large data transfers
- Document expected behavior and error conditions

Example:
service VoiceService {
  rpc ProcessAudio(stream AudioChunk) returns (TranscriptionResult);
  rpc GetTranscription(TranscriptionRequest) returns (TranscriptionResponse);
  rpc ListTranscriptions(ListRequest) returns (ListResponse);
}
```

## Testing Strategies

### Unit Testing Best Practices
```
Test Structure (AAA Pattern):
func TestCalculateTotal(t *testing.T) {
    // Arrange
    items := []Item{
        {Price: 10.00, Quantity: 2},
        {Price: 5.00, Quantity: 1},
    }
    
    // Act
    total := CalculateTotal(items)
    
    // Assert
    expected := 25.00
    if total != expected {
        t.Errorf("Expected %v, got %v", expected, total)
    }
}

Test Categories:
- Happy path: Normal, expected usage
- Edge cases: Boundary conditions, empty inputs
- Error cases: Invalid inputs, system failures
- Performance: Large datasets, concurrent usage
```

### Integration Testing
```
Integration Test Patterns:
1. **Database Integration**: Test with real database
2. **API Integration**: Test HTTP endpoints end-to-end
3. **Service Integration**: Test service-to-service communication
4. **External Integration**: Test third-party service integration

Go Integration Test Example:
func TestUserAPI(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer cleanupDB(db)
    
    server := NewServer(db)
    testServer := httptest.NewServer(server)
    defer testServer.Close()
    
    // Test API endpoints
    resp, err := http.Post(testServer.URL+"/users", "application/json", 
        strings.NewReader(`{"name": "test user"}`))
    // assertions...
}
```

## Documentation Guidelines

### Code Documentation
```
Go Documentation:
// Package voice provides voice processing capabilities for the Loqa system.
// It handles speech-to-text conversion, intent recognition, and response generation.
package voice

// ProcessAudio converts audio input to text and extracts user intent.
// It returns the transcribed text and identified intent, or an error if
// processing fails.
func ProcessAudio(audio []byte) (*Result, error) {
    // implementation
}

JavaScript Documentation (JSDoc):
/**
 * Processes user voice commands and returns structured responses
 * @param {ArrayBuffer} audioData - Raw audio data from microphone
 * @param {Object} options - Processing options
 * @param {number} options.sampleRate - Audio sample rate in Hz
 * @returns {Promise<ProcessingResult>} Processed voice command result
 * @throws {ValidationError} When audio data is invalid
 */
async function processVoiceCommand(audioData, options = {}) {
    // implementation
}
```

### API Documentation
```
OpenAPI/Swagger for REST APIs:
paths:
  /api/transcriptions:
    post:
      summary: Create a new transcription
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                audio:
                  type: string
                  format: binary
      responses:
        '200':
          description: Transcription successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TranscriptionResult'
```