cask "chatgpt" do
  version "1.1.0"
  arch = Hardware::CPU.arch.to_s
  sha256s = {
    "x86_64" => "6747e61a507402fa4b36db443c37a79299a4e1d4ba9904298a0b00c3e6a243b6",
    "aarch64" => "f870ba135ad990715474cbb038b5b38acb8d08640803e2c79c878e210f4800f6"
  }
  if arch == "arm64" then arch = "aarch64" end
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
