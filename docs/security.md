# 🔐 Security Policy

We take privacy and security seriously — it's at the heart of why Loqa exists.

---

## 🧭 Philosophy

Loqa is **local-first by design**. This means:

- No cloud syncing or external APIs by default
- No telemetry or background data collection
- No "opt-out" tracking — because there’s nothing to opt out of

You control your data. Full stop.

---

## 🧪 Current Surface Area

As of now, Loqa services are:

- Run only on the local network
- Not exposed to the internet
- Use no external authentication systems
- Transmit audio over gRPC and events via NATS

We strongly recommend running Loqa behind a firewall or on an isolated network until hardened access controls are in place.

---

## 🔐 Planned Hardening

Upcoming security improvements include:

- TLS for gRPC and NATS services
- Local authentication for skill and device registration
- Role-based permissions for sensitive commands
- Encrypted local config and state storage

These features are in progress as Loqa matures toward production-readiness.

---

## 🛡️ Responsible Disclosure

If you discover a vulnerability or security concern:

📬 **Email: anna@steckybarnes.com**

Please do **not** open public GitHub issues for security reports.  
We’ll respond promptly and work with you to resolve any concerns.

---

## 🧩 Contributing Secure Code

If you're submitting code that touches audio, networking, or model inference:

- Avoid introducing external dependencies without review
- Make clear any ports/services exposed
- Sanitize and validate any external inputs
- Follow Go and container security best practices

Security contributions are very welcome — especially from people with expertise in privacy, sandboxing, and embedded security.

---

## 🤝 Thanks

Thanks for helping keep Loqa safe, open, and empowering.