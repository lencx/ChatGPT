use anyhow::Result;
use log::info;
use regex::Regex;
use serde_json::Value;
use std::{
    collections::HashMap,
    fs::{self, File},
    path::{Path, PathBuf},
    process::Command,
};
use tauri::Manager;
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

pub fn create_chatgpt_prompts() {
    let sync_file = chat_root().join("cache_model").join("chatgpt_prompts.json");
    if !exists(&sync_file) {
        create_file(&sync_file).unwrap();
        fs::write(&sync_file, "[]").unwrap();
    }
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
    info!("open_file: {}", path.to_string_lossy());
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

pub fn clear_conf(app: &tauri::AppHandle) {
    let root = chat_root();
    let app2 = app.clone();
    let msg = format!("Path: {}\nAre you sure to clear all ChatGPT configurations? Please backup in advance if necessary!", root.to_string_lossy());
    tauri::api::dialog::ask(
        app.get_window("core").as_ref(),
        "Clear Config",
        msg,
        move |is_ok| {
            if is_ok {
                fs::remove_dir_all(root).unwrap();
                tauri::api::process::restart(&app2.env());
            }
        },
    );
}

pub fn merge(v: &Value, fields: &HashMap<String, Value>) -> Value {
    match v {
        Value::Object(m) => {
            let mut m = m.clone();
            for (k, v) in fields {
                m.insert(k.clone(), v.clone());
            }
            Value::Object(m)
        }
        v => v.clone(),
    }
}

pub fn gen_cmd(name: String) -> String {
    let re = Regex::new(r"[^a-zA-Z0-9]").unwrap();
    re.replace_all(&name, "_").to_lowercase()
}
