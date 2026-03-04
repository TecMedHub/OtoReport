import { FolderOpen } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";

export function WorkspaceSetup() {
  const { selectWorkspace } = useWorkspace();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          OtoReport
        </h1>
        <p className="mb-8 text-center text-gray-500">
          Selecciona una carpeta de trabajo para almacenar tus informes
        </p>
        <button
          onClick={selectWorkspace}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <FolderOpen size={20} />
          Seleccionar carpeta de trabajo
        </button>
      </div>
    </div>
  );
}
