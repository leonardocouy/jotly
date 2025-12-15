"""Jotly Backend - FastAPI server for voice-to-text transcription."""

import logging
import threading
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .services import AVAILABLE_MODELS, AudioService, TranscriptionService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Global service instances
audio_service = AudioService()
transcription_service = TranscriptionService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown."""
    logger.info("Starting Jotly backend...")
    # Load default model in background thread
    threading.Thread(
        target=transcription_service.load_model,
        args=("tiny",),
        daemon=True,
    ).start()
    yield
    logger.info("Shutting down Jotly backend...")


app = FastAPI(
    title="Jotly Backend",
    description="Voice-to-text transcription API using Whisper",
    version="0.1.0",
    lifespan=lifespan,
)

# Allow CORS for Electron app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request/Response Models ---


class StatusResponse(BaseModel):
    recording: bool
    model_loaded: bool
    model_loading: bool
    current_model: Optional[str]


class RecordingStopRequest(BaseModel):
    language: str = "auto"


class TranscriptionResponse(BaseModel):
    text: str
    success: bool


class LoadModelRequest(BaseModel):
    model: str


class SetDeviceRequest(BaseModel):
    device_id: Optional[int]


class DeviceInfo(BaseModel):
    id: int
    name: str
    channels: int


# --- Endpoints ---


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/status", response_model=StatusResponse)
async def get_status():
    """Get current backend status."""
    return StatusResponse(
        recording=audio_service.is_recording(),
        model_loaded=transcription_service.is_loaded(),
        model_loading=transcription_service.is_loading(),
        current_model=transcription_service.get_current_model(),
    )


@app.post("/recording/start")
async def start_recording():
    """Start audio recording."""
    if audio_service.is_recording():
        raise HTTPException(status_code=400, detail="Already recording")

    if not transcription_service.is_loaded():
        raise HTTPException(status_code=400, detail="Model not loaded yet")

    audio_service.start_recording()
    return {"success": True}


@app.post("/recording/stop", response_model=TranscriptionResponse)
async def stop_recording(request: RecordingStopRequest = RecordingStopRequest()):
    """Stop recording and transcribe audio."""
    if not audio_service.is_recording():
        raise HTTPException(status_code=400, detail="Not recording")

    # Stop recording and get audio
    audio = audio_service.stop_recording()

    if len(audio) == 0:
        return TranscriptionResponse(text="", success=True)

    # Transcribe
    try:
        text = transcription_service.transcribe(audio, language=request.language)
        return TranscriptionResponse(text=text, success=True)
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
async def list_models():
    """List available Whisper models."""
    return {
        "models": AVAILABLE_MODELS,
        "current": transcription_service.get_current_model(),
    }


@app.post("/models/load")
async def load_model(request: LoadModelRequest):
    """Load a Whisper model."""
    if request.model not in AVAILABLE_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model. Available: {AVAILABLE_MODELS}",
        )

    if transcription_service.is_loading():
        raise HTTPException(status_code=400, detail="Model is already loading")

    # Load model in background thread
    threading.Thread(
        target=transcription_service.load_model,
        args=(request.model,),
        daemon=True,
    ).start()

    return {"success": True, "message": f"Loading model: {request.model}"}


@app.get("/devices", response_model=list[DeviceInfo])
async def list_devices():
    """List available audio input devices."""
    devices = AudioService.get_input_devices()
    return [DeviceInfo(**d) for d in devices]


@app.post("/devices/set")
async def set_device(request: SetDeviceRequest):
    """Set the audio input device."""
    audio_service.set_device(request.device_id)
    return {"success": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8765)
