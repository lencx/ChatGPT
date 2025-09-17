# Courtney AI Desktop Application - Development Roadmap

## 🎯 **Project Overview**

Transform the forked ChatGPT desktop app (v1.1.0) into a branded Courtney AI desktop application that connects to our AGX Orin server at `172.30.30.111:8000` instead of OpenAI's API.

## 📋 **Development Phases**

### **Phase 1: Environment Setup & Baseline Testing** (Days 1-2)

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

### **Phase 2: Branding & Identity Update** (Days 3-4)

#### 2.1 Application Metadata

- [x] **Update `package.json`** (name, description, author)
- [x] **Update `Cargo.toml`** (package name, description)
- [x] **Update `tauri.conf.json`** (app name, identifier, version)
- [x] **Update window titles** and system tray text
- [x] **Update about dialog** information

#### 2.2 Visual Branding

- [ ] **Replace app icons** (`src-tauri/icons/`)
  - Desktop icon (`.ico`, `.icns`, `.png`)
  - System tray icons (`tray-icon.png`, `tray-icon-light.png`)
  - Windows Store assets (various Square logos)
- [ ] **Update splash screen** and loading graphics
- [ ] **Replace logo in UI** (`public/logo.png`)
- [ ] **Update favicon** and web assets

#### 2.3 Text & Copy Updates

- [ ] **Update all "ChatGPT" references** to "Courtney AI"
- [ ] **Update menu items** and context menus
- [ ] **Update error messages** and notifications
- [ ] **Update help text** and tooltips
- [ ] **Update README** and documentation

---

### 2.4 Credential entry & secure storage (UI + Backend)

Add a user-facing API key entry and a secure storage flow so the desktop app can authenticate to the Courtney AI security proxy without exposing secrets in the renderer or bundles.

Tasks:

- [ ] Add Settings UI component to enter the QWEN API key (masked input, show/hide, Save/Clear/Test buttons).
- [ ] Implement a Tauri backend command set to store/retrieve/clear the API key using the OS keychain (recommend `keyring` crate) and to test the key against the proxy health endpoint.
- [ ] Provide a `proxy_request` Tauri command that attaches the stored Authorization header and forwards requests to `http://127.0.0.1:8001` (recommended centralization of outgoing proxy calls).
- [ ] Add a development fallback that reads `QWEN_API_KEY` from environment only in dev mode with a clear warning in the UI.

Acceptance criteria:

- User can save/clear the API key in Settings and the key persists across app restarts via OS keychain.
- The app never stores the raw key in renderer-local storage or build artifacts.
- Test action validates the key by calling the proxy health endpoint and reports success/failure in UI.
- Core network calls to the security proxy are routed through the backend so raw keys are never exposed to the renderer.

Files/areas to modify:

- `src/components/Settings/ApiKeyForm.tsx` (new UI component)
- `src/view/settings/*` (include the new form)
- `src-tauri/Cargo.toml` (add `keyring` or preferred keychain crate)
- `src-tauri/src/main.rs` and a helper `src-tauri/src/keychain.rs` (implement Tauri commands)
- Refactor places in `src/` that call the proxy directly to use `invoke('proxy_request', ...)` or a thin backend wrapper.

### **Phase 3: API Integration** (Days 5-6)

#### 3.1 Identify API Integration Points

- [ ] **Audit codebase** for OpenAI API calls
- [ ] **Locate configuration files** for API endpoints
- [ ] **Document request/response formats** currently used
- [ ] **Test AGX Orin API compatibility** with OpenAI format
- [ ] **Identify authentication differences**

#### 3.2 Replace API Endpoints

- [ ] **Update base URL** from OpenAI to `172.30.30.111:8000`
- [ ] **Remove OpenAI API key** requirements
- [ ] **Update request headers** and authentication
- [ ] **Test basic chat functionality** with AGX Orin
- [ ] **Handle API response differences**

#### 3.3 API Error Handling

- [ ] **Update error messages** for local server
- [ ] **Add connection status** monitoring
- [ ] **Implement retry logic** for server downtime
- [ ] **Add server health checks**
- [ ] **Handle network connectivity** issues

---

### **Phase 4: Interface Customization** (Days 7-8)

#### 4.1 UI/UX Improvements

- [ ] **Review Open WebUI styling** for inspiration
- [ ] **Update color scheme** to match Courtney AI branding
- [ ] **Customize chat interface** layout
- [ ] **Add code highlighting** optimized for Qwen3-Coder
- [ ] **Improve file handling** for code projects

#### 4.2 Feature Enhancements

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
