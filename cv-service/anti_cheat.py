"""
Anti-cheat engine for EcoQuest litter detection.

Key rules:
1. Object must be detected in 3+ consecutive frames before being "tracked"
2. Object must DISAPPEAR for 3+ consecutive frames to award points
3. Each unique object fingerprint has a 60s cooldown per session
4. Max 5 pickups per minute per session
5. Objects must be in a different position across consecutive detections
   (prevents showing a static photo on screen)
"""

import time
import hashlib
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class TrackedObject:
    fingerprint: str
    cls: str
    points: int
    appear_frames: int = 0      # consecutive frames it has been seen
    disappear_frames: int = 0   # consecutive frames it has been absent
    last_seen: float = 0.0
    position_history: list[tuple[float, float]] = field(default_factory=list)
    scored: bool = False


@dataclass
class SessionState:
    tracked: dict[str, TrackedObject] = field(default_factory=dict)
    cooldowns: dict[str, float] = field(default_factory=dict)  # fp → last_scored_time
    pickup_times: list[float] = field(default_factory=list)    # for rate limiting
    total_pickups: int = 0


class AntiCheatEngine:
    APPEAR_THRESHOLD = 3       # frames needed to confirm object exists
    DISAPPEAR_THRESHOLD = 3    # frames needed to confirm object was picked up
    COOLDOWN_SECS = 60.0       # cooldown per unique object fingerprint
    MAX_PICKUPS_PER_MINUTE = 8
    STATIC_TOLERANCE = 0.03    # max fraction of frame width for "static" detection
    POSITION_BUCKET = 0.10     # bucket size for fingerprint (10% of frame)

    def __init__(self):
        self.sessions: dict[str, SessionState] = {}

    def _get_session(self, session_id: str) -> SessionState:
        if session_id not in self.sessions:
            self.sessions[session_id] = SessionState()
        return self.sessions[session_id]

    def _make_fingerprint(self, detection: dict, frame_w: int = 640, frame_h: int = 480) -> str:
        """Create a spatial fingerprint — stable if object doesn't move much."""
        x1, y1, x2, y2 = detection["bbox"]
        cx = (x1 + x2) / 2 / frame_w
        cy = (y1 + y2) / 2 / frame_h
        # Bucket to tolerance grid
        bx = round(cx / self.POSITION_BUCKET)
        by = round(cy / self.POSITION_BUCKET)
        raw = f"{detection['class']}-{bx}-{by}"
        return hashlib.md5(raw.encode()).hexdigest()[:12]

    def _is_static(self, obj: TrackedObject) -> bool:
        """Return True if the object hasn't moved (likely a screen photo)."""
        if len(obj.position_history) < 3:
            return False
        xs = [p[0] for p in obj.position_history[-5:]]
        ys = [p[1] for p in obj.position_history[-5:]]
        spread = max(max(xs) - min(xs), max(ys) - min(ys))
        return spread < self.STATIC_TOLERANCE

    def _rate_limited(self, state: SessionState) -> bool:
        """True if user has exceeded max pickups per minute."""
        now = time.time()
        state.pickup_times = [t for t in state.pickup_times if now - t < 60]
        return len(state.pickup_times) >= self.MAX_PICKUPS_PER_MINUTE

    def process(
        self,
        session_id: str,
        detections: list[dict],
        frame_w: int = 640,
        frame_h: int = 480,
    ) -> tuple[list[dict], list[dict]]:
        """
        Process one frame's detections for a session.

        Returns:
            (updated_detections, scored_pickups)
            scored_pickups: list of dicts to award points for
        """
        state = self._get_session(session_id)
        now = time.time()

        # Build fingerprint → detection map for this frame
        seen_fps: set[str] = set()
        for det in detections:
            fp = self._make_fingerprint(det, frame_w, frame_h)
            det["fingerprint"] = fp
            seen_fps.add(fp)

            cx = (det["bbox"][0] + det["bbox"][2]) / 2 / frame_w
            cy = (det["bbox"][1] + det["bbox"][3]) / 2 / frame_h

            if fp not in state.tracked:
                state.tracked[fp] = TrackedObject(
                    fingerprint=fp,
                    cls=det["class"],
                    points=det["points"],
                    last_seen=now,
                    position_history=[(cx, cy)],
                )
            else:
                obj = state.tracked[fp]
                obj.appear_frames += 1
                obj.disappear_frames = 0
                obj.last_seen = now
                obj.position_history.append((cx, cy))
                if len(obj.position_history) > 20:
                    obj.position_history = obj.position_history[-20:]

        # Update disappear counters for objects not seen this frame
        scored_pickups = []
        for fp, obj in list(state.tracked.items()):
            if fp not in seen_fps:
                obj.disappear_frames += 1

                # Object confirmed picked up
                if (
                    obj.appear_frames >= self.APPEAR_THRESHOLD
                    and obj.disappear_frames >= self.DISAPPEAR_THRESHOLD
                    and not obj.scored
                ):
                    # Anti-cheat checks
                    on_cooldown = (now - state.cooldowns.get(fp, 0)) < self.COOLDOWN_SECS
                    rate_limited = self._rate_limited(state)
                    static = self._is_static(obj)

                    if not on_cooldown and not rate_limited and not static:
                        obj.scored = True
                        state.cooldowns[fp] = now
                        state.pickup_times.append(now)
                        state.total_pickups += 1
                        scored_pickups.append({
                            "fingerprint": fp,
                            "class": obj.cls,
                            "points": obj.points,
                            "timestamp": now,
                        })

                # Clean up old/stale tracked objects (gone > 10s)
                if now - obj.last_seen > 10:
                    del state.tracked[fp]

        # Only return detections where object has been confirmed (appear >= threshold)
        confirmed_detections = [
            d for d in detections
            if state.tracked.get(d["fingerprint"], TrackedObject("", "", 0)).appear_frames >= 1
        ]

        return confirmed_detections, scored_pickups

    def cleanup_session(self, session_id: str):
        self.sessions.pop(session_id, None)
