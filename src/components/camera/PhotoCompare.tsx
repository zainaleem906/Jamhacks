"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle } from "lucide-react";
import type { DetectedObject } from "@/types";

const CLASS_COLORS: Record<string, string> = {
  bottle: "#00d4e8", can: "#40e080", bag: "#ffb347",
  cup: "#9b7fe8", cardboard: "#ff6b3a", wrapper: "#ff6b8a", litter: "#6a9abf",
};

interface PhotoSlotProps {
  label: string;
  tag: string;
  color: string;
  preview: string | null;
  detections: DetectedObject[];
  onFile: (b64: string, file: File) => void;
  onClear: () => void;
  disabled?: boolean;
  analyzing?: boolean;
}

function PhotoSlot({ label, tag, color, preview, detections, onFile, onClear, disabled, analyzing }: PhotoSlotProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState(false);

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
        const c = CLASS_COLORS[det.class] ?? "#00d4e8";
        ctx.strokeStyle = c;
        ctx.lineWidth = Math.max(2, canvas.width / 200);
        ctx.shadowColor = c;
        ctx.shadowBlur = 8;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        ctx.shadowBlur = 0;
        const lbl = det.class;
        ctx.font = `bold ${Math.max(12, canvas.width / 40)}px Inter, sans-serif`;
        const tw = ctx.measureText(lbl).width + 12;
        ctx.fillStyle = c + "cc";
        ctx.beginPath();
        ctx.roundRect(x1, y1 - 26, tw, 22, 4);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.fillText(lbl, x1 + 6, y1 - 8);
      }
    };
    if (img.complete && img.naturalWidth > 0) draw();
    else img.onload = draw;
  }, [preview, detections]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) readFile(file);
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
      onFile(dataUrl.split(",")[1], file);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ flex: 1 }}>
      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800,
            letterSpacing: "0.1em", textTransform: "uppercase",
            background: `${color}18`, color, border: `1px solid ${color}40`,
          }}>
            {tag}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#d8f0ff" }}>{label}</span>
        </div>
        {detections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "3px 10px", borderRadius: 20,
              background: `${color}18`, color, border: `1px solid ${color}40`,
              fontSize: 11, fontWeight: 700,
            }}
          >
            <CheckCircle size={11} />
            {detections.length} detected
          </motion.div>
        )}
      </div>

      {/* Drop zone */}
      <div
        className={preview ? "upload-zone has-image" : "upload-zone"}
        style={{
          minHeight: 220,
          borderColor: dragging ? color : undefined,
          boxShadow: dragging ? `0 0 30px ${color}30, inset 0 0 30px ${color}08` : undefined,
          background: dragging ? `${color}06` : undefined,
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "relative", width: "100%", height: "100%" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={preview}
                alt={label}
                style={{ width: "100%", objectFit: "contain", display: "block", maxHeight: 320 }}
              />
              <canvas
                ref={canvasRef}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
              />
              {/* Scan line when analyzing */}
              {analyzing && <div className="scan-line" />}
              {/* Clear button */}
              {!disabled && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={onClear}
                  style={{
                    position: "absolute", top: 10, right: 10,
                    width: 30, height: 30, borderRadius: "50%",
                    background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#fff",
                  }}
                >
                  <X size={14} />
                </motion.button>
              )}
              {/* Detection count badge */}
              {detections.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    position: "absolute", bottom: 10, left: 10,
                    padding: "4px 12px", borderRadius: 20,
                    background: `${color}dd`, color: "#000",
                    fontSize: 11, fontWeight: 800,
                    boxShadow: `0 0 16px ${color}80`,
                  }}
                >
                  {detections.length} item{detections.length !== 1 ? "s" : ""} found
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.label
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 16, padding: 32, cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.4 : 1, minHeight: 220,
              }}
            >
              <motion.div
                animate={{ scale: dragging ? 1.15 : 1 }}
                style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: `${color}12`, border: `2px dashed ${color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}
              >
                <Upload size={24} style={{ color }} />
                {dragging && (
                  <>
                    <div className="pulse-ring" style={{ width: 64, height: 64, borderColor: `${color}80` }} />
                    <div className="pulse-ring" style={{ width: 64, height: 64, borderColor: `${color}40`, animationDelay: "0.5s" }} />
                  </>
                )}
              </motion.div>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#d8f0ff", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  {dragging ? "Drop it!" : "Upload photo"}
                </p>
                <p style={{ color: "#2e4a68", fontSize: 12 }}>Click or drag & drop</p>
              </div>
              <input type="file" accept="image/*" style={{ display: "none" }} disabled={disabled} onChange={onFileChange} />
            </motion.label>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface AnalysisResult { detections: DetectedObject[]; count: number; }
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

  function handleBefore(b64: string, file: File) { setBeforeB64(b64); setBeforePreview(URL.createObjectURL(file)); }
  function handleAfter(b64: string, file: File) { setAfterB64(b64); setAfterPreview(URL.createObjectURL(file)); }
  function clearBefore() { setBeforeB64(null); setBeforePreview(null); onReset(); }
  function clearAfter() { setAfterB64(null); setAfterPreview(null); onReset(); }

  return (
    <div>
      {/* Analyzing overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 20,
              background: "rgba(3,11,28,0.85)", backdropFilter: "blur(4px)",
              borderRadius: 16, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 20,
            }}
          >
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 80, height: 80, borderRadius: "50%",
                  border: "2px solid rgba(0,212,232,0.15)",
                  borderTopColor: "#00d4e8",
                  position: "absolute", inset: 0,
                  boxShadow: "0 0 20px rgba(0,212,232,0.3)",
                }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  border: "2px solid rgba(255,107,58,0.15)",
                  borderTopColor: "#ff6b3a",
                  position: "absolute", top: 12, left: 12,
                }}
              />
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>🔍</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 800, color: "#d8f0ff", letterSpacing: "0.04em" }}>
                AI SCANNING
              </p>
              <p style={{ fontSize: 12, color: "#6a9abf", marginTop: 4 }}>Counting items removed…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", flexDirection: "row", gap: 16, position: "relative" }}>
        <PhotoSlot
          label="Before you cleaned" tag="BEFORE" color="#ff6b3a"
          preview={beforePreview} detections={beforeResult?.detections ?? []}
          onFile={handleBefore} onClear={clearBefore} disabled={analyzing} analyzing={analyzing && !!beforePreview}
        />

        {/* Divider */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, paddingTop: 34, flexShrink: 0 }}>
          <div style={{ width: 1, flex: 1, background: "linear-gradient(to bottom, transparent, rgba(80,160,220,0.2), transparent)" }} />
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(5,14,35,0.9)", border: "1px solid rgba(80,160,220,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#2e4a68", fontWeight: 800,
          }}>→</div>
          <div style={{ width: 1, flex: 1, background: "linear-gradient(to bottom, transparent, rgba(80,160,220,0.2), transparent)" }} />
        </div>

        <PhotoSlot
          label="After you cleaned" tag="AFTER" color="#00d4e8"
          preview={afterPreview} detections={afterResult?.detections ?? []}
          onFile={handleAfter} onClear={clearAfter} disabled={analyzing} analyzing={analyzing && !!afterPreview}
        />
      </div>
    </div>
  );
}
