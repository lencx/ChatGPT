<p align="center">
  <img width="180" src="./public/logo.png" alt="ChatGPT">
  <h1 align="center">ChatGPT</h1>
</p>

> ChatGPT 桌面应用

[![English badge](https://img.shields.io/badge/%E8%8B%B1%E6%96%87-English-blue)](./README.md)
[![简体中文 badge](https://img.shields.io/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-Simplified%20Chinese-blue)](./README-ZH_CN.md)

[![ChatGPT downloads](https://img.shields.io/github/downloads/lencx/ChatGPT/total.svg?style=flat-square)](https://github.com/lencx/ChatGPT/releases)
[![chat](https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord)](https://discord.gg/aPhCRf4zZr)
[![lencx](https://img.shields.io/twitter/follow/lencx_.svg?style=social)](https://twitter.com/lencx_)

[Awesome ChatGPT](./AWESOME.md)

## 📦 下载

[📝 更新日志](./UPDATE_LOG.md)

<!-- download start -->

**最新版:**

- `Mac`: [ChatGPT_0.7.2_x64.dmg](https://github.com/lencx/ChatGPT/releases/download/v0.7.2/ChatGPT_0.7.2_x64.dmg)
- `Linux`: [chat-gpt_0.7.2_amd64.deb](https://github.com/lencx/ChatGPT/releases/download/v0.7.2/chat-gpt_0.7.2_amd64.deb)
- `Windows`: [ChatGPT_0.7.2_x64_en-US.msi](https://github.com/lencx/ChatGPT/releases/download/v0.7.2/ChatGPT_0.7.2_x64_en-US.msi)

[其他版本...](https://github.com/lencx/ChatGPT/releases)

<!-- download end -->

### brew 安装

Easily install with _[Homebrew](https://brew.sh) ([Cask](https://docs.brew.sh/Cask-Cookbook)):_

```sh
brew tap lencx/chatgpt https://github.com/lencx/ChatGPT.git
brew install --cask chatgpt --no-quarantine
```

Also, if you keep a _[Brewfile](https://github.com/Homebrew/homebrew-bundle#usage)_, you can add something like this:

```rb
repo = "lencx/chatgpt"
tap repo, "https://github.com/#{repo}.git"
cask "popcorn-time", args: { "no-quarantine": true }
```

## 📢 公告

这是一个令人兴奋的重大更新。像 `Telegram 机器人指令` 那样工作，帮助你快速填充自定模型，来让 ChatGPT 按照你想要的方式去工作。这个项目倾注了我大量业余时间，如果它对你有所帮助，宣传转发，或者 star 都是对我的巨大鼓励。我希望我可以持续更新下去，加入更多有趣的功能。

### 如何使用指令？

你可以从 [awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts) 来寻找有趣的功能来导入到应用。

![chat cmd](./assets/chat-cmd-1.png)
![chat cmd](./assets/chat-cmd-2.png)

数据导入完成后，可以重新启动应用来使配置生效（`Menu -> Preferences -> Restart ChatGPT`）。

在 ChatGPT 文本输入区域，键入 `/` 开头的字符，则会弹出指令提示，按下空格键，它会默认将命令关联的文本填充到输入区域（注意：如果包含多个指令提示，它只会选择第一个作为填充，你可以持续输入，直到第一个提示命令为你想要时，再按下空格键。或者使用鼠标来点击多条指令中的某一个）。填充完成后，你只需要按下回车键即可。斜杠命令下，使用 TAB 键修改 `{q}` 标签内容（仅支持单个修改 [#54](https://github.com/lencx/ChatGPT/issues/54)）。使用键盘 `⇧` 和 `⇩`（上下键）来选择斜杠指令。

![chatgpt](assets/chatgpt.gif)
![chatgpt-cmd](assets/chatgpt-cmd.gif)

## ✨ 功能概览

- 跨平台: `macOS` `Linux` `Windows`
- 导出 ChatGPT 聊天记录 (支持 PNG, PDF 和生成分享链接)
- 应用自动升级通知
- 丰富的快捷键
- 系统托盘悬浮窗
- 应用菜单功能强大
- 支持斜杠命令及其配置（可手动配置或从文件同步 [#55](https://github.com/lencx/ChatGPT/issues/55)）
<!-- - 进入应用的全局快捷键 (mac: `command+shift+o`, windows: `ctrl+shift+o`) -->

### 菜单项

- **Preferences (喜好)**
  - `Theme` - `Light`, `Dark` (仅支持 macOS 和 Windows)
  - `Stay On Top`: 窗口置顶
  - `Titlebar`: 是否显示 `Titlebar`，仅 macOS 支持
  - `Inject Script`: 用于修改网站的用户自定义脚本
  - `Hide Dock Icon` ([#35](https://github.com/lencx/ChatGPT/issues/35)): 隐藏 Dock 中的应用图标 (仅 macOS 支持)
    - 系统图盘右键单击打开菜单，然后在菜单项中点击 `Show Dock Icon` 可以重新将应用图标显示在 Dock（`SystemTrayMenu -> Show Dock Icon`）
  - `Control Center`: ChatGPT 应用的控制中心，它将为应用提供无限的可能
    - 设置 `Theme`，`Stay On Top`，`Titlebar` 等
    - `User Agent` ([#17](https://github.com/lencx/ChatGPT/issues/17)): 自定义 `user agent` 防止网站安全检测，默认值为空
    - `Switch Origin` ([#14](https://github.com/lencx/ChatGPT/issues/14)): 切换网站源地址，默认为 `https://chat.openai.com`。需要注意的是镜像网站的 UI 需要和原网站一致，否则可能会导致某些功能不工作
  - `Go to Config`: 打开 ChatGPT 配置目录 (`path: ~/.chatgpt/*`)
  - `Clear Config`: 清除 ChatGPT 配置数据 (`path: ~/.chatgpt/*`), 这是危险操作，请提前备份数据
  - `Restart ChatGPT`: 重启应用。如果注入脚本编辑完成，或者应用可卡死可以通过此菜单重新启动应用
  - `Awesome ChatGPT`: 一个很棒的 ChatGPT 推荐列表
- **Edit** - `Undo`, `Redo`, `Cut`, `Copy`, `SelectAll`, ...
- **View** - `Go Back`, `Go Forward`, `Scroll to Top of Screen`, `Scroll to Bottom of Screen`, `Refresh the Screen`, ...
- **Help**
  - `Update Log`: ChatGPT 应用更新日志
  - `Report Bug`: 报告 BUG 或反馈建议
  - `Toggle Developer Tools`: 网站调试工具，调试页面或脚本可能需要

## 应用配置

| 平台    | 路径                      |
| ------- | ------------------------- |
| Linux   | `/home/lencx/.chatgpt`    |
| macOS   | `/Users/lencx/.chatgpt`   |
| Windows | `C:\Users\lencx\.chatgpt` |

- `[.chatgpt]` - 应用配置根路径
  - `chat.conf.json` - 应用喜好配置
  - `chat.model.json` - ChatGPT 输入提示，通过斜杠命令来快速完成输入，主要包含三部分:
    - `user_custom` - 需要手动录入 (**Control Conter -> Language Model -> User Custom**)
    - `sync_prompts` - 从 [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts) 同步数据 (**Control Conter -> Language Model -> Sync Prompts**)
    - `sync_custom` - 同步自定义的 json 或 csv 文件数据，支持本地和远程 (**Control Conter -> Language Model -> Sync Custom**)
  - `chat.model.cmd.json` - 过滤（是否启用）和排序处理后的斜杠命令数据
  - `[cache_model]` - 缓存同步或录入的数据
    - `chatgpt_prompts.json` - 缓存 `sync_prompts` 数据
    - `user_custom.json` - 缓存 `user_custom` 数据
    - `ae6cf32a6f8541b499d6bfe549dbfca3.json` - 随机生成的文件名，缓存 `sync_custom` 数据
    - `4f695d3cfbf8491e9b1f3fab6d85715c.json` - 随机生成的文件名，缓存 `sync_custom` 数据
    - `bd1b96f15a1644f7bd647cc53073ff8f.json` - 随机生成的文件名，缓存 `sync_custom` 数据

### Sync Custom

目前同步自定文件仅支持 json 和 csv，且需要满足以下格式，否则会导致应用异常：

> JSON 格式

```json
[
  {
    "cmd": "a",
    "act": "aa",
    "prompt": "aaa aaa aaa"
  },
  {
    "cmd": "b",
    "act": "bb",
    "prompt": "bbb bbb bbb"
  }
]
```

> CSV 格式

```csv
"cmd","act","prompt"
"a","aa","aaa aaa aaa"
"b","bb","bbb bbb bbb"
```

## 👀 预览

<img width="320" src="./assets/install.png" alt="install"> <img width="320" src="./assets/control-center.png" alt="control center">
<img width="320" src="./assets/export.png" alt="export"> <img width="320" src="./assets/tray.png" alt="tray">
<img width="320" src="./assets/tray-login.png" alt="tray login"> <img width="320" src="./assets/auto-update.png" alt="auto update">

---

<a href="https://www.buymeacoffee.com/lencx" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## ❓ 常见问题

### 不能打开 ChatGPT

如果升级应用后无法打开，请尝试清除配置，它位于此目录 `~/.chatgpt/*`。

### 主窗口已经登录，但是系统托盘窗口显示未登录

可通过菜单项里的 `Restart ChatGPT` 重启应用来修复这个问题（`Menu -> Preferences -> Restart ChatGPT`）。

### 它是否安全？

它是安全的，仅仅只是对 [OpenAI ChatGPT](https://chat.openai.com) 网站的包装，注入了一些额外功能（均在本地，未发起网络请求），如果存疑，可以检查源代码。

### Developer cannot be verified?

Mac 上无法安装，提示开发者未验证，具体可以查看下面给出的解决方案（它是开源的，很安全）。

- [Open a Mac app from an unidentified developer](https://support.apple.com/en-sg/guide/mac-help/mh40616/mac)

### 我想自己构建它？

#### 预安装

- [Rust](https://www.rust-lang.org/)
- [VS Code](https://code.visualstudio.com/)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  - [tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)

#### 开始

```bash
# step1: 克隆仓库
git clone https://github.com/lencx/ChatGPT.git

# step2: 进入目录
cd ChatGPT

# step3: 安装依赖
yarn

# step4: 开发启动
yarn dev

# step5: 构建应用
# 构建后的安装包位置: src-tauri/target/release/bundle
yarn build
```

## ❤️ 感谢

- 分享按钮的代码从 [@liady](https://github.com/liady) 的插件获得，并做了一些本地化修改
- 感谢 [Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts) 项目为这个应用自定义指令功能所带来的启发

---

[![Star History Chart](https://api.star-history.com/svg?repos=lencx/chatgpt&type=Date)](https://star-history.com/#lencx/chatgpt&Date)

## 中国用户

国内用户如果遇到使用问题或者想交流 ChatGPT 技巧，可以关注公众号“浮之静”，发送 “chat” 进群参与讨论。公众号会更新[《Tauri 系列》](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzIzNjE2NTI3NQ==&action=getalbum&album_id=2593843659863752704)文章，技术思考等等，如果对 tauri 开发应用感兴趣可以关注公众号后回复 “tauri” 进技术开发群（想私聊的也可以关注公众号，来添加微信）。开源不易，如果这个项目对你有帮助可以分享给更多人，或者微信扫码打赏。

<img width="180" src="https://user-images.githubusercontent.com/16164244/207228300-ea5c4688-c916-4c55-a8c3-7f862888f351.png"> <img width="200" src="https://user-images.githubusercontent.com/16164244/207228025-117b5f77-c5d2-48c2-a070-774b7a1596f2.png">

## License

Apache License
