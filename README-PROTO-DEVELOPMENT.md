# Protocol Development Workflow

This document explains the improved protocol buffer development workflow for the Loqa ecosystem.

## 🎯 Problem Solved

Previously, testing protocol changes required:
1. Making changes in `loqa-proto`
2. Creating a GitHub release to get a version number
3. Updating consuming services to use the new version
4. Testing - but if issues were found, repeating the entire process

This created a chicken-and-egg problem for testing proto changes before finalizing them.

## ✅ New Solution: Development Mode

The new workflow allows testing proto changes across all services BEFORE creating releases:

### 🚀 Quick Start

```bash
# 1. Make protocol changes
cd loqa-proto
vim audio.proto
./generate.sh

# 2. Enable development mode for all services
./loqa/tools/proto-dev-mode.sh dev

# 3. Test changes across services
cd loqa-hub && make quality-check
cd ../loqa-relay && make test

# 4. When ready, switch back and release
./loqa/tools/proto-dev-mode.sh prod
cd loqa-proto && git tag v0.0.19 && git push origin v0.0.19
```

## 📋 Available Commands

### Universal Script (Recommended)
```bash
./loqa/tools/proto-dev-mode.sh dev        # Enable dev mode for all services
./loqa/tools/proto-dev-mode.sh prod       # Enable prod mode for all services
./loqa/tools/proto-dev-mode.sh status     # Show current mode for all services

# Target specific services
./loqa/tools/proto-dev-mode.sh dev loqa-hub     # Only hub service
./loqa/tools/proto-dev-mode.sh prod loqa-relay  # Only relay service
```

### Individual Service Scripts
```bash
cd loqa-hub && ./scripts/proto-dev-mode.sh dev
cd loqa-relay && ./scripts/proto-dev-mode.sh prod
```

## 🔧 How It Works

### Development Mode
- Uses `replace` directives in `go.mod` files
- Points to local `../loqa-proto/go` directory
- Allows testing unreleased protocol changes

### Production Mode  
- Comments out `replace` directives
- Uses released versions from GitHub
- Standard dependency management

### Example go.mod in Development Mode
```go
require (
    github.com/loqalabs/loqa-proto/go v0.0.18
)

// Development mode: Using local proto changes for testing
replace github.com/loqalabs/loqa-proto/go => ../loqa-proto/go
```

### Example go.mod in Production Mode
```go
require (
    github.com/loqalabs/loqa-proto/go v0.0.18
)

// Development mode: Uncomment the line below to use local proto changes for testing  
// replace github.com/loqalabs/loqa-proto/go => ../loqa-proto/go
```

## 📖 Complete Development Workflow

### 1. Making Protocol Changes
```bash
cd loqa-proto
git checkout -b feature/new-audio-fields
vim audio.proto
./generate.sh
make validate
```

### 2. Cross-Service Testing
```bash
# Enable dev mode for all services
./loqa/tools/proto-dev-mode.sh dev

# Test each service
cd loqa-hub
make quality-check
go test ./...

cd ../loqa-relay  
make test
go build -o bin/relay ./test-go/cmd

# Integration testing
cd ../loqa-hub/tests/integration
go test -v

# End-to-end testing
cd ../e2e
go test -v
```

### 3. Release Process
```bash
# Switch back to production mode
./loqa/tools/proto-dev-mode.sh prod

# Release new proto version
cd loqa-proto
git push origin feature/new-audio-fields
# Create PR and merge to main
git checkout main && git pull
git tag v0.0.19
git push origin v0.0.19

# Update consuming services
cd ../loqa-hub
go get github.com/loqalabs/loqa-proto/go@v0.0.19
git add go.mod go.sum
git commit -m "Update to proto v0.0.19"

cd ../loqa-relay
go get github.com/loqalabs/loqa-proto/go@v0.0.19  
git add test-go/go.mod test-go/go.sum
git commit -m "Update to proto v0.0.19"
```

## 🎯 Benefits

- ✅ **Test before release** - Validate proto changes across all services
- ✅ **Faster iteration** - No need for GitHub releases during development
- ✅ **Safe rollback** - Easy switch between dev/prod modes
- ✅ **Version consistency** - Ensures all services use compatible versions
- ✅ **CI/CD friendly** - Scripts work in automated environments

## 🔄 Future Improvements (Planned)

### Phase 2: Automation
- Automated proto releases on main branch pushes
- Proto validation CI across consuming services  
- Integration test matrix for service combinations

### Phase 3: Advanced Features
- Go workspace approach for tighter integration
- Semantic versioning based on proto changes
- Breaking change detection and alerts

## ⚠️ Important Notes

1. **Always use production mode for commits** - Never commit with development mode enabled
2. **Coordinate releases** - Follow dependency order: proto → hub → relay
3. **Test thoroughly** - Use development mode for comprehensive testing before releases
4. **Clean state** - Protocol generation requires clean git working directory

## 🤝 Contributing

When making protocol changes:

1. Create feature branch in `loqa-proto`
2. Make changes and test with development mode
3. Create coordinated PRs across affected services
4. Merge in dependency order: proto → consuming services

For questions or issues with the development workflow, refer to the individual service `CLAUDE.md` files or create an issue in the relevant repository.