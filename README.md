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
- xclip (for clipboard support):
  - Ubuntu/Debian: `sudo apt-get install xclip`
  - Fedora/RHEL: `sudo dnf install xclip`
  - Arch: `sudo pacman -S xclip`

**Development Tools:**
- Python 3.11+
- Bun (JavaScript runtime)
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

**Option 1: Using mprocs (recommended)**

```bash
# Install mprocs (if not already installed)
cargo install mprocs

# Run all services with interactive TUI
mprocs
```

This gives you an interactive terminal UI where you can view and control logs from both services.

**Option 2: Using shell script**

```bash
./scripts/dev.sh
```

**Option 3: Manual setup (separate terminals)**

```bash
# Terminal 1 - Backend
cd backend
uv run uvicorn src.main:app --reload --port 8765

# Terminal 2 - Desktop
cd desktop
bun run dev
```

**Note:** The dev scripts disable Electron sandbox for development. This is safe for local development but not recommended for production builds.

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

## Troubleshooting

### Electron Sandbox Error

If you see "SUID sandbox helper binary was found, but is not configured correctly":

This is expected in development. The dev script automatically disables the sandbox for development convenience. For production builds, the sandbox is enabled.

**If you want to fix sandbox permissions permanently:**
```bash
sudo chown root desktop/node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 desktop/node_modules/electron/dist/chrome-sandbox
```

Then you can remove `ELECTRON_DISABLE_SANDBOX` from package.json.

### Address Already in Use (Port 8765)

If you see "Address already in use" on port 8765:

```bash
# Kill the process using port 8765
sudo lsof -i :8765
sudo kill -9 <PID>

# Or change the port in backend/src/main.py or use the --port flag:
uv run uvicorn src.main:app --reload --port 8766
```

## License

MIT
