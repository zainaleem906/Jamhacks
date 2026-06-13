"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, X } from "lucide-react";
import type { DetectedObject } from "@/types";

interface PhotoSlotProps {
  label: string;
  sublabel: string;
  preview: string | null;
  detections: DetectedObject[];
  onFile: (b64: string, file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}

const CLASS_COLORS: Record<string, string> = {
  bottle: "#22c55e", can: "#0ea5e9", bag: "#f59e0b",
  cup: "#a78bfa", cardboard: "#fb923c", wrapper: "#f472b6", litter: "#94a3b8",
};

function PhotoSlot({ label, sublabel, preview, detections, onFile, onClear, disabled }: PhotoSlotProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw bounding boxes on canvas overlay after image loads
  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !preview) return;

    const draw = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const det of detections) {
        const [x1, y1, x2, y2] = det.bbox;
        const color = CLASS_COLORS[det.class] ?? "#22c55e";
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, canvas.width / 200);
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        const label = `${det.class} ×1`;
        ctx.font = `bold ${Math.max(12, canvas.width / 40)}px Inter, sans-serif`;
        const tw = ctx.measureText(label).width + 10;
        ctx.fillStyle = color + "cc";
        ctx.beginPath();
        ctx.roundRect(x1, y1 - 24, tw, 22, 4);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText(label, x1 + 5, y1 - 7);
      }
    };

    if (img.complete && img.naturalWidth > 0) draw();
    else img.onload = draw;
  }, [preview, detections]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) readFile(file);
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    e.target.value = "";
  }, []);

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const b64 = dataUrl.split(",")[1];
      onFile(b64, file);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">{label}</p>
          <p className="text-gray-500 text-xs">{sublabel}</p>
        </div>
        {detections.length > 0 && (
          <span className="text-xs bg-brand-500/15 text-brand-400 border border-brand-500/30 px-2 py-0.5 rounded-full font-semibold">
            {detections.length} item{detections.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div
        className="relative rounded-2xl overflow-hidden border border-eco-border bg-eco-card"
        style={{ minHeight: 200 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={preview}
              alt={label}
              className="w-full object-contain"
              style={{ display: "block", maxHeight: 300 }}
            />
            {/* Canvas overlay for bounding boxes */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ objectFit: "contain" }}
            />
            {!disabled && (
              <button
                onClick={onClear}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </>
        ) : (
          <label className={`flex flex-col items-center justify-center gap-3 p-6 cursor-pointer w-full h-full ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-eco-border/30"} transition-colors`} style={{ minHeight: 200 }}>
            <div className="w-14 h-14 rounded-full bg-brand-500/10 border-2 border-dashed border-brand-500/30 flex items-center justify-center">
              <Upload size={24} className="text-brand-400" />
            </div>
            <p className="text-gray-400 text-sm text-center">Click or drag a photo here</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled}
              onChange={onFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface AnalysisResult {
  detections: DetectedObject[];
  count: number;
}

interface PhotoCompareProps {
  beforeResult: AnalysisResult | null;
  afterResult: AnalysisResult | null;
  analyzing: boolean;
  onBothReady: (before: string, after: string) => void;
  onReset: () => void;
}

export default function PhotoCompare({ beforeResult, afterResult, analyzing, onBothReady, onReset }: PhotoCompareProps) {
  const [beforeB64, setBeforeB64] = useState<string | null>(null);
  const [afterB64, setAfterB64] = useState<string | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);

  useEffect(() => {
    if (beforeB64 && afterB64) onBothReady(beforeB64, afterB64);
  }, [beforeB64, afterB64, onBothReady]);

  function handleBefore(b64: string, file: File) {
    setBeforeB64(b64);
    setBeforePreview(URL.createObjectURL(file));
  }
  function handleAfter(b64: string, file: File) {
    setAfterB64(b64);
    setAfterPreview(URL.createObjectURL(file));
  }
  function clearBefore() { setBeforeB64(null); setBeforePreview(null); onReset(); }
  function clearAfter()  { setAfterB64(null);  setAfterPreview(null);  onReset(); }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <PhotoSlot
        label="📸 Before"
        sublabel="Photo showing the litter"
        preview={beforePreview}
        detections={beforeResult?.detections ?? []}
        onFile={handleBefore}
        onClear={clearBefore}
        disabled={analyzing}
      />
      <PhotoSlot
        label="✅ After"
        sublabel="Photo after you cleaned up"
        preview={afterPreview}
        detections={afterResult?.detections ?? []}
        onFile={handleAfter}
        onClear={clearAfter}
        disabled={analyzing}
      />
    </div>
  );
}
