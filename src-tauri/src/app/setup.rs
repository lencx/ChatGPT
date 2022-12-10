use crate::{app::window, conf, utils};
use tauri::{utils::config::WindowUrl, window::WindowBuilder, App, Manager};

#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

pub fn init(
    app: &mut App,
    chat_conf: conf::ChatConfJson,
) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let conf = utils::get_tauri_conf().unwrap();
    let url = conf.build.dev_path.to_string();
    window::mini_window(&app.app_handle());

    #[cfg(target_os = "macos")]
    WindowBuilder::new(app, "core", WindowUrl::App(url.into()))
        .resizable(true)
        .fullscreen(false)
        .inner_size(800.0, 600.0)
        .hidden_title(true)
        .title_bar_style(TitleBarStyle::Overlay)
        .always_on_top(chat_conf.always_on_top)
        .initialization_script(&utils::user_script())
        .initialization_script(include_str!("../assets/html2canvas.js"))
        .initialization_script(include_str!("../assets/jspdf.js"))
        .initialization_script(include_str!("../assets/core.js"))
        .initialization_script(include_str!("../assets/export.js"))
        .user_agent(conf::USER_AGENT)
        .build()?;

    #[cfg(not(target_os = "macos"))]
    WindowBuilder::new(app, "core", WindowUrl::App(url.into()))
        .title("ChatGPT")
        .resizable(true)
        .fullscreen(false)
        .inner_size(800.0, 600.0)
        .always_on_top(chat_conf.always_on_top)
        .initialization_script(&utils::user_script())
        .initialization_script(include_str!("../assets/html2canvas.js"))
        .initialization_script(include_str!("../assets/jspdf.js"))
        .initialization_script(include_str!("../assets/core.js"))
        .initialization_script(include_str!("../assets/export.js"))
        .user_agent(conf::USER_AGENT)
        .build()?;

    Ok(())
}
