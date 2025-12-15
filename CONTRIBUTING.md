# Contributing to Jotly

We appreciate your interest in contributing to Jotly! This document outlines the guidelines for contributing to this project.

## About Jotly

Jotly is a dead-simple voice-to-text desktop application for Linux. It's offline-first, privacy-respecting, and lightning fast - powered by faster-whisper running locally on your machine.

**Tech Stack:**
- **Frontend:** Electron (Bun) + TypeScript
- **Backend:** Python 3.11+ + FastAPI + uvicorn
- **AI/ML:** faster-whisper (optimized Whisper)

## Getting Started

1. **Fork the repository:** Create a fork of the Jotly repository on GitHub.
2. **Clone your fork:** Clone your forked repository to your local machine.
3. **Set up the development environment:** Follow the setup instructions in the [README.md](README.md).
4. **Create a branch:** Create a new branch for your contribution (`git checkout -b feature/your-feature-name`).
5. **Make changes:** Make your changes to the codebase.
6. **Test your changes:** Thoroughly test your changes to ensure they work as expected and do not introduce regressions.
7. **Commit your changes:** Commit your changes with descriptive commit messages.
8. **Push your changes:** Push your changes to your forked repository.
9. **Create a pull request:** Create a pull request from your branch to the main branch of the upstream repository.

## Development Setup

### Prerequisites

- Linux desktop with ALSA/PulseAudio
- PortAudio library (`sudo apt-get install libportaudio2 portaudio19-dev`)
- Python 3.11+
- Bun (JavaScript runtime)
- uv (Python package manager)

### Running Locally

```bash
# Install dependencies
cd backend && uv sync && cd ..
cd desktop && bun install && cd ..

# Run with mprocs (recommended)
mprocs

# Or manually in separate terminals
cd backend && uv run uvicorn src.main:app --reload --port 8765
cd desktop && bun run dev
```

## Contribution Guidelines

- **Follow the coding style:** Adhere to the existing coding style and conventions used in the project.
- **Write clear and concise code:** Make sure your code is well-documented, easy to understand, and maintainable.
- **Test thoroughly:** Ensure your changes work on Linux and don't break existing functionality.
- **Keep it simple:** Jotly is designed to be lightweight and minimal. Avoid over-engineering.
- **Adhere to the license:** Ensure your contributions comply with the project's license (MIT).

## Pull Request Review

All pull requests will be reviewed by the maintainers of the project. We may request changes or clarifications before merging your pull request.

## Additional Notes

- Feel free to open an issue to discuss your contribution ideas before starting work on them.
- We appreciate any contributions, big or small!
- For major changes, please open an issue first to discuss what you would like to change.

Thank you for your contributions to Jotly!
