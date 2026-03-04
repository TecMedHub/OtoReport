import { RotateCcw, RotateCw, RefreshCw, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface RotationControlProps {
  rotation: number;
  onRotate: (degrees: number) => void;
  onReset: () => void;
  onSetRotation: (degrees: number) => void;
  pivotMode: boolean;
  onTogglePivotMode: () => void;
}

export function RotationControl({
  rotation,
  onRotate,
  onReset,
  onSetRotation,
  pivotMode,
  onTogglePivotMode,
}: RotationControlProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => onRotate(-90)} title="Rotar -90°">
        <RotateCcw size={14} />
      </Button>
      <input
        type="range"
        min="0"
        max="359"
        value={rotation}
        onChange={(e) => onSetRotation(parseInt(e.target.value))}
        className="w-24"
      />
      <span className="w-10 text-xs text-gray-500 text-center">{rotation}°</span>
      <Button variant="ghost" size="sm" onClick={() => onRotate(90)} title="Rotar +90°">
        <RotateCw size={14} />
      </Button>
      <Button variant="ghost" size="sm" onClick={onReset} title="Reset">
        <RefreshCw size={14} />
      </Button>
      <button
        onClick={onTogglePivotMode}
        title="Pivote de rotación"
        className={cn(
          "rounded p-1.5 transition-colors",
          pivotMode
            ? "bg-orange-100 text-orange-700"
            : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
        )}
      >
        <Target size={14} />
      </button>
    </div>
  );
}
