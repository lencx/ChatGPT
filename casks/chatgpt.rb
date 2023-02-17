cask "chatgpt" do
  version "0.11.0"
  arch = Hardware::CPU.arch.to_s
  sha256s = {
    "x86_64" => "5f8013bee34daa53be8612b751955f745e7af9ef85b3541eba304b45176b6d8a",
    "aarch64" => "a5d914277d16827c5e3c641abd80c7978f78b8ccf36bf08661e1bc06efc6224e"
  }

  url "https://github.com/lencx/ChatGPT/releases/download/v#{version}/ChatGPT_#{version}_macos_#{arch}.dmg"
  sha256 sha256s[arch]

  name "ChatGPT"
  desc "Desktop wrapper for OpenAI ChatGPT"
  homepage "https://github.com/lencx/ChatGPT#readme"

  app "ChatGPT.app"

  uninstall quit: "com.lencx.chatgpt"

  zap trash: [
    "~/.chatgpt",
    "~/Library/Caches/com.lencx.chatgpt",
    "~/Library/HTTPStorages/com.lencx.chatgpt.binarycookies",
    "~/Library/Preferences/com.lencx.chatgpt.plist",
    "~/Library/Saved Application State/com.lencx.chatgpt.savedState",
    "~/Library/WebKit/com.lencx.chatgpt",
  ]
end
