use crate::utils::{chat_root, create_file, exists};
use anyhow::Result;
use log::info;
use serde_json::Value;
use std::{collections::BTreeMap, fs, path::PathBuf};
use tauri::{Manager, Theme};

#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

// pub const USER_AGENT: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15";
// pub const PHONE_USER_AGENT: &str = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";

pub const ISSUES_URL: &str = "https://github.com/lencx/ChatGPT/issues";
pub const UPDATE_LOG_URL: &str = "https://github.com/lencx/ChatGPT/blob/main/UPDATE_LOG.md";
pub const AWESOME_URL: &str = "https://github.com/lencx/ChatGPT/blob/main/AWESOME.md";
pub const BUY_COFFEE: &str = "https://www.buymeacoffee.com/lencx";
pub const GITHUB_PROMPTS_CSV_URL: &str =
  "https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv";
pub const DEFAULT_CHAT_CONF: &str = r#"{
  "stay_on_top": false,
  "auto_update": "Prompt",
  "theme": "Light",
  "tray": true,
  "titlebar": true,
  "popup_search": false,
  "global_shortcut": "",
  "hide_dock_icon": false,
  "main_dashboard": false,
  "tray_dashboard": false,
  "main_origin": "https://chat.openai.com",
  "tray_origin": "https://chat.openai.com",
  "default_origin": "https://chat.openai.com",
  "ua_window": "",
  "ua_tray": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
}"#;
pub const DEFAULT_CHAT_CONF_MAC: &str = r#"{
  "stay_on_top": false,
  "auto_update": "Prompt",
  "theme": "Light",
  "tray": true,
  "titlebar": false,
  "popup_search": false,
  "global_shortcut": "",
  "hide_dock_icon": false,
  "main_dashboard": false,
  "tray_dashboard": false,
  "main_origin": "https://chat.openai.com",
  "tray_origin": "https://chat.openai.com",
  "default_origin": "https://chat.openai.com",
  "ua_window": "",
  "ua_tray": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
}"#;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ChatConfJson {
  // support macOS only
  pub titlebar: bool,
  pub hide_dock_icon: bool,

  // macOS and Windows, Light/Dark/System
  pub theme: String,
  // auto update policy, Prompt/Silent/Disable
  pub auto_update: String,
  pub tray: bool,
  pub popup_search: bool,
  pub stay_on_top: bool,
  pub main_dashboard: bool,
  pub tray_dashboard: bool,
  pub main_origin: String,
  pub tray_origin: String,
  pub default_origin: String,
  pub ua_window: String,
  pub ua_tray: String,
  pub global_shortcut: Option<String>,
}

impl ChatConfJson {
  /// init chat.conf.json
  /// path: ~/.chatgpt/chat.conf.json
  pub fn init() -> PathBuf {
    info!("chat_conf_init");
    let conf_file = ChatConfJson::conf_path();
    let content = if cfg!(target_os = "macos") {
      DEFAULT_CHAT_CONF_MAC
    } else {
      DEFAULT_CHAT_CONF
    };

    if !exists(&conf_file) {
      create_file(&conf_file).unwrap();
      fs::write(&conf_file, content).unwrap();
      return conf_file;
    }

    let conf_file = ChatConfJson::conf_path();
    let file_content = fs::read_to_string(&conf_file).unwrap();
    match serde_json::from_str(&file_content) {
      Ok(v) => v,
      Err(err) => {
        if err.to_string() == "invalid type: map, expected unit at line 1 column 0" {
          return conf_file;
        }
        fs::write(&conf_file, content).unwrap();
      }
    };

    conf_file
  }

  pub fn conf_path() -> PathBuf {
    chat_root().join("chat.conf.json")
  }

  pub fn get_chat_conf() -> Self {
    let conf_file = ChatConfJson::conf_path();
    let file_content = fs::read_to_string(&conf_file).unwrap();
    let content = if cfg!(target_os = "macos") {
      DEFAULT_CHAT_CONF_MAC
    } else {
      DEFAULT_CHAT_CONF
    };

    match serde_json::from_value(match serde_json::from_str(&file_content) {
      Ok(v) => v,
      Err(_) => {
        fs::write(&conf_file, content).unwrap();
        serde_json::from_str(content).unwrap()
      }
    }) {
      Ok(v) => v,
      Err(_) => {
        fs::write(&conf_file, content).unwrap();
        serde_json::from_value(serde_json::from_str(content).unwrap()).unwrap()
      }
    }
  }

  pub fn reset_chat_conf() -> Self {
    let conf_file = ChatConfJson::conf_path();
    let content = if cfg!(target_os = "macos") {
      DEFAULT_CHAT_CONF_MAC
    } else {
      DEFAULT_CHAT_CONF
    };
    fs::write(&conf_file, content).unwrap();
    serde_json::from_str(content).unwrap()
  }

  // https://users.rust-lang.org/t/updating-object-fields-given-dynamic-json/39049/3
  pub fn amend(new_rules: &Value, app: Option<tauri::AppHandle>) -> Result<()> {
    let config = ChatConfJson::get_chat_conf();
    let config: Value = serde_json::to_value(&config)?;
    let mut config: BTreeMap<String, Value> = serde_json::from_value(config)?;
    let new_rules: BTreeMap<String, Value> = serde_json::from_value(new_rules.clone())?;

    for (k, v) in new_rules {
      config.insert(k, v);
    }

    fs::write(
      ChatConfJson::conf_path(),
      serde_json::to_string_pretty(&config)?,
    )?;

    if let Some(handle) = app {
      tauri::api::process::restart(&handle.env());
    }

    Ok(())
  }

  pub fn theme() -> Option<Theme> {
    let conf = ChatConfJson::get_chat_conf();
    let theme = match conf.theme.as_str() {
      "System" => match dark_light::detect() {
        // Dark mode
        dark_light::Mode::Dark => Theme::Dark,
        // Light mode
        dark_light::Mode::Light => Theme::Light,
        // Unspecified
        dark_light::Mode::Default => Theme::Light,
      },
      "Dark" => Theme::Dark,
      _ => Theme::Light,
    };

    Some(theme)
  }

  #[cfg(target_os = "macos")]
  pub fn titlebar() -> TitleBarStyle {
    let conf = ChatConfJson::get_chat_conf();
    if conf.titlebar {
      TitleBarStyle::Transparent
    } else {
      TitleBarStyle::Overlay
    }
  }
}
