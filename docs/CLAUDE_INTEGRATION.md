# Claude API Integration Guide

## Overview

This ChatGPT desktop application now supports **dual AI providers**, allowing users to choose between:
- **ChatGPT (Web)**: OpenAI's ChatGPT web interface
- **Claude (API)**: Anthropic's Claude API with native integration

## Features

### Core Features
- ✅ **Provider Selection**: Seamlessly switch between ChatGPT and Claude
- ✅ **Extended Context**: Support for 1M token context window via Anthropic's beta features
- ✅ **Secure API Key Storage**: API keys are stored locally in your config directory
- ✅ **Conversation History**: Maintains context across messages for Claude interactions
- ✅ **Modern UI**: Beautiful, dark mode-compatible interface
- ✅ **Error Handling**: Comprehensive error messages and retry logic

### Technical Specifications

#### Claude API Client
- **Model**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250514)
- **Max Tokens**: 8,192 tokens per response
- **Timeout**: 5 minutes per request
- **API Version**: 2023-06-01
- **Extended Context**: Optional 1M token context window (beta)

#### Supported Features
- Messages API with conversation history
- System prompts (optional)
- Token usage tracking
- Extended context (1M tokens) via beta header
- Comprehensive error handling

## Setup Guide

### Prerequisites
1. **Anthropic API Key**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. **Application Installation**: Build and install the ChatGPT desktop application

### Configuration Steps

#### 1. Access Settings
- Open the application
- Navigate to Settings (via menu or keyboard shortcut)

#### 2. Configure Claude Provider
1. Select **Claude (API)** as your provider
2. Enter your **Anthropic API Key** (format: `sk-ant-...`)
3. (Optional) Enable **Extended Context (1M tokens)** for processing larger documents
4. Click **Save Settings**

#### 3. Start Using Claude
- Return to the main chat interface
- Type your message in the input panel
- Press **Enter** or **⌘/Ctrl + Enter** to send
- Claude will respond with the conversation context maintained

### API Key Security

Your API key is stored securely in:
- **macOS**: `~/Library/Application Support/com.nofwl.chatgpt/config.json`
- **Linux**: `~/.config/com.nofwl.chatgpt/config.json`
- **Windows**: `%APPDATA%\com.nofwl.chatgpt\config.json`

The configuration file is user-readable only and never transmitted except to Anthropic's API.

## Configuration File Format

```json
{
  "theme": "system",
  "stay_on_top": false,
  "ask_mode": true,
  "mac_titlebar_hidden": true,
  "provider": "claude",
  "anthropic_api_key": "sk-ant-...",
  "use_extended_context": false
}
```

### Configuration Options

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `provider` | string | AI provider ("chatgpt" or "claude") | "chatgpt" |
| `anthropic_api_key` | string | Your Anthropic API key | "" |
| `use_extended_context` | boolean | Enable 1M token context window | false |

## Usage Examples

### Basic Conversation
```
User: What is Rust?
Claude: Rust is a systems programming language focused on safety,
        speed, and concurrency...
```

### Extended Context Use Case
Enable **Extended Context** for:
- Processing large documents (up to 1M tokens)
- Analyzing entire codebases
- Long-form content generation
- Complex multi-document analysis

### Conversation History
The application automatically maintains conversation context:
- Previous messages are sent with each request
- Claude maintains awareness of the full conversation
- Clear conversation via the interface (future feature)

## API Implementation Details

### Request Format
```rust
CreateMessageRequest {
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 8192,
    messages: Vec<ClaudeMessage>,
    system: Option<String>,
}
```

### Headers
- `x-api-key`: Your Anthropic API key
- `anthropic-version`: "2023-06-01"
- `anthropic-beta`: "context-1m-2025-08-07" (when extended context is enabled)
- `content-type`: "application/json"

### Response Handling
- Success: Extracts text from content blocks
- Error: Displays user-friendly error messages
- Timeout: 5-minute timeout for long-running requests

## Troubleshooting

### Common Issues

#### 1. "API key not configured"
**Solution**: Open Settings → Enter your Anthropic API key → Save

#### 2. "Authentication error"
**Solution**: Verify your API key is correct at [Anthropic Console](https://console.anthropic.com/)

#### 3. "Request timeout"
**Solution**:
- Check your internet connection
- Try again with a shorter prompt
- Verify Anthropic API status

#### 4. "Rate limit exceeded"
**Solution**:
- Wait a few moments before retrying
- Check your Anthropic account tier limits
- Upgrade your API plan if needed

### Debug Mode

To enable debug logging:
```bash
RUST_LOG=debug ./chatgpt
```

## Architecture

### Components

```
┌─────────────────────────────────────────┐
│         User Interface (React)          │
│  ┌────────────┐        ┌─────────────┐  │
│  │  Ask.tsx   │        │Settings.tsx │  │
│  └────────────┘        └─────────────┘  │
└───────────────┬─────────────────────────┘
                │ Tauri IPC
┌───────────────┴─────────────────────────┐
│         Rust Backend (Tauri)            │
│  ┌────────────────────────────────────┐ │
│  │  cmd.rs (Tauri Commands)           │ │
│  ├────────────────────────────────────┤ │
│  │  claude.rs (API Client)            │ │
│  ├────────────────────────────────────┤ │
│  │  conf.rs (Configuration)           │ │
│  └────────────────────────────────────┘ │
└───────────────┬─────────────────────────┘
                │ HTTPS
┌───────────────┴─────────────────────────┐
│      Anthropic API (api.anthropic.com)  │
└─────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → Ask.tsx captures message
2. **Provider Check** → Routes to ChatGPT or Claude
3. **API Request** → claude.rs sends request to Anthropic
4. **Response** → Displayed in claude-chat.html
5. **History** → Conversation stored in webview state

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### Running Tests

```bash
# Rust tests
cd src-tauri
cargo test

# Integration tests
cargo test -- --test-threads=1
```

### Code Structure

```
src-tauri/src/core/
├── claude.rs          # Claude API client implementation
├── cmd.rs             # Tauri command handlers
├── conf.rs            # Configuration management
├── setup.rs           # Application initialization
└── ...

src/view/
├── Ask.tsx            # Chat input component
├── Settings.tsx       # Settings UI
└── ...

claude-chat.html       # Claude chat interface
```

## API Rate Limits

Anthropic API has the following rate limits (check your tier):

| Tier | Requests/min | Tokens/min | Tokens/day |
|------|--------------|------------|------------|
| Free | 5 | 50,000 | 1,000,000 |
| Build | 50 | 100,000 | 2,500,000 |
| Scale | 1,000 | 400,000 | 10,000,000 |

Extended context (1M tokens) may have different limits. Check [Anthropic Documentation](https://docs.anthropic.com/en/api/rate-limits).

## Future Enhancements

Planned features:
- [ ] Streaming responses
- [ ] Custom system prompts
- [ ] Conversation export/import
- [ ] Multiple conversation threads
- [ ] Token usage analytics
- [ ] Model selection (Opus, Haiku)
- [ ] Function calling / Tool use
- [ ] Vision support (image inputs)

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/lencx/ChatGPT/issues)
- **Documentation**: [Full documentation](https://github.com/lencx/ChatGPT/tree/main/docs)
- **Anthropic Docs**: [Claude API Documentation](https://docs.anthropic.com/)

## License

This integration follows the same license as the main ChatGPT desktop application (AGPL-3.0).

## Credits

- **Anthropic** for the Claude API
- **ChatGPT Desktop** original developers
- Open source contributors

---

**Note**: This feature requires an active Anthropic API key. API usage is subject to Anthropic's terms of service and pricing.
