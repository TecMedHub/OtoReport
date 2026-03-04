import { Checkbox } from "@/components/ui/Checkbox";
import type { EarFindings } from "@/types";

interface FindingsChecklistProps {
  findings: EarFindings;
  onChange: (findings: EarFindings) => void;
}

const membraneFindings: { key: keyof EarFindings; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "retraction", label: "Retracción" },
  { key: "perforation", label: "Perforación" },
  { key: "effusion", label: "Efusión" },
  { key: "tympanosclerosis", label: "Timpanoesclerosis" },
  { key: "cholesteatoma", label: "Colesteatoma" },
  { key: "inflammation", label: "Inflamación" },
  { key: "cerumen", label: "Cerumen" },
  { key: "foreign_body", label: "Cuerpo extraño" },
  { key: "tube", label: "Tubo de ventilación" },
  { key: "myringitis", label: "Miringitis" },
  { key: "neomembrane", label: "Neomembrana" },
];

const caeFindings: { key: keyof EarFindings; label: string }[] = [
  { key: "cae_normal", label: "Normal" },
  { key: "cae_edema", label: "Edema" },
  { key: "cae_exostosis", label: "Exostosis" },
  { key: "cae_otorrhea", label: "Otorrea" },
];

export function FindingsChecklist({ findings, onChange }: FindingsChecklistProps) {
  function handleChange(key: keyof EarFindings, checked: boolean) {
    const updated = { ...findings, [key]: checked };

    // Si marcan "normal", desmarcan los demás de membrana
    if (key === "normal" && checked) {
      membraneFindings.forEach((f) => {
        if (f.key !== "normal") updated[f.key] = false;
      });
    }
    // Si marcan otro hallazgo de membrana, desmarcan "normal"
    if (key !== "normal" && key !== "cae_normal" && checked) {
      updated.normal = false;
    }

    // Lo mismo para CAE
    if (key === "cae_normal" && checked) {
      caeFindings.forEach((f) => {
        if (f.key !== "cae_normal") updated[f.key] = false;
      });
    }
    if (key.startsWith("cae_") && key !== "cae_normal" && checked) {
      updated.cae_normal = false;
    }

    onChange(updated);
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">
          Membrana Timpánica
        </h4>
        <div className="grid grid-cols-2 gap-1">
          {membraneFindings.map(({ key, label }) => (
            <Checkbox
              key={key}
              id={key}
              label={label}
              checked={findings[key]}
              onChange={(e) => handleChange(key, e.target.checked)}
            />
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">
          Conducto Auditivo Externo
        </h4>
        <div className="grid grid-cols-2 gap-1">
          {caeFindings.map(({ key, label }) => (
            <Checkbox
              key={key}
              id={key}
              label={label}
              checked={findings[key]}
              onChange={(e) => handleChange(key, e.target.checked)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
