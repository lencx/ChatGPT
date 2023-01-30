<div align="center">
<p align="center">
<img width="180" src="../../public/logo.png" alt="ChatGPT">
<h1 align="center">ChatGPT Desktop App Prompts</h1>
</div>

## ChatGPT Prompts!

This is a major and exciting update. It works like a `Telegram bot command` and helps you quickly populate custom models to make chatgpt work the way you want it to. This project has taken a lot of my spare time, so if it helps you, please help spread the word or star it would be a great encouragement to me. I hope I can keep updating it and adding more interesting features.

### How does it work?

You can look at **[awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)** to find interesting features to import into the app. You can also use `Sync Prompts` to sync all in one click, and if you don't want certain prompts to appear in your slash commands, you can disable them.

![chatgpt cmd](./assets/chatgpt-cmd.png)
![chatgpt sync prompts](./assets/chatgpt-sync-prompts.png)

<!-- After the data import is done, you can restart the app to make the configuration take effect (`Menu -> Preferences -> Restart ChatGPT`). -->

- In the chatgpt text input area, type a character starting with `/` to bring up the command prompt, press the spacebar, and it will fill the input area with the text associated with the command by default (note: if it contains multiple command prompts, it will only select the first one as the fill, you can keep typing until the first prompted command is the one you want, then press the spacebar.
- Or use the mouse to click on one of the multiple commands). When the fill is complete, you simply press the Enter key.
- Under the slash command, use the tab key to modify the contents of the `{q}` tag (only single changes are supported [#54](https://github.com/lencx/ChatGPT/issues/54)). Use the keyboard `⇧` (arrow up) and `⇩` (arrow down) keys to select the slash command.

![chatgpt](assets/chatgpt.gif)
![chatgpt-cmd](assets/chatgpt-cmd.gif)

## ✨ Features

- Multi-platform: `macOS` `Linux` `Windows`
- Export ChatGPT history (PNG, PDF and Markdown)
- The main window and system tray support custom URLs to wrap any website into a desktop application
- Automatic application upgrade notification
- Common shortcut keys
- System tray hover window
- Powerful menu items
- Support for slash commands and their configuration (can be configured manually or synchronized from a file [#55](https://github.com/lencx/ChatGPT/issues/55))
- Customize global shortcuts ([#108](https://github.com/lencx/ChatGPT/issues/108))
- Pop-up Search ([#122](https://github.com/lencx/ChatGPT/issues/122) mouse selected content, no more than 400 characters): The application is built using Tauri, and due to its security restrictions, some of the action buttons will not work, so we recommend going to your browser.

## #️⃣ MenuItem

- **Preferences**
  - `Theme` - `Light`, `Dark`, `System` (Only macOS and Windows are supported).
  - `Stay On Top`: The window is stay on top of other windows.
  - `Titlebar`: Whether to display the titlebar, supported by macOS only.
  - `Hide Dock Icon` ([#35](https://github.com/lencx/ChatGPT/issues/35)): Hide application icons from the Dock(support macOS only).
    - Right-click on the SystemTray to open the menu, then click `Show Dock Icon` in the menu item to re-display the application icon in the Dock (`SystemTrayMenu -> Show Dock Icon`).
  - `Inject Script`: Using scripts to modify pages.
  - `Control Center`: The control center of ChatGPT application, it will give unlimited imagination to the application.
    - `Theme`, `Stay On Top`, `Titlebar`, ...
    - `User Agent` ([#17](https://github.com/lencx/ChatGPT/issues/17)): Custom `user agent`, which may be required in some scenarios. The default value is the empty string.
    - `Switch Origin` ([#14](https://github.com/lencx/ChatGPT/issues/14)): Switch the site source address, the default is `https://chat.openai.com`, please make sure the mirror site UI is the same as the original address. Otherwise, some functions may not be available.
  - `Go to Config`: Open the configuration file directory (`path: ~/.chatgpt/*`).
  - `Clear Config`: Clear the configuration file (`path: ~/.chatgpt/*`), dangerous operation, please backup the data in advance.
  - `Restart ChatGPT`: Restart the application, for example: the program is stuck or the injection script can take effect by restarting the application after editing.
  - `Awesome ChatGPT`: Recommended Related Resources.
- **Edit** - `Undo`, `Redo`, `Cut`, `Copy`, `SelectAll`, ...
- **View** - `Go Back`, `Go Forward`, `Scroll to Top of Screen`, `Scroll to Bottom of Screen`, `Refresh the Screen`, ...
- **Help**
  - `Update Log`: ChatGPT changelog.
  - `Report Bug`: Report a bug or give feedback.
  - `Toggle Developer Tools`: Developer debugging tools.