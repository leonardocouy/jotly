# Jotly Backend

Voice-to-text backend using OpenAI's Whisper model via faster-whisper.

## Features

- Fast speech-to-text transcription using faster-whisper
- Real-time audio processing with sounddevice
- FastAPI-based REST API
- Efficient audio handling with numpy

## Development

Install development dependencies:

```bash
uv sync
```

Run tests:

```bash
pytest
```

Lint and format:

```bash
ruff check .
ruff format .
```
