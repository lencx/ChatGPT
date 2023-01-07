use crate::{app::window, conf::ChatConfJson, utils};
use log::info;
use tauri::{utils::config::WindowUrl, window::WindowBuilder, App, GlobalShortcutManager, Manager};
use wry::application::accelerator::Accelerator;

pub fn init(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
    info!("stepup");
    let chat_conf = ChatConfJson::get_chat_conf();
    let url = chat_conf.origin.to_string();
    let theme = ChatConfJson::theme();
    let handle = app.app_handle();

    tauri::async_runtime::spawn(async move {
        window::tray_window(&handle);
    });

    if let Some(v) = chat_conf.global_shortcut {
        info!("global_shortcut: `{}`", v);
        match v.parse::<Accelerator>() {
            Ok(_) => {
                info!("global_shortcut_register");
                let handle = app.app_handle();
                let mut shortcut = app.global_shortcut_manager();
                shortcut
                    .register(&v, move || {
                        if let Some(w) = handle.get_window("core") {
                            if w.is_visible().unwrap() {
                                w.hide().unwrap();
                            } else {
                                w.show().unwrap();
                                w.set_focus().unwrap();
                            }
                        }
                    })
                    .unwrap_or_else(|err| {
                        info!("global_shortcut_register_error: {}", err);
                    });
            }
            Err(err) => {
                info!("global_shortcut_parse_error: {}", err);
            }
        }
    } else {
        info!("global_shortcut_unregister");
    };

    if chat_conf.hide_dock_icon {
        #[cfg(target_os = "macos")]
        app.set_activation_policy(tauri::ActivationPolicy::Accessory);
    } else {
        let app = app.handle();
        tauri::async_runtime::spawn(async move {
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
                .initialization_script(include_str!("../vendors/floating-ui-core.js"))
                .initialization_script(include_str!("../vendors/floating-ui-dom.js"))
                .initialization_script(include_str!("../vendors/html2canvas.js"))
                .initialization_script(include_str!("../vendors/jspdf.js"))
                .initialization_script(include_str!("../assets/core.js"))
                .initialization_script(include_str!("../assets/popup.core.js"))
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
                .initialization_script(include_str!("../vendors/floating-ui-core.js"))
                .initialization_script(include_str!("../vendors/floating-ui-dom.js"))
                .initialization_script(include_str!("../vendors/html2canvas.js"))
                .initialization_script(include_str!("../vendors/jspdf.js"))
                .initialization_script(include_str!("../assets/core.js"))
                .initialization_script(include_str!("../assets/popup.core.js"))
                .initialization_script(include_str!("../assets/export.js"))
                .initialization_script(include_str!("../assets/cmd.js"))
                .user_agent(&chat_conf.ua_window)
                .build()
                .unwrap();
        });
    }

    // auto_update
    if chat_conf.auto_update != "Disable" {
        info!("stepup::run_check_update");
        let app = app.handle();
        utils::run_check_update(app, chat_conf.auto_update == "Silent", None);
    }

    Ok(())
}
