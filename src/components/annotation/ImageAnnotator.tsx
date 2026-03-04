import { useRef, useEffect, useCallback, useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnnotationToolbar } from "./AnnotationToolbar";
import { RotationControl } from "./RotationControl";
import { renderAnnotation } from "./SymbolStamps";
import { useAnnotation } from "@/hooks/useAnnotation";
import type { Annotation } from "@/types/annotation";
import { AnnotationType } from "@/types/annotation";

interface ImageAnnotatorProps {
  imageUrl: string;
  annotations: Annotation[];
  rotation: number;
  onSave: (annotations: Annotation[], rotation: number) => void;
  onClose: () => void;
}

interface CropRegion {
  start: { x: number; y: number };
  end: { x: number; y: number };
  type: "crop-rect" | "crop-circle";
}

export function ImageAnnotator({
  imageUrl,
  annotations: initialAnnotations,
  rotation: initialRotation,
  onSave,
  onClose,
}: ImageAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  const {
    activeTool,
    setActiveTool,
    activeColor,
    setActiveColor,
    rotation,
    setRotation,
    rotate,
    resetRotation,
    pivot,
    setPivot,
    pivotMode,
    setPivotMode,
  } = useAnnotation({
    annotations: initialAnnotations,
    onChange: () => {},
  });

  const [localAnnotations, setLocalAnnotations] = useState(initialAnnotations);

  // Crop state
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [cropPending, setCropPending] = useState<CropRegion | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Pivot drag state
  const [isDraggingPivot, setIsDraggingPivot] = useState(false);

  const isCropTool = activeTool === "crop-rect" || activeTool === "crop-circle";

  const handleAddAnnotation = useCallback(
    (x: number, y: number, text?: string) => {
      if (!activeTool || activeTool === "eraser" || activeTool === "crop-rect" || activeTool === "crop-circle") return;
      const annotation: Annotation = {
        id: crypto.randomUUID(),
        type: activeTool,
        x,
        y,
        color: activeColor,
        size: 20,
        rotation: 0,
        text,
      };
      setLocalAnnotations((prev) => [...prev, annotation]);
    },
    [activeTool, activeColor]
  );

  const handleRemoveAt = useCallback(
    (x: number, y: number) => {
      const threshold = 0.03;
      setLocalAnnotations((prev) => {
        const idx = prev.findIndex(
          (a) => Math.abs(a.x - x) < threshold && Math.abs(a.y - y) < threshold
        );
        if (idx >= 0) {
          const next = [...prev];
          next.splice(idx, 1);
          return next;
        }
        return prev;
      });
    },
    []
  );

  useEffect(() => {
    setRotation(initialRotation);
  }, [initialRotation, setRotation]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Helper to get normalized coords from mouse event
  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: ((e.clientX - rect.left) * scaleX) / canvas.width,
      y: ((e.clientY - rect.top) * scaleY) / canvas.height,
    };
  }, []);

  // Check if mouse is near pivot
  const isNearPivot = useCallback((x: number, y: number) => {
    if (!pivot) return false;
    const threshold = 0.02;
    return Math.abs(x - pivot.x) < threshold && Math.abs(y - pivot.y) < threshold;
  }, [pivot]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate pivot point in pixels
    const pivotX = pivot ? pivot.x * canvas.width : canvas.width / 2;
    const pivotY = pivot ? pivot.y * canvas.height : canvas.height / 2;

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -pivotX, -pivotY);
    ctx.restore();

    localAnnotations.forEach((a) => {
      renderAnnotation(ctx, a, canvas.width, canvas.height);
    });

    // Draw crop overlay
    if ((cropStart && cropEnd) || cropPending) {
      const region = cropPending || {
        start: cropStart!,
        end: cropEnd!,
        type: activeTool as "crop-rect" | "crop-circle",
      };

      const sx = region.start.x * canvas.width;
      const sy = region.start.y * canvas.height;
      const ex = region.end.x * canvas.width;
      const ey = region.end.y * canvas.height;

      // Dark overlay
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear the selected region to show image
      ctx.globalCompositeOperation = "destination-out";
      if (region.type === "crop-rect") {
        const rx = Math.min(sx, ex);
        const ry = Math.min(sy, ey);
        const rw = Math.abs(ex - sx);
        const rh = Math.abs(ey - sy);
        ctx.fillRect(rx, ry, rw, rh);
      } else {
        const cx = (sx + ex) / 2;
        const cy = (sy + ey) / 2;
        const rx = Math.abs(ex - sx) / 2;
        const ry = Math.abs(ey - sy) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Draw border around selection
      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      if (region.type === "crop-rect") {
        const rx = Math.min(sx, ex);
        const ry = Math.min(sy, ey);
        const rw = Math.abs(ex - sx);
        const rh = Math.abs(ey - sy);
        ctx.strokeRect(rx, ry, rw, rh);
      } else {
        const cx = (sx + ex) / 2;
        const cy = (sy + ey) / 2;
        const rx = Math.abs(ex - sx) / 2;
        const ry = Math.abs(ey - sy) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw pivot indicator
    if (pivot && (pivotMode || rotation !== 0)) {
      const px = pivot.x * canvas.width;
      const py = pivot.y * canvas.height;
      ctx.save();
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;

      // Crosshair lines
      const size = 12;
      ctx.beginPath();
      ctx.moveTo(px - size, py);
      ctx.lineTo(px + size, py);
      ctx.moveTo(px, py - size);
      ctx.lineTo(px, py + size);
      ctx.stroke();

      // Circle
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }, [rotation, localAnnotations, loaded, cropStart, cropEnd, cropPending, activeTool, pivot, pivotMode]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Apply crop
  const applyCrop = useCallback(() => {
    if (!cropPending || !imageRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { start, end, type } = cropPending;

    // Work on the current canvas content (which has rotation applied)
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = canvas.width;
    sourceCanvas.height = canvas.height;
    const sourceCtx = sourceCanvas.getContext("2d")!;
    // Redraw image with rotation (without annotations or overlay)
    const img = imageRef.current;
    const pivotX = pivot ? pivot.x * canvas.width : canvas.width / 2;
    const pivotY = pivot ? pivot.y * canvas.height : canvas.height / 2;
    sourceCtx.save();
    sourceCtx.translate(pivotX, pivotY);
    sourceCtx.rotate((rotation * Math.PI) / 180);
    sourceCtx.drawImage(img, -pivotX, -pivotY);
    sourceCtx.restore();

    const sx = Math.min(start.x, end.x) * canvas.width;
    const sy = Math.min(start.y, end.y) * canvas.height;
    const sw = Math.abs(end.x - start.x) * canvas.width;
    const sh = Math.abs(end.y - start.y) * canvas.height;

    if (type === "crop-rect") {
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = sw;
      cropCanvas.height = sh;
      const cropCtx = cropCanvas.getContext("2d")!;
      cropCtx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

      const newImg = new Image();
      newImg.onload = () => {
        imageRef.current = newImg;
        setLocalAnnotations([]);
        setRotation(0);
        setPivot(null);
        setCropPending(null);
        setActiveTool(null);
      };
      newImg.src = cropCanvas.toDataURL("image/png");
    } else {
      // Circular crop
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = sw;
      cropCanvas.height = sh;
      const cropCtx = cropCanvas.getContext("2d")!;

      // Black background
      cropCtx.fillStyle = "#000000";
      cropCtx.fillRect(0, 0, sw, sh);

      // Clip to ellipse
      cropCtx.save();
      cropCtx.beginPath();
      cropCtx.ellipse(sw / 2, sh / 2, sw / 2, sh / 2, 0, 0, Math.PI * 2);
      cropCtx.clip();
      cropCtx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
      cropCtx.restore();

      const newImg = new Image();
      newImg.onload = () => {
        imageRef.current = newImg;
        setLocalAnnotations([]);
        setRotation(0);
        setPivot(null);
        setCropPending(null);
        setActiveTool(null);
      };
      newImg.src = cropCanvas.toDataURL("image/png");
    }
  }, [cropPending, rotation, pivot, setRotation, setPivot, setActiveTool]);

  const cancelCrop = useCallback(() => {
    setCropPending(null);
    setCropStart(null);
    setCropEnd(null);
  }, []);

  // Mouse handlers
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    // Pivot dragging
    if (pivotMode && isNearPivot(coords.x, coords.y)) {
      setIsDraggingPivot(true);
      return;
    }

    // Pivot placement
    if (pivotMode) {
      setPivot({ x: coords.x, y: coords.y });
      return;
    }

    // Crop drag start
    if (isCropTool && !cropPending) {
      setCropStart(coords);
      setCropEnd(coords);
      setIsDragging(true);
      return;
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (isDraggingPivot) {
      setPivot({ x: coords.x, y: coords.y });
      return;
    }

    if (isDragging && isCropTool) {
      setCropEnd(coords);
    }
  }

  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isDraggingPivot) {
      setIsDraggingPivot(false);
      return;
    }

    if (isDragging && isCropTool && cropStart && cropEnd) {
      const coords = getCanvasCoords(e);
      if (coords) {
        setCropEnd(coords);
        setCropPending({
          start: cropStart,
          end: coords,
          type: activeTool as "crop-rect" | "crop-circle",
        });
      }
      setIsDragging(false);
      return;
    }
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    // Don't process clicks during crop/pivot modes or if already handled by mousedown
    if (isCropTool || pivotMode || cropPending) return;

    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (activeTool === "eraser") {
      handleRemoveAt(coords.x, coords.y);
    } else if (activeTool === AnnotationType.Text) {
      const text = prompt("Texto:");
      if (text) handleAddAnnotation(coords.x, coords.y, text);
    } else if (activeTool) {
      handleAddAnnotation(coords.x, coords.y);
    }
  }

  // Get cursor style
  const getCursorStyle = () => {
    if (pivotMode) return "move";
    if (isCropTool) return "crosshair";
    return "crosshair";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <AnnotationToolbar
          activeTool={activeTool}
          activeColor={activeColor}
          onSelectTool={(tool) => {
            setActiveTool(tool);
            // Cancel pending crop when switching tools
            cancelCrop();
          }}
          onSelectColor={setActiveColor}
          onClear={() => setLocalAnnotations([])}
        />
        <RotationControl
          rotation={rotation}
          onRotate={rotate}
          onReset={resetRotation}
          onSetRotation={setRotation}
          pivotMode={pivotMode}
          onTogglePivotMode={() => setPivotMode(!pivotMode)}
        />
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSave(localAnnotations, rotation)}
          >
            Guardar
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
            <X size={18} />
          </Button>
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-auto p-4">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="max-h-full max-w-full"
          style={{ imageRendering: "auto", cursor: getCursorStyle() }}
        />
        {/* Crop action bar */}
        {cropPending && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 rounded-lg bg-gray-800 px-4 py-2 shadow-lg">
            <Button variant="primary" size="sm" onClick={applyCrop}>
              <Check size={14} className="mr-1" />
              Aplicar recorte
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelCrop} className="text-white">
              <X size={14} className="mr-1" />
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
