import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PatientCard } from "./PatientCard";
import type { Patient } from "@/types";

interface PatientListProps {
  patients: Patient[];
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onNewReport: (patient: Patient) => void;
}

export function PatientList({
  patients,
  search,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  onNewReport,
}: PatientListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Buscar por nombre o RUT..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onAdd}>
          <UserPlus size={16} />
          Nuevo Paciente
        </Button>
      </div>

      {patients.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          {search ? "Sin resultados" : "No hay pacientes registrados"}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <PatientCard
              key={p.id}
              patient={p}
              onEdit={onEdit}
              onDelete={onDelete}
              onNewReport={onNewReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
