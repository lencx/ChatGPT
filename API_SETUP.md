# Anthropic API Integration Guide

This guide explains how to set up and use the Anthropic API integration in ChatGPT Desktop.

## Features

- **Dual Mode Operation**: Switch between Website Mode (ChatGPT.com) and API Mode (Anthropic Claude)
- **Secure Key Storage**: API keys are stored in your system keychain (not plain text)
- **Multiple Claude Models**: Support for Claude 3.5 Sonnet, Haiku, Opus, and more
- **Conversation History**: Full chat interface in API mode
- **Environment Variable Support**: Optional `.env` file configuration

## Quick Start

### 1. Get an API Key

1. Visit https://console.anthropic.com/settings/keys
2. Create a new API key (it starts with `sk-ant-api03-`)
3. Copy the key (you won't be able to see it again)

### 2. Configure the Application

#### Option A: Using the Settings UI (Recommended)

1. Launch the application
2. Click the Settings icon in the titlebar
3. Paste your API key in the "Anthropic API Key" field
4. Click "Save"
5. Toggle "API Mode" to start using Claude directly

#### Option B: Using Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   ```

3. The application will automatically detect and use this key

### 3. Choose Your Mode

**Website Mode (Default)**
- Uses chatgpt.com in a webview
- No API key required
- Full ChatGPT web interface

**API Mode**
- Direct connection to Anthropic API
- Requires API key
- Native chat interface
- Choose from multiple Claude models

## Configuration Options

### Available Models

- **Claude 3.5 Sonnet** (Latest) - Best balance of speed and intelligence
- **Claude 3.5 Haiku** - Fastest responses
- **Claude 3 Opus** - Most capable for complex tasks
- **Claude 3 Sonnet** - Previous generation
- **Claude 3 Haiku** - Previous generation fast model

### Max Tokens

- Range: 256 - 8192 tokens
- Default: 4096 tokens
- Adjust via slider in Settings

### Environment Variables

All environment variables are optional:

```env
# Required for API mode
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: Model selection (default: claude-3-5-sonnet-20241022)
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Optional: Max tokens (default: 4096)
ANTHROPIC_MAX_TOKENS=4096

# Optional: API base URL (default: https://api.anthropic.com)
ANTHROPIC_API_URL=https://api.anthropic.com
```

## Security

### How Your API Key is Stored

1. **System Keychain**: When saved via Settings UI, your key is stored in:
   - **macOS**: Keychain Access
   - **Windows**: Credential Manager
   - **Linux**: Secret Service (libsecret)

2. **Not in Config Files**: Your API key is NEVER stored in:
   - `config.json`
   - Source code
   - Plain text files

3. **Environment Variables**: If you use `.env`, make sure:
   - `.env` is in `.gitignore` (already configured)
   - Never commit `.env` to version control
   - Use `.env.example` as a template

### Best Practices

- ✅ Use the Settings UI for API key storage
- ✅ Revoke compromised keys immediately at console.anthropic.com
- ✅ Use different keys for different environments
- ❌ Never share your API key
- ❌ Never commit `.env` files
- ❌ Never hardcode API keys in source

## Usage

### Website Mode

1. Application loads chatgpt.com
2. Login with your OpenAI account
3. Use the Ask sidebar to quickly send messages
4. Full ChatGPT interface with all features

### API Mode

1. Enable API Mode in Settings
2. Use the Ask sidebar to chat with Claude
3. Conversation history is maintained in the UI
4. Click "Clear" to start a new conversation
5. Press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows/Linux) to send

## Troubleshooting

### "No API key found"

**Solution**: Set your API key in Settings or create a `.env` file

### "Invalid API key format"

**Solution**: Ensure your key starts with `sk-ant-api03-` and is complete

### "Failed to save API key"

**Solution**: Check system keychain permissions. On Linux, ensure `libsecret` is installed:
```bash
# Ubuntu/Debian
sudo apt install libsecret-1-0

# Fedora
sudo dnf install libsecret
```

### API requests failing

1. Check your API key is valid at console.anthropic.com
2. Verify you have API credits
3. Check network connection
4. Try a different model

### Build errors with keyring

If you encounter keyring-related build errors:

**macOS**: Install Xcode Command Line Tools
```bash
xcode-select --install
```

**Linux**: Install required dependencies
```bash
# Ubuntu/Debian
sudo apt install libdbus-1-dev pkg-config

# Fedora
sudo dnf install dbus-devel
```

**Windows**: Should work out of the box with Visual Studio Build Tools

## API Costs

When using API Mode, you'll be charged by Anthropic based on:
- Model used (Opus > Sonnet > Haiku)
- Number of tokens (input + output)
- Check pricing at: https://anthropic.com/pricing

**Website Mode has no additional costs** - uses your OpenAI ChatGPT subscription.

## Development

### Building from Source

```bash
# Install dependencies
pnpm install

# Development mode
pnpm run dev

# Build for production
pnpm run build
pnpm run tauri build
```

### Adding New Models

Edit `src/view/Settings.tsx` and add to the `CLAUDE_MODELS` array:

```typescript
const CLAUDE_MODELS = [
  { value: 'model-id', label: 'Display Name' },
  // ...
];
```

### Modifying API Client

The API client is in `src-tauri/src/core/api.rs`. Key functions:

- `store_api_key()` - Save key to keychain
- `get_api_key()` - Retrieve key
- `AnthropicClient::send_message()` - Send API request

## Support

For issues or questions:
1. Check this documentation
2. Review `.env.example` for configuration options
3. Open an issue on GitHub with:
   - Error messages
   - Steps to reproduce
   - OS and version

## License

Same as the main project (AGPL-3.0)
