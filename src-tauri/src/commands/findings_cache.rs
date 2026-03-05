use crate::commands::workspace;
use crate::storage::{file_manager, json_store};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FindingsCacheMeta {
    #[serde(default)]
    pub version: String,
    #[serde(default)]
    pub last_sync: String,
    #[serde(default)]
    pub images: HashMap<String, String>,
}

fn get_cache_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let ws = workspace::get_workspace_path(app)?;
    Ok(ws.join("findings_cache"))
}

fn get_img_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(get_cache_dir(app)?.join("img"))
}

#[tauri::command]
pub fn get_findings_cache_meta(app: tauri::AppHandle) -> Result<FindingsCacheMeta, String> {
    let meta_path = get_cache_dir(&app)?.join("meta.json");
    if meta_path.exists() {
        json_store::read_json(&meta_path)
    } else {
        Ok(FindingsCacheMeta::default())
    }
}

#[tauri::command]
pub fn save_findings_cache_meta(app: tauri::AppHandle, meta: FindingsCacheMeta) -> Result<(), String> {
    let cache_dir = get_cache_dir(&app)?;
    file_manager::ensure_dir(&cache_dir)?;
    let meta_path = cache_dir.join("meta.json");
    json_store::write_json(&meta_path, &meta)
}

#[tauri::command]
pub fn save_finding_image(app: tauri::AppHandle, filename: String, image_data: Vec<u8>) -> Result<(), String> {
    let img_dir = get_img_dir(&app)?;
    file_manager::ensure_dir(&img_dir)?;
    let file_path = img_dir.join(&filename);
    std::fs::write(&file_path, &image_data)
        .map_err(|e| format!("Error guardando imagen de hallazgo: {}", e))
}

#[tauri::command]
pub fn load_finding_image(app: tauri::AppHandle, filename: String) -> Result<Vec<u8>, String> {
    let img_dir = get_img_dir(&app)?;
    let file_path = img_dir.join(&filename);
    if file_path.exists() {
        std::fs::read(&file_path)
            .map_err(|e| format!("Error leyendo imagen: {}", e))
    } else {
        Err(format!("Imagen no encontrada: {}", filename))
    }
}

#[tauri::command]
pub fn clear_findings_cache(app: tauri::AppHandle) -> Result<(), String> {
    let cache_dir = get_cache_dir(&app)?;
    if cache_dir.exists() {
        file_manager::remove_dir_all(&cache_dir)?;
    }
    Ok(())
}
