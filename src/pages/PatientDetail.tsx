import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import {
  FilePlus,
  Trash2,
  Copy,
  ArrowLeft,
  FileText,
  Pencil,
} from "lucide-react";
import type { Patient, SessionInfo } from "@/types";

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [p, s] = await Promise.all([
        invoke<Patient>("get_patient", { id }),
        invoke<SessionInfo[]>("list_patient_sessions", { patientId: id }),
      ]);
      setPatient(p);
      setSessions(s);
    } catch (err) {
      console.error("Error loading patient:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeleteSession() {
    if (!deleteTarget || !id) return;
    try {
      await invoke("delete_session", {
        patientId: id,
        sessionId: deleteTarget,
      });
      setDeleteTarget(null);
      toast("Informe eliminado", "success");
      await load();
    } catch (err) {
      console.error(err);
      toast("Error al eliminar", "error");
    }
  }

  async function handleDuplicate(sessionId: string) {
    if (!id) return;
    try {
      await invoke<string>("duplicate_session", {
        patientId: id,
        sessionId,
      });
      toast("Informe duplicado", "success");
      await load();
    } catch (err) {
      console.error(err);
      toast("Error al duplicar", "error");
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Paciente" />
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </>
    );
  }

  if (!patient) {
    return (
      <>
        <Header title="Paciente" />
        <div className="flex flex-1 items-center justify-center text-gray-400">
          Paciente no encontrado
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={patient.name} />
      <div className="flex-1 overflow-auto p-6">
        {/* Back + actions */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/patients")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} />
            Volver a pacientes
          </button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/patients?edit=${patient.id}`)}
            >
              <Pencil size={14} />
              Editar paciente
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/new-report?patient=${patient.id}`)}
            >
              <FilePlus size={14} />
              Nuevo Informe
            </Button>
          </div>
        </div>

        {/* Patient info card */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs font-medium text-gray-500">RUT</span>
              <p className="text-gray-800">{patient.rut}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">Edad</span>
              <p className="text-gray-800">{patient.age} años</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">
                Teléfono
              </span>
              <p className="text-gray-800">{patient.phone || "—"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">Email</span>
              <p className="text-gray-800">{patient.email || "—"}</p>
            </div>
          </div>
        </div>

        {/* Sessions / Reports list */}
        <h3 className="mb-3 text-base font-semibold text-gray-800">
          Informes ({sessions.length})
        </h3>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-12 text-gray-400">
            <FileText size={36} className="mb-2" />
            <p className="text-sm">Sin informes aún</p>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => navigate(`/new-report?patient=${patient.id}`)}
            >
              Crear primer informe
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm"
                onClick={() =>
                  navigate(
                    `/new-report?patient=${s.patient_id}&session=${s.id}`
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <FileText
                    size={20}
                    className={
                      s.status === "completed" ? "text-blue-600" : "text-gray-400"
                    }
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDate(s.created_at) || "Sin fecha"}
                    </p>
                    <span
                      className={`text-xs font-medium ${
                        s.status === "completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {s.status === "completed" ? "Completado" : "En progreso"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {/* Duplicar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Duplicar informe"
                    onClick={() => handleDuplicate(s.id)}
                  >
                    <Copy size={16} />
                  </Button>

                  {/* Eliminar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Eliminar informe"
                    onClick={() => setDeleteTarget(s.id)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm delete dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar informe"
      >
        <p className="mb-4 text-sm text-gray-600">
          ¿Eliminar este informe y todas sus imágenes? Esta acción no se puede
          deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteSession}>
            Eliminar
          </Button>
        </div>
      </Dialog>
    </>
  );
}
