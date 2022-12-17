use crate::{conf, utils};
use tauri::{utils::config::WindowUrl, window::WindowBuilder};

pub fn tray_window(handle: &tauri::AppHandle) {
    let chat_conf = conf::ChatConfJson::get_chat_conf();
    let theme = conf::ChatConfJson::theme();
    let app = handle.clone();

    std::thread::spawn(move || {
        WindowBuilder::new(&app, "tray", WindowUrl::App(chat_conf.origin.into()))
            .title("ChatGPT")
            .resizable(false)
            .fullscreen(false)
            .inner_size(360.0, 540.0)
            .decorations(false)
            .always_on_top(true)
            .theme(theme)
            .initialization_script(&utils::user_script())
            .initialization_script(include_str!("../assets/html2canvas.js"))
            .initialization_script(include_str!("../assets/jspdf.js"))
            .initialization_script(include_str!("../assets/core.js"))
            .initialization_script(include_str!("../assets/export.js"))
            .initialization_script(include_str!("../assets/cmd.js"))
            .user_agent(&chat_conf.ua_tray)
            .build()
            .unwrap()
            .hide()
            .unwrap();
    });
}
