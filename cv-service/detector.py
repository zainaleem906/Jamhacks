"""YOLOv8-based litter detector — detects any object on the floor."""

import cv2
import numpy as np
from ultralytics import YOLO

# COCO classes to skip — things that are clearly not litter on a floor
SKIP_CLASSES = {
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train",
    "truck", "boat", "traffic light", "fire hydrant", "stop sign",
    "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep",
    "cow", "elephant", "bear", "zebra", "giraffe", "couch", "bed",
    "dining table", "toilet", "tv", "laptop", "refrigerator", "oven",
    "microwave", "sink", "potted plant", "chair",
}

# Known litter items get specific labels
LITTER_LABELS: dict[str, str] = {
    "bottle": "bottle",
    "cup": "cup",
    "can": "can",
    "bag": "bag",
    "handbag": "bag",
    "backpack": "bag",
    "suitcase": "bag",
    "book": "cardboard",
    "paper": "wrapper",
    "banana": "wrapper",
    "apple": "wrapper",
    "orange": "wrapper",
    "sandwich": "wrapper",
    "pizza": "wrapper",
    "hot dog": "wrapper",
    "cake": "wrapper",
    "fork": "litter",
    "knife": "litter",
    "spoon": "litter",
    "bowl": "litter",
    "scissors": "litter",
    "umbrella": "litter",
    "tie": "wrapper",
    "frisbee": "litter",
    "sports ball": "litter",
    "baseball bat": "litter",
    "baseball glove": "litter",
    "skateboard": "litter",
    "surfboard": "litter",
    "tennis racket": "litter",
    "wine glass": "bottle",
    "cell phone": "litter",
    "remote": "litter",
    "keyboard": "litter",
    "mouse": "litter",
    "toothbrush": "litter",
    "hair drier": "litter",
    "clock": "litter",
    "vase": "litter",
    "teddy bear": "litter",
}


class LitterDetector:
    def __init__(self, model_path: str = "yolov8n.pt", confidence: float = 0.20):
        self.model = YOLO(model_path)
        self.confidence = confidence
        print(f"[LitterDetector] Loaded model: {model_path}")

    def detect(self, frame: np.ndarray) -> list[dict]:
        """Run detection on a BGR frame, return list of detection dicts."""
        results = self.model(
            frame,
            conf=self.confidence,
            iou=0.35,        # lower = keep more overlapping boxes (better for dense litter)
            max_det=50,      # allow up to 50 objects per image
            verbose=False,
        )
        detections = []

        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                cls_name = result.names[cls_id].lower()
                conf = float(box.conf[0])

                if cls_name in SKIP_CLASSES:
                    continue

                label = LITTER_LABELS.get(cls_name, "litter")
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append({
                    "class": label,
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2],
                    "points": 1,
                })

        return detections
