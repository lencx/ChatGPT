#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app;
mod conf;
mod utils;

use app::{cmd, menu, setup};
use conf::ChatConfJson;

fn main() {
    ChatConfJson::init();
    let context = tauri::generate_context!();
    let chat_conf = ChatConfJson::get_chat_conf();
    let chat_conf2 = chat_conf.clone();

    tauri::Builder::default()
        .manage(conf::ChatState::default(&chat_conf))
        .invoke_handler(tauri::generate_handler![
            cmd::drag_window,
            cmd::fullscreen,
            cmd::download,
            cmd::open_link
        ])
        .setup(|app| setup::init(app, chat_conf2))
        .plugin(tauri_plugin_positioner::init())
        .menu(menu::init(&chat_conf, &context))
        .system_tray(menu::tray_menu())
        .on_menu_event(menu::menu_handler)
        .on_system_tray_event(menu::tray_handler)
        .on_window_event(|event| {
            // https://github.com/tauri-apps/tauri/discussions/2684
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                // TODO: https://github.com/tauri-apps/tauri/issues/3084
                // event.window().hide().unwrap();
                // https://github.com/tauri-apps/tao/pull/517
                event.window().minimize().unwrap();
                api.prevent_close();
            }
        })
        .run(context)
        .expect("error while running ChatGPT application");
}
