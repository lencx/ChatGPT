cask "chatgpt" do
  version "1.0.0"
  arch = Hardware::CPU.arch.to_s
  sha256s = {
    "x86_64" => "474c6024ac1100512c242449da8d93b521334d0d03a9457c42446293a64eaff4",
    "aarch64" => "998d15813194957de140a530605252fdf3f68fafdba1353706fa00d070c7c23d"
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
