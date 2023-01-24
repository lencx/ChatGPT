use crate::{
  conf::ChatConfJson,
  utils::{self, chat_root, create_file},
};
use log::info;
use std::{fs, path::PathBuf};
use tauri::{api, command, AppHandle, Manager, Theme};

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
  let path = chat_root().join(PathBuf::from(name));
  create_file(&path).unwrap();
  fs::write(&path, blob).unwrap();
  utils::open_file(path);
}

#[command]
pub fn save_file(_app: AppHandle, name: String, content: String) {
  let path = chat_root().join(PathBuf::from(name));
  create_file(&path).unwrap();
  fs::write(&path, content).unwrap();
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
pub fn reset_chat_conf() -> ChatConfJson {
  ChatConfJson::reset_chat_conf()
}

#[command]
pub fn get_theme() -> String {
  ChatConfJson::theme().unwrap_or(Theme::Light).to_string()
}

#[command]
pub fn run_check_update(app: AppHandle, silent: bool, has_msg: Option<bool>) {
  utils::run_check_update(app, silent, has_msg);
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
pub async fn get_data(app: AppHandle, url: String, is_msg: Option<bool>) -> Option<String> {
  let is_msg = is_msg.unwrap_or(false);
  let res = if is_msg {
    utils::get_data(&url, Some(&app)).await
  } else {
    utils::get_data(&url, None).await
  };
  res.unwrap_or_else(|err| {
    info!("chatgpt_client_http_error: {}", err);
    None
  })
}
