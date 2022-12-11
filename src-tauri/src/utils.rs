use anyhow::Result;
use std::{
    fs::{self, File},
    path::{Path, PathBuf},
    process::Command,
};
// use tauri::utils::config::Config;

pub fn chat_root() -> PathBuf {
    tauri::api::path::home_dir().unwrap().join(".chatgpt")
}

// pub fn get_tauri_conf() -> Option<Config> {
//     let config_file = include_str!("../tauri.conf.json");
//     let config: Config =
//         serde_json::from_str(config_file).expect("failed to parse tauri.conf.json");
//     Some(config)
// }

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
    let script_file = chat_root().join("main.js");
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

pub fn open_file(path: PathBuf) {
    #[cfg(target_os = "macos")]
    Command::new("open").arg("-R").arg(path).spawn().unwrap();

    #[cfg(target_os = "windows")]
    Command::new("explorer")
        .arg("/select,")
        .arg(path)
        .spawn()
        .unwrap();

    // https://askubuntu.com/a/31071
    #[cfg(target_os = "linux")]
    Command::new("xdg-open").arg(path).spawn().unwrap();
}
