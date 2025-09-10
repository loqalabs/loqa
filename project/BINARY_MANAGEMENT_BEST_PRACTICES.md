# Binary Management Best Practices

**Date**: 2025-09-09  
**Context**: Repository hygiene improvements across Loqa ecosystem

## Overview

This document establishes best practices for managing compiled binaries across all Loqa repositories to maintain repository hygiene, security, and development consistency.

## ❌ What NOT to Commit

### Never Commit These Binary Types:
- **Compiled Go binaries** (`*.exe`, executable files without extension)
- **Test binaries** (built with `go test -c`)  
- **Platform-specific executables** (Linux, Windows, macOS binaries)
- **Debug/development binaries** (profiling, debugging tools)
- **Third-party binaries** (downloaded tools, dependencies)

### Examples from Recent Cleanup:
```bash
# These were removed from repositories:
loqa-hub/loqa-hub-test          # Test binary
loqa-hub/skills-cli             # CLI tool binary
loqa-relay/test-go/test-puck    # Test relay binary
```

## ✅ Recommended Approach

### 1. Local Building
Binaries should be built locally by developers:

```bash
# Build main service
go build -o bin/hub ./cmd

# Build CLI tools
go build -o skills-cli ./cmd/skills-cli

# Build and run tests
go test ./...
go test -c -o integration.test ./tests/integration
```

### 2. Build Scripts and Makefiles
Provide consistent build commands:

```makefile
# Makefile example
build:
	go build -o bin/$(BINARY_NAME) ./cmd

test:
	go test ./...

clean:
	rm -rf bin/
	rm -f *.test

.PHONY: build test clean
```

### 3. Container-Based Distribution
Use Docker for distributing built applications:

```dockerfile
# Multi-stage build
FROM golang:1.25-alpine AS builder
COPY . .
RUN go build -o app ./cmd

FROM alpine:latest
COPY --from=builder /app /usr/local/bin/
CMD ["app"]
```

## 🔧 .gitignore Configuration

### Standard Go .gitignore Patterns

```gitignore
# Build artifacts
bin/
build/
dist/

# Go binaries
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binaries
*.test

# Specific binary names (customize per repository)
hub
relay
skills-cli
test-puck
```

### Repository-Specific Additions

Each repository should add its specific binary names:

**loqa-hub/.gitignore:**
```gitignore
# Compiled binaries (should not be committed)
loqa-hub-test
skills-cli
hub
loqa-hub
loqa-hub-stub
test-static
test-hub
```

**loqa-relay/.gitignore:**
```gitignore
# Go binaries (including test binaries)
test-relay
test-go/test-relay
test-go/test-puck
test-puck
relay
```

## 🏗️ CI/CD Integration

### Build Validation
Ensure binaries can be built in CI:

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.25'
      
      - name: Build binaries
        run: |
          go build -o bin/hub ./cmd
          go build -o bin/skills-cli ./cmd/skills-cli
      
      - name: Verify no binaries committed
        run: |
          if git ls-files | grep -E '\.(exe|test)$|^bin/'; then
            echo "ERROR: Binaries found in git tracking"
            exit 1
          fi
```

### Release Artifacts
Build and attach binaries to releases only:

```yaml
# .github/workflows/release.yml
- name: Build release binaries
  run: |
    GOOS=linux GOARCH=amd64 go build -o hub-linux-amd64 ./cmd
    GOOS=darwin GOARCH=amd64 go build -o hub-darwin-amd64 ./cmd
    GOOS=windows GOARCH=amd64 go build -o hub-windows-amd64.exe ./cmd

- name: Upload release assets
  uses: actions/upload-release-asset@v1
  # ... upload built binaries
```

## 🔐 Security Considerations

### Why Binary Commits Are Risky:
1. **Embedded Secrets**: Binaries may contain configuration or API keys
2. **Supply Chain**: Hard to verify the source code that produced the binary
3. **Platform Dependency**: Architecture-specific binaries don't work everywhere
4. **Size Bloat**: Binary files make repositories slow to clone

### Security Best Practices:
- **Build from source**: Always build binaries from current source
- **Verify builds**: Use reproducible builds when possible
- **Scan binaries**: Run security scans on built binaries (not committed ones)
- **Sign releases**: Sign official release binaries for distribution

## 📋 Implementation Checklist

### For Existing Repositories:
- [ ] Audit current repository for committed binaries
- [ ] Update .gitignore with specific binary names
- [ ] Remove committed binaries: `git rm binary-name`
- [ ] Add build instructions to README
- [ ] Update CI/CD to build and test binaries
- [ ] Validate cleanup: `git ls-files | grep -E 'binary-pattern'`

### For New Repositories:
- [ ] Start with comprehensive .gitignore
- [ ] Add Makefile with build targets
- [ ] Configure CI/CD to build binaries
- [ ] Document local build process
- [ ] Set up release artifact pipeline

## 🔄 Migration Process

### Repository Cleanup Steps:

1. **Identify committed binaries:**
   ```bash
   find . -type f -exec file {} \; | grep -E "(executable|binary)"
   git ls-files | xargs file | grep -E "(executable|binary)"
   ```

2. **Update .gitignore before removal:**
   ```bash
   echo "binary-name" >> .gitignore
   git add .gitignore
   ```

3. **Remove from git tracking:**
   ```bash
   git rm binary-name
   git commit -m "Remove committed binary and update .gitignore"
   ```

4. **Validate cleanup:**
   ```bash
   git ls-files | xargs file | grep -E "(executable|binary)" || echo "✅ Clean"
   ```

## 📊 Benefits

### Repository Health:
- **Smaller size**: Faster clones and reduced storage
- **Platform independence**: Works on any architecture
- **Version control efficiency**: Git tracks source code, not build artifacts

### Security:
- **No embedded secrets**: Binaries built with current configuration
- **Supply chain integrity**: Verifiable builds from source
- **Audit trail**: Clear separation of source and build artifacts

### Development Workflow:
- **Consistent builds**: Everyone builds from the same source
- **Local development**: Developers control their build environment
- **CI/CD validation**: Automated verification that code builds correctly

## 📝 Current Status

### Completed Cleanup (2025-09-09):
- ✅ **loqa-hub**: Removed `loqa-hub-test`, `skills-cli` → [PR #34](https://github.com/loqalabs/loqa-hub/pull/34)
- ✅ **loqa-relay**: Removed `test-go/test-puck` → [PR #8](https://github.com/loqalabs/loqa-relay/pull/8)
- ✅ **loqa-skills**: No committed binaries found

### Ongoing Monitoring:
- CI/CD checks prevent future binary commits
- Regular audits during code reviews
- Developer education on build practices

---

**Note**: This cleanup is part of the broader repository hygiene improvements across the Loqa ecosystem, ensuring best practices are followed consistently across all services.