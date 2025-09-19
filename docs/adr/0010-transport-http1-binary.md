# ADR-0010: Use HTTP/1.1 + Binary Framing for Puck-to-Hub Transport

**Status:** Accepted  
**Date:** 2025-09-19

---

## 🎯 Context

Previous versions of Loqa relied on either:

- gRPC (proto + streaming) — deprecated in ADR-0007
- WebSocket + Envelope framing — deprecated in ADR-0001

Both were rejected for the following reasons:

- ❌ Poor memory efficiency on ESP32-class devices
- ❌ Complex debugging and envelope deserialization
- ❌ TLS overhead and binary framing conflicts with WebSocket libraries
- ❌ No fine-grained control over reconnect and recovery

---

## ✅ Decision

Loqa will use **HTTP/1.1 with chunked transfer encoding** to support bidirectional audio and control streaming between the puck and the hub.

### Protocol Summary

- `POST /uplink/{conversation_id}` for audio and control upload
  - Body: one binary frame per HTTP chunk
- `GET /downlink/{puck_id}?resume_seq=N` for playback and control delivery
  - Chunked binary stream with audio/control frames

Frame structure:

```
| type 1B | seq 2B | ts_ms 4B | len 2B | payload... |
```

- Audio: PCM16 mono 16 kHz
- Control: UTF-8 JSON or TLV
- See `docs/binary-frame-spec.md` for exact format

Authentication:

- All requests use `Authorization: Bearer <device_token>`

Timeouts and keep-alive:

- Ping/pong via CONTROL frames every 5s
- Uplink or downlink idle timeout: 30s

---

## 🔗 Supporting Specifications

- [`transport-specification.md`](../transport-specification.md)
- [`binary-frame-spec.md`](../binary-frame-spec.md)
- ADR-0006 (Proto + SQLite sunset)

---

## 💡 Consequences

- ✅ Works reliably on ESP32-S3 and low-memory pucks
- ✅ Removes protobuf/gRPC/WebSocket dependencies
- ✅ Simplifies hub debug tooling (frame inspector, replay)
- ✅ Enables frame buffering, sequence tracking, and recovery
- ⚠️ Requires implementation of chunked encoding on constrained devices (esp_http_client)
