import { invoke } from "@tauri-apps/api/core";

let _platform: string | null = null;

export async function getPlatform(): Promise<string> {
  if (!_platform) _platform = await invoke<string>("get_platform");
  return _platform;
}

export async function isAndroid(): Promise<boolean> {
  return (await getPlatform()) === "android";
}

export async function isMobile(): Promise<boolean> {
  const p = await getPlatform();
  return p === "android" || p === "ios";
}

export async function isDesktop(): Promise<boolean> {
  return !(await isMobile());
}
