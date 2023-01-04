use crate::{conf, utils};
use std::time::SystemTime;
use tauri::{utils::config::WindowUrl, window::WindowBuilder};

pub fn tray_window(handle: &tauri::AppHandle) {
    let chat_conf = conf::ChatConfJson::get_chat_conf();
    let theme = conf::ChatConfJson::theme();
    let app = handle.clone();

    tauri::async_runtime::spawn(async move {
        WindowBuilder::new(&app, "tray", WindowUrl::App(chat_conf.origin.into()))
            .title("ChatGPT")
            .resizable(false)
            .fullscreen(false)
            .inner_size(360.0, 540.0)
            .decorations(false)
            .always_on_top(true)
            .theme(theme)
            .initialization_script(&utils::user_script())
            .initialization_script(include_str!("../assets/core.js"))
            .initialization_script(include_str!("../assets/cmd.js"))
            .user_agent(&chat_conf.ua_tray)
            .build()
            .unwrap()
            .hide()
            .unwrap();
    });
}

pub fn dalle2_window(handle: &tauri::AppHandle, query: String) {
    let timestamp = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    let theme = conf::ChatConfJson::theme();
    let app = handle.clone();

    tauri::async_runtime::spawn(async move {
        WindowBuilder::new(&app, format!("dalle2_{}", timestamp), WindowUrl::App("https://labs.openai.com".into()))
            .title("ChatGPT & DALL·E 2")
            .resizable(true)
            .fullscreen(false)
            .inner_size(800.0, 600.0)
            .always_on_top(false)
            .theme(theme)
            .initialization_script(include_str!("../assets/core.js"))
            .initialization_script(&format!(
                "window.addEventListener('DOMContentLoaded', function() {{\nwindow.__CHATGPT_QUERY__='{}';\n}})",
                query
            ))
            .initialization_script(include_str!("../assets/dalle2.js"))
            .build()
            .unwrap();
    });
}

pub fn control_window(handle: &tauri::AppHandle) {
    let app = handle.clone();
    tauri::async_runtime::spawn(async move {
        WindowBuilder::new(&app, "main", WindowUrl::App("index.html".into()))
            .title("Control Center")
            .resizable(true)
            .fullscreen(false)
            .inner_size(800.0, 600.0)
            .min_inner_size(800.0, 600.0)
            .build()
            .unwrap();
    });
}
