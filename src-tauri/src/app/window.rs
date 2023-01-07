use crate::{conf, utils};
use log::info;
use std::time::SystemTime;
use tauri::{utils::config::WindowUrl, window::WindowBuilder, Manager};

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
            .initialization_script(include_str!("../vendors/floating-ui-core.js"))
            .initialization_script(include_str!("../vendors/floating-ui-dom.js"))
            .initialization_script(include_str!("../assets/core.js"))
            .initialization_script(include_str!("../assets/cmd.js"))
            .initialization_script(include_str!("../assets/popup.core.js"))
            .user_agent(&chat_conf.ua_tray)
            .build()
            .unwrap()
            .hide()
            .unwrap();
    });
}

pub fn dalle2_window(
    handle: &tauri::AppHandle,
    query: Option<String>,
    title: Option<String>,
    is_new: Option<bool>,
) {
    info!("dalle2_query: {:?}", query);
    let theme = conf::ChatConfJson::theme();
    let app = handle.clone();

    let query = if query.is_some() {
        format!(
            "window.addEventListener('DOMContentLoaded', function() {{\nwindow.__CHATGPT_QUERY__='{}';\n}})",
            query.unwrap()
        )
    } else {
        "".to_string()
    };

    let label = if is_new.unwrap_or(true) {
        let timestamp = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        format!("dalle2_{}", timestamp)
    } else {
        "dalle2".to_string()
    };

    if app.get_window("dalle2").is_none() {
        tauri::async_runtime::spawn(async move {
            WindowBuilder::new(
                &app,
                label,
                WindowUrl::App("https://labs.openai.com".into()),
            )
            .title(title.unwrap_or_else(|| "DALL·E 2".to_string()))
            .resizable(true)
            .fullscreen(false)
            .inner_size(800.0, 600.0)
            .always_on_top(false)
            .theme(theme)
            .initialization_script(include_str!("../assets/core.js"))
            .initialization_script(&query)
            .initialization_script(include_str!("../assets/dalle2.js"))
            .build()
            .unwrap();
        });
    } else {
        let dalle2_win = app.get_window("dalle2").unwrap();
        dalle2_win.show().unwrap();
        dalle2_win.set_focus().unwrap();
    }
}

pub fn control_window(handle: &tauri::AppHandle) {
    let app = handle.clone();
    tauri::async_runtime::spawn(async move {
        if app.app_handle().get_window("main").is_none() {
            WindowBuilder::new(&app, "main", WindowUrl::App("index.html".into()))
                .title("Control Center")
                .resizable(true)
                .fullscreen(false)
                .inner_size(800.0, 600.0)
                .min_inner_size(800.0, 600.0)
                .build()
                .unwrap();
        } else {
            let main_win = app.app_handle().get_window("main").unwrap();
            main_win.show().unwrap();
            main_win.set_focus().unwrap();
        }
    });
}
