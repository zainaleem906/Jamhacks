"""YOLOv8-based litter detector — two-model pipeline.

Detection:      yolov8n (nano)  — finds everything object-shaped, counts only (label ignored)
Classification: yolov8l (large) — identifies what each detected region actually is
                                   overrides nano label with bottle/can/bag/etc. or falls back to "litter"
"""

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
    def __init__(
        self,
        model_path: str = "yolov8n.pt",
        classifier_path: str = "yolov8l.pt",
        confidence: float = 0.05,
        classify_confidence: float = 0.25,
    ):
        self.model = YOLO(model_path)
        self.classifier = YOLO(classifier_path)
        self.confidence = confidence
        self.classify_confidence = classify_confidence
        print(f"[LitterDetector] Detector: {model_path} | Classifier: {classifier_path}")

    def detect(self, frame: np.ndarray) -> list[dict]:
        """Run two-stage detection on a BGR frame, return list of detection dicts."""
        results = self.model(
            frame,
            conf=self.confidence,
            iou=0.60,
            max_det=50,
            imgsz=1280,
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

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                # Reject tiny boxes — likely noise or texture artifacts
                h, w = frame.shape[:2]
                box_area = (x2 - x1) * (y2 - y1)
                if box_area < (w * h * 0.005):
                    continue

                # Nano's label is ignored — large model classifies, falls back to "litter"
                label = self._classify_crop(frame, x1, y1, x2, y2)

                detections.append({
                    "class": label,
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2],
                    "points": 1,
                })

        return detections

    def _classify_crop(self, frame: np.ndarray, x1: float, y1: float, x2: float, y2: float) -> str:
        """Crop the detected region and run the large classifier.
        Returns a specific label (bottle/can/bag/etc.) or 'litter' if uncertain.
        Nano's label is never used here — large model decides or defaults to litter.
        """
        h, w = frame.shape[:2]

        pad = 20
        cx1 = max(0, int(x1) - pad)
        cy1 = max(0, int(y1) - pad)
        cx2 = min(w, int(x2) + pad)
        cy2 = min(h, int(y2) + pad)

        crop = frame[cy1:cy2, cx1:cx2]
        if crop.size == 0:
            return "litter"

        results = self.classifier(crop, conf=self.classify_confidence, max_det=1, verbose=False)

        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                cls_name = result.names[cls_id].lower()
                if cls_name not in SKIP_CLASSES:
                    return LITTER_LABELS.get(cls_name, "litter")

        return "litter"
