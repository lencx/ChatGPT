use crate::utils::{chat_root, create_file, exists};
use anyhow::Result;
use serde_json::Value;
use std::{collections::BTreeMap, fs, path::PathBuf, sync::Mutex};
use tauri::{Theme, TitleBarStyle};

pub const USER_AGENT: &str = "5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
pub const PHONE_USER_AGENT: &str = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
pub const ISSUES_URL: &str = "https://github.com/lencx/ChatGPT/issues";
pub const AWESOME_URL: &str = "https://github.com/lencx/ChatGPT/blob/main/AWESOME.md";
pub const DEFAULT_CHAT_CONF: &str = r#"{
    "always_on_top": false,
    "theme": "Light",
    "titlebar": true,
    "origin": "https://chat.openai.com/"
}"#;

pub struct ChatState {
    pub always_on_top: Mutex<bool>,
}

impl ChatState {
    pub fn default(chat_conf: ChatConfJson) -> Self {
        ChatState {
            always_on_top: Mutex::new(chat_conf.always_on_top),
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ChatConfJson {
    pub always_on_top: bool,
    pub theme: String,
    pub titlebar: bool,
    pub origin: String,
}

impl ChatConfJson {
    /// init chat.conf.json
    /// path: ~/.chatgpt/chat.conf.json
    pub fn init() -> PathBuf {
        let conf_file = ChatConfJson::conf_path();
        if !exists(&conf_file) {
            create_file(&conf_file).unwrap();
            fs::write(&conf_file, DEFAULT_CHAT_CONF).unwrap();

            #[cfg(target_os = "macos")]
            ChatConfJson::amend(&serde_json::json!({ "titlebar": false })).unwrap();
        }
        conf_file
    }

    pub fn conf_path() -> PathBuf {
        chat_root().join("chat.conf.json")
    }

    pub fn get_chat_conf() -> Self {
        let config_file = fs::read_to_string(ChatConfJson::conf_path()).unwrap();
        let config: Value =
            serde_json::from_str(&config_file).expect("failed to parse chat.conf.json");
        serde_json::from_value(config).unwrap_or_else(|_| ChatConfJson::chat_conf_default())
    }

    // https://users.rust-lang.org/t/updating-object-fields-given-dynamic-json/39049/3
    pub fn amend(new_rules: &Value) -> Result<()> {
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

    pub fn titlebar() -> TitleBarStyle {
        let conf = ChatConfJson::get_chat_conf();
        if conf.titlebar {
            TitleBarStyle::Transparent
        } else {
            TitleBarStyle::Overlay
        }
    }

    pub fn chat_conf_default() -> Self {
        serde_json::from_value(serde_json::json!(DEFAULT_CHAT_CONF)).unwrap()
    }
}
