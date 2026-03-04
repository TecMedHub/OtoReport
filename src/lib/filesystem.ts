import { invoke } from "@tauri-apps/api/core";
import type { WorkspaceConfig } from "@/types";

export async function getWorkspace(): Promise<string> {
  return invoke<string>("get_workspace");
}

export async function setWorkspace(path: string): Promise<void> {
  return invoke("set_workspace", { path });
}

export async function getWorkspaceConfig(): Promise<WorkspaceConfig> {
  return invoke<WorkspaceConfig>("get_workspace_config");
}

export async function saveWorkspaceConfig(
  config: WorkspaceConfig
): Promise<void> {
  return invoke("save_workspace_config", { config });
}
