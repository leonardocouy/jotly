# Jotly - Voice-to-Text Application

## Project Overview

**Jotly** is a dead-simple voice-to-text desktop application for Linux. It's designed to be:
- **Offline-first**: All processing happens locally
- **Privacy-respecting**: No data leaves your device
- **Lightning fast**: Uses faster-whisper (optimized Whisper model)
- **Lightweight**: Minimal dependencies, runs on any Linux desktop

### Key Features

- 🎤 Press `Super+Shift+R` to record, press again to transcribe
- 📋 Auto-copy transcribed text to clipboard
- 🔒 100% offline - Whisper runs locally
- ⚡ Powered by faster-whisper optimization
- 🐧 Linux-first (Electron + Python backend)

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Electron (Bun) + TypeScript |
| **Backend** | Python 3.11+ + FastAPI + uvicorn |
| **AI/ML** | faster-whisper (optimized Whisper) |
| **Audio** | sounddevice + numpy |
| **Dev Tools** | mprocs (process management), uv (Python), Bun (Node) |

## Project Structure

```
jotly/
├── desktop/              # Electron app (formerly "electron")
│   ├── src/main/         # Main process (hotkeys, system tray, API calls)
│   ├── package.json      # Build and dev scripts (with ELECTRON_DISABLE_SANDBOX)
│   └── tsconfig.json     # TypeScript config
├── backend/              # FastAPI server
│   ├── src/
│   │   ├── main.py       # FastAPI app entry
│   │   └── services/
│   │       ├── audio.py  # AudioService (sounddevice)
│   │       └── transcription.py  # TranscriptionService (faster-whisper)
│   ├── pyproject.toml    # Dependencies (fastapi, uvicorn, faster-whisper, sounddevice)
│   └── README.md         # Backend-specific docs
├── scripts/
│   └── dev.sh            # Shell script runner (alternative to mprocs)
├── mprocs.yaml           # **Recommended** - Process manager config for dev
├── README.md             # Main project docs
└── AGENTS.md             # This file
```

## Setup & Development

### Prerequisites

**System Dependencies:**
- Linux desktop with ALSA/PulseAudio
- **PortAudio library** (required by sounddevice):
  - Ubuntu/Debian: `sudo apt-get install libportaudio2 portaudio19-dev`
  - Fedora/RHEL: `sudo dnf install portaudio-devel`
  - Arch: `sudo pacman -S portaudio`

**Development Tools:**
- Python 3.11+
- Bun (JavaScript runtime)
- uv (Python package manager)
- Cargo (for mprocs installation)

### Installation

```bash
# Clone and setup
cd voice-to-text

# Backend
cd backend && uv sync && cd ..

# Desktop/Frontend
cd desktop && bun install && cd ..
```

### Running Development Environment

**Option 1: Using mprocs (recommended)**
```bash
cargo install mprocs  # If not installed
mprocs                # Runs backend + desktop with interactive TUI
```

**Option 2: Using shell script**
```bash
./scripts/dev.sh
```

**Option 3: Manual (separate terminals)**
```bash
# Terminal 1
cd backend && uv run uvicorn src.main:app --reload --port 8765

# Terminal 2
cd desktop && bun run dev
```

## API Endpoints

The backend runs on `http://127.0.0.1:8765`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/status` | GET | Current recording status |
| `/recording/start` | POST | Start recording audio |
| `/recording/stop` | POST | Stop recording and transcribe |
| `/models` | GET | List available Whisper models |
| `/models/load` | POST | Load a specific model |
| `/devices` | GET | List audio input devices |

## Common Tasks

### Add New Whisper Model

1. Update `backend/src/services/transcription.py` - add model size
2. Update `README.md` - Whisper Models table
3. Test with `/models` endpoint

### Change Default Recording Hotkey

1. Edit `desktop/src/main/hotkey.ts` - change keybinding
2. Rebuild: `cd desktop && bun run build`
3. Test in dev environment

### Debug Audio Issues

1. Check available devices: `curl http://127.0.0.1:8765/devices`
2. Verify PortAudio is installed: `ldconfig -p | grep portaudio`
3. Check backend logs in mprocs terminal

### Enable Electron Sandbox for Production

1. Remove `ELECTRON_DISABLE_SANDBOX=1` from `desktop/package.json` dev script
2. Fix sandbox permissions:
   ```bash
   sudo chown root desktop/node_modules/electron/dist/chrome-sandbox
   sudo chmod 4755 desktop/node_modules/electron/dist/chrome-sandbox
   ```

## Troubleshooting

### OSError: PortAudio library not found
Install PortAudio system dependency (see Prerequisites section)

### SUID sandbox error during development
Expected in dev mode. The `mprocs.yaml` and `package.json` automatically disable sandbox with `ELECTRON_DISABLE_SANDBOX=1`

### Port 8765 already in use
```bash
sudo lsof -i :8765
sudo kill -9 <PID>
# Or change port: uv run uvicorn src.main:app --reload --port 8766
```

### Missing dependencies when importing
Check if the package requires system libraries. See "How to Find Missing System Dependencies" in backend/README.md

## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Auto-syncs to JSONL for version control
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**
```bash
bd ready --json
```

**Create new issues:**
```bash
bd create "Issue title" -t bug|feature|task -p 0-4 --json
bd create "Issue title" -p 1 --deps discovered-from:bd-123 --json
bd create "Subtask" --parent <epic-id> --json  # Hierarchical subtask (gets ID like epic-id.1)
```

**Claim and update:**
```bash
bd update bd-42 --status in_progress --json
bd update bd-42 --priority 1 --json
```

**Complete work:**
```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`
6. **Commit together**: Always commit the `.beads/issues.jsonl` file together with the code changes so issue state stays in sync with code state

### Auto-Sync

bd automatically syncs with git:
- Exports to `.beads/issues.jsonl` after changes (5s debounce)
- Imports from JSONL when newer (e.g., after `git pull`)
- No manual export/import needed!

### GitHub Copilot Integration

If using GitHub Copilot, also create `.github/copilot-instructions.md` for automatic instruction loading.
Run `bd onboard` to get the content, or see step 2 of the onboard instructions.

### MCP Server (Recommended)

If using Claude or MCP-compatible clients, install the beads MCP server:

```bash
pip install beads-mcp
```

Add to MCP config (e.g., `~/.config/claude/config.json`):
```json
{
  "beads": {
    "command": "beads-mcp",
    "args": []
  }
}
```

Then use `mcp__beads__*` functions instead of CLI commands.

### Managing AI-Generated Planning Documents

AI assistants often create planning and design documents during development:
- PLAN.md, IMPLEMENTATION.md, ARCHITECTURE.md
- DESIGN.md, CODEBASE_SUMMARY.md, INTEGRATION_PLAN.md
- TESTING_GUIDE.md, TECHNICAL_DESIGN.md, and similar files

**Best Practice: Use a dedicated directory for these ephemeral files**

**Recommended approach:**
- Create a `history/` directory in the project root
- Store ALL AI-generated planning/design docs in `history/`
- Keep the repository root clean and focused on permanent project files
- Only access `history/` when explicitly asked to review past planning

**Example .gitignore entry (optional):**
```
# AI planning documents (ephemeral)
history/
```

**Benefits:**
- ✅ Clean repository root
- ✅ Clear separation between ephemeral and permanent documentation
- ✅ Easy to exclude from version control if desired
- ✅ Preserves planning history for archeological research
- ✅ Reduces noise when browsing the project

### CLI Help

Run `bd <command> --help` to see all available flags for any command.
For example: `bd create --help` shows `--parent`, `--deps`, `--assignee`, etc.

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ✅ Store AI planning docs in `history/` directory
- ✅ Run `bd <cmd> --help` to discover available flags
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems
- ❌ Do NOT clutter repo root with planning documents

For more details, see README.md and QUICKSTART.md.
