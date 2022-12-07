use anyhow::Result;
use std::fs::{self, File};
use std::path::{Path, PathBuf};
use tauri::utils::config::Config;

pub fn get_tauri_conf() -> Option<Config> {
    let config_file = include_str!("../tauri.conf.json");
    let config: Config =
        serde_json::from_str(config_file).expect("failed to parse tauri.conf.json");
    Some(config)
}

pub fn exists(path: &Path) -> bool {
    Path::new(path).exists()
}

pub fn create_file(path: &Path) -> Result<File> {
    if let Some(p) = path.parent() {
        fs::create_dir_all(p)?
    }
    File::create(path).map_err(Into::into)
}

pub fn script_path() -> PathBuf {
    let root = tauri::api::path::home_dir().unwrap().join(".chatgpt");
    let script_file = root.join("main.js");
    if !exists(&script_file) {
        create_file(&script_file).unwrap();
        fs::write(&script_file, format!("// *** ChatGPT User Script ***\n// @github: https://github.com/lencx/ChatGPT \n// @path: {}\n\nconsole.log('🤩 Hello ChatGPT!!!');", &script_file.to_string_lossy())).unwrap();
    }

    script_file
}

pub fn user_script() -> String {
    let user_script_content = fs::read_to_string(script_path()).unwrap_or_else(|_| "".to_string());
    format!(
        "window.addEventListener('DOMContentLoaded', function() {{\n{}\n}})",
        user_script_content
    )
}
