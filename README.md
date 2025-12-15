# Jotly

**Type less. Say more.**

Jotly is a dead-simple voice-to-text tool that lives on your desktop and respects your privacy. Open-source, offline-first, and lightning fast.

## Features

- 🎤 **Voice to Text** - Press `Super+Shift+R` to record, press again to transcribe
- 🔒 **100% Offline** - Your voice never leaves your device
- ⚡ **Lightning Fast** - Powered by faster-whisper (optimized Whisper)
- 📋 **Auto Clipboard** - Transcribed text is copied automatically
- 🐧 **Linux First** - Built for Linux desktops

## Quick Start

### Prerequisites

**System Dependencies:**
- Linux desktop environment (ALSA/PulseAudio audio support)
- PortAudio library (for audio input):
  - Ubuntu/Debian: `sudo apt-get install libportaudio2 portaudio19-dev`
  - Fedora/RHEL: `sudo dnf install portaudio-devel`
  - Arch: `sudo pacman -S portaudio`

**Development Tools:**
- Python 3.11+
- Bun
- uv (Python package manager)

### Installation

```bash
# Clone the repository
cd jotly

# Setup backend
cd backend
uv sync

# Setup desktop
cd ../desktop
bun install
```

### Development

```bash
# Run both backend and frontend
./scripts/dev.sh

# Or run separately:

# Terminal 1 - Backend
cd backend
uv run uvicorn src.main:app --reload --port 8765

# Terminal 2 - Desktop
cd desktop
bun run dev
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop App (Bun)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Global      │  │ System Tray  │  │ HTTP Client        │  │
│  │ Shortcut    │  │ (idle/rec)   │  │ (fetch backend)    │  │
│  └──────┬──────┘  └──────────────┘  └─────────┬──────────┘  │
└─────────┼───────────────────────────────────────────────────┘
          │                              │
          │  Press hotkey                │ HTTP requests
          │                              ▼
┌─────────┼──────────────────────────────────────────────────┐
│         │          Python Backend (FastAPI)                │
│         ▼    ┌──────────────┐    ┌───────────────────────┐ │
│  ┌──────────┐│ AudioService │    │ TranscriptionService  │ │
│  │ /record  ││ (sounddevice)│    │ (faster-whisper)      │ │
│  │ /stop    │└──────────────┘    └───────────────────────┘ │
│  │ /models  │                                              │
│  └──────────┘                                              │
└────────────────────────────────────────────────────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/status` | Current status |
| POST | `/recording/start` | Start recording |
| POST | `/recording/stop` | Stop and transcribe |
| GET | `/models` | List Whisper models |
| POST | `/models/load` | Load a model |
| GET | `/devices` | List audio devices |

## Whisper Models

| Model | Size | Speed | Accuracy |
|-------|------|-------|----------|
| tiny | ~75MB | Fastest | Good |
| base | ~150MB | Fast | Better |
| small | ~500MB | Medium | Great |
| medium | ~1.5GB | Slow | Excellent |
| large-v3 | ~3GB | Slowest | Best |

## Tech Stack

- **Frontend**: Electron + Bun + TypeScript
- **Backend**: Python + FastAPI + uvicorn
- **AI**: faster-whisper (optimized Whisper)
- **Audio**: sounddevice

## License

MIT
