use tauri::{command, AppHandle, LogicalPosition, Manager, PhysicalSize};

use crate::core::{
    claude::{ClaudeClient, ClaudeMessage},
    conf::AppConf,
    constant::{ASK_HEIGHT, TITLEBAR_HEIGHT},
};

#[command]
pub fn view_reload(app: AppHandle) {
    app.get_window("core")
        .unwrap()
        .get_webview("main")
        .unwrap()
        .eval("window.location.reload()")
        .unwrap();
}

#[command]
pub fn view_url(app: AppHandle) -> tauri::Url {
    app.get_window("core")
        .unwrap()
        .get_webview("main")
        .unwrap()
        .url()
        .unwrap()
}

#[command]
pub fn view_go_forward(app: AppHandle) {
    app.get_window("core")
        .unwrap()
        .get_webview("main")
        .unwrap()
        .eval("window.history.forward()")
        .unwrap();
}

#[command]
pub fn view_go_back(app: AppHandle) {
    app.get_window("core")
        .unwrap()
        .get_webview("main")
        .unwrap()
        .eval("window.history.back()")
        .unwrap();
}

#[command]
pub fn window_pin(app: AppHandle, pin: bool) {
    let conf = AppConf::load(&app).unwrap();
    conf.amend(serde_json::json!({"stay_on_top": pin}))
        .unwrap()
        .save(&app)
        .unwrap();

    app.get_window("core")
        .unwrap()
        .set_always_on_top(pin)
        .unwrap();
}

#[command]
pub fn ask_sync(app: AppHandle, message: String) {
    app.get_window("core")
        .unwrap()
        .get_webview("main")
        .unwrap()
        .eval(&format!("ChatAsk.sync({})", message))
        .unwrap();
}

#[command]
pub fn ask_send(app: AppHandle) {
    let win = app.get_window("core").unwrap();

    win.get_webview("main")
        .unwrap()
        .eval(
            r#"
        ChatAsk.submit();
        setTimeout(() => {
            __TAURI__.webview.Webview.getByLabel('ask')?.setFocus();
        }, 500);
        "#,
        )
        .unwrap();
}

#[command]
pub fn set_theme(app: AppHandle, theme: String) {
    let conf = AppConf::load(&app).unwrap();
    conf.amend(serde_json::json!({"theme": theme}))
        .unwrap()
        .save(&app)
        .unwrap();

    app.restart();
}

#[command]
pub fn get_app_conf(app: AppHandle) -> AppConf {
    AppConf::load(&app).unwrap()
}

#[command]
pub fn set_view_ask(app: AppHandle, enabled: bool) {
    let conf = AppConf::load(&app).unwrap();
    conf.amend(serde_json::json!({"ask_mode": enabled}))
        .unwrap()
        .save(&app)
        .unwrap();

    let core_window = app.get_window("core").unwrap();
    let ask_mode_height = if enabled { ASK_HEIGHT } else { 0.0 };
    let scale_factor = core_window.scale_factor().unwrap();
    let titlebar_height = (scale_factor * TITLEBAR_HEIGHT).round() as u32;
    let win_size = core_window.inner_size().unwrap();
    let ask_height = (scale_factor * ask_mode_height).round() as u32;

    let main_view = core_window.get_webview("main").unwrap();
    let titlebar_view = core_window.get_webview("titlebar").unwrap();
    let ask_view = core_window.get_webview("ask").unwrap();

    if enabled {
        ask_view.set_focus().unwrap();
    } else {
        main_view.set_focus().unwrap();
    }

    let set_view_properties =
        |view: &tauri::Webview, position: LogicalPosition<f64>, size: PhysicalSize<u32>| {
            if let Err(e) = view.set_position(position) {
                eprintln!("[cmd:view:position] Failed to set view position: {}", e);
            }
            if let Err(e) = view.set_size(size) {
                eprintln!("[cmd:view:size] Failed to set view size: {}", e);
            }
        };

    #[cfg(target_os = "macos")]
    {
        set_view_properties(
            &main_view,
            LogicalPosition::new(0.0, TITLEBAR_HEIGHT),
            PhysicalSize::new(
                win_size.width,
                win_size.height - (titlebar_height + ask_height),
            ),
        );
        set_view_properties(
            &titlebar_view,
            LogicalPosition::new(0.0, 0.0),
            PhysicalSize::new(win_size.width, titlebar_height),
        );
        set_view_properties(
            &ask_view,
            LogicalPosition::new(
                0.0,
                (win_size.height as f64 / scale_factor) - ask_mode_height,
            ),
            PhysicalSize::new(win_size.width, ask_height),
        );
    }

    #[cfg(not(target_os = "macos"))]
    {
        set_view_properties(
            &main_view,
            LogicalPosition::new(0.0, 0.0),
            PhysicalSize::new(
                win_size.width,
                win_size.height - (ask_height + titlebar_height),
            ),
        );
        set_view_properties(
            &titlebar_view,
            LogicalPosition::new(
                0.0,
                (win_size.height as f64 / scale_factor) - TITLEBAR_HEIGHT,
            ),
            PhysicalSize::new(win_size.width, titlebar_height),
        );
        set_view_properties(
            &ask_view,
            LogicalPosition::new(
                0.0,
                (win_size.height as f64 / scale_factor) - ask_mode_height - TITLEBAR_HEIGHT,
            ),
            PhysicalSize::new(win_size.width, ask_height),
        );
    }
}

#[command]
pub fn set_provider(app: AppHandle, provider: String) -> Result<(), String> {
    let conf = AppConf::load(&app).map_err(|e| e.to_string())?;
    conf.amend(serde_json::json!({"provider": provider}))
        .map_err(|e| e.to_string())?
        .save(&app)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub fn set_anthropic_api_key(app: AppHandle, api_key: String) -> Result<(), String> {
    let conf = AppConf::load(&app).map_err(|e| e.to_string())?;
    conf.amend(serde_json::json!({"anthropic_api_key": api_key}))
        .map_err(|e| e.to_string())?
        .save(&app)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub fn set_extended_context(app: AppHandle, enabled: bool) -> Result<(), String> {
    let conf = AppConf::load(&app).map_err(|e| e.to_string())?;
    conf.amend(serde_json::json!({"use_extended_context": enabled}))
        .map_err(|e| e.to_string())?
        .save(&app)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub async fn send_claude_message(
    app: AppHandle,
    messages: Vec<ClaudeMessage>,
    system: Option<String>,
) -> Result<String, String> {
    let conf = AppConf::load(&app).map_err(|e| e.to_string())?;

    if conf.anthropic_api_key.is_empty() {
        return Err("Anthropic API key not configured".to_string());
    }

    let client = ClaudeClient::new(conf.anthropic_api_key, conf.use_extended_context)
        .map_err(|e| e.to_string())?;

    let response = client
        .create_message(messages, system)
        .await
        .map_err(|e| e.to_string())?;

    let text = ClaudeClient::extract_text_from_response(&response);
    Ok(text)
}

#[command]
pub fn eval_webview(app: AppHandle, webview: String, script: String) -> Result<String, String> {
    let win = app.get_window("core").ok_or("Window not found")?;
    let view = win.get_webview(&webview).ok_or("Webview not found")?;

    view.eval(&script).map_err(|e| e.to_string())?;
    Ok("Success".to_string())
}
