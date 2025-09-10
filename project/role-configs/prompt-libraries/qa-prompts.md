# QA Role Prompt Library

## Testing Strategy and Planning

### Test Strategy Framework
```
Test Strategy Components:
1. **Scope**: What will and won't be tested
2. **Approach**: Testing methodologies and techniques
3. **Resources**: People, tools, environments needed
4. **Schedule**: Testing phases and timelines
5. **Risks**: Potential issues and mitigation strategies
6. **Deliverables**: Test cases, reports, documentation

Risk-Based Testing Priority:
- High Risk: Core functionality, data integrity, security
- Medium Risk: Integration points, performance
- Low Risk: UI polish, non-critical features

Test Types by Phase:
- Unit Testing: Developer responsibility, 70% of tests
- Integration Testing: QA focus, 20% of tests  
- E2E Testing: User journey validation, 10% of tests
```

### Test Planning Template
```
# Test Plan: [Feature/Component Name]

## Test Objectives
- Primary: Validate core functionality works as specified
- Secondary: Ensure integration with existing system
- Tertiary: Verify performance meets requirements

## Test Scope
**In Scope:**
- Feature functionality as per acceptance criteria
- Integration with dependent services
- Error handling and edge cases
- Performance under normal load

**Out of Scope:**
- Load testing beyond normal usage
- Security penetration testing (separate activity)
- Legacy system compatibility

## Test Approach
- Manual testing for user experience validation
- Automated testing for regression prevention
- Performance testing for response time validation
- Exploratory testing for edge case discovery

## Entry Criteria
- [ ] Feature development complete
- [ ] Unit tests passing
- [ ] Test environment available
- [ ] Test data prepared

## Exit Criteria
- [ ] All test cases executed
- [ ] No critical or high-priority bugs
- [ ] Performance requirements met
- [ ] Documentation updated
```

## Test Case Design Techniques

### Equivalence Partitioning
```
Example: Voice Command Length Validation

Valid Partitions:
- Short commands: 1-10 words
- Medium commands: 11-25 words  
- Long commands: 26-50 words

Invalid Partitions:
- Empty input: 0 words
- Excessive length: 51+ words
- Non-speech input: noise, music

Test Cases:
1. Valid short: "Turn on lights" (3 words)
2. Valid medium: "Set living room temperature to 72 degrees and turn on the fan" (13 words)
3. Valid long: [25+ word command]
4. Invalid empty: "" (empty string)
5. Invalid excessive: [60+ word command]
6. Invalid non-speech: [background music audio]
```

### Boundary Value Analysis
```
Example: Audio Processing Sample Rate

Boundaries:
- Minimum: 8000 Hz (telephone quality)
- Standard: 16000 Hz (voice recognition)
- High: 44100 Hz (CD quality)
- Maximum: 48000 Hz (professional audio)

Test Cases:
1. Below minimum: 7999 Hz (should reject)
2. Minimum boundary: 8000 Hz (should accept)
3. Just above minimum: 8001 Hz (should accept)
4. Standard rate: 16000 Hz (should accept)
5. Maximum boundary: 48000 Hz (should accept)
6. Above maximum: 48001 Hz (should reject or downscale)
```

### State-Based Testing
```
Voice Assistant State Machine:

States: Idle → Listening → Processing → Responding → Idle

Test Scenarios:
1. Happy Path: Idle → wake word → Listening → command → Processing → response → Responding → Idle
2. Timeout: Idle → wake word → Listening → [no command] → timeout → Idle
3. Error: Idle → wake word → Listening → command → Processing → error → Idle
4. Interrupt: Any state → wake word → Listening (interrupt current operation)

State Transition Test Matrix:
| From State | Event | Expected To State | Test Case |
|------------|-------|-------------------|-----------|
| Idle | Wake word | Listening | TC001 |
| Listening | Voice command | Processing | TC002 |
| Processing | Processing complete | Responding | TC003 |
| Responding | Response complete | Idle | TC004 |
| Any | Error | Idle | TC005 |
```

## Test Automation Frameworks

### Testing Pyramid for Loqa
```
**Unit Tests (70%)**
- Individual function testing
- Mock external dependencies
- Fast execution (< 1 second)
- Run on every commit

Go Unit Test Example:
func TestProcessVoiceCommand(t *testing.T) {
    tests := []struct {
        name     string
        input    string
        expected CommandType
        wantErr  bool
    }{
        {"turn on lights", "turn on the lights", LightControl, false},
        {"weather query", "what's the weather", WeatherQuery, false},
        {"invalid command", "xyz123", Unknown, true},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result, err := ProcessVoiceCommand(tt.input)
            if tt.wantErr && err == nil {
                t.Error("expected error but got none")
            }
            if result.Type != tt.expected {
                t.Errorf("expected %v, got %v", tt.expected, result.Type)
            }
        })
    }
}
```

### Integration Testing Patterns
```
**Service Integration Tests (20%)**
- Test service-to-service communication
- Use real external services or reliable mocks
- Validate data flow and transformations
- Medium execution time (5-30 seconds)

Example: Hub-to-STT Service Integration
func TestSTTServiceIntegration(t *testing.T) {
    // Setup
    sttService := NewSTTService(testConfig)
    audioFile := loadTestAudio("test-command.wav")
    
    // Execute
    result, err := sttService.Transcribe(audioFile)
    
    // Verify
    assert.NoError(t, err)
    assert.Contains(t, result.Text, "turn on lights")
    assert.GreaterThan(t, result.Confidence, 0.8)
    assert.WithinDuration(t, time.Now(), result.Timestamp, 5*time.Second)
}

**E2E Tests (10%)**
- Full user journey testing
- Test complete workflows
- Use real services and data
- Slow execution (30+ seconds)
- Focus on critical user paths
```

### Test Data Management
```
Test Data Categories:
1. **Static Test Data**: Pre-defined, version-controlled
   - Valid voice commands for different intents
   - Sample audio files for different scenarios
   - Expected response templates

2. **Generated Test Data**: Created programmatically
   - Large datasets for performance testing
   - Edge case combinations
   - Random but valid input variations

3. **Production-like Data**: Sanitized real data
   - Anonymized user commands
   - Real audio samples (with consent)
   - Performance baselines

Test Data Storage:
/tests/
├── data/
│   ├── audio-samples/
│   │   ├── clear-commands/
│   │   ├── noisy-environments/
│   │   └── different-accents/
│   ├── expected-responses/
│   └── performance-baselines/
├── fixtures/
└── generators/
```

## Performance Testing

### Performance Test Types
```
1. **Load Testing**: Normal expected load
   - Concurrent users: 10-50
   - Duration: 30 minutes
   - Verify system handles normal traffic

2. **Stress Testing**: Beyond normal capacity
   - Concurrent users: 100-500
   - Duration: 15 minutes
   - Find breaking point and behavior under stress

3. **Spike Testing**: Sudden traffic increases
   - Ramp up from 10 to 100 users in 30 seconds
   - Verify auto-scaling and graceful handling

4. **Volume Testing**: Large amounts of data
   - Process 1000+ voice commands
   - Large audio files (5+ minutes)
   - Verify memory usage and processing time

5. **Endurance Testing**: Extended periods
   - Normal load for 2-8 hours
   - Check for memory leaks and degradation
```

### Performance Testing with k6
```javascript
// performance-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

export default function() {
  // Test voice processing endpoint
  let payload = JSON.stringify({
    audio: 'base64_encoded_audio_data',
    format: 'wav',
    sampleRate: 16000
  });
  
  let params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  let response = http.post('http://localhost:3000/api/voice/process', payload, params);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has transcription': (r) => JSON.parse(r.body).transcription !== '',
  });
  
  sleep(1); // Wait 1 second between requests
}
```

## Bug Tracking and Management

### Bug Report Template
```
# Bug Report: [Short Description]

## Summary
Brief description of the issue

## Environment
- **OS**: macOS 14.0 / Ubuntu 22.04 / Windows 11
- **Browser**: Chrome 118.0 (if applicable)
- **Version**: Loqa v1.2.3
- **Environment**: Development / Staging / Production

## Steps to Reproduce
1. Start the Loqa system
2. Say wake word "Hey Loqa"
3. Give command "turn on bedroom lights"
4. Observe the result

## Expected Behavior
The bedroom lights should turn on and the system should respond with confirmation.

## Actual Behavior
The system responds with "I don't understand" and no lights are affected.

## Evidence
- Screenshots: [attach if applicable]
- Audio recordings: [if voice-related issue]
- Log files: [relevant log excerpts]
- Network traces: [if integration issue]

## Impact
- **Severity**: Critical / High / Medium / Low
- **Priority**: P1 / P2 / P3 / P4
- **User Impact**: How many users affected?
- **Business Impact**: Revenue/reputation impact?

## Additional Information
- First occurrence: 2024-01-15 14:30 UTC
- Frequency: Occurs every time / intermittent
- Related issues: #123, #456
- Workaround: [if available]
```

### Bug Classification
```
**Severity Classification:**
- **Critical**: System crash, data loss, security vulnerability
- **High**: Core functionality broken, user can't complete main tasks
- **Medium**: Feature works but with issues, user can find workaround
- **Low**: Cosmetic issues, minor inconvenience

**Priority Classification:**
- **P1**: Fix immediately, block release
- **P2**: Fix before next release
- **P3**: Fix in upcoming release
- **P4**: Fix when time permits

**Bug Categories:**
- **Functional**: Feature doesn't work as specified
- **Performance**: Slow response, resource usage issues
- **Integration**: Service communication problems
- **Usability**: User experience problems
- **Compatibility**: Works on some platforms but not others
```

## Test Metrics and Reporting

### Test Metrics Dashboard
```
**Coverage Metrics:**
- Code Coverage: Lines/branches covered by tests
- Feature Coverage: Features with automated tests
- Scenario Coverage: User scenarios tested

**Quality Metrics:**
- Defect Density: Bugs per thousand lines of code
- Defect Removal Efficiency: Bugs found in testing vs production
- Mean Time to Resolution: Average time to fix bugs

**Test Execution Metrics:**
- Test Pass Rate: Percentage of tests passing
- Test Execution Time: Time to run full test suite
- Flaky Test Rate: Tests with inconsistent results

**Performance Metrics:**
- Response Time: 95th percentile response times
- Throughput: Requests handled per second
- Error Rate: Percentage of failed requests
```

### Test Reporting Template
```
# Test Report: [Release/Sprint Name]

## Executive Summary
- **Testing Period**: 2024-01-15 to 2024-01-22
- **Overall Status**: ✅ Ready for Release / ⚠️ Issues Found / ❌ Not Ready
- **Critical Issues**: 0 open, 2 resolved
- **Recommendation**: Proceed with release / Address issues first

## Test Execution Summary
| Test Type | Planned | Executed | Passed | Failed | Blocked |
|-----------|---------|----------|---------|---------|---------|
| Unit Tests | 450 | 450 | 447 | 3 | 0 |
| Integration | 75 | 75 | 72 | 3 | 0 |
| E2E Tests | 25 | 25 | 23 | 2 | 0 |
| **Total** | **550** | **550** | **542** | **8** | **0** |

## Bug Summary
| Severity | Open | Resolved | Total Found |
|----------|------|----------|-------------|
| Critical | 0 | 2 | 2 |
| High | 1 | 4 | 5 |
| Medium | 3 | 8 | 11 |
| Low | 5 | 12 | 17 |
| **Total** | **9** | **26** | **35** |

## Performance Test Results
- **Load Test**: ✅ Passed (10-50 concurrent users)
- **Average Response Time**: 245ms (target: <500ms)
- **95th Percentile**: 480ms (target: <1000ms)
- **Error Rate**: 0.2% (target: <1%)
- **Throughput**: 125 req/sec (target: >100 req/sec)

## Risk Assessment
**High Risk Areas:**
- Voice recognition accuracy in noisy environments
- Performance under sustained load (needs monitoring)

**Medium Risk Areas:**
- Integration with new smart home devices
- Mobile app compatibility with older iOS versions

**Recommendations:**
1. Monitor voice recognition metrics closely after release
2. Implement gradual rollout for new device integrations
3. Add automated performance regression tests
```

## Acceptance Testing

### User Acceptance Testing (UAT)
```
UAT Planning:
1. **User Story Validation**: Each story has acceptance criteria
2. **Test Scenario Creation**: Real-world usage scenarios  
3. **User Involvement**: Actual end-users test the system
4. **Environment Setup**: Production-like test environment
5. **Success Criteria**: Clear definition of "acceptance"

UAT Test Scenarios for Voice Assistant:
1. **Daily Usage Scenario**: 
   - Morning routine: Weather, calendar, lights
   - Throughout day: Music, reminders, smart home control
   - Evening: News, lights off, security check

2. **First-time User Scenario**:
   - Initial setup and configuration
   - Learning basic commands
   - Discovering available features

3. **Error Handling Scenario**:
   - Handling unclear voice commands
   - Network connectivity issues
   - Device unavailability responses

4. **Accessibility Scenario**:
   - Usage with different accents
   - Hearing impaired user alternatives
   - Visual feedback for voice interactions
```

### Acceptance Criteria Validation
```
Feature: Voice Command Processing

Scenario: User gives lighting control command
Given the voice assistant is active and listening
When the user says "turn on bedroom lights"
Then the system should:
  ✅ Recognize the command within 2 seconds
  ✅ Send control signal to bedroom light switch
  ✅ Confirm action with voice response "Bedroom lights turned on"
  ✅ Update the home automation interface status
  ✅ Log the action for user review

Validation Checklist:
- [ ] Functional requirements met
- [ ] Performance requirements satisfied
- [ ] Error handling works correctly
- [ ] User interface is intuitive
- [ ] Integration points function properly
- [ ] Security requirements addressed
- [ ] Accessibility requirements met
```

## Quality Assurance Process

### QA Workflow Integration
```
Development Workflow with QA Gates:

1. **Code Review Gate**:
   - QA reviews code changes for testability
   - Identifies potential test scenarios
   - Suggests automation opportunities

2. **Feature Testing Gate**:
   - Functional testing of new features
   - Integration testing with existing system
   - User experience validation

3. **Regression Testing Gate**:
   - Automated regression test execution
   - Manual testing of critical user paths
   - Performance regression checks

4. **Release Readiness Gate**:
   - Final validation of release criteria
   - Sign-off on quality metrics
   - Risk assessment for production release
```

### Continuous Quality Improvement
```
Quality Metrics Review (Weekly):
- Test automation coverage trends
- Bug discovery and resolution rates
- Test execution time optimization
- Flaky test identification and fixes

Process Improvement (Monthly):
- Retrospective on testing practices
- Tool evaluation and upgrades
- Training needs assessment
- Best practices documentation updates

Quality Standards (Quarterly):
- Review and update quality gates
- Benchmark against industry standards
- Assess team skill development
- Plan testing infrastructure improvements
```