"use client";

import { useRef, useState, useCallback } from "react";

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  stream: MediaStream | null;
  error: string | null;
  starting: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => string | null;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const startCamera = useCallback(async () => {
    setStarting(true);
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = s;
        // Wait for metadata before calling play() to avoid AbortError
        await new Promise<void>((resolve) => {
          const v = videoRef.current!;
          if (v.readyState >= 1) { resolve(); return; }
          v.onloadedmetadata = () => resolve();
        });
        try {
          await videoRef.current.play();
        } catch (playErr) {
          // AbortError fires when srcObject changes mid-play; safe to ignore
          if ((playErr as Error).name !== "AbortError") throw playErr;
        }
      }
      setStream(s);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Camera access denied";
      setError(msg);
    } finally {
      setStarting(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !stream) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
  }, [stream]);

  return { videoRef, canvasRef, stream, error, starting, startCamera, stopCamera, captureFrame };
}
