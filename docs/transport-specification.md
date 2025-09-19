# Transport Specification (Puck ↔ Hub)

This document defines the full transport protocol between Loqa pucks and the hub. The protocol is optimized for ESP32-class devices using HTTP/1.1 with chunked transfer encoding and a simple binary frame format.

---

## 🔁 Overview

Loqa pucks communicate with the hub using two long-lived HTTP/1.1 connections:

1. `POST /uplink/{conversation_id}` – puck streams PCM audio and signals to hub
2. `GET /downlink/{puck_id}` – hub streams audio and control frames back to puck

All communication is in the form of binary frames (see `binary-frame-spec.md`).

---

## 🔐 Authentication

- **Header**: `Authorization: Bearer <device_token>`
- Tokens are rotated periodically (see ADR-0011)
- Missing or invalid tokens result in `401 Unauthorized`

---

## 🎤 Puck → Hub: Uplink

**Endpoint:**

```
POST /uplink/{conversation_id}
Content-Type: application/octet-stream
Transfer-Encoding: chunked
Authorization: Bearer <token>
```

- One **binary frame per chunk** (preferred)
- Optional: small batches of 2–4 frames allowed on bad networks

**Hub responses:**

- `200 OK`: connection accepted
- `400`: bad frame format
- `401`: auth failed
- `413`: frame too large
- `426`: upgrade required (e.g., codec mismatch)

---

## 🔊 Hub → Puck: Downlink

**Endpoint:**

```
GET /downlink/{puck_id}?resume_seq={optional_uint16}
Accept: application/octet-stream
Authorization: Bearer <token>
```

- Chunked response
- Hub streams audio (0xB1) and control (0xC1) frames
- If `resume_seq` provided, hub attempts to replay from that sequence (no guarantee)

---

## ⏳ Keep-alive & Timeouts

- Hub sends `ping` control frame every 5s (0xC1)
- Puck must reply with `pong` within 5s via uplink
- Idle timeout: 30s — either side may close
- Puck should retry with exponential backoff: 1s → 2s → 4s → max 30s

---

## 🔁 Connection Recovery

### Upload drops:

- Puck buffers up to 1s of frames
- New conversation starts unless hub supports resume

### Download drops:

- Puck reconnects with `resume_seq`
- Hub attempts replay of audio/control if still buffered

---

## 📎 Status Codes Summary

- `200 OK`: session accepted
- `400 Bad Request`: malformed frame
- `401 Unauthorized`: bad/missing token
- `413 Payload Too Large`: frame size exceeded
- `426 Upgrade Required`: codec/transport not supported

In-stream fatal errors are also communicated via `ERROR (0xFF)` binary frames.

---

See also:

- [`binary-frame-spec.md`](binary-frame-spec.md)
- [ADR-0010](../adr/0010-transport-http1-binary-stream.md) – HTTP Transport Design
- ADR-0010: Error and Retry Logic
