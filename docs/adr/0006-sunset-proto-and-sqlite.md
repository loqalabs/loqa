# ADR-0006: Sunset Proto and SQLite (Pre-MVP Infrastructure Removal)

**Status:** Accepted  
**Date:** 2025-09-19 00:18:53

---

## 🎯 Context

Loqa initially considered:

- `loqa-proto` for gRPC-based audio streaming and service definitions
- SQLite for persisting transcripts and playback events

These were removed pre-MVP:

- gRPC was replaced by HTTP/1.1 chunked binary transport optimized for constrained hardware (see ADR-0012)
- SQLite was replaced by ephemeral tracing and event-sourced coordination via NATS

---

## ✅ Decision

We will:

- Officially deprecate the `loqa-proto` repository
- Remove gRPC server code and protobuf bindings from `loqa-hub`
- Remove SQLite dependencies from `loqa-hub`
- Replace any persistent transcript recording with a future `Recorder` module (not MVP)

---

## 💡 Consequences

- ⚡ Faster build and runtime; no proto/gen steps
- ✅ Lower memory and disk footprint; less statefulness
- 🔒 Easier to ensure privacy compliance (ephemeral voice state)
- 🛠️ Optional persistence can be added later via config
- 📦 This change fully retires both gRPC and SQLite before they were deployed — simplifying the architecture and aligning with the final transport model in ADR-0012

This simplifies MVP deployment and aligns with our local-first design philosophy.
