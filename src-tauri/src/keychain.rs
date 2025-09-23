use anyhow::{anyhow, Result};
use keyring::Entry;
use serde::{Deserialize, Serialize};
use tauri::command;

const KEYRING_SERVICE: &str = "courtney-ai";
const KEYRING_ACCOUNT: &str = "qwen_api_key";

#[derive(Debug, Serialize, Deserialize)]
pub struct TestResult {
  pub success: bool,
  pub message: String,
  pub server_status: Option<String>,
}

/// Securely store API key in OS keychain
pub fn store_api_key(key: &str) -> Result<()> {
  if key.is_empty() {
    return Err(anyhow!("API key cannot be empty"));
  }

  // Basic validation
  if !key.starts_with("qwen_") || !key.contains(':') {
    return Err(anyhow!(
      "Invalid API key format. Expected: qwen_<id>:<secret>"
    ));
  }

  let entry = Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT)?;
  entry
    .set_password(key)
    .map_err(|e| anyhow!("Failed to store API key: {}", e))?;

  log::info!("API key stored successfully in keychain");
  Ok(())
}

/// Retrieve API key from OS keychain
pub fn get_api_key() -> Result<Option<String>> {
  let entry = Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT)?;

  match entry.get_password() {
    Ok(key) => Ok(Some(key)),
    Err(keyring::Error::NoEntry) => Ok(None),
    Err(e) => Err(anyhow!("Failed to retrieve API key: {}", e)),
  }
}

/// Remove API key from OS keychain
pub fn clear_api_key() -> Result<()> {
  let entry = Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT)?;

  match entry.delete_password() {
    Ok(()) => {
      log::info!("API key cleared from keychain");
      Ok(())
    }
    Err(keyring::Error::NoEntry) => Ok(()), // Already cleared
    Err(e) => Err(anyhow!("Failed to clear API key: {}", e)),
  }
}

/// Test API key by making a request to the proxy health endpoint
pub async fn test_api_key() -> Result<TestResult> {
  let api_key = match get_api_key()? {
    Some(key) => key,
    None => {
      return Ok(TestResult {
        success: false,
        message: "No API key stored".to_string(),
        server_status: None,
      });
    }
  };

  let client = reqwest::Client::new();
  let proxy_url = "http://172.30.30.111:8001/health";

  let response = match client
    .get(proxy_url)
    .header("Authorization", format!("Bearer {}", api_key))
    .timeout(std::time::Duration::from_secs(10))
    .send()
    .await
  {
    Ok(resp) => resp,
    Err(e) => {
      return Ok(TestResult {
        success: false,
        message: format!("Connection failed: {}", e),
        server_status: None,
      });
    }
  };

  let status_code = response.status();
  let response_text = response.text().await.unwrap_or_default();

  if status_code.is_success() {
    Ok(TestResult {
      success: true,
      message: "API key valid and proxy healthy".to_string(),
      server_status: Some(response_text),
    })
  } else {
    Ok(TestResult {
      success: false,
      message: format!("Proxy returned error: {} - {}", status_code, response_text),
      server_status: Some(response_text),
    })
  }
}

/// Make a proxied request to the security proxy with stored API key
pub async fn proxy_request(method: &str, path: &str, body: Option<String>) -> Result<String> {
  let api_key = get_api_key()?
    .ok_or_else(|| anyhow!("No API key stored. Please configure API key in Settings."))?;

  let client = reqwest::Client::new();
  let url = format!("http://172.30.30.111:8001{}", path);

  let mut request_builder = match method.to_uppercase().as_str() {
    "GET" => client.get(&url),
    "POST" => client.post(&url),
    "PUT" => client.put(&url),
    "DELETE" => client.delete(&url),
    _ => return Err(anyhow!("Unsupported HTTP method: {}", method)),
  };

  // Add authorization header
  request_builder = request_builder.header("Authorization", format!("Bearer {}", api_key));

  // Add body if provided
  if let Some(body_content) = body {
    request_builder = request_builder
      .header("Content-Type", "application/json")
      .body(body_content);
  }

  let response = request_builder
    .timeout(std::time::Duration::from_secs(30))
    .send()
    .await
    .map_err(|e| anyhow!("Request failed: {}", e))?;

  let status = response.status();
  let response_text = response
    .text()
    .await
    .map_err(|e| anyhow!("Failed to read response: {}", e))?;

  if status.is_success() {
    Ok(response_text)
  } else {
    Err(anyhow!(
      "Request failed with status {}: {}",
      status,
      response_text
    ))
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_api_key_validation() {
    // Valid key format
    assert!(store_api_key("qwen_test123:secret456").is_ok());

    // Invalid formats
    assert!(store_api_key("").is_err());
    assert!(store_api_key("invalid_key").is_err());
    assert!(store_api_key("qwen_test123").is_err()); // Missing colon
    assert!(store_api_key("notqwen_test:secret").is_err()); // Wrong prefix
  }
}

// ===== Tauri Commands =====

#[command]
pub async fn api_store_key(key: String) -> Result<(), String> {
  store_api_key(&key).map_err(|e| e.to_string())
}

#[command]
pub async fn api_get_key() -> Result<Option<String>, String> {
  get_api_key().map_err(|e| e.to_string())
}

#[command]
pub async fn api_clear_key() -> Result<(), String> {
  clear_api_key().map_err(|e| e.to_string())
}

#[command]
pub async fn api_test_connection() -> Result<TestResult, String> {
  test_api_key().await.map_err(|e| e.to_string())
}

#[command]
pub async fn api_proxy_request(
  method: String,
  path: String,
  body: Option<String>,
) -> Result<String, String> {
  proxy_request(&method, &path, body)
    .await
    .map_err(|e| e.to_string())
}

#[command]
pub async fn api_chat_completion(
  messages: String,
  model: Option<String>,
) -> Result<String, String> {
  let model = model.unwrap_or_else(|| "qwen".to_string());

  let chat_request = format!(
    r#"{{
        "model": "{}",
        "messages": {},
        "stream": false,
        "temperature": 0.7,
        "max_tokens": 2048
    }}"#,
    model, messages
  );

  proxy_request("POST", "/v1/chat/completions", Some(chat_request))
    .await
    .map_err(|e| e.to_string())
}

#[command]
pub async fn api_list_models() -> Result<String, String> {
  proxy_request("GET", "/v1/models", None)
    .await
    .map_err(|e| e.to_string())
}
