"use client";

import { useEffect, useRef, useCallback } from "react";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { useDetection } from "@/hooks/useDetection";
import DetectionOverlay from "./DetectionOverlay";
import { Upload, X, Wifi, WifiOff } from "lucide-react";
import type { ScoredPickup } from "@/types";

interface VideoFeedProps {
  sessionId: string | null;
  active: boolean;
  onPickup: (pickups: ScoredPickup[]) => void;
  onPointsUpdate: (total: number, count: number) => void;
}

export default function VideoFeed({ sessionId, active, onPickup, onPointsUpdate }: VideoFeedProps) {
  const { videoRef, canvasRef, videoUrl, fileName, error, loadVideo, captureFrame, clearVideo } = useVideoUpload();
  const { detections, running, cvOffline, startDetection, stopDetection, newPickups, clearNewPickups, totalPoints, itemCount } = useDetection();
  const dropRef = useRef<HTMLDivElement>(null);

  // Bubble pickups up
  useEffect(() => {
    if (newPickups.length > 0) {
      onPickup(newPickups);
      onPointsUpdate(totalPoints, itemCount);
      clearNewPickups();
    }
  }, [newPickups, onPickup, onPointsUpdate, clearNewPickups, totalPoints, itemCount]);

  // Start/stop detection
  useEffect(() => {
    if (active && sessionId && videoUrl && !running) {
      videoRef.current?.play();
      startDetection(sessionId, captureFrame);
    }
    if (!active && running) {
      videoRef.current?.pause();
      stopDetection();
    }
  }, [active, sessionId, videoUrl, running, startDetection, stopDetection, captureFrame, videoRef]);

  useEffect(() => {
    return () => stopDetection();
  }, [stopDetection]);

  // Drag-and-drop handlers
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadVideo(file);
  }, [loadVideo]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadVideo(file);
  }, [loadVideo]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-eco-border">
      {/* Video player (always mounted so ref is stable) */}
      <video
        ref={videoRef}
        className={`w-full h-full object-contain ${videoUrl ? "block" : "hidden"}`}
        playsInline
        muted={false}
        controls={false}
        loop={false}
        onEnded={() => stopDetection()}
      />

      {/* Hidden capture canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Detection overlay */}
      {videoUrl && <DetectionOverlay detections={detections} videoRef={videoRef} />}

      {/* Upload zone — shown when no video loaded */}
      {!videoUrl && (
        <div
          ref={dropRef}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer group"
        >
          <label className="flex flex-col items-center gap-4 cursor-pointer w-full h-full justify-center px-8">
            <div className="w-20 h-20 rounded-full bg-brand-500/10 border-2 border-dashed border-brand-500/40 flex items-center justify-center group-hover:border-brand-500 group-hover:bg-brand-500/20 transition-all">
              <Upload size={32} className="text-brand-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">Upload your cleanup video</p>
              <p className="text-gray-500 text-sm mt-1">Drag & drop or click to browse</p>
              <p className="text-gray-600 text-xs mt-1">MP4, WebM, MOV supported</p>
            </div>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              className="hidden"
              onChange={onFileChange}
            />
          </label>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl">{error}</p>
        </div>
      )}

      {/* File name bar + clear button */}
      {videoUrl && fileName && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2">
          <span className="text-white text-xs truncate">{fileName}</span>
          <button
            onClick={() => { clearVideo(); stopDetection(); }}
            className="text-gray-400 hover:text-white ml-2 flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* CV status badge */}
      {videoUrl && running && (
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
          cvOffline
            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            : "bg-brand-500/20 text-brand-400 border border-brand-500/30"
        }`}>
          {cvOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
          {cvOffline ? "CV offline" : "Analyzing…"}
        </div>
      )}
    </div>
  );
}
