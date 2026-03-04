import { Header } from "@/components/layout/Header";
import { useWorkspace } from "@/hooks/useWorkspace";
import { FilePlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const { config } = useWorkspace();
  const navigate = useNavigate();

  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800">
            Bienvenido{config?.examiner ? `, ${config.examiner}` : ""}
          </h3>
          <p className="mt-1 text-gray-500">
            Sistema de informes de otoscopía clínica
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <button
            onClick={() => navigate("/new-report")}
            className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <FilePlus size={32} className="text-blue-600" />
            <span className="font-medium text-gray-700">Nuevo Informe</span>
          </button>
          <button
            onClick={() => navigate("/patients")}
            className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <Users size={32} className="text-blue-600" />
            <span className="font-medium text-gray-700">Pacientes</span>
          </button>
        </div>
      </div>
    </>
  );
}
