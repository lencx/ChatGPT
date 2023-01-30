<div align="center">
<p align="center">
  <img width="180" src="../../public/logo.png" alt="ChatGPT">
  <h1 align="center">ChatGPT Desktop App</h1>
  <p align="center">ChatGPT Desktop Application</p>
  <p align="center">(Install for Mac)</p>
  </div>

  ### Install ChatGPT Desktop on Mac

- [ChatGPT_0.10.1_x64.dmg](https://github.com/lencx/ChatGPT/releases/download/v0.10.1/ChatGPT_0.10.1_x64.dmg): Direct download installer
- [ChatGPT.app.tar.gz](https://github.com/lencx/ChatGPT/releases/download/v0.10.1/ChatGPT.app.tar.gz): Download the `.app` installer
- Homebrew \
  Or you can install with _[Homebrew](https://brew.sh) ([Cask](https://docs.brew.sh/Cask-Cookbook)):_
  ```sh
  brew tap lencx/chatgpt https://github.com/lencx/ChatGPT.git
  brew install --cask chatgpt --no-quarantine
  ```
  Also, if you keep a _[Brewfile](https://github.com/Homebrew/homebrew-bundle#usage)_, you can add something like this:
  ```rb
  repo = "lencx/chatgpt"
  tap repo, "https://github.com/#{repo}.git"
  cask "chatgpt", args: { "no-quarantine": true }
  ```

<div align="center">
<img width="50" src="../../assets/apple-mac.png" alt="ChatGPT">
<p align="center">(Install for Windows (version 10,11))</p>
</div>

---
- [📝 Update Log](https://github.com/lencx/ChatGPT/blob/main/docs/system/UPDATE_LOG.md)
- [🕒 History versions...](https://github.com/lencx/ChatGPT/releases)