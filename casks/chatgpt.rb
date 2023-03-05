cask "chatgpt" do
  version "0.12.0"
  arch = Hardware::CPU.arch.to_s
  sha256s = {
    "x86_64" => "d7f32d11f86ad8ac073dd451452124324e1c9154c318f15b77b5cd254000a3c4",
    "aarch64" => "c4c10eeb4a2c9a885da13047340372f461d411711c20472fc673fbf958bf6378"
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
