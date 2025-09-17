# Dev Container for Courtney AI Desktop

This dev container provides a complete development environment for the Courtney AI Desktop application.

## Features

- **GUI Support**: X11 forwarding and desktop environment for testing the desktop app
- **Rust Development**: Latest Rust toolchain with Tauri CLI
- **Node.js Development**: Node.js 18+ with pnpm package manager
- **System Dependencies**: All required libraries for building cross-platform desktop apps

## Running the Application

To start the development server with proper environment variables:

```bash
XDG_RUNTIME_DIR=/tmp/.tauri TMPDIR=/tmp/.tauri pnpm tauri dev
```

This ensures proper system tray and temp directory handling in the container environment.

## Key Environment Variables

- `XDG_RUNTIME_DIR=/tmp/.tauri` - Runtime directory for GUI components
- `TMPDIR=/tmp/.tauri` - Temp directory with proper permissions
- `DISPLAY` - X11 display for GUI applications (handled automatically)

## Container Setup

The container includes:

- Desktop-lite feature for GUI support
- Rust with Tauri dependencies
- Node.js with pnpm
- System libraries for WebKit and system tray functionality
- Proper permissions for temp directories

## Troubleshooting

- **System Tray Issues**: The environment variables above resolve temp folder permission errors
- **ABI Mismatches**: Run `cargo clean` if you encounter proc-macro ABI errors
- **Build Cache**: Clean with `rm -rf target/` and `rm -rf node_modules/.pnpm` if needed
