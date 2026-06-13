"""YOLOv8-based litter detector using COCO-class approximations."""

import cv2
import numpy as np
from ultralytics import YOLO

# COCO class IDs → (litter label, points)
# Using the closest COCO classes for common litter items
LITTER_MAP: dict[int, tuple[str, int]] = {
    39: ("bottle", 10),   # bottle
    41: ("cup", 8),       # cup
    64: ("mouse", 5),     # sometimes picks up round items
    67: ("cell phone", 5),# sometimes misidentified litter
    73: ("book", 5),      # cardboard-ish
    76: ("scissors", 5),  # metal litter
    77: ("teddy bear", 7), # bags sometimes
}

# Better: if using custom model or YOLO with trash dataset
# These custom class names would override COCO
CUSTOM_CLASSES: dict[str, tuple[str, int]] = {
    "plastic bottle": ("bottle", 10),
    "bottle": ("bottle", 10),
    "can": ("can", 12),
    "aluminum can": ("can", 12),
    "plastic bag": ("bag", 15),
    "bag": ("bag", 15),
    "cup": ("cup", 8),
    "paper cup": ("cup", 8),
    "cardboard": ("cardboard", 10),
    "wrapper": ("wrapper", 7),
    "cigarette": ("litter", 5),
    "trash": ("litter", 5),
    "garbage": ("litter", 5),
    "litter": ("litter", 5),
}


class LitterDetector:
    def __init__(self, model_path: str = "yolov8n.pt", confidence: float = 0.4):
        self.model = YOLO(model_path)
        self.confidence = confidence
        print(f"[LitterDetector] Loaded model: {model_path}")

    def detect(self, frame: np.ndarray) -> list[dict]:
        """Run detection on a BGR frame, return list of detection dicts."""
        results = self.model(frame, conf=self.confidence, verbose=False)
        detections = []

        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                cls_name = result.names[cls_id].lower()
                conf = float(box.conf[0])

                # Check custom classes first (e.g. if using a custom trash model)
                litter_info = CUSTOM_CLASSES.get(cls_name)
                if litter_info is None:
                    # Fall back to COCO class mapping
                    litter_info = LITTER_MAP.get(cls_id)

                if litter_info is None:
                    continue

                label, points = litter_info
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append({
                    "class": label,
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2],
                    "points": points,
                })

        return detections
