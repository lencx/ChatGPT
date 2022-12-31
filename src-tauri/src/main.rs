#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app;
mod conf;
mod utils;

use app::{cmd, fs_extra, menu, setup};
use conf::{ChatConfJson, ChatState};
use tauri::api::path;
use tauri_plugin_log::{
    fern::colors::{Color, ColoredLevelConfig},
    LogTarget, LoggerBuilder,
};

#[tokio::main]
async fn main() {
    ChatConfJson::init();
    // If the file does not exist, creating the file will block menu synchronization
    utils::create_chatgpt_prompts();
    let chat_conf = ChatConfJson::get_chat_conf();
    let context = tauri::generate_context!();
    let colors = ColoredLevelConfig {
        error: Color::Red,
        warn: Color::Yellow,
        debug: Color::Blue,
        info: Color::BrightGreen,
        trace: Color::Cyan,
    };

    tauri::Builder::default()
        // https://github.com/tauri-apps/tauri/pull/2736
        .plugin(
            LoggerBuilder::new()
                .level(log::LevelFilter::Debug)
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
            cmd::reset_chat_conf,
            cmd::run_check_update,
            cmd::form_cancel,
            cmd::form_confirm,
            cmd::form_msg,
            cmd::open_file,
            cmd::get_chat_model_cmd,
            cmd::parse_prompt,
            cmd::sync_prompts,
            cmd::sync_user_prompts,
            cmd::window_reload,
            cmd::cmd_list,
            fs_extra::metadata,
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
                    win.close().unwrap();
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
