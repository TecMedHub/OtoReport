import { cn } from "@/lib/utils";
import { AnnotationType } from "@/types/annotation";
import type { EditorTool } from "@/types/annotation";
import { ArrowUp, Type, Circle, X, Crosshair, Eraser, Square, CircleDashed, Undo2, RotateCw } from "lucide-react";

interface AnnotationToolbarProps {
  activeTool: EditorTool | null;
  activeColor: string;
  onSelectTool: (tool: EditorTool | null) => void;
  onSelectColor: (color: string) => void;
  onClear: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

const tools: { type: EditorTool; icon: typeof ArrowUp; label: string }[] = [
  { type: AnnotationType.Arrow, icon: ArrowUp, label: "Flecha" },
  { type: AnnotationType.Text, icon: Type, label: "Texto" },
  { type: AnnotationType.Circle, icon: Circle, label: "Círculo" },
  { type: AnnotationType.Cross, icon: X, label: "Cruz" },
  { type: AnnotationType.Dot, icon: Crosshair, label: "Punto" },
  { type: "eraser", icon: Eraser, label: "Borrador" },
  { type: "crop-rect", icon: Square, label: "Recorte rectangular" },
  { type: "crop-circle", icon: CircleDashed, label: "Recorte circular" },
  { type: "rotate", icon: RotateCw, label: "Rotar" },
];

const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ffffff", "#000000"];

export function AnnotationToolbar({
  activeTool,
  activeColor,
  onSelectTool,
  onSelectColor,
  onClear,
  onUndo,
  canUndo,
}: AnnotationToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {tools.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => onSelectTool(activeTool === type ? null : type)}
            title={label}
            className={cn(
              "rounded p-1.5 transition-colors",
              activeTool === type
                ? "bg-accent-subtle text-accent-text"
                : "text-text-tertiary hover:bg-bg-tertiary"
            )}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-border-secondary" />

      <div className="flex gap-1">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onSelectColor(c)}
            className={cn(
              "h-5 w-5 rounded-full border-2 transition-transform",
              activeColor === c ? "border-text-primary scale-110" : "border-border-primary"
            )}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="h-6 w-px bg-border-secondary" />

      {onUndo && (
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            "rounded p-1.5 transition-colors",
            canUndo
              ? "text-text-tertiary hover:bg-bg-tertiary"
              : "text-text-tertiary/50 cursor-not-allowed"
          )}
          title="Deshacer"
        >
          <Undo2 size={16} />
        </button>
      )}

      <button
        onClick={onClear}
        className="text-xs text-danger-text hover:text-danger"
      >
        Limpiar todo
      </button>
    </div>
  );
}
