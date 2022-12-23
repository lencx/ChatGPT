use crate::{conf::ChatConfJson, utils};
use std::{fs, path::PathBuf};
use tauri::{api, command, AppHandle, Manager};

#[command]
pub fn drag_window(app: AppHandle) {
    app.get_window("core").unwrap().start_dragging().unwrap();
}

#[command]
pub fn fullscreen(app: AppHandle) {
    let win = app.get_window("core").unwrap();
    if win.is_fullscreen().unwrap() {
        win.set_fullscreen(false).unwrap();
    } else {
        win.set_fullscreen(true).unwrap();
    }
}

#[command]
pub fn download(_app: AppHandle, name: String, blob: Vec<u8>) {
    let path = api::path::download_dir().unwrap().join(name);
    fs::write(&path, blob).unwrap();
    utils::open_file(path);
}

#[command]
pub fn open_link(app: AppHandle, url: String) {
    api::shell::open(&app.shell_scope(), url, None).unwrap();
}

#[command]
pub fn get_chat_conf() -> ChatConfJson {
    ChatConfJson::get_chat_conf()
}

#[command]
pub fn form_confirm(_app: AppHandle, data: serde_json::Value) {
    ChatConfJson::amend(&serde_json::json!(data), None).unwrap();
}

#[command]
pub fn form_cancel(app: AppHandle, label: &str, title: &str, msg: &str) {
    let win = app.app_handle().get_window(label).unwrap();
    tauri::api::dialog::ask(
        app.app_handle().get_window(label).as_ref(),
        title,
        msg,
        move |is_cancel| {
            if is_cancel {
                win.close().unwrap();
            }
        },
    );
}

#[command]
pub fn form_msg(app: AppHandle, label: &str, title: &str, msg: &str) {
    let win = app.app_handle().get_window(label);
    tauri::api::dialog::message(win.as_ref(), title, msg);
}

#[command]
pub fn open_file(path: PathBuf) {
    utils::open_file(path);
}

#[command]
pub fn get_chat_model_cmd() -> serde_json::Value {
    let path = utils::chat_root().join("chat.model.cmd.json");
    let content = fs::read_to_string(path).unwrap_or_else(|_| r#"{"data":[]}"#.to_string());
    serde_json::from_str(&content).unwrap()
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct PromptRecord {
    pub cmd: Option<String>,
    pub act: String,
    pub prompt: String,
}

#[command]
pub fn parse_prompt(data: String) -> Vec<PromptRecord> {
    let mut rdr = csv::Reader::from_reader(data.as_bytes());
    let mut list = vec![];
    for result in rdr.deserialize() {
        let record: PromptRecord = result.unwrap();
        list.push(record);
    }
    list
}

#[command]
pub fn window_reload(app: AppHandle, label: &str) {
    app.app_handle()
        .get_window(label)
        .unwrap()
        .eval("window.location.reload()")
        .unwrap();
}


use walkdir::WalkDir;
use utils::chat_root;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ModelRecord {
    pub cmd: String,
    pub act: String,
    pub prompt: String,
    pub tags: Vec<String>,
    pub enable: bool,
}

#[command]
pub fn cmd_list() -> Vec<ModelRecord> {
    let mut list = vec![];
    for entry in WalkDir::new(chat_root().join("cache_model")).into_iter().filter_map(|e| e.ok()) {
        let file = fs::read_to_string(entry.path().display().to_string());
        if let Ok(v) = file {
            let data: Vec<ModelRecord> = serde_json::from_str(&v).unwrap_or_else(|_| vec![]);
            let enable_list = data.into_iter()
                .filter(|v| v.enable);
            list.extend(enable_list)
        }
    }
    // dbg!(&list);
    list.sort_by(|a, b| a.cmd.len().cmp(&b.cmd.len()));
    list
}
