# 🧩 Loqa Skills

Skills are modular building blocks that allow Loqa to understand and execute new types of commands.

Each skill declares:

- The **intents** it handles
- The **entities** it expects (like device types, locations, actions)
- How it **responds** to parsed commands via the message bus

---

## 🔧 How Skills Work

1. User speaks: “Turn on the kitchen lights”
2. Loqa transcribes, parses, and classifies the command as `lights.on`
3. `lights` skill receives the command payload from the NATS message bus
4. Skill performs the action (e.g., update state, control real device)
5. Optional: Sends a confirmation or follow-up response

---

## 📦 Example Skills

| Skill Name       | Description                                      |
| ---------------- | ------------------------------------------------ |
| `lights`         | Turn lights on/off by room or zone               |
| `music`          | Play, pause, or change music                     |
| `weather`        | Responds to weather queries (future cloud-based) |
| `home-assistant` | Interface with Home Assistant APIs               |
| `timers`         | Set, cancel, and query voice timers              |
| `reminders`      | Schedule reminders or repeating issues           |

---

## 🪄 Skill Manifest (WIP)

Each skill will define a manifest like:

```toml
name = "lights"
description = "Control lights in various rooms"
intents = ["lights.on", "lights.off"]
entities = ["location", "brightness"]
subscribe = ["loqa.devices.commands.lights"]
publish = ["loqa.devices.responses"]
```

Eventually this will allow skills to be:

- Dynamically loaded
- Discoverable by the hub
- Independently testable

---

## 🧪 Building Your Own Skills

Right now, skills are implemented as Go plugins in the `loqa-skills` repository.

To build a new one:

1. Add a new handler in `internal/handlers/`
2. Match against relevant command fields
3. Perform your action
4. Optionally, publish a response to NATS

```go
if cmd.Type == "lights" && cmd.Action == "on" {
    turnOnLights(cmd.Location)
    publishStatus("lights.on", cmd.Location)
}
```

---

## 🌍 Future: External Skill Runtimes

We plan to support external skills written in:

- Go
- Python
- Node.js (low priority)
- WASM (experimental)

These skills will connect via:

- gRPC
- Local WebSocket bridge
- Direct NATS subscriptions

---

## 🤝 Contributing Skills

Want to add your own skill to the Loqa ecosystem?

👉 Check out [`CONTRIBUTING.md`](./CONTRIBUTING.md) to learn how to submit a new skill or publish one to the Loqa Skill Registry (coming soon!).
