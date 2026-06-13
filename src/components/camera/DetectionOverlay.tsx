"use client";

import { useEffect, useRef } from "react";
import type { DetectedObject } from "@/types";
import { LITTER_LABELS } from "@/lib/points";

interface DetectionOverlayProps {
  detections: DetectedObject[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const CLASS_COLORS: Record<string, string> = {
  bottle: "#22c55e",
  can: "#0ea5e9",
  bag: "#f59e0b",
  cup: "#a78bfa",
  cardboard: "#fb923c",
  wrapper: "#f472b6",
  litter: "#94a3b8",
};

export default function DetectionOverlay({ detections, videoRef }: DetectionOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / (video.videoWidth || 640);
    const scaleY = canvas.height / (video.videoHeight || 480);

    for (const det of detections) {
      const [x1, y1, x2, y2] = det.bbox;
      const px1 = x1 * scaleX;
      const py1 = y1 * scaleY;
      const pw = (x2 - x1) * scaleX;
      const ph = (y2 - y1) * scaleY;

      const color = CLASS_COLORS[det.class] ?? "#22c55e";

      // Bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(px1, py1, pw, ph);

      // Corner accents
      const cs = 12;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px1, py1 + cs); ctx.lineTo(px1, py1); ctx.lineTo(px1 + cs, py1);
      ctx.moveTo(px1 + pw - cs, py1); ctx.lineTo(px1 + pw, py1); ctx.lineTo(px1 + pw, py1 + cs);
      ctx.moveTo(px1 + pw, py1 + ph - cs); ctx.lineTo(px1 + pw, py1 + ph); ctx.lineTo(px1 + pw - cs, py1 + ph);
      ctx.moveTo(px1 + cs, py1 + ph); ctx.lineTo(px1, py1 + ph); ctx.lineTo(px1, py1 + ph - cs);
      ctx.stroke();

      // Label background
      const label = `${LITTER_LABELS[det.class] ?? det.class} +${det.points}pts`;
      ctx.font = "bold 11px Inter, sans-serif";
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = color + "cc";
      ctx.beginPath();
      ctx.roundRect(px1, py1 - 22, textWidth + 10, 20, 4);
      ctx.fill();

      // Label text
      ctx.fillStyle = "#fff";
      ctx.fillText(label, px1 + 5, py1 - 7);
    }
  }, [detections, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
