import { cn } from "@/lib/utils";
import { FindingType } from "@/types/findings";

const symbols: { type: FindingType; label: string; color: string }[] = [
  { type: FindingType.Retraction, label: "Retracción", color: "#f59e0b" },
  { type: FindingType.Perforation, label: "Perforación", color: "#ef4444" },
  { type: FindingType.Effusion, label: "Efusión", color: "#3b82f6" },
  { type: FindingType.Tympanoslerosis, label: "Timpanoesclerosis", color: "#8b5cf6" },
  { type: FindingType.Cholesteatoma, label: "Colesteatoma", color: "#f97316" },
  { type: FindingType.Inflammation, label: "Inflamación", color: "#dc2626" },
  { type: FindingType.Tube, label: "Tubo", color: "#10b981" },
  { type: FindingType.Myringitis, label: "Miringitis", color: "#ec4899" },
];

interface SymbolPaletteProps {
  selected: FindingType | null;
  onSelect: (type: FindingType | null) => void;
}

export function SymbolPalette({ selected, onSelect }: SymbolPaletteProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {symbols.map(({ type, label, color }) => (
        <button
          key={type}
          onClick={() => onSelect(selected === type ? null : type)}
          title={label}
          className={cn(
            "rounded px-2 py-1 text-xs font-medium transition-colors border",
            selected === type
              ? "border-text-primary ring-2 ring-border-primary"
              : "border-border-secondary hover:border-border-primary"
          )}
          style={{
            backgroundColor: selected === type ? color : `${color}20`,
            color: selected === type ? "white" : color,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
