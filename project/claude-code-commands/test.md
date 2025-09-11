---
description: "Run comprehensive cross-service integration tests with Docker orchestration"
allowed_tools: ["mcp__loqa-assistant__run_integration_tests"]
---

# Run Integration Tests

Execute comprehensive integration tests across Loqa services with Docker orchestration:

$ARGUMENTS

Please use the MCP function `mcp__loqa-assistant__run_integration_tests` with the following parameters parsed from the arguments above:

- **repositories**: Specific repositories to test (if provided as `--repositories=...`, defaults to core integration repos)
- **testSuites**: Test suites to run (if provided as `--testSuites=...`, options: integration, e2e, defaults to both)
- **dockerCompose**: Use Docker Compose orchestration (if provided as `--dockerCompose=false`, defaults to true)
- **cleanup**: Cleanup Docker services after testing (if provided as `--cleanup=false`, defaults to true)

This command automatically starts required services (hub, stt, tts, ollama, nats) and runs tests in proper dependency order.

Examples:
- `/test` - Run all integration tests with Docker
- `/test --repositories=loqa-hub,loqa-relay` - Test specific services
- `/test --testSuites=integration` - Run only integration tests
- `/test --cleanup=false` - Skip cleanup for debugging