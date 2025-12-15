# Jotly Backend

Voice-to-text backend using OpenAI's Whisper model via faster-whisper.

## Features

- Fast speech-to-text transcription using faster-whisper
- Real-time audio processing with sounddevice
- FastAPI-based REST API
- Efficient audio handling with numpy

## Prerequisites

### System Dependencies

The `sounddevice` library requires PortAudio to be installed:

- **Ubuntu/Debian**: `sudo apt-get install libportaudio2 portaudio19-dev`
- **Fedora/RHEL**: `sudo dnf install portaudio-devel`
- **Arch**: `sudo pacman -S portaudio`
- **macOS**: `brew install portaudio`

### Python Environment

Install dependencies:

```bash
uv sync
```

## Troubleshooting

### OSError: PortAudio library not found

If you see this error, the `sounddevice` library can't find PortAudio. Install system dependencies:

```bash
# Ubuntu/Debian
sudo apt-get install libportaudio2 portaudio19-dev

# Fedora/RHEL
sudo dnf install portaudio-devel

# Arch
sudo pacman -S portaudio

# macOS
brew install portaudio
```

Then try again: `uv sync` and run your code.

### How to Find Missing System Dependencies

If a Python package fails with "not found" errors:

1. **Read the error message** - it usually mentions the missing library (e.g., "PortAudio library not found")
2. **Search the Python package docs** - PyPI page shows what system dependencies are needed
3. **Check the package's GitHub** - usually has a "Installation" or "Requirements" section
4. **Use your distro's search**:
   - Ubuntu: `apt search <library-name>`
   - Fedora: `dnf search <library-name>`
   - Arch: `pacman -Ss <library-name>`

Run tests:

```bash
pytest
```

Lint and format:

```bash
ruff check .
ruff format .
```
