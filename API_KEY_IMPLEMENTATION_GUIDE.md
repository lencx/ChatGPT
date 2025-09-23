# Desktop App API Key Implementation Guide

## Overview

Implement secure API key storage and authentication for the Courtney AI desktop app. The app will store a single API key in the OS keychain and use it to authenticate all requests to the AGX Orin proxy at `http://172.30.30.111:8001`.

## Implementation Steps

### Step 1: Add Keyring Dependency

Edit `src-tauri/Cargo.toml` and ensure this dependency exists:

```toml
[dependencies]
keyring = "2.3"
```

### Step 2: Create Keychain Helper Module

Create `src-tauri/src/keychain.rs`:

```rust
use keyring::Entry;
use tauri::Result;

const SERVICE: &str = "courtney-ai";
const USERNAME: &str = "qwen_api_key";

pub fn store_api_key(key: &str) -> Result<(), Box<dyn std::error::Error>> {
    let entry = Entry::new(SERVICE, USERNAME)?;
    entry.set_password(key)?;
    Ok(())
}

pub fn get_api_key() -> Result<Option<String>, Box<dyn std::error::Error>> {
    let entry = Entry::new(SERVICE, USERNAME)?;
    match entry.get_password() {
        Ok(key) => Ok(Some(key)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(Box::new(e)),
    }
}

pub fn delete_api_key() -> Result<(), Box<dyn std::error::Error>> {
    let entry = Entry::new(SERVICE, USERNAME)?;
    entry.delete_password()?;
    Ok(())
}
```

### Step 3: Add Tauri Commands

Edit `src-tauri/src/main.rs` and add these imports at the top:

```rust
mod keychain;
use reqwest;
use serde::{Deserialize, Serialize};
```

Add these command functions before the `main()` function:

```rust
#[derive(Serialize, Deserialize)]
struct TestResult {
    success: bool,
    message: String,
}

#[tauri::command]
async fn set_qwen_api_key(key: String) -> Result<(), String> {
    keychain::store_api_key(&key).map_err(|e| format!("Failed to store API key: {}", e))
}

#[tauri::command]
async fn get_qwen_api_key() -> Result<Option<String>, String> {
    keychain::get_api_key().map_err(|e| format!("Failed to retrieve API key: {}", e))
}

#[tauri::command]
async fn clear_qwen_api_key() -> Result<(), String> {
    keychain::delete_api_key().map_err(|e| format!("Failed to clear API key: {}", e))
}

#[tauri::command]
async fn test_qwen_api_key() -> Result<TestResult, String> {
    let key = match keychain::get_api_key() {
        Ok(Some(key)) => key,
        Ok(None) => return Ok(TestResult {
            success: false,
            message: "No API key stored".to_string(),
        }),
        Err(e) => return Err(format!("Failed to retrieve API key: {}", e)),
    };

    let client = reqwest::Client::new();
    let response = client
        .get("http://172.30.30.111:8001/health")
        .header("Authorization", format!("Bearer {}", key))
        .send()
        .await;

    match response {
        Ok(resp) if resp.status().is_success() => Ok(TestResult {
            success: true,
            message: "API key is valid".to_string(),
        }),
        Ok(resp) => Ok(TestResult {
            success: false,
            message: format!("Server returned status: {}", resp.status()),
        }),
        Err(e) => Ok(TestResult {
            success: false,
            message: format!("Connection error: {}", e),
        }),
    }
}

#[tauri::command]
async fn proxy_request(method: String, path: String, body: Option<String>) -> Result<String, String> {
    let key = match keychain::get_api_key() {
        Ok(Some(key)) => key,
        Ok(None) => return Err("No API key configured".to_string()),
        Err(e) => return Err(format!("Failed to retrieve API key: {}", e)),
    };

    let client = reqwest::Client::new();
    let url = format!("http://172.30.30.111:8001{}", path);

    let mut request = match method.to_uppercase().as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        _ => return Err("Unsupported HTTP method".to_string()),
    };

    request = request.header("Authorization", format!("Bearer {}", key));

    if let Some(body_content) = body {
        request = request
            .header("Content-Type", "application/json")
            .body(body_content);
    }

    let response = request.send().await
        .map_err(|e| format!("Request failed: {}", e))?;

    let text = response.text().await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    Ok(text)
}
```

Update the command registration in the `main()` function:

```rust
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // ... existing commands ...
            set_qwen_api_key,
            get_qwen_api_key,
            clear_qwen_api_key,
            test_qwen_api_key,
            proxy_request
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Step 4: Add Required Dependencies

Edit `src-tauri/Cargo.toml` and ensure these dependencies exist:

```toml
[dependencies]
reqwest = { version = "0.11", features = ["json"] }
serde = { version = "1.0", features = ["derive"] }
```

### Step 5: Create Settings UI Component

Create `src/components/Settings/ApiKeyForm.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import './ApiKeyForm.scss';

interface TestResult {
  success: boolean;
  message: string;
}

export const ApiKeyForm: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    checkStoredKey();
  }, []);

  const checkStoredKey = async () => {
    try {
      const storedKey = await invoke<string | null>('get_qwen_api_key');
      setHasStoredKey(!!storedKey);
    } catch (error) {
      console.error('Failed to check stored key:', error);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      showMessage('Please enter an API key', 'error');
      return;
    }

    if (!apiKey.includes(':') || !apiKey.startsWith('qwen_')) {
      showMessage('API key should be in format: qwen_xxxxx:secret', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await invoke('set_qwen_api_key', { key: apiKey });
      setHasStoredKey(true);
      setApiKey('');
      showMessage('API key saved successfully', 'success');
    } catch (error) {
      showMessage(`Failed to save API key: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const result = await invoke<TestResult>('test_qwen_api_key');
      showMessage(result.message, result.success ? 'success' : 'error');
    } catch (error) {
      showMessage(`Test failed: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setIsLoading(true);
    try {
      await invoke('clear_qwen_api_key');
      setHasStoredKey(false);
      setApiKey('');
      showMessage('API key cleared', 'success');
    } catch (error) {
      showMessage(`Failed to clear API key: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="api-key-form">
      <h3>API Key Configuration</h3>

      <div className="form-group">
        <label htmlFor="api-key">Qwen API Key:</label>
        <div className="input-group">
          <input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="qwen_xxxxx:your_secret_key"
            disabled={isLoading}
          />
          <button type="button" onClick={() => setShowKey(!showKey)} className="toggle-visibility">
            {showKey ? '👁️' : '🙈'}
          </button>
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleSave} disabled={isLoading || !apiKey.trim()} className="save-btn">
          {isLoading ? 'Saving...' : 'Save'}
        </button>

        <button onClick={handleTest} disabled={isLoading || !hasStoredKey} className="test-btn">
          {isLoading ? 'Testing...' : 'Test'}
        </button>

        <button onClick={handleClear} disabled={isLoading || !hasStoredKey} className="clear-btn">
          {isLoading ? 'Clearing...' : 'Clear'}
        </button>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <div className="help-text">
        <p>Status: {hasStoredKey ? '✅ API key configured' : '❌ No API key stored'}</p>
        <p>
          <small>
            Your API key is stored securely in the system keychain. Format: qwen_[key_id]:[secret]
          </small>
        </p>
      </div>
    </div>
  );
};
```

### Step 6: Create CSS for the Form

Create `src/components/Settings/ApiKeyForm.scss`:

```scss
.api-key-form {
  max-width: 500px;
  padding: 20px;

  h3 {
    margin-bottom: 20px;
    color: #333;
  }

  .form-group {
    margin-bottom: 15px;

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .input-group {
      display: flex;
      gap: 8px;

      input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;

        &:focus {
          outline: none;
          border-color: #007acc;
        }

        &:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
      }

      .toggle-visibility {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;

        &:hover {
          background-color: #f0f0f0;
        }
      }
    }
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &.save-btn {
        background-color: #007acc;
        color: white;

        &:hover:not(:disabled) {
          background-color: #005999;
        }
      }

      &.test-btn {
        background-color: #28a745;
        color: white;

        &:hover:not(:disabled) {
          background-color: #218838;
        }
      }

      &.clear-btn {
        background-color: #dc3545;
        color: white;

        &:hover:not(:disabled) {
          background-color: #c82333;
        }
      }
    }
  }

  .message {
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;

    &.success {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }

    &.error {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }
  }

  .help-text {
    font-size: 12px;
    color: #666;

    p {
      margin: 5px 0;
    }
  }
}
```

### Step 7: Integration Example

Add the component to your settings page. For example, in `src/view/settings/index.tsx`:

```tsx
import { ApiKeyForm } from '../../components/Settings/ApiKeyForm';

// In your settings component:
<ApiKeyForm />;
```

### Step 8: Using the Proxy Request Function

Replace direct fetch calls with the secure proxy function:

```tsx
// Instead of:
// fetch('http://172.30.30.111:8001/v1/chat/completions', {...})

// Use:
import { invoke } from '@tauri-apps/api/tauri';

const sendChatMessage = async (message: string) => {
  try {
    const response = await invoke<string>('proxy_request', {
      method: 'POST',
      path: '/v1/chat/completions',
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        model: 'qwen3-coder',
        max_tokens: 500,
      }),
    });

    const data = JSON.parse(response);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chat request failed:', error);
    throw error;
  }
};
```

## Testing Steps

1. **Build and run the app:**

   ```bash
   cd desktop-app
   pnpm tauri dev
   ```

2. **Test API key flow:**

   - Navigate to Settings
   - Enter your API key: `qwen_a7b508f9afcbc4a9:LlkN4Hshm9G88vr7MVGjW1-FOrwf9noiDHJLXy9ECBM`
   - Click Save (should show success)
   - Click Test (should show "API key is valid")
   - Restart the app
   - Click Test again (should still work, proving persistence)

3. **Test proxy requests:**
   - Use the `proxy_request` function to make a chat request
   - Verify the response comes back correctly

## Security Notes

- ✅ API key is stored in OS keychain (secure)
- ✅ Key never appears in build artifacts or localStorage
- ✅ All proxy requests go through backend with automatic auth
- ✅ Input validation for API key format
- ✅ Clear error messages without exposing secrets

## Troubleshooting

- If keyring fails to build, check platform-specific requirements
- Ensure the proxy server is running on `172.30.30.111:8001`
- Check console for any Tauri command errors
- Verify the API key format matches: `qwen_[id]:[secret]`

This implementation provides secure, persistent API key storage with a clean UI and proper error handling.
