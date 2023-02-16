cask "chatgpt" do
  version "0.10.3"
  sha256 "f44838a80844999191a303684fd7ae1811dd2fae6709aebe8bff23c70f9b8a10"

  url "https://github.com/lencx/ChatGPT/releases/download/v#{version}/ChatGPT_#{version}_macos_x86_64.dmg"
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
