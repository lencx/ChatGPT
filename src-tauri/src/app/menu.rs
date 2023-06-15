use crate::{
  app::window,
  conf::{self, AppConf},
  utils,
};
use tauri::{
  AppHandle, CustomMenuItem, Manager, Menu, MenuItem, Submenu, SystemTray, SystemTrayEvent,
  SystemTrayMenu, SystemTrayMenuItem, WindowMenuEvent,
};
use tauri_plugin_positioner::{on_tray_event, Position, WindowExt};

#[cfg(target_os = "macos")]
use tauri::AboutMetadata;

// --- Menu
pub fn init() -> Menu {
  let app_conf = AppConf::read();
  let name = "ChatGPT";
  let app_menu = Submenu::new(
    name,
    Menu::with_items([
      #[cfg(target_os = "macos")]
      MenuItem::About(name.into(), AboutMetadata::default()).into(),
      #[cfg(not(target_os = "macos"))]
      CustomMenuItem::new("about", "About ChatGPT").into(),
      CustomMenuItem::new("check_update", "Check for Updates").into(),
      MenuItem::Services.into(),
      MenuItem::Hide.into(),
      MenuItem::HideOthers.into(),
      MenuItem::ShowAll.into(),
      MenuItem::Separator.into(),
      MenuItem::Quit.into(),
    ]),
  );

  let stay_on_top = CustomMenuItem::new("stay_on_top", "Stay On Top").accelerator("CmdOrCtrl+T");
  let stay_on_top_menu = if app_conf.stay_on_top {
    stay_on_top.selected()
  } else {
    stay_on_top
  };

  let theme_light = CustomMenuItem::new("theme_light", "Light");
  let theme_dark = CustomMenuItem::new("theme_dark", "Dark");
  let theme_system = CustomMenuItem::new("theme_system", "System");
  let is_dark = app_conf.clone().theme_check("dark");
  let is_system = app_conf.clone().theme_check("system");

  let update_prompt = CustomMenuItem::new("update_prompt", "Prompt");
  let update_silent = CustomMenuItem::new("update_silent", "Silent");
  // let _update_disable = CustomMenuItem::new("update_disable", "Disable");

  let popup_search = CustomMenuItem::new("popup_search", "Pop-up Search");
  let popup_search_menu = if app_conf.popup_search {
    popup_search.selected()
  } else {
    popup_search
  };

  #[cfg(target_os = "macos")]
  let titlebar = CustomMenuItem::new("titlebar", "Titlebar").accelerator("CmdOrCtrl+B");
  #[cfg(target_os = "macos")]
  let titlebar_menu = if app_conf.titlebar {
    titlebar.selected()
  } else {
    titlebar
  };

  let system_tray = CustomMenuItem::new("system_tray", "System Tray");
  let system_tray_menu = if app_conf.tray {
    system_tray.selected()
  } else {
    system_tray
  };
  let hide_dock_icon = CustomMenuItem::new("hide_dock_icon", "Hide Dock Icon");
  let hide_dock_icon_menu = if app_conf.tray {
    hide_dock_icon
  } else {
    hide_dock_icon.disabled()
  };

  let auto_update = app_conf.get_auto_update();
  let preferences_menu = Submenu::new(
    "Preferences",
    Menu::with_items([
      CustomMenuItem::new("control_center", "Control Center")
        .accelerator("CmdOrCtrl+Shift+P")
        .into(),
      MenuItem::Separator.into(),
      stay_on_top_menu.into(),
      #[cfg(target_os = "macos")]
      titlebar_menu.into(),
      #[cfg(target_os = "macos")]
      hide_dock_icon_menu.into(),
      system_tray_menu.into(),
      MenuItem::Separator.into(),
      Submenu::new(
        "Theme",
        Menu::new()
          .add_item(if is_dark || is_system {
            theme_light
          } else {
            theme_light.selected()
          })
          .add_item(if is_dark {
            theme_dark.selected()
          } else {
            theme_dark
          })
          .add_item(if is_system {
            theme_system.selected()
          } else {
            theme_system
          }),
      )
      .into(),
      Submenu::new(
        "Auto Update",
        Menu::new()
          .add_item(if auto_update == "prompt" {
            update_prompt.selected()
          } else {
            update_prompt
          })
          .add_item(if auto_update == "silent" {
            update_silent.selected()
          } else {
            update_silent
          }), // .add_item(if auto_update == "disable" {
              //     update_disable.selected()
              // } else {
              //     update_disable
              // })
      )
      .into(),
      MenuItem::Separator.into(),
      popup_search_menu.into(),
      CustomMenuItem::new("sync_prompts", "Sync Prompts").into(),
      MenuItem::Separator.into(),
      CustomMenuItem::new("go_conf", "Go to Config")
        .accelerator("CmdOrCtrl+Shift+G")
        .into(),
      CustomMenuItem::new("restart", "Restart ChatGPT")
        .accelerator("CmdOrCtrl+Shift+R")
        .into(),
      CustomMenuItem::new("clear_conf", "Clear Config").into(),
      MenuItem::Separator.into(),
      CustomMenuItem::new("chatgpt_sponsors", "ChatGPT Sponsors").into(),
      MenuItem::Separator.into(),
      CustomMenuItem::new("nofwl", "NoFWL Desktop Application").into(),
      CustomMenuItem::new("sponsor", "Sponsor Author").into(),
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
      .add_item(CustomMenuItem::new("go_back", "Go Back").accelerator("CmdOrCtrl+["))
      .add_item(CustomMenuItem::new("go_forward", "Go Forward").accelerator("CmdOrCtrl+]"))
      .add_item(
        CustomMenuItem::new("scroll_top", "Scroll to Top of Screen").accelerator("CmdOrCtrl+Up"),
      )
      .add_item(
        CustomMenuItem::new("scroll_bottom", "Scroll to Bottom of Screen")
          .accelerator("CmdOrCtrl+Down"),
      )
      .add_native_item(MenuItem::Separator)
      .add_item(CustomMenuItem::new("zoom_0", "Zoom to Actual Size").accelerator("CmdOrCtrl+0"))
      .add_item(CustomMenuItem::new("zoom_out", "Zoom Out").accelerator("CmdOrCtrl+-"))
      .add_item(CustomMenuItem::new("zoom_in", "Zoom In").accelerator("CmdOrCtrl+Plus"))
      .add_native_item(MenuItem::Separator)
      .add_item(CustomMenuItem::new("reload", "Refresh the Screen").accelerator("CmdOrCtrl+R")),
  );

  let window_menu = Submenu::new(
    "Window",
    Menu::new()
      .add_item(CustomMenuItem::new("app_website", "ChatGPT User's Guide"))
      .add_item(CustomMenuItem::new("dalle2", "DALL·E 2"))
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Minimize)
      .add_native_item(MenuItem::Zoom),
  );

  let help_menu = Submenu::new(
    "Help",
    Menu::new()
      .add_item(CustomMenuItem::new("chatgpt_log", "ChatGPT Log"))
      .add_item(CustomMenuItem::new("update_log", "Update Log"))
      .add_item(CustomMenuItem::new("report_bug", "Report Bug"))
      .add_item(
        CustomMenuItem::new("dev_tools", "Toggle Developer Tools").accelerator("CmdOrCtrl+Shift+I"),
      ),
  );

  Menu::new()
    .add_submenu(app_menu)
    .add_submenu(preferences_menu)
    .add_submenu(window_menu)
    .add_submenu(edit_menu)
    .add_submenu(view_menu)
    .add_submenu(help_menu)
}

// --- Menu Event
pub fn menu_handler(event: WindowMenuEvent<tauri::Wry>) {
  let win = Some(event.window()).unwrap();
  let app = win.app_handle();
  let menu_id = event.menu_item_id();
  let menu_handle = win.menu_handle();

  match menu_id {
    // App
    "about" => {
      let tauri_conf = utils::get_tauri_conf().unwrap();
      tauri::api::dialog::message(
        app.get_window("core").as_ref(),
        "ChatGPT",
        format!("Version {}", tauri_conf.package.version.unwrap()),
      );
    }
    "check_update" => {
      utils::run_check_update(app, false, None);
    }
    // Preferences
    "control_center" => window::cmd::control_window(app, "control".into()),
    "restart" => tauri::api::process::restart(&app.env()),
    "go_conf" => utils::open_file(utils::app_root()),
    "clear_conf" => utils::clear_conf(&app),
    "app_website" => window::cmd::wa_window(
      app,
      "app_website".into(),
      "ChatGPT User's Guide".into(),
      conf::APP_WEBSITE.into(),
      None,
    ),
    "nofwl" => open(&app, conf::NOFWL_APP),
    "chatgpt_sponsors" => window::cmd::wa_window(
      app,
      "chatgpt_sponsors".into(),
      "Sponsors".into(),
      conf::APP_SPONSORS.into(),
      None,
    ),
    "sponsor" => window::sponsor_window(app),
    "popup_search" => {
      let app_conf = AppConf::read();
      let popup_search = !app_conf.popup_search;
      menu_handle
        .get_item(menu_id)
        .set_selected(popup_search)
        .unwrap();
      app_conf
        .amend(serde_json::json!({ "popup_search": popup_search }))
        .write();
      window::cmd::window_reload(app.clone(), "core");
      window::cmd::window_reload(app, "tray");
    }
    "sync_prompts" => {
      tauri::api::dialog::ask(
        app.get_window("core").as_ref(),
        "Sync Prompts",
        "Data sync will enable all prompts, are you sure you want to sync?",
        move |is_restart| {
          if is_restart {
            app
              .get_window("core")
              .unwrap()
              .eval("window.__sync_prompts && window.__sync_prompts()")
              .unwrap()
          }
        },
      );
    }
    "hide_dock_icon" => {
      AppConf::read()
        .amend(serde_json::json!({ "hide_dock_icon": true }))
        .write()
        .restart(app);
    }
    "titlebar" => {
      let app_conf = AppConf::read();
      app_conf
        .clone()
        .amend(serde_json::json!({ "titlebar": !app_conf.titlebar }))
        .write()
        .restart(app);
    }
    "system_tray" => {
      let app_conf = AppConf::read();
      app_conf
        .clone()
        .amend(serde_json::json!({ "tray": !app_conf.tray }))
        .write()
        .restart(app);
    }
    "theme_light" | "theme_dark" | "theme_system" => {
      let theme = match menu_id {
        "theme_dark" => "dark",
        "theme_system" => "system",
        _ => "light",
      };
      AppConf::read()
        .amend(serde_json::json!({ "theme": theme }))
        .write()
        .restart(app);
    }
    "update_prompt" | "update_silent" | "update_disable" => {
      // for id in ["update_prompt", "update_silent", "update_disable"] {
      for id in ["update_prompt", "update_silent"] {
        menu_handle.get_item(id).set_selected(false).unwrap();
      }
      let auto_update = match menu_id {
        "update_silent" => {
          menu_handle
            .get_item("update_silent")
            .set_selected(true)
            .unwrap();
          "silent"
        }
        "update_disable" => {
          menu_handle
            .get_item("update_disable")
            .set_selected(true)
            .unwrap();
          "disable"
        }
        _ => {
          menu_handle
            .get_item("update_prompt")
            .set_selected(true)
            .unwrap();
          "prompt"
        }
      };
      AppConf::read()
        .amend(serde_json::json!({ "auto_update": auto_update }))
        .write();
    }
    "stay_on_top" => {
      let app_conf = AppConf::read();
      let stay_on_top = !app_conf.stay_on_top;
      menu_handle
        .get_item(menu_id)
        .set_selected(stay_on_top)
        .unwrap();
      win.set_always_on_top(stay_on_top).unwrap();
      app_conf
        .amend(serde_json::json!({ "stay_on_top": stay_on_top }))
        .write();
    }
    // Window
    "dalle2" => window::dalle2_window(&app, None, None, Some(false)),
    // View
    "zoom_0" => win.eval("window.__zoom0 && window.__zoom0()").unwrap(),
    "zoom_out" => win.eval("window.__zoomOut && window.__zoomOut()").unwrap(),
    "zoom_in" => win.eval("window.__zoomIn && window.__zoomIn()").unwrap(),
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
    "chatgpt_log" => utils::open_file(utils::app_root().join("chatgpt.log")),
    "update_log" => open(&app, conf::UPDATE_LOG_URL),
    "report_bug" => open(&app, conf::ISSUES_URL),
    "dev_tools" => {
      win.open_devtools();
      win.close_devtools();
    }
    _ => (),
  }
}

// --- SystemTray Menu
pub fn tray_menu() -> SystemTray {
  if cfg!(target_os = "macos") {
    let mut tray_menu = SystemTrayMenu::new()
      .add_item(CustomMenuItem::new("control_center", "Control Center"))
      .add_native_item(SystemTrayMenuItem::Separator);

    if AppConf::read().hide_dock_icon {
      tray_menu = tray_menu.add_item(CustomMenuItem::new("show_dock_icon", "Show Dock Icon"));
    } else {
      tray_menu = tray_menu
        .add_item(CustomMenuItem::new("hide_dock_icon", "Hide Dock Icon"))
        .add_item(CustomMenuItem::new("show_core", "Show Window"));
    }

    SystemTray::new().with_menu(
      tray_menu
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit", "Quit")),
    )
  } else {
    SystemTray::new().with_menu(
      SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("control_center", "Control Center"))
        .add_item(CustomMenuItem::new("show_core", "Show Window"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit", "Quit")),
    )
  }
}

// --- SystemTray Event
pub fn tray_handler(handle: &AppHandle, event: SystemTrayEvent) {
  on_tray_event(handle, &event);

  let app = handle.clone();

  match event {
    SystemTrayEvent::LeftClick { .. } => {
      let app_conf = AppConf::read();

      if !app_conf.hide_dock_icon {
        if let Some(core_win) = handle.get_window("core") {
          core_win.minimize().unwrap();
        }
      }

      if let Some(tray_win) = handle.get_window("tray") {
        tray_win.move_window(Position::TrayFixedCenter).unwrap();

        if tray_win.is_visible().unwrap() {
          tray_win.hide().unwrap();
        } else {
          tray_win.show().unwrap();
        }
      }
    }
    SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
      "control_center" => window::cmd::control_window(app, "control".into()),
      "restart" => tauri::api::process::restart(&handle.env()),
      "show_dock_icon" => {
        AppConf::read()
          .amend(serde_json::json!({ "hide_dock_icon": false }))
          .write()
          .restart(app);
      }
      "hide_dock_icon" => {
        let app_conf = AppConf::read();
        if !app_conf.hide_dock_icon {
          app_conf
            .amend(serde_json::json!({ "hide_dock_icon": true }))
            .write()
            .restart(app);
        }
      }
      "show_core" => {
        if let Some(core_win) = app.get_window("core") {
          let tray_win = app.get_window("tray").unwrap();
          if !core_win.is_visible().unwrap() {
            core_win.show().unwrap();
            core_win.set_focus().unwrap();
            tray_win.hide().unwrap();
          }
        };
      }
      "quit" => app.exit(0),
      _ => (),
    },
    _ => (),
  }
}

pub fn open(app: &AppHandle, path: &str) {
  tauri::api::shell::open(&app.shell_scope(), path, None).unwrap();
}
