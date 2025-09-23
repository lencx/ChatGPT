# Courtney AI Desktop Application - Development Roadmap

## 🎯 **Project Overview**

Transform the forked ChatGPT desktop app (v1.1.0) into a branded Courtney AI desktop application that connects to our AGX Orin server at `172.30.30.111:8000` instead of OpenAI's API.

## 📋 **Development Phases**

### **Phase 1: Environment Setup & Baseline Testing** (Days 1-2) ✅ **COMPLETED**

#### 1.1 Setup Development Environment

- [x] **Review existing dev container** (`.devcontainer/devcontainer.json`)
- [x] **Install Rust toolchain** (for Tauri backend)
- [x] **Install Node.js dependencies** (`pnpm install`)
- [x] **Install Tauri CLI** (`cargo install tauri-cli`)
- [x] **Verify build tools** (Rust, Node.js, pnpm versions)

#### 1.2 Test Baseline Application

- [x] **Build development version** (`pnpm tauri dev`)
- [x] **Test original ChatGPT functionality** (with OpenAI API)
- [x] **Document current features** and UI components
- [x] **Identify potential issues** or outdated dependencies
- [x] **Screenshot baseline interface** for comparison

#### 1.3 Update Development Container (if needed)

- [x] **Update Node.js version** to latest LTS
- [x] **Update Rust toolchain** to stable
- [x] **Fix any dependency conflicts**
- [x] **Optimize container for Tauri development**
- [x] **Test build process** in updated environment

---

### **Phase 2: Branding & Identity Update** (Days 3-4) ✅ **COMPLETED**

#### 2.1 Application Metadata

- [x] **Update `package.json`** (name, description, author)
- [x] **Update `Cargo.toml`** (package name, description)
- [x] **Update `tauri.conf.json`** (app name, identifier, version)
- [x] **Update window titles** and system tray text
- [x] **Update about dialog** information

#### 2.2 Visual Branding

- [x] **Replace app icons** (`src-tauri/icons/`)
  - Desktop icon (`.ico`, `.icns`, `.png`)
  - System tray icons (`tray-icon.png`, `tray-icon-light.png`)
  - Windows Store assets (various Square logos)
- [x] **Update splash screen** and loading graphics
- [x] **Replace logo in UI** (`public/logo.png`)
- [x] **Update favicon** and web assets

#### 2.3 Text & Copy Updates

- [x] **Update all "ChatGPT" references** to "Courtney AI"
- [x] **Update menu items** and context menus
- [x] **Update error messages** and notifications
- [x] **Update help text** and tooltips
- [x] **Update README** and documentation

---

### **Phase 3: API Integration** (Days 5-6) ✅ **MOSTLY COMPLETED**

#### 3.1 AGX Orin Server Configuration

- [x] **Update base URL** in `src-tauri/src/conf.rs`
  - Change from `https://chat.openai.com` to `http://172.30.30.111:8080`
- [x] **Configure API endpoints** for llama.cpp server
  - Chat completion: `http://172.30.30.111:8001/v1/chat/completions`
  - Models list: `http://172.30.30.111:8001/v1/models`
- [x] **Implement authentication** using API keys
  - Format: `qwen_a7b508f9afcbc4a9:LlkN4Hshm9G88vr7MVGjW1-FOrwf9noiDHJLXy9ECBM`
  - Secure storage in OS keychain

#### 3.2 Request/Response Handling

- [x] **Update API calls** to match llama.cpp format
- [x] **Add direct API integration** via Tauri commands
  - `api_chat_completion`
  - `api_list_models`
  - `api_proxy_request`
- [x] **Handle authentication headers** (`Authorization: Bearer`)
- [ ] **Error handling** for connection issues
- [ ] **Retry logic** for failed requests

#### 3.3 Feature Compatibility

- [x] **Chat interface** compatibility with OpenAI format
- [ ] **Code highlighting** optimization for Qwen3-Coder
- [ ] **Remove DALL-E functionality** (not supported)
- [ ] **Update export features** for new response format

---

### **Phase 4: Interface Customization** (Days 7-8)

#### 4.1 UI/UX Improvements

- [ ] **Review Open WebUI styling** for inspiration
- [ ] **Update color scheme** to match Courtney AI branding
- [ ] **Customize chat interface** layout
- [ ] **Add code highlighting** optimized for Qwen3-Coder
- [ ] **Improve file handling** for code projects

#### 4.2 Feature Enhancements

- [ ] **Remove DALL-E functionality** - Local LLM doesn't support image generation
  - Remove DALL-E 2 button from pop-up search
  - Remove image generation UI components
  - Clean up DALL-E related scripts and menu items
  - Update help text and tooltips to remove image generation references
- [ ] **Add connection status** indicator
- [ ] **Add server configuration** options
- [ ] **Improve code export** functionality
- [ ] **Add keyboard shortcuts** for common actions
- [ ] **Customize system tray** menu

#### 4.3 Performance Optimization

- [ ] **Optimize bundle size** (remove unused features)
- [ ] **Improve startup time**
- [ ] **Optimize memory usage**
- [ ] **Test with large conversations**
- [ ] **Profile and optimize** critical paths

---

### **Phase 5: Testing & Quality Assurance** (Days 9-10)

#### 5.1 Integration Testing

- [ ] **Test all chat functionality** with AGX Orin
- [ ] **Test file operations** (save, export, import)
- [ ] **Test system integration** (tray, notifications)
- [ ] **Test window management** (minimize, restore, close)
- [ ] **Test keyboard shortcuts** and hotkeys

#### 5.2 Cross-Platform Testing

- [ ] **Test on Linux** (Ubuntu/Debian)
- [ ] **Test on Windows** (Windows 10/11)
- [ ] **Verify desktop integration** on both platforms
- [ ] **Test auto-update mechanism**
- [ ] **Test installer packages**

#### 5.3 Performance & Reliability

- [ ] **Stress test** with long conversations
- [ ] **Test network disconnection** scenarios
- [ ] **Test server restart** scenarios
- [ ] **Memory leak testing**
- [ ] **Battery usage optimization** (if applicable)

---

### **Phase 6: Build & Distribution** (Days 11-12)

#### 6.1 Production Builds

- [ ] **Build Windows installer** (`.msi`)
- [ ] **Build Windows portable** (`.exe`)
- [ ] **Build Linux AppImage** (universal)
- [ ] **Build Linux packages** (`.deb`, `.rpm`)
- [ ] **Test all installers** on clean systems

#### 6.2 Auto-Update Setup

- [ ] **Configure update server** endpoints
- [ ] **Test auto-update mechanism**
- [ ] **Setup release channels** (stable, beta)
- [ ] **Create update documentation**
- [ ] **Test rollback scenarios**

#### 6.3 Documentation & Deployment

- [ ] **Create user documentation**
- [ ] **Create installation guides**
- [ ] **Document configuration options**
- [ ] **Create troubleshooting guide**
- [ ] **Prepare deployment scripts**

---

## 🛠️ **Technical Stack Analysis**

### **Current Architecture**

```
Frontend: React + TypeScript + Vite
Backend: Rust (Tauri framework)
Styling: SCSS + CSS Modules
Package Manager: pnpm
Build Tool: Tauri CLI
```

### **Key Files to Modify**

- `src-tauri/tauri.conf.json` - App configuration
- `package.json` - Node.js metadata
- `src-tauri/Cargo.toml` - Rust metadata
- `src/` - React components and styling
- `src-tauri/icons/` - All app icons and assets
- `scripts/` - Any API integration scripts

### **Potential Challenges & Solutions**

1. **API Compatibility**: May need to adapt OpenAI format to AGX Orin
2. **Authentication**: Remove OpenAI keys, add local server auth if needed
3. **Icon/Asset Quality**: May need to create custom Courtney AI assets
4. **Cross-platform Building**: Ensure all platforms build correctly
5. **Auto-updates**: Configure for internal distribution

---

## 🎯 **Success Metrics**

- [ ] App builds successfully on both platforms
- [ ] All chat functionality works with AGX Orin server
- [ ] UI is fully branded as Courtney AI
- [ ] Performance matches or exceeds original app
- [ ] Installation packages work on clean systems
- [ ] Auto-update mechanism functions correctly

---

## 📅 **Timeline Summary**

- **Days 1-2**: Environment & baseline testing
- **Days 3-4**: Branding and visual updates
- **Days 5-6**: API integration with AGX Orin
- **Days 7-8**: Interface customization
- **Days 9-10**: Testing and QA
- **Days 11-12**: Build and distribution

**Total Estimated Time**: 12 development days (2.5 weeks)

This roadmap can be refined as we progress and encounter specific challenges or discover better approaches for each phase.
