use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::time::Duration;

const ANTHROPIC_API_URL: &str = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION: &str = "2023-06-01";
const DEFAULT_MODEL: &str = "claude-sonnet-4-5";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClaudeMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize)]
struct CreateMessageRequest {
    model: String,
    max_tokens: u32,
    messages: Vec<ClaudeMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    system: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ContentBlock {
    #[serde(rename = "type")]
    pub content_type: String,
    pub text: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateMessageResponse {
    pub id: String,
    #[serde(rename = "type")]
    pub response_type: String,
    pub role: String,
    pub content: Vec<ContentBlock>,
    pub model: String,
    pub stop_reason: Option<String>,
    pub stop_sequence: Option<String>,
    pub usage: Usage,
}

#[derive(Debug, Deserialize)]
pub struct Usage {
    pub input_tokens: u32,
    pub output_tokens: u32,
}

#[derive(Debug, Deserialize)]
struct ApiError {
    #[serde(rename = "type")]
    error_type: String,
    message: String,
}

#[derive(Debug, Deserialize)]
struct ApiErrorResponse {
    error: ApiError,
}

pub struct ClaudeClient {
    api_key: String,
    client: reqwest::Client,
    use_extended_context: bool,
}

impl ClaudeClient {
    pub fn new(api_key: String, use_extended_context: bool) -> Result<Self> {
        if api_key.is_empty() {
            return Err(anyhow!("Anthropic API key is required"));
        }

        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(300))
            .build()?;

        Ok(Self {
            api_key,
            client,
            use_extended_context,
        })
    }

    pub async fn create_message(
        &self,
        messages: Vec<ClaudeMessage>,
        system: Option<String>,
    ) -> Result<CreateMessageResponse> {
        let request = CreateMessageRequest {
            model: DEFAULT_MODEL.to_string(),
            max_tokens: 1024,
            messages,
            system,
        };

        let mut req_builder = self
            .client
            .post(ANTHROPIC_API_URL)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .header("content-type", "application/json");

        // Add beta header for extended context if enabled
        if self.use_extended_context {
            req_builder = req_builder.header("anthropic-beta", "context-1m-2025-08-07");
        }

        let response = req_builder.json(&request).send().await?;

        let status = response.status();
        let response_text = response.text().await?;

        if !status.is_success() {
            // Try to parse as API error
            if let Ok(error_response) = serde_json::from_str::<ApiErrorResponse>(&response_text) {
                return Err(anyhow!(
                    "Anthropic API error ({}): {}",
                    error_response.error.error_type,
                    error_response.error.message
                ));
            }
            return Err(anyhow!(
                "Anthropic API request failed with status {}: {}",
                status,
                response_text
            ));
        }

        let message_response: CreateMessageResponse = serde_json::from_str(&response_text)?;
        Ok(message_response)
    }

    pub fn extract_text_from_response(response: &CreateMessageResponse) -> String {
        response
            .content
            .iter()
            .filter_map(|block| {
                if block.content_type == "text" {
                    block.text.clone()
                } else {
                    None
                }
            })
            .collect::<Vec<String>>()
            .join("\n")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_client_creation_without_api_key() {
        let result = ClaudeClient::new(String::new(), false);
        assert!(result.is_err());
    }

    #[test]
    fn test_client_creation_with_api_key() {
        let result = ClaudeClient::new("test-key".to_string(), false);
        assert!(result.is_ok());
    }
}
