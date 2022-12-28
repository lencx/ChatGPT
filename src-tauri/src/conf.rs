use crate::utils::{chat_root, create_file, exists};
use anyhow::Result;
use log::info;
use serde_json::Value;
use std::{collections::BTreeMap, fs, path::PathBuf, sync::Mutex};
use tauri::{Manager, Theme};

#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

// pub const USER_AGENT: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15";
// pub const PHONE_USER_AGENT: &str = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";

pub const ISSUES_URL: &str = "https://github.com/lencx/ChatGPT/issues";
pub const UPDATE_LOG_URL: &str = "https://github.com/lencx/ChatGPT/blob/main/UPDATE_LOG.md";
pub const AWESOME_URL: &str = "https://github.com/lencx/ChatGPT/blob/main/AWESOME.md";
pub const DEFAULT_CHAT_CONF: &str = r#"{
    "stay_on_top": false,
    "theme": "Light",
    "titlebar": true,
    "hide_dock_icon": false,
    "default_origin": "https://chat.openai.com",
    "origin": "https://chat.openai.com",
    "ua_window": "",
    "ua_tray": ""
}"#;
pub const DEFAULT_CHAT_CONF_MAC: &str = r#"{
    "stay_on_top": false,
    "theme": "Light",
    "titlebar": false,
    "hide_dock_icon": false,
    "default_origin": "https://chat.openai.com",
    "origin": "https://chat.openai.com",
    "ua_window": "",
    "ua_tray": ""
}"#;

pub struct ChatState {
    pub stay_on_top: Mutex<bool>,
}

impl ChatState {
    pub fn default(chat_conf: ChatConfJson) -> Self {
        ChatState {
            stay_on_top: Mutex::new(chat_conf.stay_on_top),
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ChatConfJson {
    // support macOS only
    pub titlebar: bool,
    pub hide_dock_icon: bool,

    // macOS and Windows
    pub theme: String,

    pub stay_on_top: bool,
    pub default_origin: String,
    pub origin: String,
    pub ua_window: String,
    pub ua_tray: String,
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
            // tauri::api::dialog::ask(
            //     handle.get_window("core").as_ref(),
            //     "ChatGPT Restart",
            //     "Whether to restart immediately?",
            //     move |is_restart| {
            //         if is_restart {
            //         }
            //     },
            // );
        }

        Ok(())
    }

    pub fn theme() -> Option<Theme> {
        let conf = ChatConfJson::get_chat_conf();
        if conf.theme == "Dark" {
            Some(Theme::Dark)
        } else {
            Some(Theme::Light)
        }
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
