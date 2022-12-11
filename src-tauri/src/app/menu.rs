use crate::{
    conf::{self, ChatConfJson},
    utils,
};
use tauri::{
    utils::assets::EmbeddedAssets, AboutMetadata, AppHandle, Context, CustomMenuItem, Manager,
    Menu, MenuItem, Submenu, SystemTray, SystemTrayEvent, SystemTrayMenu, WindowMenuEvent,
};
use tauri_plugin_positioner::{on_tray_event, Position, WindowExt};

// --- Menu
pub fn init(chat_conf: &conf::ChatConfJson, context: &Context<EmbeddedAssets>) -> Menu {
    let name = &context.package_info().name;
    let app_menu = Submenu::new(
        name,
        Menu::new()
            .add_native_item(MenuItem::About(name.into(), AboutMetadata::default()))
            .add_native_item(MenuItem::Separator)
            .add_item(
                CustomMenuItem::new("restart".to_string(), "Restart ChatGPT")
                    .accelerator("CmdOrCtrl+Shift+R"),
            )
            .add_native_item(MenuItem::Services)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::ShowAll)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit),
    );

    let always_on_top = CustomMenuItem::new("always_on_top".to_string(), "Always On Top")
        .accelerator("CmdOrCtrl+T");
    let titlebar =
        CustomMenuItem::new("titlebar".to_string(), "Titlebar").accelerator("CmdOrCtrl+B");
    let theme_light = CustomMenuItem::new("theme_light".to_string(), "Light");
    let theme_dark = CustomMenuItem::new("theme_dark".to_string(), "Dark");
    let is_dark = chat_conf.theme == "Dark";

    let always_on_top_menu = if chat_conf.always_on_top {
        always_on_top.selected()
    } else {
        always_on_top
    };
    let titlebar_menu = if chat_conf.titlebar {
        titlebar.selected()
    } else {
        titlebar
    };

    let preferences_menu = Submenu::new(
        "Preferences",
        Menu::with_items([
            Submenu::new(
                "Theme",
                Menu::new()
                    .add_item(if is_dark {
                        theme_light
                    } else {
                        theme_light.selected()
                    })
                    .add_item(if is_dark {
                        theme_dark.selected()
                    } else {
                        theme_dark
                    }),
            )
            .into(),
            always_on_top_menu.into(),
            #[cfg(target_os = "macos")]
            titlebar_menu.into(),
            CustomMenuItem::new("inject_script".to_string(), "Inject Script")
                .accelerator("CmdOrCtrl+J")
                .into(),
            MenuItem::Separator.into(),
            CustomMenuItem::new("awesome".to_string(), "Awesome ChatGPT")
                .accelerator("CmdOrCtrl+Z")
                .into(),
        ]),
    );

    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll),
    );

    let view_menu = Submenu::new(
        "View",
        Menu::new()
            .add_item(
                CustomMenuItem::new("go_back".to_string(), "Go Back").accelerator("CmdOrCtrl+Left"),
            )
            .add_item(
                CustomMenuItem::new("go_forward".to_string(), "Go Forward")
                    .accelerator("CmdOrCtrl+Right"),
            )
            .add_item(
                CustomMenuItem::new("scroll_top".to_string(), "Scroll to Top of Screen")
                    .accelerator("CmdOrCtrl+Up"),
            )
            .add_item(
                CustomMenuItem::new("scroll_bottom".to_string(), "Scroll to Bottom of Screen")
                    .accelerator("CmdOrCtrl+Down"),
            )
            .add_native_item(MenuItem::Zoom)
            .add_native_item(MenuItem::Separator)
            .add_item(
                CustomMenuItem::new("reload".to_string(), "Refresh the Screen")
                    .accelerator("CmdOrCtrl+R"),
            ),
    );

    let help_menu = Submenu::new(
        "Help",
        Menu::new()
            .add_item(CustomMenuItem::new("report_bug".to_string(), "Report Bug"))
            .add_item(
                CustomMenuItem::new("dev_tools".to_string(), "Toggle Developer Tools")
                    .accelerator("CmdOrCtrl+Shift+I"),
            ),
    );

    Menu::new()
        .add_submenu(app_menu)
        .add_submenu(preferences_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu)
        .add_submenu(help_menu)
}

// --- Menu Event
pub fn menu_handler(event: WindowMenuEvent<tauri::Wry>) {
    let win = Some(event.window()).unwrap();
    let app = win.app_handle();
    let state: tauri::State<conf::ChatState> = app.state();
    let script_path = utils::script_path().to_string_lossy().to_string();
    let menu_id = event.menu_item_id();

    let core_window = app.get_window("core").unwrap();
    let menu_handle = core_window.menu_handle();

    match menu_id {
        // App
        "restart" => tauri::api::process::restart(&app.env()),
        // Preferences
        "inject_script" => open(&app, script_path),
        "awesome" => open(&app, conf::AWESOME_URL.to_string()),
        "titlebar" => {
            let chat_conf = conf::ChatConfJson::get_chat_conf();
            ChatConfJson::amend(&serde_json::json!({ "titlebar": !chat_conf.titlebar })).unwrap();
            tauri::api::process::restart(&app.env());
        }
        "theme_light" | "theme_dark" => {
            let theme = if menu_id == "theme_dark" {
                "Dark"
            } else {
                "Light"
            };
            ChatConfJson::amend(&serde_json::json!({ "theme": theme })).unwrap();
            tauri::api::process::restart(&app.env());
        }
        "always_on_top" => {
            let mut always_on_top = state.always_on_top.lock().unwrap();
            *always_on_top = !*always_on_top;
            menu_handle
                .get_item(menu_id)
                .set_selected(*always_on_top)
                .unwrap();
            win.set_always_on_top(*always_on_top).unwrap();
            ChatConfJson::amend(&serde_json::json!({ "always_on_top": *always_on_top })).unwrap();
        }
        // View
        "reload" => win.eval("window.location.reload()").unwrap(),
        "go_back" => win.eval("window.history.go(-1)").unwrap(),
        "go_forward" => win.eval("window.history.go(1)").unwrap(),
        "scroll_top" => win
            .eval(
                r#"window.scroll({
                top: 0,
                left: 0,
                behavior: "smooth"
                })"#,
            )
            .unwrap(),
        "scroll_bottom" => win
            .eval(
                r#"window.scroll({
                top: document.body.scrollHeight,
                left: 0,
                behavior: "smooth"})"#,
            )
            .unwrap(),
        // Help
        "report_bug" => open(&app, conf::ISSUES_URL.to_string()),
        "dev_tools" => {
            win.open_devtools();
            win.close_devtools();
        }
        _ => (),
    }
}

// --- SystemTray Menu
pub fn tray_menu() -> SystemTray {
    SystemTray::new().with_menu(SystemTrayMenu::new())
}

// --- SystemTray Event
pub fn tray_handler(handle: &AppHandle, event: SystemTrayEvent) {
    let core_win = handle.get_window("core").unwrap();
    on_tray_event(handle, &event);

    if let SystemTrayEvent::LeftClick { .. } = event {
        core_win.minimize().unwrap();
        let mini_win = handle.get_window("mini").unwrap();
        mini_win.move_window(Position::TrayCenter).unwrap();

        if mini_win.is_visible().unwrap() {
            mini_win.hide().unwrap();
        } else {
            mini_win.show().unwrap();
        }
    }
}

pub fn open(app: &AppHandle, path: String) {
    tauri::api::shell::open(&app.shell_scope(), path, None).unwrap();
}
