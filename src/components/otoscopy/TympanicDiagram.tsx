import { FindingType, QuadrantName, type QuadrantMark, type EarMarks } from "@/types/findings";
import type { EarSide } from "@/types/image";

interface TympanicDiagramProps {
  side: EarSide;
  marks: EarMarks;
  selectedFinding: FindingType | null;
  onMarkQuadrant: (quadrant: QuadrantName) => void;
  showLegend?: boolean;
}

const findingLabels: Record<string, string> = {
  [FindingType.Retraction]: "Retracción",
  [FindingType.Perforation]: "Perforación",
  [FindingType.Effusion]: "Efusión",
  [FindingType.Tympanoslerosis]: "Timpanoesclerosis",
  [FindingType.Cholesteatoma]: "Colesteatoma",
  [FindingType.Inflammation]: "Inflamación",
  [FindingType.Tube]: "Tubo",
  [FindingType.Myringitis]: "Miringitis",
};

const findingColors: Record<string, string> = {
  [FindingType.Retraction]: "#f59e0b",
  [FindingType.Perforation]: "#ef4444",
  [FindingType.Effusion]: "#3b82f6",
  [FindingType.Tympanoslerosis]: "#8b5cf6",
  [FindingType.Cholesteatoma]: "#f97316",
  [FindingType.Inflammation]: "#dc2626",
  [FindingType.Tube]: "#10b981",
  [FindingType.Myringitis]: "#ec4899",
};

function getPatternForFinding(finding: FindingType, id: string): React.ReactNode {
  const color = findingColors[finding] || "#888";
  switch (finding) {
    case FindingType.Retraction:
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6">
          <line x1="0" y1="6" x2="6" y2="0" stroke={color} strokeWidth="1" />
        </pattern>
      );
    case FindingType.Perforation:
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="8" height="8">
          <circle cx="4" cy="4" r="2" fill={color} fillOpacity="0.5" />
        </pattern>
      );
    case FindingType.Effusion:
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="10" height="6">
          <path d="M0 3 Q2.5 0 5 3 T10 3" fill="none" stroke={color} strokeWidth="1" />
        </pattern>
      );
    case FindingType.Tympanoslerosis:
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6">
          <circle cx="3" cy="3" r="1.5" fill={color} fillOpacity="0.6" />
        </pattern>
      );
    default:
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill={color} fillOpacity="0.3" />
        </pattern>
      );
  }
}

function getQuadrantFill(
  quadrant: QuadrantName,
  marks: QuadrantMark[]
): { fill: string; patternId: string | null; finding: FindingType | null } {
  const mark = marks.find((m) => m.quadrant === quadrant);
  if (mark) {
    return {
      fill: `url(#pattern-${quadrant})`,
      patternId: `pattern-${quadrant}`,
      finding: mark.finding as FindingType,
    };
  }
  return { fill: "transparent", patternId: null, finding: null };
}

export function TympanicDiagram({
  side,
  marks,
  selectedFinding,
  onMarkQuadrant,
  showLegend,
}: TympanicDiagramProps) {
  // Para OI, el esquema se espeja horizontalmente
  const isRight = side === "right";
  const cx = 100;
  const cy = 100;
  const r = 70; // Radio del annulus
  const caeR = 85; // Radio del CAE

  const quadrants = marks.marks;
  const activeQuadrants = [
    QuadrantName.AnteriorSuperior,
    QuadrantName.AnteriorInferior,
    QuadrantName.PosteriorSuperior,
    QuadrantName.PosteriorInferior,
    QuadrantName.ParsFlaccida,
  ];

  // Hallazgos únicos marcados (para la leyenda)
  const uniqueFindings = [...new Set(quadrants.map((m) => m.finding))];
  const legendHeight = showLegend && uniqueFindings.length > 0
    ? 10 + uniqueFindings.length * 16
    : 0;
  const viewBoxHeight = 200 + legendHeight;

  return (
    <svg
      viewBox={`0 0 200 ${viewBoxHeight}`}
      className="w-full max-w-[200px] cursor-pointer"
      style={{ transform: isRight ? "none" : "scaleX(-1)" }}
    >
      <defs>
        {activeQuadrants.map((q) => {
          const { finding } = getQuadrantFill(q, quadrants);
          if (finding) {
            return getPatternForFinding(finding, `pattern-${q}`);
          }
          return null;
        })}
      </defs>

      {/* CAE */}
      <circle
        cx={cx}
        cy={cy}
        r={caeR}
        fill="#fef3c7"
        stroke="#d97706"
        strokeWidth="1.5"
      />

      {/* Annulus */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="#fde68a"
        stroke="#92400e"
        strokeWidth="2"
      />

      {/* Líneas divisorias cuadrantes */}
      {/* Línea horizontal (mango del martillo como referencia) */}
      <line
        x1={cx - r}
        y1={cy}
        x2={cx + r}
        y2={cy}
        stroke="#92400e"
        strokeWidth="0.5"
        strokeDasharray="3,3"
      />
      {/* Línea del mango del martillo (vertical) */}
      <line
        x1={cx}
        y1={cy - r}
        x2={cx}
        y2={cy + r}
        stroke="#92400e"
        strokeWidth="0.5"
        strokeDasharray="3,3"
      />

      {/* Cuadrantes clickeables */}
      {/* Anterior Superior */}
      <path
        d={`M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 0,1 ${cx + r},${cy} Z`}
        fill={getQuadrantFill(QuadrantName.AnteriorSuperior, quadrants).fill}
        fillOpacity="0.6"
        stroke="transparent"
        className="hover:fill-blue-200 hover:fill-opacity-30 transition-colors"
        onClick={() => onMarkQuadrant(QuadrantName.AnteriorSuperior)}
      />
      {/* Anterior Inferior */}
      <path
        d={`M${cx},${cy} L${cx + r},${cy} A${r},${r} 0 0,1 ${cx},${cy + r} Z`}
        fill={getQuadrantFill(QuadrantName.AnteriorInferior, quadrants).fill}
        fillOpacity="0.6"
        stroke="transparent"
        className="hover:fill-blue-200 hover:fill-opacity-30 transition-colors"
        onClick={() => onMarkQuadrant(QuadrantName.AnteriorInferior)}
      />
      {/* Posterior Inferior */}
      <path
        d={`M${cx},${cy} L${cx},${cy + r} A${r},${r} 0 0,1 ${cx - r},${cy} Z`}
        fill={getQuadrantFill(QuadrantName.PosteriorInferior, quadrants).fill}
        fillOpacity="0.6"
        stroke="transparent"
        className="hover:fill-blue-200 hover:fill-opacity-30 transition-colors"
        onClick={() => onMarkQuadrant(QuadrantName.PosteriorInferior)}
      />
      {/* Posterior Superior */}
      <path
        d={`M${cx},${cy} L${cx - r},${cy} A${r},${r} 0 0,1 ${cx},${cy - r} Z`}
        fill={getQuadrantFill(QuadrantName.PosteriorSuperior, quadrants).fill}
        fillOpacity="0.6"
        stroke="transparent"
        className="hover:fill-blue-200 hover:fill-opacity-30 transition-colors"
        onClick={() => onMarkQuadrant(QuadrantName.PosteriorSuperior)}
      />

      {/* Pars Flaccida */}
      <ellipse
        cx={cx}
        cy={cy - r + 8}
        rx={18}
        ry={10}
        fill={getQuadrantFill(QuadrantName.ParsFlaccida, quadrants).fill}
        fillOpacity="0.6"
        stroke="#92400e"
        strokeWidth="1"
        className="hover:fill-blue-200 hover:fill-opacity-30 transition-colors"
        onClick={() => onMarkQuadrant(QuadrantName.ParsFlaccida)}
      />

      {/* Mango del martillo */}
      <line
        x1={cx}
        y1={cy - r + 15}
        x2={cx}
        y2={cy + 10}
        stroke="#78350f"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Umbo */}
      <circle cx={cx} cy={cy + 10} r={3} fill="#78350f" />

      {/* Cono luminoso (anterior inferior) */}
      <path
        d={`M${cx + 3},${cy + 13} L${cx + 35},${cy + 45} L${cx + 20},${cy + 50} Z`}
        fill="#fef08a"
        fillOpacity="0.5"
        stroke="#eab308"
        strokeWidth="0.5"
      />

      {/* Labels */}
      <text
        x={cx + 25}
        y={cy - 20}
        fontSize="8"
        fill="#78350f"
        textAnchor="middle"
        style={{ transform: isRight ? "none" : "scaleX(-1)", transformOrigin: `${cx + 25}px ${cy - 20}px` }}
      >
        AS
      </text>
      <text
        x={cx + 25}
        y={cy + 35}
        fontSize="8"
        fill="#78350f"
        textAnchor="middle"
        style={{ transform: isRight ? "none" : "scaleX(-1)", transformOrigin: `${cx + 25}px ${cy + 35}px` }}
      >
        AI
      </text>
      <text
        x={cx - 25}
        y={cy + 35}
        fontSize="8"
        fill="#78350f"
        textAnchor="middle"
        style={{ transform: isRight ? "none" : "scaleX(-1)", transformOrigin: `${cx - 25}px ${cy + 35}px` }}
      >
        PI
      </text>
      <text
        x={cx - 25}
        y={cy - 20}
        fontSize="8"
        fill="#78350f"
        textAnchor="middle"
        style={{ transform: isRight ? "none" : "scaleX(-1)", transformOrigin: `${cx - 25}px ${cy - 20}px` }}
      >
        PS
      </text>
      <text
        x={cx}
        y={cy - r - 5}
        fontSize="8"
        fill="#78350f"
        textAnchor="middle"
        style={{ transform: isRight ? "none" : "scaleX(-1)", transformOrigin: `${cx}px ${cy - r - 5}px` }}
      >
        PF
      </text>

      {/* Indicador de hallazgo seleccionado */}
      {selectedFinding && (
        <rect
          x={2}
          y={2}
          width={196}
          height={196}
          rx={4}
          fill="none"
          stroke={findingColors[selectedFinding] || "#888"}
          strokeWidth="2"
          strokeDasharray="4,4"
        />
      )}

      {/* Leyenda de hallazgos marcados */}
      {showLegend && uniqueFindings.length > 0 && (
        <g>
          {uniqueFindings.map((finding, i) => {
            const y = 210 + i * 16;
            const color = findingColors[finding] || "#888";
            const label = findingLabels[finding] || finding;
            return (
              <g key={finding}>
                <rect x={10} y={y - 7} width={12} height={12} rx={2} fill={color} fillOpacity={0.7} stroke={color} strokeWidth="1" />
                <text
                  x={28}
                  y={y + 2}
                  fontSize="10"
                  fill="#374151"
                  style={{ transform: isRight ? "none" : "scaleX(-1)", transformOrigin: `28px ${y + 2}px` }}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
