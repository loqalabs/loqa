# Third-Party License Compliance

This document provides an overview of third-party dependencies used in the Loqa project and their license compatibility with our AGPLv3 license.

## License Compatibility Summary

**Status: ✅ ALL DEPENDENCIES ARE COMPATIBLE WITH AGPLv3**

All third-party dependencies use permissive licenses (MIT, BSD-3-Clause, Apache 2.0) that are fully compatible with the GNU Affero General Public License v3.0.

## Dependencies by Repository

### loqa-hub

| Dependency | License | Compatibility |
|------------|---------|---------------|
| `github.com/nats-io/nats.go` | Apache 2.0 | ✅ Compatible |
| `google.golang.org/grpc` | Apache 2.0 | ✅ Compatible |
| `github.com/klauspost/compress` | Apache 2.0/BSD/MIT | ✅ Compatible |
| `github.com/nats-io/nkeys` | Apache 2.0 | ✅ Compatible |
| `github.com/nats-io/nuid` | Apache 2.0 | ✅ Compatible |
| `golang.org/x/*` | BSD-3-Clause | ✅ Compatible |
| `google.golang.org/protobuf` | BSD-3-Clause | ✅ Compatible |

### loqa-device-service

| Dependency | License | Compatibility |
|------------|---------|---------------|
| `github.com/nats-io/nats.go` | Apache 2.0 | ✅ Compatible |
| `github.com/klauspost/compress` | Apache 2.0/BSD/MIT | ✅ Compatible |
| `github.com/nats-io/nkeys` | Apache 2.0 | ✅ Compatible |
| `github.com/nats-io/nuid` | Apache 2.0 | ✅ Compatible |
| `golang.org/x/*` | BSD-3-Clause | ✅ Compatible |

### loqa-relay

| Dependency | License | Compatibility |
|------------|---------|---------------|
| `github.com/gordonklaus/portaudio` | MIT | ✅ Compatible |
| `google.golang.org/grpc` | Apache 2.0 | ✅ Compatible |
| `golang.org/x/*` | BSD-3-Clause | ✅ Compatible |
| `google.golang.org/protobuf` | BSD-3-Clause | ✅ Compatible |

### loqa-proto

| Dependency | License | Compatibility |
|------------|---------|---------------|
| `google.golang.org/grpc` | Apache 2.0 | ✅ Compatible |
| `google.golang.org/protobuf` | BSD-3-Clause | ✅ Compatible |
| `golang.org/x/*` | BSD-3-Clause | ✅ Compatible |

## License Types Explained

### Apache 2.0 License
- **Permissive license** with patent protection clauses
- **Compatible** with AGPLv3 (confirmed by Free Software Foundation)
- Requires preservation of copyright notices and disclaimers
- Used by: NATS, gRPC, compression libraries, NATS utilities

### MIT License  
- **Highly permissive** license with minimal restrictions
- **Compatible** with all copyleft licenses including AGPLv3
- Only requires preservation of copyright notice
- Used by: PortAudio bindings

### BSD-3-Clause License
- **Permissive license** similar to MIT with non-endorsement clause
- **Compatible** with AGPLv3 and all GPL family licenses
- Requires preservation of copyright notices and disclaimers
- Used by: Protocol Buffers, Go extended libraries

## Compliance Requirements

When distributing Loqa under AGPLv3 with these dependencies:

1. **Include License Texts**: All original license texts must be preserved
2. **Copyright Notices**: All copyright notices must be maintained
3. **AGPLv3 Applies**: The entire combined work is distributed under AGPLv3
4. **Network Copyleft**: AGPLv3 network distribution requirements apply to the whole application
5. **Source Availability**: Complete source code (including dependencies) must be available

## License Compatibility Matrix

| License Type | Compatible with AGPLv3 | Notes |
|--------------|------------------------|-------|
| Apache 2.0 | ✅ Yes | Patent clauses compatible with AGPLv3 |
| MIT | ✅ Yes | Highly permissive, no restrictions |
| BSD-3-Clause | ✅ Yes | Permissive with attribution requirement |
| AGPLv3 | ✅ Yes | Same license |

## Verification

This analysis was conducted on 2025-01-01 by reviewing:
- Individual dependency repository LICENSE files
- SPDX license database
- Free Software Foundation compatibility guidelines
- Go module dependency trees

## Updates

This document should be reviewed when:
- New dependencies are added
- Existing dependencies change licenses
- Major version updates occur

---

*For questions about license compliance, contact security@loqalabs.com*