#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app;
mod conf;
mod utils;

use app::{cmd, menu, setup};
use conf::{ChatConfJson, ChatState};
use tauri::api::path;
use tauri_plugin_log::{fern::colors::ColoredLevelConfig, LogTarget, LoggerBuilder};

fn main() {
    ChatConfJson::init();
    let chat_conf = ChatConfJson::get_chat_conf();
    let context = tauri::generate_context!();
    let colors = ColoredLevelConfig::default();

    tauri::Builder::default()
        // https://github.com/tauri-apps/tauri/pull/2736
        .plugin(
            LoggerBuilder::new()
                .with_colors(colors)
                .targets([
                    // LogTarget::LogDir,
                    // LOG PATH: ~/.chatgpt/ChatGPT.log
                    LogTarget::Folder(path::home_dir().unwrap().join(".chatgpt")),
                    LogTarget::Stdout,
                    LogTarget::Webview,
                ])
                .build(),
        )
        .manage(ChatState::default(chat_conf))
        .invoke_handler(tauri::generate_handler![
            cmd::drag_window,
            cmd::fullscreen,
            cmd::download,
            cmd::open_link,
            cmd::get_chat_conf,
            cmd::form_cancel,
            cmd::form_confirm,
            cmd::form_msg,
            cmd::open_file,
            cmd::get_chat_model,
        ])
        .setup(setup::init)
        .plugin(tauri_plugin_positioner::init())
        .menu(menu::init())
        .system_tray(menu::tray_menu())
        .on_menu_event(menu::menu_handler)
        .on_system_tray_event(menu::tray_handler)
        .on_window_event(|event| {
            // https://github.com/tauri-apps/tauri/discussions/2684
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                let win = event.window();
                if win.label() == "main" {
                    win.hide().unwrap();
                } else {
                    // TODO: https://github.com/tauri-apps/tauri/issues/3084
                    // event.window().hide().unwrap();
                    // https://github.com/tauri-apps/tao/pull/517
                    event.window().minimize().unwrap();
                }
                api.prevent_close();
            }
        })
        .run(context)
        .expect("error while running ChatGPT application");
}
