# Copilot Agent Instructions for Courtney AI Desktop App

## Project Overview

- This is a cross-platform desktop app (Linux, Windows, Mac) built with React + TypeScript + Vite (frontend) and Rust (Tauri) for the backend.
- The app is a fork of ChatGPT Desktop v1.1.0, rebranded as "Courtney AI" and connects to the AGX Orin server at `172.30.30.111:8000` instead of OpenAI's API.
- Current codebase retains all original ChatGPT branding and `https://chat.openai.com` endpoints - complete transformation needed.

## Architecture & Key Components

- **Frontend:** Located in `src/` (React 18, TypeScript, Vite 4, Ant Design 5, Monaco Editor)
- **Backend:** Located in `src-tauri/` (Rust 2021, Tauri 1.3, custom plugins)
- **Scripts:** Browser extension scripts in `scripts/` (inject into chat.openai.com)
- **Config:** User data stored in `~/.chatgpt/` directory
- **Assets:** Icons and branding in `src-tauri/icons/` and `public/`

## Developer Workflows

- **Install dependencies:** `pnpm install` (Node ^14.18||^16||^18), `cargo install tauri-cli` (Rust)
- **Build/Run (dev):** `pnpm tauri dev` (starts Vite dev server on :1420 + Tauri window)
- **Build (prod):** `pnpm tauri build` (creates platform-specific installers)
- **Frontend only:** `pnpm dev:fe` (Vite dev server only)
- **Format code:** `pnpm prettier` (formats JS/TS/MD), `pnpm fmt:rs` (Rust)

## Critical Branding & API Migration

- **Comprehensive rebrand needed:** All "ChatGPT" → "Courtney AI" in 40+ files including:
  - App metadata: `package.json` (name, keywords, repo), `Cargo.toml` (name, description), `tauri.conf.json` (productName)
  - UI text: Window titles, system tray, about dialogs, error messages
  - File paths: `~/.chatgpt/` → `~/.courtney-ai/`, log files, config paths
  - URLs: GitHub repos, update endpoints, documentation links
- **API endpoints:** Replace `https://chat.openai.com` (in `src-tauri/src/conf.rs` CHATGPT_URL) with AGX Orin server
- **Script injection:** Update `scripts/core.js` host detection from `chat.openai.com` to new domain
- **Remove OpenAI dependencies:** No API keys needed for local AGX Orin server

## Current Tech Stack & Dependencies

- **Frontend:** React 18.2, TypeScript 4.9, Vite 4.0, SCSS/Sass 1.56
- **UI Framework:** Ant Design 5.1, @ant-design/icons 4.8
- **Code Editor:** Monaco Editor 0.34, @monaco-editor/react 4.4
- **Routing:** React Router DOM 6.4
- **Markdown:** react-markdown 8.0, remark-gfm, rehype-raw
- **Utils:** lodash 4.17, dayjs 1.11, uuid 9.0, clsx 1.2
- **Backend:** Tauri 1.3, custom plugins for window-state, autostart, positioner

## Integration Points & Patterns

- **API calls:** Update all OpenAI endpoints to AGX Orin; handle request/response differences
- **Error handling:** Update for local server, add connection status and retry logic
- **Code highlighting:** Optimize for Qwen3-Coder in chat interface
- **File handling:** Improve code export/import features
- **Auto-update:** Configure endpoints and test rollback scenarios

## Key Files & Directories

- `src-tauri/tauri.conf.json` – Tauri app config (productName, identifier, version)
- `src-tauri/src/conf.rs` – Contains CHATGPT_URL and other hardcoded endpoints
- `package.json` – Node metadata (name, repository, homepage need updates)
- `src-tauri/Cargo.toml` – Rust metadata (name, description, repository)
- `src/components/SwitchOrigin/index.tsx` – Hardcoded chat.openai.com URL
- `src/utils.ts` – Contains GitHub URLs and .chatgpt paths
- `scripts/` – Browser extension scripts that inject into chat.openai.com
- `src-tauri/icons/` – All app icons need Courtney AI branding

## Example Patterns

- **Branding in configs:** Search "chatgpt" case-insensitive for metadata updates
- **File system paths:** All `~/.chatgpt/` references in Rust code (utils.rs, conf.rs)
- **URL hardcoding:** `https://chat.openai.com` appears in conf.rs and SwitchOrigin component
- **Script injection:** Scripts check `window.location.host === 'chat.openai.com'`
- **API integration:** Currently no direct OpenAI API calls - uses browser extension approach

---

**For major changes, update the roadmap in `COURTNEY_AI_DESKTOP_ROADMAP.md`. Always follow project-specific branding, API, and build conventions.**
