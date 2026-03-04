use crate::commands::workspace;
use crate::storage::file_manager;
use image::imageops::FilterType;
use image::ImageReader;
use std::io::Cursor;
use uuid::Uuid;

fn ear_path(
    app: &tauri::AppHandle,
    patient_id: &str,
    session_id: &str,
    side: &str,
) -> Result<std::path::PathBuf, String> {
    let ws = workspace::get_workspace_path(app)?;
    let path = ws
        .join("patients")
        .join(patient_id)
        .join("sessions")
        .join(session_id)
        .join(side);
    file_manager::ensure_dir(&path)?;
    Ok(path)
}

#[tauri::command]
pub fn save_image(
    app: tauri::AppHandle,
    patient_id: String,
    session_id: String,
    side: String,
    image_data: Vec<u8>,
    extension: String,
) -> Result<(String, String), String> {
    let dir = ear_path(&app, &patient_id, &session_id, &side)?;
    let id = Uuid::new_v4().to_string();
    let filename = format!("{}.{}", id, extension);
    let thumb_filename = format!("{}_thumb.jpg", id);

    // Save original
    let orig_path = dir.join(&filename);
    std::fs::write(&orig_path, &image_data).map_err(|e| e.to_string())?;

    // Create thumbnail
    let img = ImageReader::new(Cursor::new(&image_data))
        .with_guessed_format()
        .map_err(|e| e.to_string())?
        .decode()
        .map_err(|e| e.to_string())?;

    let thumb = img.resize(200, 200, FilterType::Triangle);
    let thumb_path = dir.join(&thumb_filename);
    thumb.save(&thumb_path).map_err(|e| e.to_string())?;

    Ok((filename, thumb_filename))
}

#[tauri::command]
pub fn load_image(
    app: tauri::AppHandle,
    patient_id: String,
    session_id: String,
    side: String,
    filename: String,
) -> Result<Vec<u8>, String> {
    let dir = ear_path(&app, &patient_id, &session_id, &side)?;
    let path = dir.join(&filename);
    std::fs::read(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_image(
    app: tauri::AppHandle,
    patient_id: String,
    session_id: String,
    side: String,
    filename: String,
    thumbnail: String,
) -> Result<(), String> {
    let dir = ear_path(&app, &patient_id, &session_id, &side)?;
    let _ = std::fs::remove_file(dir.join(&filename));
    let _ = std::fs::remove_file(dir.join(&thumbnail));
    Ok(())
}

#[tauri::command]
pub fn rotate_image(
    app: tauri::AppHandle,
    patient_id: String,
    session_id: String,
    side: String,
    filename: String,
    degrees: i32,
) -> Result<(), String> {
    let dir = ear_path(&app, &patient_id, &session_id, &side)?;
    let path = dir.join(&filename);
    let data = std::fs::read(&path).map_err(|e| e.to_string())?;

    let img = ImageReader::new(Cursor::new(&data))
        .with_guessed_format()
        .map_err(|e| e.to_string())?
        .decode()
        .map_err(|e| e.to_string())?;

    let rotated = match degrees % 360 {
        90 | -270 => img.rotate90(),
        180 | -180 => img.rotate180(),
        270 | -90 => img.rotate270(),
        _ => img,
    };

    rotated.save(&path).map_err(|e| e.to_string())?;

    // Regenerate thumbnail
    let thumb = rotated.resize(200, 200, FilterType::Triangle);
    let stem = filename.rsplit_once('.').map(|(s, _)| s).unwrap_or(&filename);
    let thumb_path = dir.join(format!("{}_thumb.jpg", stem));
    thumb.save(&thumb_path).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn move_image(
    app: tauri::AppHandle,
    patient_id: String,
    session_id: String,
    from_side: String,
    to_side: String,
    filename: String,
    thumbnail: String,
) -> Result<(), String> {
    let src_dir = ear_path(&app, &patient_id, &session_id, &from_side)?;
    let dst_dir = ear_path(&app, &patient_id, &session_id, &to_side)?;

    std::fs::rename(src_dir.join(&filename), dst_dir.join(&filename))
        .map_err(|e| e.to_string())?;
    std::fs::rename(src_dir.join(&thumbnail), dst_dir.join(&thumbnail))
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_annotated(
    app: tauri::AppHandle,
    patient_id: String,
    session_id: String,
    side: String,
    filename: String,
    image_data: Vec<u8>,
) -> Result<(), String> {
    let dir = ear_path(&app, &patient_id, &session_id, &side)?;
    let stem = filename.rsplit_once('.').map(|(s, _)| s).unwrap_or(&filename);
    let annotated_path = dir.join(format!("{}_annotated.png", stem));
    std::fs::write(&annotated_path, &image_data).map_err(|e| e.to_string())
}
