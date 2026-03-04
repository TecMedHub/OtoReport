use std::path::PathBuf;

#[tauri::command]
pub fn save_pdf(path: String, data: Vec<u8>) -> Result<(), String> {
    let file_path = PathBuf::from(&path);
    if let Some(parent) = file_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(&file_path, &data).map_err(|e| e.to_string())
}
