## 🟥 P1 – Must-Fix Before MVP

### 🧠 Intent Parsing & Command Execution
- [ ] Support multi-command chaining in parsed intent pipeline
  - [ ] Parse compound utterances (e.g., "Turn off the lights and play music")
  - [ ] Route sub-intents to appropriate skills in sequence
  - [ ] Ensure skill responses can be executed in order without overlap or conflict
  - [ ] Combine or sequence TTS responses for multiple results
  - [ ] If chaining fails, gracefully fallback to the first valid command

### 🖥️ Observer UI & API Surface
- [ ] Fix "Active Pucks" count to reflect disconnections (e.g., when puck exits unexpectedly)
- [ ] Ensure timeline audio playback works correctly (verify path, MIME type, player logic)
- [ ] Add ability to filter timeline by success, failure, or low-confidence events
- [x] Make event boxes more compact or collapsed by default

### 🗣️ Speech-to-Text (STT)
- [x] Remove Whisper.cpp fallback
  - [x] Remove whisper.cpp code from STT pipeline
  - [x] Remove whisper model download logic
  - [x] Clean up WHISPER_MODEL_PATH
  - [x] Remove whisper-models volume from Docker
- [ ] Strip wake word ("Hey Loqa") before passing to intent parser
- [ ] Normalize common misspellings of "Loqa" (e.g., "Luca") in post-STT
- [ ] Define and enforce default confidence threshold for rejecting low-quality transcriptions
- [ ] Fallback: Ask user to repeat command if confidence is too low

### 🔊 Text-to-Speech (TTS)
- [ ] Play returned TTS phrase through speakers when using the test puck (not just print)

### 🧠 Skills & Plugin System
- [ ] Add built-in "Set a timer" skill with local tracking and TTS countdown/complete response
  - [ ] Support durations like "set a timer for 5 minutes"
  - [ ] Handle multiple timers if possible (e.g., "set a tea timer for 3 minutes and an oven timer for 10 minutes")
  - [ ] Announce when timer expires via TTS playback
  - [ ] Store and cancel timers locally on the hub
- [x] Add built-in "What time is it?" skill using hub local time

---

## 🟧 P2 – High-Impact UX Improvements

### 🖥️ Observer UI & API Surface
- [ ] Add drill-down breakdown of slow events (e.g., STT, LLM parse, skill handling)
- [ ] Add compact/toggle view mode for timeline events

### 🎛️ Skill Management UI
- [ ] Create a “Skills” tab in `loqa-observer` with list of installed plugins
- [ ] Show skill name, description, version, and enabled status
- [ ] Add toggles to enable/disable skills
- [ ] Link to skill config editor (if `config` hook is present)
- [ ] Add visual indicator for skills generating events
- [ ] Add modal to show raw manifest JSON
- [ ] Provide logs/debug link per skill (reuse from Timeline)
- [ ] Persist skill enable/disable state across restarts

### 🗣️ Speech-to-Text (STT)
- [ ] Expose confidence thresholds as user-configurable setting (via config or UI)
- [ ] Emit partial transcription results in near-realtime (don't wait for full clip)
- [ ] Add YAML-based STT config format

### 🧠 Skills & Plugin System
- [ ] Add minimal built-in skills like "help", "version", "ping", "what can you do?"