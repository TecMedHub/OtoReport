import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border-secondary bg-bg-secondary shadow-sm transition-shadow hover:shadow-md">
      {/* Zona clickeable → detalle del paciente */}
      <button
        onClick={() => navigate(`/patients/${patient.id}`)}
        className="w-full p-4 pb-2 text-left"
      >
        <h3 className="font-semibold text-text-primary">{patient.name}</h3>
        <p className="text-sm text-text-tertiary">{patient.rut}</p>
        <div className="mt-2 space-y-0.5 text-sm text-text-secondary">
          <p>{t("patients.age")}: {patient.age} {t("patients.ageYears")}</p>
          {patient.phone && <p>{t("patients.phone")}: {patient.phone}</p>}
          <p className="text-xs text-text-tertiary">
            {t("patients.createdAt")}: {formatDate(patient.created_at)}
          </p>
        </div>
      </button>

      {/* Acciones rápidas */}
      <div className="flex gap-1 border-t border-border-secondary px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNewReport(patient)}
          title={t("patients.newReport")}
        >
          <FilePlus size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(patient)}
          title={t("common.edit")}
        >
          <Pencil size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(patient.id)}
          title={t("common.delete")}
        >
          <Trash2 size={16} className="text-danger" />
        </Button>
      </div>
    </div>
  );
}
