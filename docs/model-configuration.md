# Centralized Model Configuration

## Overview

The Loqa platform now uses centralized model configuration to ensure consistency across all environments and prevent model mismatches that can cause issues.

## Configuration File

**Location**: `/loqa/config/models.env`

This file contains all AI model specifications used throughout the platform:

```bash
# LLM Configuration
OLLAMA_MODEL=llama3.2:3b
STREAMING_MODEL=llama3.2:3b

# STT Configuration
WHISPER_MODEL=base.en
```

## Usage

### Docker Compose Integration

Both `docker-compose.yml` and `docker-compose.dev.yml` now source this file:

```yaml
services:
  ollama:
    env_file:
      - ./config/models.env
    command: >
      "ollama serve &
       sleep 10 &&
       ollama pull ${OLLAMA_MODEL} &&
       wait"

  stt:
    env_file:
      - ./config/models.env
    environment:
      - MODEL=${WHISPER_MODEL}

  hub:
    env_file:
      - ./config/models.env
```

**Important**: The Makefile targets use clean aliases that automatically source the environment variables:

```makefile
# Clean aliases in tools/Makefile
COMPOSE_WITH_ENV = cd .. && set -a && source ./config/models.env && set +a && docker-compose
COMPOSE_DEV_WITH_ENV = cd .. && set -a && source ./config/models.env && set +a && docker-compose -f docker-compose.dev.yml

# Usage example
start-dev:
	@echo "🛠️ Starting Loqa development services..."
	$(COMPOSE_DEV_WITH_ENV) up -d
```

This ensures `${OLLAMA_MODEL}` and `${WHISPER_MODEL}` substitution works correctly without code duplication.

### Service Configuration

The Hub service automatically reads these environment variables:

- `OLLAMA_MODEL` - Used for command parsing and intent recognition
- `STREAMING_MODEL` - Used for real-time response generation
- `WHISPER_MODEL` - Used for speech-to-text transcription

## Model Options

### LLM Models (Ollama)
- `llama3.2:1b` - Fastest, lowest memory, good for simple commands
- `llama3.2:3b` - **Recommended default** - balanced performance and understanding
- `llama3.2:8b` - Best understanding, higher resource requirements

### STT Models (Whisper)
- `tiny` - Fastest, lower accuracy
- `base` - Good balance for multilingual
- `base.en` - **Recommended default** - good balance, English-only, often more accurate
- `small` - Better accuracy, moderate performance impact
- `medium` - High accuracy, significant performance impact
- `large` - Highest accuracy, substantial resource requirements

## Changing Models

To change models system-wide:

1. **Update the configuration file**:
   ```bash
   # Edit /loqa/config/models.env
   OLLAMA_MODEL=llama3.2:1b      # Switch to faster model
   WHISPER_MODEL=small           # Switch to more accurate STT
   ```

2. **Restart the affected services**:
   ```bash
   cd /loqa
   docker-compose restart ollama stt hub
   ```

3. **Verify the changes**:
   ```bash
   docker-compose logs hub | grep "Using.*model"
   ```

## Benefits

- ✅ **Consistency**: Same models across development and production
- ✅ **Single Source of Truth**: One file controls all model selections
- ✅ **Easy Changes**: Update once, applies everywhere
- ✅ **Version Control**: Model configurations are tracked in git
- ✅ **Environment Flexibility**: Easy to override for specific deployments

## Scripts Integration

The `tools/status.sh` script now automatically loads the centralized model configuration from multiple possible locations:

```bash
# Works from any directory (workspace root, loqa/, or loqa/tools/)
./tools/status.sh          # From loqa/ directory
./loqa/tools/status.sh     # From workspace root
make status                # Via Makefile (recommended)

# Output shows current models and config location:
📋 Loaded model configuration from ./config/models.env: LLM=llama3.2:3b, STT=base.en
✅ LLM Model: llama3.2:3b loaded and responding
```

The script automatically finds the config file by checking:
1. `./config/models.env` (when run from loqa/ directory)
2. `./loqa/config/models.env` (when run from workspace root)
3. `../config/models.env` (when run from loqa/tools/ directory)

## Migration

Previously, models were hardcoded in multiple locations:
- `docker-compose.yml` - Different LLM models (1b vs 3b)
- `docker-compose.dev.yml` - Different STT models (base vs base.en)
- `Dockerfile` - Hardcoded defaults
- Go code - Hardcoded STT model references
- `tools/status.sh` - Hardcoded model checking

All these have been updated to use the centralized configuration, eliminating inconsistencies and making model management much simpler.