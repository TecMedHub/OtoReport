import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { PatientList } from "@/components/patients/PatientList";
import { PatientForm } from "@/components/patients/PatientForm";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { usePatients } from "@/hooks/usePatients";
import { useToast } from "@/components/ui/Toast";
import type { Patient } from "@/types";

export function Patients() {
  const { patients, search, setSearch, save, remove, loading } = usePatients();
  const [editing, setEditing] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  async function handleSave(patient: Patient) {
    await save(patient);
    setShowForm(false);
    setEditing(null);
    toast(editing ? "Paciente actualizado" : "Paciente creado", "success");
  }

  async function handleConfirmDelete() {
    if (deleteTarget) {
      await remove(deleteTarget);
      setDeleteTarget(null);
      toast("Paciente eliminado", "success");
    }
  }

  function handleEdit(patient: Patient) {
    setEditing(patient);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <>
      <Header title="Pacientes" />
      <div className="flex-1 overflow-auto p-6">
        {showForm ? (
          <div className="mx-auto max-w-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              {editing ? "Editar Paciente" : "Nuevo Paciente"}
            </h3>
            <PatientForm
              patient={editing ?? undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <PatientList
            patients={patients}
            search={search}
            onSearchChange={setSearch}
            onAdd={() => setShowForm(true)}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteTarget(id)}
            onNewReport={(p) => navigate(`/new-report?patient=${p.id}`)}
          />
        )}
      </div>

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar eliminación"
      >
        <p className="mb-4 text-sm text-gray-600">
          ¿Eliminar este paciente y todos sus datos? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </div>
      </Dialog>
    </>
  );
}
