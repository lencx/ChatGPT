use crate::{app::window, conf::ChatConfJson, utils};
use log::info;
use tauri::{utils::config::WindowUrl, window::WindowBuilder, App, GlobalShortcutManager, Manager};

pub fn init(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let chat_conf = ChatConfJson::get_chat_conf();
    let url = chat_conf.origin.to_string();
    let theme = ChatConfJson::theme();
    let handle = app.app_handle();

    std::thread::spawn(move || {
        window::tray_window(&handle);
    });

    info!("stepup");

    {
        info!("global_shortcut_start");
        let handle = app.app_handle();
        let mut shortcut = app.global_shortcut_manager();
        let is_mini_key = shortcut.is_registered("CmdOrCtrl+Shift+O");

        if is_mini_key.is_ok() {
            shortcut
                .register("CmdOrCtrl+Shift+O", move || {
                    if let Some(w) = handle.get_window("core") {
                        if w.is_visible().unwrap() {
                            w.hide().unwrap();
                        } else {
                            w.show().unwrap();
                            w.set_focus().unwrap();
                        }
                    }
                })
                .unwrap();
        };
        info!("global_shortcut_end");
    }

    if chat_conf.hide_dock_icon {
        #[cfg(target_os = "macos")]
        app.set_activation_policy(tauri::ActivationPolicy::Accessory);
    } else {
        let app = app.handle();
        std::thread::spawn(move || {
            #[cfg(target_os = "macos")]
            WindowBuilder::new(&app, "core", WindowUrl::App(url.into()))
                .title("ChatGPT")
                .resizable(true)
                .fullscreen(false)
                .inner_size(800.0, 600.0)
                .hidden_title(true)
                .theme(theme)
                .always_on_top(chat_conf.stay_on_top)
                .title_bar_style(ChatConfJson::titlebar())
                .initialization_script(&utils::user_script())
                .initialization_script(include_str!("../assets/html2canvas.js"))
                .initialization_script(include_str!("../assets/jspdf.js"))
                .initialization_script(include_str!("../assets/core.js"))
                .initialization_script(include_str!("../assets/export.js"))
                .initialization_script(include_str!("../assets/cmd.js"))
                .user_agent(&chat_conf.ua_window)
                .build()
                .unwrap();

            #[cfg(not(target_os = "macos"))]
            WindowBuilder::new(&app, "core", WindowUrl::App(url.into()))
                .title("ChatGPT")
                .resizable(true)
                .fullscreen(false)
                .inner_size(800.0, 600.0)
                .theme(theme)
                .always_on_top(chat_conf.stay_on_top)
                .initialization_script(&utils::user_script())
                .initialization_script(include_str!("../assets/html2canvas.js"))
                .initialization_script(include_str!("../assets/jspdf.js"))
                .initialization_script(include_str!("../assets/core.js"))
                .initialization_script(include_str!("../assets/export.js"))
                .initialization_script(include_str!("../assets/cmd.js"))
                .user_agent(&chat_conf.ua_window)
                .build()
                .unwrap();
        });
    }

    Ok(())
}
