import { invoke } from "@tauri-apps/api/core";

const GITHUB_RAW =
  "https://raw.githubusercontent.com/TecMedHub/Otoreports_findings/main";
const INDEX_URL = `${GITHUB_RAW}/json/index.json`;
const IMG_BASE = `${GITHUB_RAW}/img`;

type ContributorEntry = { file: string; name: string };
type Contributors = Record<string, ContributorEntry[]>;

interface CacheMeta {
  version: string;
  last_sync: string;
  images: Record<string, string>;
}

interface RemoteIndex {
  version: string;
  contributors: Record<string, string | ContributorEntry[]>;
}

export interface SyncProgress {
  status: "checking" | "downloading" | "done" | "error";
  current: number;
  total: number;
  message?: string;
}

/** Fetch remote index.json */
async function fetchRemoteIndex(): Promise<{ ok: boolean; data?: RemoteIndex }> {
  try {
    const res = await fetch(INDEX_URL, { cache: "no-cache" });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}

/** Parse contributors from remote index to normalized format */
function parseContributors(raw: Record<string, string | ContributorEntry[]>): Contributors {
  const result: Contributors = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key === "_comment") continue;
    if (typeof value === "string") {
      result[key] = [{ file: `${key}.webp`, name: value }];
    } else if (Array.isArray(value)) {
      result[key] = value as ContributorEntry[];
    }
  }
  return result;
}

/** Get all unique image files from contributors map */
function getImageFiles(contributors: Contributors): Map<string, string> {
  const files = new Map<string, string>(); // filename -> findingKey
  for (const [key, entries] of Object.entries(contributors)) {
    for (const entry of entries) {
      files.set(entry.file, key);
    }
  }
  return files;
}

/** Download a single image from GitHub */
async function downloadImage(filename: string): Promise<Uint8Array | null> {
  try {
    const url = `${IMG_BASE}/${filename}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

/** Check if cache backend commands are available */
async function isCacheAvailable(): Promise<boolean> {
  try {
    await invoke<CacheMeta>("get_findings_cache_meta");
    return true;
  } catch {
    return false;
  }
}

/**
 * Sync findings cache.
 * Downloads images from GitHub only when the remote version changes
 * or images are missing locally. Falls back gracefully if backend
 * cache commands aren't available.
 */
export async function syncFindingsCache(
  onProgress?: (progress: SyncProgress) => void
): Promise<{ ok: boolean; contributors: Contributors }> {
  const report = (p: Partial<SyncProgress>) =>
    onProgress?.({
      status: "checking",
      current: 0,
      total: 0,
      ...p,
    } as SyncProgress);

  report({ status: "checking" });

  const cacheAvailable = await isCacheAvailable();

  // 1. Fetch remote index
  const remote = await fetchRemoteIndex();
  if (!remote.ok || !remote.data) {
    // Offline — try to use local cache if available
    if (cacheAvailable) {
      try {
        const meta = await invoke<CacheMeta>("get_findings_cache_meta");
        if (meta.version) {
          report({ status: "done", current: 0, total: 0 });
          return { ok: true, contributors: {} };
        }
      } catch {
        // No cache
      }
    }
    report({ status: "error", message: "Sin conexión y sin caché local" });
    return { ok: false, contributors: {} };
  }

  const contributors = parseContributors(remote.data.contributors || {});
  const remoteVersion = remote.data.version || "";

  // If cache backend not available, just return contributors (GitHub direct)
  if (!cacheAvailable) {
    report({ status: "done", current: 0, total: 0 });
    return { ok: true, contributors };
  }

  // 2. Read local cache meta
  let localMeta: CacheMeta = { version: "", last_sync: "", images: {} };
  try {
    localMeta = await invoke<CacheMeta>("get_findings_cache_meta");
  } catch {
    // No cache yet
  }

  // 3. Check if sync is needed
  const imageFiles = getImageFiles(contributors);
  const needsSync =
    localMeta.version !== remoteVersion ||
    [...imageFiles.keys()].some((f) => !localMeta.images[f]);

  if (!needsSync) {
    report({ status: "done", current: 0, total: 0 });
    return { ok: true, contributors };
  }

  // 4. Download missing images
  const toDownload = [...imageFiles.keys()].filter((f) => !localMeta.images[f]);
  const total = toDownload.length;

  report({ status: "downloading", current: 0, total });

  const newImages = { ...localMeta.images };

  for (let i = 0; i < toDownload.length; i++) {
    const filename = toDownload[i];
    report({ status: "downloading", current: i + 1, total });

    const data = await downloadImage(filename);
    if (data) {
      try {
        await invoke("save_finding_image", {
          filename,
          imageData: Array.from(data),
        });
        newImages[filename] = imageFiles.get(filename) || "";
      } catch {
        // Failed to save, skip this image
      }
    }
  }

  // 5. Save updated meta
  try {
    const updatedMeta: CacheMeta = {
      version: remoteVersion,
      last_sync: new Date().toISOString(),
      images: newImages,
    };
    await invoke("save_findings_cache_meta", { meta: updatedMeta });
  } catch {
    // Failed to save meta, cache won't persist but images still work
  }

  report({ status: "done", current: total, total });
  return { ok: true, contributors };
}

/** Get a data URL for a cached finding image */
export async function getCachedImageUrl(filename: string): Promise<string | null> {
  try {
    const data = await invoke<number[]>("load_finding_image", { filename });
    const bytes = new Uint8Array(data);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "webp"
          ? "image/webp"
          : ext === "png"
            ? "image/png"
            : "image/jpeg";
    const blob = new Blob([bytes], { type: mime });
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Clear the entire findings cache */
export async function clearFindingsCache(): Promise<void> {
  try {
    await invoke("clear_findings_cache");
  } catch {
    // Backend not available
  }
}
