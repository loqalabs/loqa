# Binary Frame Specification

This document defines the binary frame structure used in Loqa relay ↔ hub communication.

---

## 🧱 Layout

Each frame has the following layout:

```
| type 1B | seq 2B | ts_ms 4B | len 2B | payload ... |
```

- Total header size: 9 bytes
- All multi-byte fields use **little-endian**
- No padding; fields are packed

---

## 🧩 Fields

- **type (uint8)**: frame type

  - `0xA1`: Uplink audio (PCM16)
  - `0xB1`: Downlink audio (PCM16)
  - `0xC1`: Control (JSON or TLV)
  - `0xFF`: Error

- **seq (uint16)**: sequence number

  - Wraps from `65535 → 0`
  - Hub tracks recent `N` values to avoid duplication

- **ts_ms (uint32)**: monotonic milliseconds since puck boot

  - Used for latency and drift tracking
  - Not synchronized to real time

- **len (uint16)**: byte length of payload

  - Max value: `2048`
  - Payload exceeding this is rejected with an ERROR frame

- **payload (byte[])**:
  - For audio: raw PCM16 mono @ 16kHz, 20ms chunks = 640 bytes
  - For control: UTF-8 JSON or TLV
  - For error: TLV-formatted error code + message

---

## 🎧 Audio Payloads

- Audio is assumed to be **signed PCM16 mono** at **16 kHz**
- Uplink frames typically carry 20ms: 640 bytes
- If `len != 640`, puck or hub may log or resample
- Gaps in downlink are filled with silence (relay-side)

---

## ⚙️ Control Payloads

**Typical JSON:**

```json
{"op":"down_start","play_id":"abc","category":"AssistantResponse","priority":100,"interrupt":"PREEMPT"}
{"op":"pause","play_id":"abc"}
{"op":"leader","group_id":"kitchen","relay_id":"r2","lease_ms":5000"}
{"op":"ping","nonce":123}
{"op":"pong","nonce":123}
```

- Future: may move to TLV or CBOR encoding

---

## ❌ Error Frames (type = 0xFF)

Payload format:

```
| code (2B) | len (2B) | UTF-8 message (len bytes) |
```

- **Example codes**:
  - `0x0001`: BAD_LEN
  - `0x0002`: BAD_TYPE
  - `0x0003`: AUTH
  - `0x0004`: RATE_LIMIT
  - `0x0005`: INTERNAL

After sending an error frame, the hub may immediately close the connection.

---

## 🧪 Validation

- Frame size must be ≥ 9 bytes
- `len` must not exceed payload bytes available
- If a malformed frame is received, send ERROR then close

---

See also:

- [`transport-specification.md`](transport-specification.md)
- [ADR-0010](../adr/0010-transport-http1-binary-stream.md) – Puck ↔ Hub transport decision
