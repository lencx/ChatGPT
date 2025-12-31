# Copilot Instructions for ChatGPT Desktop App

## Project Overview
- **Architecture:** Cross-platform desktop app using [Tauri](https://tauri.app/) v2 (Rust backend, React/TypeScript frontend). Embeds ChatGPT web interface in a webview with custom titlebar and input bar overlays.
- **Major Components:**
  - `src/App.tsx`: Routes to views based on Tauri webview label (titlebar, ask, settings).
  - `src/view/`: UI views - `Titlebar.tsx` (navigation/controls), `Ask.tsx` (chat input), `Settings.tsx` (placeholder).
  - `src-tauri/src/core/`: Rust modules for commands (`cmd.rs`), config (`conf.rs`), window setup (`setup.rs`).
  - Webviews: `main` (loads https://chatgpt.com), `titlebar` (custom React), `ask` (input React), `settings` (future).

## Key Workflows
- **Build/Run:**
  - Frontend: `pnpm dev` (Vite dev server on localhost:1420).
  - Full app: `pnpm tauri dev` (starts Tauri with embedded webviews).
  - Build: `pnpm build` (frontend dist), `pnpm tauri build` (desktop binaries).
- **Debugging:**
  - Backend: Tauri's dev tools (Rust logs, webview inspection).
  - Frontend: Browser dev tools on webviews; React DevTools not directly available.
  - Hotkeys: `Ctrl+Enter`/`Cmd+Enter` to send chat (see `Ask.tsx`).

## Communication Patterns
- **Frontend <-> Backend:** Tauri `invoke` calls Rust commands (e.g., `invoke('ask_send')` triggers JS eval in main webview).
- **Data Flow:** Ask view inputs text → `ask_sync` updates main webview textarea via injected `ChatAsk.sync()` → `ask_send` clicks submit button in main webview.
- **Config:** JSON-based (`AppConf` in Rust), amended and saved via commands; loaded on app start.

## Project-Specific Conventions
- **Path Aliases:** `~` for `src/` (e.g., `~view/Titlebar`).
- **View Routing:** Based on webview label; add new views in `viewMap` in `App.tsx`.
- **Styling:** Tailwind CSS; dark/light themes via config.
- **JS Injection:** Custom scripts in `src-tauri/scripts/` loaded as webview init scripts (e.g., `ask.js` for ChatAsk class).
- **Window Layout:** Dynamic resizing via `set_view_ask` command; different logic for macOS vs. others.

## Integration Points
- **Tauri Plugins:** OS, Shell, Dialog enabled; used for platform detection, file ops.
- **External APIs:** None direct; interacts with ChatGPT via DOM manipulation in embedded webview.
- **Config Storage:** JSON in app config dir (`~/.config/com.nofwl.chatgpt/config.json`).

## Examples
- **Add Backend Command:** Implement in `cmd.rs`, register in `main.rs`, invoke from frontend.
- **Modify Chat Input:** Update `Ask.tsx` and `ask.js` for sync/submit logic.
- **Add View:** Create in `src/view/`, add to `viewMap` in `App.tsx`, create webview in `setup.rs`.

## References
- `src-tauri/src/core/cmd.rs`: Command implementations and webview manipulations.
- `src/view/Ask.tsx`: Input handling and backend invokes.
- `src-tauri/scripts/ask.js`: JS injected for ChatGPT DOM interaction.
- `src-tauri/src/core/setup.rs`: Webview creation and layout.

---
_Keep instructions concise and focused on current codebase patterns. Update if architecture changes._
