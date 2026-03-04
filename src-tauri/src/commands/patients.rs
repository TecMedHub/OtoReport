use crate::commands::workspace;
use crate::storage::{file_manager, json_store};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Patient {
    pub id: String,
    pub rut: String,
    pub name: String,
    pub birth_date: String,
    pub age: i32,
    pub phone: String,
    pub email: String,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
}

fn patients_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let ws = workspace::get_workspace_path(app)?;
    let dir = ws.join("patients");
    file_manager::ensure_dir(&dir)?;
    Ok(dir)
}

#[tauri::command]
pub fn list_patients(app: tauri::AppHandle) -> Result<Vec<Patient>, String> {
    let dir = patients_dir(&app)?;
    let ids = file_manager::list_dirs(&dir)?;
    let mut patients = Vec::new();
    for id in ids {
        let path = dir.join(&id).join("patient.json");
        if path.exists() {
            match json_store::read_json::<Patient>(&path) {
                Ok(p) => patients.push(p),
                Err(_) => continue,
            }
        }
    }
    patients.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(patients)
}

#[tauri::command]
pub fn save_patient(app: tauri::AppHandle, patient: Patient) -> Result<(), String> {
    let dir = patients_dir(&app)?;
    let patient_dir = dir.join(&patient.id);
    file_manager::ensure_dir(&patient_dir)?;
    let path = patient_dir.join("patient.json");
    json_store::write_json(&path, &patient)
}

#[tauri::command]
pub fn get_patient(app: tauri::AppHandle, id: String) -> Result<Patient, String> {
    let dir = patients_dir(&app)?;
    let path = dir.join(&id).join("patient.json");
    json_store::read_json(&path)
}

#[tauri::command]
pub fn find_patient_by_rut(app: tauri::AppHandle, rut: String) -> Result<Option<Patient>, String> {
    let dir = patients_dir(&app)?;
    let ids = file_manager::list_dirs(&dir)?;
    let rut_clean: String = rut.chars().filter(|c| c.is_alphanumeric()).collect::<String>().to_uppercase();
    for id in ids {
        let path = dir.join(&id).join("patient.json");
        if path.exists() {
            if let Ok(p) = json_store::read_json::<Patient>(&path) {
                let p_clean: String = p.rut.chars().filter(|c| c.is_alphanumeric()).collect::<String>().to_uppercase();
                if p_clean == rut_clean {
                    return Ok(Some(p));
                }
            }
        }
    }
    Ok(None)
}

#[tauri::command]
pub fn delete_patient(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let dir = patients_dir(&app)?;
    let patient_dir = dir.join(&id);
    if patient_dir.exists() {
        file_manager::remove_dir_all(&patient_dir)
    } else {
        Err("Paciente no encontrado".to_string())
    }
}
