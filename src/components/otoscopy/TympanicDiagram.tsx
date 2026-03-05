import { FindingType, QuadrantName, type QuadrantMark, type EarMarks } from "@/types/findings";
import type { EarSide } from "@/types/image";

interface TympanicDiagramProps {
  side: EarSide;
  marks: EarMarks;
  selectedFinding: FindingType | null;
  onMarkQuadrant: (quadrant: QuadrantName) => void;
}

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
        <pattern key={id} id={id} patternUnits="userSpaceOnUse" width="6" height="6">
          <line x1="0" y1="6" x2="6" y2="0" stroke={color} strokeWidth="1" />
        </pattern>
      );
    case FindingType.Perforation:
      return (
        <pattern key={id} id={id} patternUnits="userSpaceOnUse" width="8" height="8">
          <circle cx="4" cy="4" r="2" fill={color} fillOpacity="0.5" />
        </pattern>
      );
    case FindingType.Effusion:
      return (
        <pattern key={id} id={id} patternUnits="userSpaceOnUse" width="10" height="6">
          <path d="M0 3 Q2.5 0 5 3 T10 3" fill="none" stroke={color} strokeWidth="1" />
        </pattern>
      );
    case FindingType.Tympanoslerosis:
      return (
        <pattern key={id} id={id} patternUnits="userSpaceOnUse" width="6" height="6">
          <circle cx="3" cy="3" r="1.5" fill={color} fillOpacity="0.6" />
        </pattern>
      );
    default:
      return (
        <pattern key={id} id={id} patternUnits="userSpaceOnUse" width="4" height="4">
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
}: TympanicDiagramProps) {
  const isRight = side === "right";
  const cx = 100;
  const cy = 100;
  const r = 70;
  const caeR = 85;
  // Signo para posicionar elementos asimétricos (cono luminoso)
  const s = isRight ? 1 : -1;

  const quadrants = marks.marks;
  const activeQuadrants = [
    QuadrantName.AnteriorSuperior,
    QuadrantName.AnteriorInferior,
    QuadrantName.PosteriorSuperior,
    QuadrantName.PosteriorInferior,
    QuadrantName.ParsFlaccida,
  ];

  // Para OI se intercambian anterior/posterior en labels
  const antX = isRight ? cx + 25 : cx - 25;
  const postX = isRight ? cx - 25 : cx + 25;

  // Los cuadrantes anatómicos también cambian de lado para OI
  // OD: anterior=derecha, posterior=izquierda
  // OI: anterior=izquierda, posterior=derecha
  const asPath = isRight
    ? `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 0,1 ${cx + r},${cy} Z`
    : `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 0,0 ${cx - r},${cy} Z`;
  const aiPath = isRight
    ? `M${cx},${cy} L${cx + r},${cy} A${r},${r} 0 0,1 ${cx},${cy + r} Z`
    : `M${cx},${cy} L${cx - r},${cy} A${r},${r} 0 0,0 ${cx},${cy + r} Z`;
  const piPath = isRight
    ? `M${cx},${cy} L${cx},${cy + r} A${r},${r} 0 0,1 ${cx - r},${cy} Z`
    : `M${cx},${cy} L${cx},${cy + r} A${r},${r} 0 0,0 ${cx + r},${cy} Z`;
  const psPath = isRight
    ? `M${cx},${cy} L${cx - r},${cy} A${r},${r} 0 0,1 ${cx},${cy - r} Z`
    : `M${cx},${cy} L${cx + r},${cy} A${r},${r} 0 0,0 ${cx},${cy - r} Z`;

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full max-w-[200px] cursor-pointer"
    >
      <defs>
        {activeQuadrants.map((q) => {
          const { finding } = getQuadrantFill(q, quadrants);
          if (!finding) return null;
          return getPatternForFinding(finding, `pattern-${q}`);
        })}
      </defs>

      {/* CAE */}
      <circle cx={cx} cy={cy} r={caeR} fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />

      {/* Annulus */}
      <circle cx={cx} cy={cy} r={r} fill="#fde68a" stroke="#92400e" strokeWidth="2" />

      {/* Líneas divisorias */}
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#92400e" strokeWidth="0.5" strokeDasharray="3,3" />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#92400e" strokeWidth="0.5" strokeDasharray="3,3" />

      {/* Cuadrantes */}
      <path d={asPath} fill={getQuadrantFill(QuadrantName.AnteriorSuperior, quadrants).fill} fillOpacity="0.6" stroke="transparent" className="hover:fill-blue-200 hover:fill-opacity-30 transition-colors" onClick={() => onMarkQuadrant(QuadrantName.AnteriorSuperior)} />
      <path d={aiPath} fill={getQuadrantFill(QuadrantName.AnteriorInferior, quadrants).fill} fillOpacity="0.6" stroke="transparent" className="hover:fill-blue-200 hover:fill-opacity-30 transition-colors" onClick={() => onMarkQuadrant(QuadrantName.AnteriorInferior)} />
      <path d={piPath} fill={getQuadrantFill(QuadrantName.PosteriorInferior, quadrants).fill} fillOpacity="0.6" stroke="transparent" className="hover:fill-blue-200 hover:fill-opacity-30 transition-colors" onClick={() => onMarkQuadrant(QuadrantName.PosteriorInferior)} />
      <path d={psPath} fill={getQuadrantFill(QuadrantName.PosteriorSuperior, quadrants).fill} fillOpacity="0.6" stroke="transparent" className="hover:fill-blue-200 hover:fill-opacity-30 transition-colors" onClick={() => onMarkQuadrant(QuadrantName.PosteriorSuperior)} />

      {/* Pars Flaccida */}
      <ellipse cx={cx} cy={cy - r + 8} rx={18} ry={10} fill={getQuadrantFill(QuadrantName.ParsFlaccida, quadrants).fill} fillOpacity="0.6" stroke="#92400e" strokeWidth="1" className="hover:fill-blue-200 hover:fill-opacity-30 transition-colors" onClick={() => onMarkQuadrant(QuadrantName.ParsFlaccida)} />

      {/* Mango del martillo */}
      <line x1={cx} y1={cy - r + 15} x2={cx} y2={cy + 10} stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />

      {/* Umbo */}
      <circle cx={cx} cy={cy + 10} r={3} fill="#78350f" />

      {/* Cono luminoso — anterior inferior, lado según oído */}
      <path
        d={`M${cx + s * 3},${cy + 13} L${cx + s * 35},${cy + 45} L${cx + s * 20},${cy + 50} Z`}
        fill="#fef08a"
        fillOpacity="0.5"
        stroke="#eab308"
        strokeWidth="0.5"
      />

      {/* Labels */}
      <text x={antX} y={cy - 20} fontSize="8" fill="#78350f" textAnchor="middle">AS</text>
      <text x={antX} y={cy + 35} fontSize="8" fill="#78350f" textAnchor="middle">AI</text>
      <text x={postX} y={cy + 35} fontSize="8" fill="#78350f" textAnchor="middle">PI</text>
      <text x={postX} y={cy - 20} fontSize="8" fill="#78350f" textAnchor="middle">PS</text>
      <text x={cx} y={cy - r - 5} fontSize="8" fill="#78350f" textAnchor="middle">PF</text>

      {/* Indicador de hallazgo seleccionado */}
      {selectedFinding && (
        <rect x={2} y={2} width={196} height={196} rx={4} fill="none" stroke={findingColors[selectedFinding] || "#888"} strokeWidth="2" strokeDasharray="4,4" />
      )}
    </svg>
  );
}
