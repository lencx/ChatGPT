use anyhow::{anyhow, Result};
use keyring::Entry;
use log::{error, info};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::env;

const KEYRING_SERVICE: &str = "com.nofwl.chatgpt";
const KEYRING_USER: &str = "anthropic_api_key";

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ApiResponse {
    pub id: String,
    pub content: Vec<ContentBlock>,
    pub model: String,
    pub role: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ContentBlock {
    #[serde(rename = "type")]
    pub content_type: String,
    pub text: Option<String>,
}

pub struct AnthropicClient {
    client: Client,
    api_key: String,
    api_url: String,
}

impl AnthropicClient {
    pub fn new(api_key: String) -> Result<Self> {
        let api_url = env::var("ANTHROPIC_API_URL")
            .unwrap_or_else(|_| "https://api.anthropic.com".to_string());

        Ok(Self {
            client: Client::new(),
            api_key,
            api_url,
        })
    }

    pub async fn send_message(
        &self,
        messages: Vec<Message>,
        model: &str,
        max_tokens: u32,
    ) -> Result<ApiResponse> {
        let url = format!("{}/v1/messages", self.api_url);

        let response = self
            .client
            .post(&url)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&json!({
                "model": model,
                "max_tokens": max_tokens,
                "messages": messages,
            }))
            .send()
            .await
            .map_err(|e| anyhow!("Failed to send request: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(anyhow!("API request failed with status {}: {}", status, error_text));
        }

        let api_response: ApiResponse = response
            .json()
            .await
            .map_err(|e| anyhow!("Failed to parse response: {}", e))?;

        Ok(api_response)
    }
}

/// Store API key securely in the system keychain
pub fn store_api_key(api_key: &str) -> Result<()> {
    let entry = Entry::new(KEYRING_SERVICE, KEYRING_USER)
        .map_err(|e| anyhow!("Failed to create keyring entry: {}", e))?;

    entry
        .set_password(api_key)
        .map_err(|e| anyhow!("Failed to store API key: {}", e))?;

    info!("API key stored successfully in system keychain");
    Ok(())
}

/// Retrieve API key from system keychain
pub fn get_api_key() -> Result<String> {
    // First try keyring
    let entry = Entry::new(KEYRING_SERVICE, KEYRING_USER)
        .map_err(|e| anyhow!("Failed to create keyring entry: {}", e))?;

    match entry.get_password() {
        Ok(key) => {
            info!("API key retrieved from system keychain");
            return Ok(key);
        }
        Err(e) => {
            info!("No API key in keychain: {}", e);
        }
    }

    // Fallback to environment variable
    if let Ok(key) = env::var("ANTHROPIC_API_KEY") {
        info!("API key retrieved from environment variable");
        return Ok(key);
    }

    Err(anyhow!("No API key found. Please set it in settings or environment variable."))
}

/// Delete API key from system keychain
pub fn delete_api_key() -> Result<()> {
    let entry = Entry::new(KEYRING_SERVICE, KEYRING_USER)
        .map_err(|e| anyhow!("Failed to create keyring entry: {}", e))?;

    entry
        .delete_credential()
        .map_err(|e| anyhow!("Failed to delete API key: {}", e))?;

    info!("API key deleted from system keychain");
    Ok(())
}

/// Check if API key exists
pub fn has_api_key() -> bool {
    if let Ok(entry) = Entry::new(KEYRING_SERVICE, KEYRING_USER) {
        if entry.get_password().is_ok() {
            return true;
        }
    }

    env::var("ANTHROPIC_API_KEY").is_ok()
}

/// Validate API key format
pub fn validate_api_key(api_key: &str) -> Result<()> {
    if api_key.is_empty() {
        return Err(anyhow!("API key cannot be empty"));
    }

    if !api_key.starts_with("sk-ant-") {
        return Err(anyhow!("Invalid API key format. Anthropic API keys start with 'sk-ant-'"));
    }

    if api_key.len() < 20 {
        return Err(anyhow!("API key is too short"));
    }

    Ok(())
}
