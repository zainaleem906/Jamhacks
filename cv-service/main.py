"""
EcoQuest CV Service — FastAPI + YOLOv8

Start:  uvicorn main:app --reload --port 8000
Mock:   uvicorn main:app --reload --port 8000 (set MOCK=true env var)
"""

import os
import base64
import time
import logging
from contextlib import asynccontextmanager

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from detector import LitterDetector
from anti_cheat import AntiCheatEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ecoquest-cv")

MOCK_MODE = os.getenv("MOCK", "false").lower() == "true"
MODEL_PATH = os.getenv("YOLO_MODEL", "yolov8n.pt")
CONFIDENCE = float(os.getenv("CONFIDENCE", "0.40"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not MOCK_MODE:
        app.state.detector = LitterDetector(model_path=MODEL_PATH, confidence=CONFIDENCE)
        logger.info(f"Detector loaded: {MODEL_PATH}")
    else:
        app.state.detector = None
        logger.info("Running in MOCK mode — no YOLO inference")
    app.state.anti_cheat = AntiCheatEngine()
    yield
    logger.info("Shutting down CV service")


app = FastAPI(title="EcoQuest CV Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DetectionRequest(BaseModel):
    frame: str        # base64-encoded JPEG
    session_id: str


class DetectionResponse(BaseModel):
    detections: list[dict]
    scored: list[dict]
    frame_w: int
    frame_h: int
    mock: bool = False


# ─── Mock state ──────────────────────────────────────────────────────────────

_mock_state: dict[str, dict] = {}


def _mock_detection(session_id: str) -> tuple[list[dict], list[dict]]:
    """Simulate a bottle appearing and disappearing for demo purposes."""
    state = _mock_state.setdefault(session_id, {"frames": 0, "last_scored": 0})
    state["frames"] += 1
    f = state["frames"]
    now = time.time()

    detections: list[dict] = []
    scored: list[dict] = []

    # Cycle: bottle visible frames 5-14, disappears at 15, 20s cooldown
    if 5 <= f < 15:
        detections.append({
            "class": "bottle",
            "confidence": 0.88,
            "bbox": [150, 100, 300, 380],
            "points": 10,
            "fingerprint": f"mock-bottle-{session_id}",
        })

    if f == 15 and now - state["last_scored"] > 20:
        state["last_scored"] = now
        state["frames"] = 0
        scored.append({
            "fingerprint": f"mock-bottle-{session_id}",
            "class": "bottle",
            "points": 10,
            "timestamp": now,
        })

    return detections, scored


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "mock": MOCK_MODE}


@app.post("/detect", response_model=DetectionResponse)
async def detect(req: DetectionRequest):
    if not req.frame:
        raise HTTPException(400, "frame is required")

    if MOCK_MODE:
        detections, scored = _mock_detection(req.session_id)
        return DetectionResponse(detections=detections, scored=scored, frame_w=640, frame_h=480, mock=True)

    # Decode base64 frame
    try:
        img_bytes = base64.b64decode(req.frame)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Failed to decode image")
    except Exception as e:
        raise HTTPException(400, f"Invalid frame data: {e}")

    h, w = frame.shape[:2]

    # Run YOLO detection
    raw_detections = app.state.detector.detect(frame)

    # Apply anti-cheat
    confirmed, scored = app.state.anti_cheat.process(req.session_id, raw_detections, w, h)

    return DetectionResponse(
        detections=confirmed,
        scored=scored,
        frame_w=w,
        frame_h=h,
    )


@app.delete("/session/{session_id}")
async def cleanup_session(session_id: str):
    app.state.anti_cheat.cleanup_session(session_id)
    _mock_state.pop(session_id, None)
    return {"ok": True}
