use crate::utils;
use tauri::{utils::config::WindowUrl, window::WindowBuilder, App};

#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

pub fn init(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let conf = utils::get_tauri_conf().unwrap();
    let url = conf.build.dev_path.to_string();

    #[cfg(target_os = "macos")]
    WindowBuilder::new(app, "core", WindowUrl::App(url.into()))
        .resizable(true)
        .fullscreen(false)
        .inner_size(800.0, 600.0)
        .hidden_title(true)
        .title_bar_style(TitleBarStyle::Overlay)
        .initialization_script(&utils::user_script())
        .initialization_script(include_str!("../assets/html2canvas.js"))
        .initialization_script(include_str!("../assets/jspdf.js"))
        .initialization_script(include_str!("../assets/core.js"))
        .initialization_script(include_str!("../assets/import.js"))
        .user_agent("5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36")
        .build()?;

    #[cfg(not(target_os = "macos"))]
    WindowBuilder::new(app, "core", WindowUrl::App(url.into()))
        .title("ChatGPT")
        .resizable(true)
        .fullscreen(false)
        .inner_size(800.0, 600.0)
        .initialization_script(&utils::user_script())
        .initialization_script(include_str!("../assets/html2canvas.js"))
        .initialization_script(include_str!("../assets/jspdf.js"))
        .initialization_script(include_str!("../assets/core.js"))
        .initialization_script(include_str!("../assets/import.js"))
        .user_agent("5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36")
        .build()?;

    Ok(())
}
