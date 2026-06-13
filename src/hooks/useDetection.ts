"use client";

import { useRef, useState, useCallback } from "react";
import type { DetectedObject, ScoredPickup } from "@/types";

interface DetectionState {
  detections: DetectedObject[];
  scored: ScoredPickup[];
  totalPoints: number;
  itemCount: number;
  cvOffline: boolean;
}

interface UseDetectionResult extends DetectionState {
  running: boolean;
  startDetection: (sessionId: string, captureFrame: () => string | null) => void;
  stopDetection: () => void;
  newPickups: ScoredPickup[];
  clearNewPickups: () => void;
}

export function useDetection(): UseDetectionResult {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [running, setRunning] = useState(false);
  const [state, setState] = useState<DetectionState>({
    detections: [],
    scored: [],
    totalPoints: 0,
    itemCount: 0,
    cvOffline: false,
  });
  const [newPickups, setNewPickups] = useState<ScoredPickup[]>([]);

  const startDetection = useCallback(
    (sessionId: string, captureFrame: () => string | null) => {
      if (intervalRef.current) return;
      setRunning(true);

      intervalRef.current = setInterval(async () => {
        const frame = captureFrame();
        if (!frame) return;

        try {
          const res = await fetch("/api/cleanup/detect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ frame, sessionId }),
          });

          if (res.status === 429) return; // rate limited, skip

          const json = await res.json();
          if (!json.ok) return;

          const { detections, scored, cvOffline } = json.data;

          if (scored?.length > 0) {
            const newPoints = scored.reduce((sum: number, s: ScoredPickup) => sum + s.points, 0);
            setState((prev) => ({
              ...prev,
              detections: detections ?? prev.detections,
              scored: [...prev.scored, ...scored],
              totalPoints: prev.totalPoints + newPoints,
              itemCount: prev.itemCount + scored.length,
              cvOffline: cvOffline ?? false,
            }));
            setNewPickups((prev) => [...prev, ...scored]);
          } else {
            setState((prev) => ({
              ...prev,
              detections: detections ?? prev.detections,
              cvOffline: cvOffline ?? false,
            }));
          }
        } catch {
          // Network error — ignore
        }
      }, 1000);
    },
    []
  );

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const clearNewPickups = useCallback(() => setNewPickups([]), []);

  return { ...state, running, startDetection, stopDetection, newPickups, clearNewPickups };
}
