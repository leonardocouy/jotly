# Jotly - Product Documentation

> **Version**: 1.0 MVP
> **Last Updated**: December 2025
> **Status**: MVP Complete

---

## Product Vision

**Jotly exists to make voice-to-text as simple as pressing a button.**

In a world where voice transcription tools are either cloud-dependent, privacy-invasive, or unnecessarily complex, Jotly takes a different approach: **100% offline, zero configuration, instant results**.

### Mission Statement

> Transform voice into text with a single hotkey - no accounts, no internet, no compromises on privacy.

### Core Philosophy

| Principle | Description |
|-----------|-------------|
| **Privacy First** | All processing happens locally. Zero data leaves your device. |
| **Dead Simple** | One hotkey. One action. No learning curve. |
| **Offline Always** | Works in airplane mode, without internet, anywhere. |
| **Linux Native** | Built for Linux users, by Linux users. |

---

## Problem Statement

### The Pain Points

1. **Cloud Dependency**: Most transcription tools require internet and send your audio to external servers
2. **Privacy Concerns**: Voice data contains sensitive information that shouldn't leave your control
3. **Complex Setup**: Many solutions require accounts, API keys, or complicated configurations
4. **Workflow Interruption**: Switching apps to dictate text breaks focus and productivity

### Who Feels This Pain?

- Developers who want to document code without typing
- Writers and content creators who think faster than they type
- Privacy-conscious professionals handling sensitive information
- Remote workers in areas with unreliable internet
- Anyone with repetitive strain injuries who needs keyboard alternatives

---

## Target Users

### Primary Persona: The Privacy-Conscious Developer

**Name**: Alex
**Role**: Software Developer
**OS**: Linux (Ubuntu/Arch)
**Pain Point**: Wants to quickly capture thoughts, write documentation, or draft messages without typing - but won't use cloud services for privacy reasons.

**Needs**:
- Quick capture without interrupting workflow
- Works offline in coffee shops or planes
- No subscription or account required
- Integrates with any text field via clipboard

### Secondary Persona: The Efficient Writer

**Name**: Sam
**Role**: Technical Writer / Content Creator
**OS**: Linux (Fedora)
**Pain Point**: Types thousands of words daily and wants to reduce keyboard fatigue.

**Needs**:
- Reliable transcription accuracy
- Fast turnaround (no waiting for cloud processing)
- Works with any application (not locked to specific editors)

---

## Current Features (MVP)

### Core Functionality

| Feature | Description | Status |
|---------|-------------|--------|
| **Global Hotkey** | `Super+Shift+R` to toggle recording from anywhere | ✅ Shipped |
| **Voice Recording** | High-quality 16kHz audio capture | ✅ Shipped |
| **Local Transcription** | Powered by faster-whisper (optimized Whisper) | ✅ Shipped |
| **Auto Clipboard** | Transcribed text automatically copied | ✅ Shipped |
| **System Tray** | Visual status indicator with color states | ✅ Shipped |
| **Notifications** | Desktop notifications with transcription preview | ✅ Shipped |

### Technical Capabilities

| Capability | Details |
|------------|---------|
| **Whisper Models** | 6 models available: tiny, base, small, medium, large-v3, turbo |
| **Audio Devices** | Supports multiple input devices with runtime switching |
| **Language Detection** | Auto-detect or specify language manually |
| **VAD Filtering** | Voice Activity Detection removes silence automatically |

### System Tray States

| State | Icon Color | Description |
|-------|------------|-------------|
| Idle | Gray | Ready to record |
| Recording | Red | Actively capturing audio |
| Transcribing | Orange | Processing audio with Whisper |

---

## User Journey

```
1. User has a thought they want to capture
          ↓
2. Press Super+Shift+R (anywhere in the system)
          ↓
3. Tray turns RED - speak naturally
          ↓
4. Press Super+Shift+R again to stop
          ↓
5. Tray turns ORANGE briefly (processing)
          ↓
6. Text copied to clipboard + notification shown
          ↓
7. Paste anywhere with Ctrl+V
          ↓
8. Done! Total time: seconds
```

---

## Product Principles

These principles guide all product decisions:

### 1. Simplicity Over Features

> "When in doubt, leave it out."

Every feature must justify its existence. We'd rather do 3 things excellently than 10 things mediocrely.

### 2. Privacy Is Non-Negotiable

> "If it can be done offline, it must be done offline."

We will never add cloud features that compromise user privacy. Local-first is not a technical constraint - it's a core value.

### 3. Respect the User's Workflow

> "Adapt to the user, don't force the user to adapt."

Jotly works with any application via clipboard. We don't lock users into our ecosystem.

### 4. Instant Gratification

> "The best interface is no interface."

One hotkey, one action. No menus, no dialogs, no interruptions.

---

## Roadmap

### Phase 1: Foundation (✅ Complete)

- [x] Core recording and transcription pipeline
- [x] Global hotkey integration
- [x] System tray with status indicators
- [x] Clipboard integration
- [x] Desktop notifications
- [x] Multi-model support

### Phase 2: Polish (Next)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Customizable Hotkey** | P1 | Let users choose their preferred key combination |
| **Audio Level Indicator** | P1 | Visual feedback showing microphone input level |
| **Model Auto-Download** | P2 | Download models on first use instead of bundling |
| **Settings UI** | P2 | Simple preferences window for model/device selection |
| **Startup on Boot** | P2 | Optional auto-start with system |

### Phase 3: Enhanced Experience

| Feature | Priority | Description |
|---------|----------|-------------|
| **History Log** | P3 | View past transcriptions with timestamps |
| **Quick Edit** | P3 | Small overlay to edit text before copying |
| **Punctuation Improvement** | P3 | Better automatic punctuation handling |
| **Multi-Language Profiles** | P3 | Save preferred language per context |
| **Audio Boost** | P3 | Normalize low microphone input |

### Phase 4: Power Features

| Feature | Priority | Description |
|---------|----------|-------------|
| **Continuous Mode** | P4 | Keep transcribing until manually stopped |
| **Custom Wake Word** | P4 | "Hey Jotly" to start recording |
| **Markdown Output** | P4 | Auto-format as headers, lists, etc. |
| **Export Formats** | P4 | Save as TXT, MD, or JSON files |
| **Keyboard Macro** | P4 | Type text directly instead of clipboard |

### Not Planned / Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud sync | Violates privacy-first principle |
| Account system | Unnecessary complexity |
| Mobile app | Different product, different needs |
| Real-time transcription | Battery/resource intensive, different UX |
| Browser extension | Scope creep |

---

## Success Metrics

### North Star Metric

> **Daily Active Transcriptions**: Number of successful transcriptions per day per user

This metric captures both engagement (users return daily) and reliability (transcriptions succeed).

### Supporting Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Time to First Transcription** | < 2 min | From install to first successful use |
| **Transcription Success Rate** | > 95% | Percentage of recordings that produce text |
| **Average Transcription Time** | < 3s | Time from stop recording to clipboard |
| **Model Load Time** | < 10s | Time to load default (tiny) model |
| **Memory Usage (Idle)** | < 100MB | Resource efficiency when not transcribing |

### Qualitative Signals

- Users mention "just works" in feedback
- Low support requests (indicates intuitive UX)
- Users recommend to privacy-conscious friends

---

## Technical Specifications

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| OS | Linux (any modern distro) | Ubuntu 22.04+ / Fedora 38+ |
| RAM | 2GB | 4GB (for larger models) |
| Storage | 200MB (tiny model) | 1GB (for model options) |
| Audio | Any working microphone | Dedicated USB microphone |

### Dependencies

| Dependency | Purpose |
|------------|---------|
| PortAudio | Audio capture |
| xclip | Clipboard integration |
| Python 3.11+ | Backend runtime |

### Model Comparison

| Model | Size | Speed | Accuracy | Use Case |
|-------|------|-------|----------|----------|
| tiny | 75MB | ⚡⚡⚡⚡⚡ | ⭐⭐ | Quick notes, low-resource systems |
| base | 150MB | ⚡⚡⚡⚡ | ⭐⭐⭐ | Balanced for most users |
| small | 500MB | ⚡⚡⚡ | ⭐⭐⭐⭐ | Better accuracy, still fast |
| medium | 1.5GB | ⚡⚡ | ⭐⭐⭐⭐ | High accuracy for longer recordings |
| large-v3 | 3GB | ⚡ | ⭐⭐⭐⭐⭐ | Maximum accuracy |
| turbo | ~800MB | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Best speed/accuracy balance |

---

## Competitive Landscape

| Product | Offline | Free | Linux | Privacy | Simplicity |
|---------|---------|------|-------|---------|------------|
| **Jotly** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Google Voice Typing | ❌ | ✅ | ❌ | ❌ | ✅ |
| Whisper.cpp | ✅ | ✅ | ✅ | ✅ | ❌ (CLI) |
| Otter.ai | ❌ | Freemium | ❌ | ❌ | ✅ |
| macOS Dictation | ❌ | ✅ | ❌ | ❌ | ✅ |

### Our Differentiation

1. **Only offline + Linux + simple** solution
2. **No account required** - download and use
3. **Clipboard-based** - works with any app
4. **Single hotkey** - zero learning curve

---

## FAQ

### Why not real-time transcription?

Real-time transcription would require continuous CPU/GPU usage, draining battery and competing for resources. Our batch approach (record → transcribe → done) is more efficient and provides better accuracy.

### Why Linux only?

We're building for ourselves first. Linux desktop is underserved by voice tools, and we use Linux daily. macOS/Windows may come later, but Linux is our priority.

### Why Whisper instead of other models?

Whisper offers the best balance of accuracy, multilingual support, and open-source availability. faster-whisper specifically provides excellent performance without requiring a GPU.

### Can I use my GPU?

Currently CPU-only for maximum compatibility. GPU support (CUDA) may be added in the future for users who want faster processing of larger models.

### How do you handle multiple languages?

Whisper auto-detects language by default. You can also manually specify a language for better accuracy if you know what you'll be speaking.

---

## Appendix

### Version History

| Version | Date | Highlights |
|---------|------|------------|
| 1.0 MVP | Dec 2025 | Initial release with full offline transcription |

### Contact

- **Repository**: Internal (Softaworks)
- **Issue Tracking**: bd (beads) - see CLAUDE.md for usage

---

*This document is maintained by the Product team and updated with each significant release.*
