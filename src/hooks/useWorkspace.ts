import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createElement } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  getWorkspace,
  setWorkspace,
  getWorkspaceConfig,
  saveWorkspaceConfig,
} from "@/lib/filesystem";
import type { WorkspaceConfig } from "@/types";

interface WorkspaceContextType {
  workspacePath: string;
  config: WorkspaceConfig | null;
  loading: boolean;
  selectWorkspace: () => Promise<boolean>;
  updateConfig: (config: WorkspaceConfig) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspacePath, setWorkspacePath] = useState("");
  const [config, setConfig] = useState<WorkspaceConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspace();
  }, []);

  async function loadWorkspace() {
    try {
      const path = await getWorkspace();
      setWorkspacePath(path);
      const cfg = await getWorkspaceConfig();
      setConfig(cfg);
    } catch {
      // No workspace configured yet
    } finally {
      setLoading(false);
    }
  }

  const selectWorkspace = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected) {
      const path = selected as string;
      await setWorkspace(path);
      setWorkspacePath(path);
      const cfg = await getWorkspaceConfig();
      setConfig(cfg);
      return true;
    }
    return false;
  }, []);

  const updateConfig = useCallback(async (newConfig: WorkspaceConfig) => {
    await saveWorkspaceConfig(newConfig);
    setConfig(newConfig);
  }, []);

  return createElement(
    WorkspaceContext.Provider,
    { value: { workspacePath, config, loading, selectWorkspace, updateConfig } },
    children
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
