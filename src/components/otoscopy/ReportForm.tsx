import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Report } from "@/types";
import { EarPanel } from "./EarPanel";
import { ReportPreview } from "./ReportPreview";
import { Button } from "@/components/ui/Button";
import { Save, FileText, ChevronDown, ChevronUp } from "lucide-react";
import type { EarImage } from "@/types/image";

interface ReportFormProps {
  report: Report;
  onChange: (updater: (prev: Report) => Report) => void;
  onSave: (report: Report) => Promise<void>;
  saving: boolean;
  readOnly?: boolean;
}

export function ReportForm({ report, onChange, onSave, saving, readOnly }: ReportFormProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  async function handleMoveImage(fromSide: "right" | "left", image: EarImage) {
    const toSide = fromSide === "right" ? "left" : "right";
    await invoke("move_image", {
      patientId: report.patient_id,
      sessionId: report.session_id,
      fromSide,
      toSide,
      filename: image.filename,
      thumbnail: image.thumbnail,
    });

    const movedImage: EarImage = { ...image, primary: false, sort_order: 0 };
    onChange((r) => {
      const fromKey = fromSide === "right" ? "right_ear" : "left_ear";
      const toKey = toSide === "right" ? "right_ear" : "left_ear";
      const fromImages = r[fromKey].images.filter((i) => i.id !== image.id);
      const toImages = [...r[toKey].images, { ...movedImage, sort_order: r[toKey].images.length }];
      return {
        ...r,
        [fromKey]: { ...r[fromKey], images: fromImages },
        [toKey]: { ...r[toKey], images: toImages },
      };
    });
  }

  const loadImageUrl = useCallback(
    async (
      patientId: string,
      sessionId: string,
      side: string,
      filename: string
    ): Promise<string> => {
      const data = await invoke<number[]>("load_image", {
        patientId,
        sessionId,
        side,
        filename,
      });
      const blob = new Blob([new Uint8Array(data)]);
      return URL.createObjectURL(blob);
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Metadata */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{report.patient.name}</p>
                <p className="text-xs text-gray-500">{report.patient.rut}</p>
                {report.patient.age > 0 && (
                  <p className="text-xs text-gray-400">{report.patient.age} años</p>
                )}
              </div>
              <button
                onClick={() => setShowPatientDetails(!showPatientDetails)}
                className="ml-auto text-gray-400 hover:text-gray-600"
                title="Ver detalles paciente"
              >
                {showPatientDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">
              Examinador
            </label>
            <input
              value={report.examiner}
              onChange={(e) =>
                onChange((r) => ({ ...r, examiner: e.target.value }))
              }
              disabled={readOnly}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">
              Equipo
            </label>
            <input
              value={report.equipment}
              onChange={(e) =>
                onChange((r) => ({ ...r, equipment: e.target.value }))
              }
              disabled={readOnly}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        {showPatientDetails && (
          <div className="mt-3 grid grid-cols-3 gap-4 border-t border-gray-100 pt-3">
            <div className="text-xs text-gray-500">
              <span className="font-medium">Tel:</span> {report.patient.phone || "—"}
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-medium">Email:</span> {report.patient.email || "—"}
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-medium">F. Nac:</span> {report.patient.birth_date || "—"}
            </div>
          </div>
        )}
      </div>

      {/* Oídos */}
      <div className="grid grid-cols-2 gap-6">
        <EarPanel
          side="right"
          data={report.right_ear}
          patientId={report.patient_id}
          sessionId={report.session_id}
          onChange={(data) => onChange((r) => ({ ...r, right_ear: data }))}
          onMoveImage={(img) => handleMoveImage("right", img)}
          readOnly={readOnly}
        />
        <EarPanel
          side="left"
          data={report.left_ear}
          patientId={report.patient_id}
          sessionId={report.session_id}
          onChange={(data) => onChange((r) => ({ ...r, left_ear: data }))}
          onMoveImage={(img) => handleMoveImage("left", img)}
          readOnly={readOnly}
        />
      </div>

      {/* Conclusión */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Conclusión
        </label>
        <textarea
          value={report.conclusion}
          onChange={(e) =>
            onChange((r) => ({ ...r, conclusion: e.target.value }))
          }
          disabled={readOnly}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          placeholder="Conclusión del examen..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => setShowPreview(true)}>
          <FileText size={16} />
          Vista Previa PDF
        </Button>
        {!readOnly && (
          <Button onClick={() => onSave(report)} disabled={saving}>
            <Save size={16} />
            {saving ? "Guardando..." : "Guardar Informe"}
          </Button>
        )}
      </div>

      {showPreview && (
        <ReportPreview
          report={report}
          loadImageUrl={loadImageUrl}
          onClose={() => setShowPreview(false)}
          onStatusComplete={
            !readOnly
              ? () => {
                  onChange((r) => ({ ...r, status: "completed" }));
                  onSave({ ...report, status: "completed" });
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
