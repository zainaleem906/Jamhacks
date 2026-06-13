"use client";

import { useRef, useState, useCallback } from "react";

interface UseVideoUploadResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoUrl: string | null;
  fileName: string | null;
  error: string | null;
  loadVideo: (file: File) => void;
  captureFrame: () => string | null;
  clearVideo: () => void;
}

const ACCEPTED = ["video/mp4", "video/webm", "video/quicktime", "video/avi"];

export function useVideoUpload(): UseVideoUploadResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadVideo = useCallback((file: File) => {
    if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi)$/i)) {
      setError("Please upload a video file (MP4, WebM, MOV)");
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
    setFileName(file.name);
    setError(null);
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
    }
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused || video.ended || video.readyState < 2) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
  }, []);

  const clearVideo = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setFileName(null);
    setError(null);
    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current.load();
    }
  }, [videoUrl]);

  return { videoRef, canvasRef, videoUrl, fileName, error, loadVideo, captureFrame, clearVideo };
}
