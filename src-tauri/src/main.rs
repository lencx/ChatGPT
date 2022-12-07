#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app;
mod utils;

use app::{cmd, menu, setup};

fn main() {
    let context = tauri::generate_context!();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![cmd::drag_window, cmd::fullscreen])
        .setup(setup::init)
        .menu(menu::init(&context))
        .system_tray(menu::tray_menu())
        .on_menu_event(menu::menu_handler)
        .on_system_tray_event(menu::tray_handler)
        .run(context)
        .expect("error while running ChatGPT application");
}
