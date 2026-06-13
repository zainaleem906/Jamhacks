"use client";

import { useEffect } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useDetection } from "@/hooks/useDetection";
import DetectionOverlay from "./DetectionOverlay";
import Button from "@/components/ui/Button";
import { Camera, CameraOff, Wifi, WifiOff } from "lucide-react";
import type { ScoredPickup } from "@/types";

interface CameraFeedProps {
  sessionId: string | null;
  active: boolean;
  onPickup: (pickups: ScoredPickup[]) => void;
  onPointsUpdate: (total: number, count: number) => void;
}

export default function CameraFeed({ sessionId, active, onPickup, onPointsUpdate }: CameraFeedProps) {
  const { videoRef, canvasRef, stream, error, starting, startCamera, stopCamera, captureFrame } = useCamera();
  const { detections, running, cvOffline, startDetection, stopDetection, newPickups, clearNewPickups, totalPoints, itemCount } = useDetection();

  // Bubble new pickups up
  useEffect(() => {
    if (newPickups.length > 0) {
      onPickup(newPickups);
      onPointsUpdate(totalPoints, itemCount);
      clearNewPickups();
    }
  }, [newPickups, onPickup, onPointsUpdate, clearNewPickups, totalPoints, itemCount]);

  // Start/stop detection with session
  useEffect(() => {
    if (active && sessionId && stream && !running) {
      startDetection(sessionId, captureFrame);
    }
    if (!active && running) {
      stopDetection();
    }
  }, [active, sessionId, stream, running, startDetection, stopDetection, captureFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopDetection();
    };
  }, [stopCamera, stopDetection]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 bg-eco-card rounded-2xl border border-red-500/30">
        <CameraOff size={40} className="text-red-400" />
        <p className="text-red-400 text-sm">{error}</p>
        <Button onClick={startCamera} size="sm">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-eco-border">
      {/* Video element */}
      {/* autoPlay removed — play() is called explicitly in useCamera after loadedmetadata */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Detection overlay */}
      {stream && <DetectionOverlay detections={detections} videoRef={videoRef} />}

      {/* No stream placeholder */}
      {!stream && !starting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center animate-pulse">
            <Camera size={32} className="text-brand-400" />
          </div>
          <p className="text-gray-400 text-sm">Camera not active</p>
          <Button onClick={startCamera} loading={starting}>Enable Camera</Button>
        </div>
      )}

      {/* Loading overlay */}
      {starting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-brand-400 text-sm animate-pulse">Starting camera…</div>
        </div>
      )}

      {/* CV service status badge */}
      {stream && (
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
          cvOffline
            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            : "bg-brand-500/20 text-brand-400 border border-brand-500/30"
        }`}>
          {cvOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
          {cvOffline ? "CV offline" : "AI active"}
        </div>
      )}

      {/* Scanning animation */}
      {running && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-[scan_3s_linear_infinite]" />
        </div>
      )}
    </div>
  );
}
