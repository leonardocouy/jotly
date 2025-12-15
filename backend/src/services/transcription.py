"""Transcription service using faster-whisper."""

import logging
import threading
from typing import Optional

import numpy as np
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

# Available Whisper models
AVAILABLE_MODELS = ["tiny", "base", "small", "medium", "large-v3", "turbo"]


class TranscriptionService:
    """Service for transcribing audio using Whisper."""

    def __init__(self):
        self._model: Optional[WhisperModel] = None
        self._current_model_name: str = None
        self._loading = False
        self._lock = threading.Lock()

    def load_model(self, model_name: str = "tiny"):
        """Load or switch Whisper model."""
        if model_name not in AVAILABLE_MODELS:
            raise ValueError(f"Invalid model: {model_name}. Available: {AVAILABLE_MODELS}")

        with self._lock:
            if self._current_model_name == model_name and self._model is not None:
                return  # Already loaded

            self._loading = True
            logger.info(f"Loading Whisper model: {model_name}")
            try:
                # Use CPU for broader compatibility, can add CUDA support later
                self._model = WhisperModel(
                    model_name,
                    device="cpu",
                    compute_type="int8",  # Faster on CPU
                )
                self._current_model_name = model_name
                logger.info(f"Model {model_name} loaded successfully")
            finally:
                self._loading = False

    def is_loading(self) -> bool:
        """Check if model is currently loading."""
        return self._loading

    def is_loaded(self) -> bool:
        """Check if a model is loaded and ready."""
        return self._model is not None

    def get_current_model(self) -> Optional[str]:
        """Get the name of the currently loaded model."""
        return self._current_model_name

    def transcribe(
        self,
        audio: np.ndarray,
        language: str = "auto",
    ) -> str:
        """Transcribe audio to text."""
        if self._model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        if len(audio) == 0:
            return ""

        # Ensure audio is float32 and normalized
        if audio.dtype != np.float32:
            audio = audio.astype(np.float32)

        # Normalize if needed
        max_val = np.abs(audio).max()
        if max_val > 1.0:
            audio = audio / max_val

        # Transcribe
        language_arg = None if language == "auto" else language

        logger.debug(
            f"Audio stats: len={len(audio)}, max={np.abs(audio).max():.4f}, mean={np.abs(audio).mean():.6f}"
        )

        segments, info = self._model.transcribe(
            audio,
            language=language_arg,
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(
                min_silence_duration_ms=500,  # Less aggressive silence detection
                speech_pad_ms=400,  # More padding around speech
            ),
        )

        # Combine all segments
        segments_list = list(segments)
        logger.debug(f"Got {len(segments_list)} segments")
        text_parts = [segment.text for segment in segments_list]
        text = " ".join(text_parts).strip()

        logger.info(f"Transcription complete: {len(text)} chars")
        return text

    def unload_model(self):
        """Unload model to free memory."""
        with self._lock:
            self._model = None
            self._current_model_name = None
            logger.info("Model unloaded")
