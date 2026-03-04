import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useSessionList } from "@/hooks/useReports";
import { formatDate } from "@/lib/utils";
import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ReportHistory() {
  const { sessions, loading } = useSessionList();
  const navigate = useNavigate();

  return (
    <>
      <Header title="Historial" />
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            No hay sesiones registradas
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText
                    size={20}
                    className={
                      s.status === "completed" ? "text-blue-600" : "text-gray-400"
                    }
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {s.patient_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(s.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {s.status === "completed" ? "Completado" : "En progreso"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/new-report?patient=${s.patient_id}&session=${s.id}`
                      )
                    }
                  >
                    <Eye size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
