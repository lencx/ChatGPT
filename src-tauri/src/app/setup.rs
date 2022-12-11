use crate::{
    app::window,
    conf::{ChatConfJson, USER_AGENT},
    utils,
};
use tauri::{utils::config::WindowUrl, window::WindowBuilder, App, Manager};

pub fn init(
    app: &mut App,
    chat_conf: ChatConfJson,
) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let url = chat_conf.origin.to_string();
    let theme = ChatConfJson::theme();
    window::mini_window(&app.app_handle());

    #[cfg(target_os = "macos")]
    WindowBuilder::new(app, "core", WindowUrl::App(url.into()))
        .resizable(true)
        .fullscreen(false)
        .inner_size(800.0, 600.0)
        .hidden_title(true)
        .theme(theme)
        .always_on_top(chat_conf.always_on_top)
        .title_bar_style(ChatConfJson::titlebar())
        .initialization_script(&utils::user_script())
        .initialization_script(include_str!("../assets/html2canvas.js"))
        .initialization_script(include_str!("../assets/jspdf.js"))
        .initialization_script(include_str!("../assets/core.js"))
        .initialization_script(include_str!("../assets/export.js"))
        .user_agent(USER_AGENT)
        .build()?;

    #[cfg(not(target_os = "macos"))]
    WindowBuilder::new(app, "core", WindowUrl::App(url.into()))
        .title("ChatGPT")
        .resizable(true)
        .fullscreen(false)
        .inner_size(800.0, 600.0)
        .theme(theme)
        .always_on_top(chat_conf.always_on_top)
        .initialization_script(&utils::user_script())
        .initialization_script(include_str!("../assets/html2canvas.js"))
        .initialization_script(include_str!("../assets/jspdf.js"))
        .initialization_script(include_str!("../assets/core.js"))
        .initialization_script(include_str!("../assets/export.js"))
        .user_agent(USER_AGENT)
        .build()?;

    Ok(())
}
