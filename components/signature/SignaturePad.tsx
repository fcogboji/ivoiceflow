"use client";

import { useRef, useState, useCallback } from "react";

type Props = {
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
};

export function SignaturePad({ onSave, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [mode, setMode] = useState<"draw" | "type">("draw");

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const getCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e) {
        return {
          x: (e.touches[0]!.clientX - rect.left) * scaleX,
          y: (e.touches[0]!.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const start = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const ctx = getCtx();
      if (!ctx) return;
      const { x, y } = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      setIsDrawing(true);
    },
    [getCtx, getCoords]
  );

  const move = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!isDrawing) return;
      const ctx = getCtx();
      if (!ctx) return;
      const { x, y } = getCoords(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing, getCtx, getCoords]
  );

  const end = useCallback(() => setIsDrawing(false), []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTypedName("");
  }, [getCtx]);

  const applyTypedName = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || !typedName.trim()) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "italic 32px Georgia, serif";
    ctx.fillStyle = "#1e293b";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName.trim(), 20, canvas.height / 2);
  }, [typedName, getCtx]);

  const save = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (mode === "type" && typedName.trim()) applyTypedName();
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  }, [mode, typedName, applyTypedName, getCtx, onSave]);

  const hasContent = useRef(false);
  const handleDrawEnd = () => {
    hasContent.current = true;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setMode("draw")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg ${mode === "draw" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          Draw
        </button>
        <button
          type="button"
          onClick={() => setMode("type")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg ${mode === "type" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          Type name
        </button>
      </div>

      {mode === "draw" ? (
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="w-full border border-slate-300 rounded-lg bg-white touch-none block"
          style={{ maxWidth: "100%", height: "120px" }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={() => { end(); handleDrawEnd(); }}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Type your full name"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg"
          />
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            className="w-full border border-slate-300 rounded-lg bg-white block"
            style={{ maxWidth: "100%", height: "120px" }}
            aria-hidden
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={clear}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={save}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Save signature
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
