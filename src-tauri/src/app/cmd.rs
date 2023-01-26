use crate::utils;
use log::info;
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
  let path = utils::app_root().join(PathBuf::from(name));
  utils::create_file(&path).unwrap();
  fs::write(&path, blob).unwrap();
  utils::open_file(path);
}

#[command]
pub fn save_file(_app: AppHandle, name: String, content: String) {
  let path = utils::app_root().join(PathBuf::from(name));
  utils::create_file(&path).unwrap();
  fs::write(&path, content).unwrap();
  utils::open_file(path);
}

#[command]
pub fn open_link(app: AppHandle, url: String) {
  api::shell::open(&app.shell_scope(), url, None).unwrap();
}

#[command]
pub fn run_check_update(app: AppHandle, silent: bool, has_msg: Option<bool>) {
  utils::run_check_update(app, silent, has_msg);
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
