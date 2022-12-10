use crate::utils::{chat_root, create_file, exists};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

pub const USER_AGENT: &str = "5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
pub const PHONE_USER_AGENT: &str = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
pub const ISSUES_URL: &str = "https://github.com/lencx/ChatGPT/issues";
pub const AWESOME_URL: &str = "https://github.com/lencx/ChatGPT/blob/main/AWESOME.md";

pub struct ChatState {
    pub always_on_top: Mutex<bool>,
}

impl ChatState {
    pub fn default(chat_conf: &ChatConfJson) -> Self {
        ChatState {
            always_on_top: Mutex::new(chat_conf.always_on_top),
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ChatConfJson {
    pub always_on_top: bool,
}

impl ChatConfJson {
    /// init chat.conf.json
    /// path: ~/.chatgpt/chat.conf.json
    pub fn init() -> PathBuf {
        let conf_file = ChatConfJson::conf_path();
        if !exists(&conf_file) {
            create_file(&conf_file).unwrap();
            fs::write(&conf_file, r#"{"always_on_top": false}"#).unwrap();
        }
        conf_file
    }

    pub fn conf_path() -> PathBuf {
        chat_root().join("chat.conf.json")
    }

    pub fn get_chat_conf() -> Self {
        let config_file = fs::read_to_string(ChatConfJson::conf_path()).unwrap();
        let config: serde_json::Value =
            serde_json::from_str(&config_file).expect("failed to parse chat.conf.json");
        serde_json::from_value(config).unwrap_or_else(|_| ChatConfJson::chat_conf_default())
    }

    pub fn update_chat_conf(always_on_top: bool) {
        let mut conf = ChatConfJson::get_chat_conf();
        conf.always_on_top = always_on_top;
        fs::write(
            ChatConfJson::conf_path(),
            serde_json::to_string(&conf).unwrap(),
        )
        .unwrap();
    }

    pub fn chat_conf_default() -> Self {
        serde_json::from_value(serde_json::json!({
            "always_on_top": false,
        }))
        .unwrap()
    }
}
