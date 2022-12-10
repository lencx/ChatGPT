use crate::{conf, utils};
use tauri::{utils::config::WindowUrl, window::WindowBuilder};

pub fn mini_window(handle: &tauri::AppHandle) {
    let conf = utils::get_tauri_conf().unwrap();
    let url = conf.build.dev_path.to_string();

    WindowBuilder::new(handle, "mini", WindowUrl::App(url.into()))
        .resizable(false)
        .fullscreen(false)
        .inner_size(360.0, 540.0)
        .decorations(false)
        .always_on_top(true)
        .initialization_script(&utils::user_script())
        .initialization_script(include_str!("../assets/html2canvas.js"))
        .initialization_script(include_str!("../assets/jspdf.js"))
        .initialization_script(include_str!("../assets/core.js"))
        .initialization_script(include_str!("../assets/export.js"))
        .user_agent(conf::PHONE_USER_AGENT)
        .menu(tauri::Menu::new())
        .build()
        .unwrap()
        .hide()
        .unwrap();
}
