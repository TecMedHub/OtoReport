import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { Patient } from "@/types";

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onNewReport: (patient: Patient) => void;
}

export function PatientCard({
  patient,
  onEdit,
  onDelete,
  onNewReport,
}: PatientCardProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Zona clickeable → detalle del paciente */}
      <button
        onClick={() => navigate(`/patients/${patient.id}`)}
        className="w-full p-4 pb-2 text-left"
      >
        <h3 className="font-semibold text-gray-800">{patient.name}</h3>
        <p className="text-sm text-gray-500">{patient.rut}</p>
        <div className="mt-2 space-y-0.5 text-sm text-gray-600">
          <p>Edad: {patient.age} años</p>
          {patient.phone && <p>Tel: {patient.phone}</p>}
          <p className="text-xs text-gray-400">
            Creado: {formatDate(patient.created_at)}
          </p>
        </div>
      </button>

      {/* Acciones rápidas */}
      <div className="flex gap-1 border-t border-gray-100 px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNewReport(patient)}
          title="Nuevo informe"
        >
          <FilePlus size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(patient)}
          title="Editar"
        >
          <Pencil size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(patient.id)}
          title="Eliminar"
        >
          <Trash2 size={16} className="text-red-500" />
        </Button>
      </div>
    </div>
  );
}
