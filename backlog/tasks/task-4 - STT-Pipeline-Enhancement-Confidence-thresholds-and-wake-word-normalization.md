---
id: task-4
title: STT Pipeline Enhancement - Confidence thresholds and wake word normalization
status: Done
assignee:
  - development
created_date: '2025-09-10 20:45'
updated_date: '2025-09-10 21:29'
labels:
  - stt
  - voice-pipeline
  - quality
dependencies: []
priority: medium
---

## Description

Strip wake word ('Hey Loqa') before passing to intent parser, normalize common misspellings, define confidence thresholds.
## Implementation Notes

MOVED: This task has been moved to loqa-hub/task-3 for proper service ownership. STT pipeline logic is implemented in the hub service. GitHub Issue: https://github.com/loqalabs/loqa-hub/issues/20
