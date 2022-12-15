use crate::{conf::ChatConfJson, utils};
use std::fs;
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
