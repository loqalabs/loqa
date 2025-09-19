# Development Workflow for Loqa Core Architecture Migration

## Branching Strategy

This project uses a **long-lived feature branch strategy** for the architecture migration:

### Branch Structure
- **`main`** - Stable production branch (current gRPC-based system)
- **`architecture-migration`** - Long-lived integration branch for HTTP/1.1 architecture
- **Feature branches** - Individual PRs merge into `architecture-migration`

### Development Workflow

1. **Create feature branches** from `architecture-migration`:
   ```bash
   git checkout architecture-migration
   git pull origin architecture-migration
   git checkout -b feature/implement-http-transport
   ```

2. **Develop and test** your changes on the feature branch

3. **Create PRs** targeting `architecture-migration` (NOT main):
   ```bash
   gh pr create --base architecture-migration --title "Implement HTTP/1.1 transport"
   ```

4. **After PR review and merge** into `architecture-migration`

5. **Final integration** - Once ALL architecture work is complete and tested:
   ```bash
   # Create final PR from architecture-migration to main
   gh pr create --base main --head architecture-migration --title "Loqa Core Architecture Migration"
   ```

## Current Status

✅ **`architecture-migration` branch established** with foundation:
- Complete ADR (Architecture Decision Record) set
- Technical specifications (binary frames, HTTP/1.1 transport)
- Updated architecture documentation
- Benchmark validation framework
- Development tooling updates

## Next Steps

All GitHub issues for the architecture migration should be implemented as PRs targeting the `architecture-migration` branch:

- **Hub refactoring** (remove gRPC, implement HTTP/1.1)
- **Puck-go implementation** (HTTP transport, arbitration simulation)
- **Skills system** (Go plugins, JSON schema validation)
- **Commander UI updates** (new monitoring, puck status)
- **Testing infrastructure** (event replay, multi-puck testing)

## Quality Gates

Before merging `architecture-migration` to `main`:
- [ ] All GitHub issues implemented and tested
- [ ] Comprehensive integration testing
- [ ] Performance validation against tier SLAs
- [ ] ESP32 compatibility verified
- [ ] Documentation updated and complete
- [ ] Community review and approval