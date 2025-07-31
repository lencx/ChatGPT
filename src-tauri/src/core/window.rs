use tauri::{command, AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

use crate::core::constant::WINDOW_SETTINGS;

#[command]
pub fn open_settings(app: AppHandle) {
  match app.get_webview_window(WINDOW_SETTINGS) {
    Some(window) => {
      let _ = window.unminimize();
      let _ = window.set_focus();
      let _ = window.show();
    }
    None => {
      WebviewWindowBuilder::new(&app, WINDOW_SETTINGS, WebviewUrl::App("index.html".into()))
        .decorations(true)
        .transparent(false) // set to true if you want frameless look
        .theme(Some(tauri::Theme::Dark)) // ⚠️ Only works on Tauri >=1.5
        .build()
        .unwrap();
    }
  }
}