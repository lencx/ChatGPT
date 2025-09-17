#!/bin/bash

# Courtney AI Desktop Development Environment Setup Script
echo "🚀 Setting up Courtney AI Desktop development environment..."

# Get the current working directory
WORKSPACE_DIR=$(pwd)
echo "📁 Working directory: $WORKSPACE_DIR"

# Change to the workspace directory if needed
cd "$WORKSPACE_DIR" || {
    echo "❌ Failed to change to workspace directory"
    exit 1
}

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install essential development packages
echo "🔧 Installing essential development packages..."
sudo apt-get install -y \
    build-essential \
    curl \
    wget \
    git \
    pkg-config \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libwebkit2gtk-4.0-dev \
    libxdo-dev \
    libxrandr-dev \
    libasound2-dev \
    libxss1 \
    libnss3-dev \
    libgconf-2-4

# Install latest Rust (if not already installed by base image)
echo "🦀 Ensuring latest Rust is installed..."
if ! command -v rustc &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
fi

# Update Rust to latest stable
rustup default stable
rustup update

# Install pnpm globally
echo "📦 Installing pnpm package manager..."
npm install -g pnpm@latest

# Install Tauri CLI
echo "🏗️ Installing Tauri CLI..."
cargo install tauri-cli --version "^1.0"

# Install project dependencies
echo "📋 Installing project dependencies..."
echo "📁 Current directory: $(pwd)"
echo "📄 Files in directory: $(ls -la)"

if [ -f "package.json" ]; then
    echo "✅ Found package.json, installing dependencies..."
    pnpm install
else
    echo "⚠️ No package.json found in current directory: $(pwd)"
    echo "📂 Directory contents:"
    ls -la
fi

# Verify installations
echo "✅ Verifying installations..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "pnpm version: $(pnpm --version)"
echo "Rust version: $(rustc --version)"
echo "Cargo version: $(cargo --version)"

if command -v cargo-tauri &> /dev/null; then
    echo "Tauri CLI version: $(cargo tauri --version)"
else
    echo "⚠️ Tauri CLI not found - may need manual installation"
fi

# Set up Git configuration if needed
echo "🔧 Setting up Git configuration..."
if [ -z "$(git config --global user.name)" ]; then
    echo "Please set up your Git configuration:"
    echo "git config --global user.name 'Your Name'"
    echo "git config --global user.email 'your.email@example.com'"
fi

# Create useful aliases
echo "🎯 Setting up development aliases..."
echo "alias dev='XDG_RUNTIME_DIR=/tmp/tauri-runtime TMPDIR=/tmp/tauri-runtime pnpm tauri dev'" >> ~/.bashrc
echo "alias build='pnpm tauri build'" >> ~/.bashrc
echo "alias install-deps='pnpm install'" >> ~/.bashrc

# Create and configure Tauri runtime directory
echo "📁 Setting up Tauri runtime directory..."
sudo mkdir -p /tmp/tauri-runtime
sudo chmod 777 /tmp/tauri-runtime
sudo chown vscode:vscode /tmp/tauri-runtime

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Available commands:"
echo "  pnpm tauri dev     - Start development server"
echo "  pnpm tauri build   - Build production app"
echo "  pnpm install       - Install/update dependencies"
echo "  cargo tauri --help - Tauri CLI help"
echo ""
echo "💡 To start developing:"
echo "  1. pnpm install (if not already done)"
echo "  2. pnpm tauri dev"
echo ""