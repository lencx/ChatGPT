# UPDATE LOG

## v0.11.0

Fix:

- User-defined close button behavior (exit or minimize) (`Control Center -> Settings -> Main Window -> Close Exit`). (https://github.com/lencx/ChatGPT/issues/359)
- Markdown content layout (https://github.com/lencx/ChatGPT/issues/378)

Feat:

- Set the main window and tray window size (https://github.com/lencx/ChatGPT/issues/405)
- Save window positions and sizes and restore them when the app is reopened (`Control Center -> Settings -> General -> Save Window State`)
- macOS support for aarch64 installer (https://github.com/lencx/ChatGPT/issues/380)

## v0.10.3

> Note: As of now the ChatGPT desktop app has added a lot of exciting features and it continues to improve, as the app grows it has gone far beyond what ChatGPT was intended for. I want to make it the ultimate goal that any website can be easily wrapped to the desktop through user customization. So it needed an international user guide to guide users to use it more professionally. And https://app.nofwl.com is the manual for the app, which will be built into the app (`Menu -> Window -> ChatGPT User's Guide`) so you can access it anytime. It's just starting at the moment, so stay tuned.

Fix:

- Incompatible configuration data causes program crashes (https://github.com/lencx/ChatGPT/issues/295)

Feat:

- Silent copy text
- Markdown export support distinguishes between users and bots (https://github.com/lencx/ChatGPT/issues/233)

## v0.10.2

Fix:

- PNG and PDF buttons do not work (https://github.com/lencx/ChatGPT/issues/274)
- Change the window size and the Send button is obscured by the Export button (https://github.com/lencx/ChatGPT/issues/286)
- Change forward and backward shortcuts (https://github.com/lencx/ChatGPT/issues/254)
  - MacOS: `Cmd [`, `Cmd ]`
  - Windows and Linux: `Ctrl [`, `Ctrl ]`

Feat:

- Copy a single record to the clipboard (https://github.com/lencx/ChatGPT/issues/191)

## v0.10.1

Fix:

- Program exception when `Awesome` data is empty (https://github.com/lencx/ChatGPT/issues/248)

Feat:

- New shortcut key to change zoom level (30% - 200%), `+` or `-` 10% each time, `0` will be reset to 100% (https://github.com/lencx/ChatGPT/issues/202)
  - Windows: `Ctrl +`, `Ctrl -`, `Ctrl 0`
  - MacOS: `Cmd +`, `Cmd -`, `Cmd 0`

## v0.10.0

Fix:

- After exporting a file in Windows, open an empty file explorer (https://github.com/lencx/ChatGPT/issues/242)

Feat:

- Markdown files support editing and live preview
- Add `Awesome` menu to the `Control Center` (similar to bookmarks, but it's just a start, more possibilities in the future), custom URL support for the home and tray windows (if you're tired of ChatGPT as your home screen).

## v0.9.2

Fix: Slash command does not work

## v0.9.1

Fix: Slash command does not work

## v0.9.0

Fix:

- Export button does not work

Feat:

- Add an export markdown button
- `Control Center` adds `Notes` and `Download` menus for managing exported chat files (Markdown, PNG, PDF). `Notes` supports markdown previews.

## v0.8.1

Fix:

- Export button keeps blinking
- Export button in the old chat does not work
- Disable export sharing links because it is a security risk

## v0.8.0

Feat:

- Theme enhancement (Light, Dark, System)
- Automatic updates support `silent` settings
- Pop-up search: select the ChatGPT content with the mouse, the `DALL·E 2` button appears, and click to jump (note: because the search content filled by the script cannot trigger the event directly, you need to enter a space in the input box to make the button clickable).

Fix:

- Close the main window and hide it in the tray (windows systems)

## v0.7.4

Fix:

- Trying to resolve linux errors: `error while loading shared libraries`
- Customize global shortcuts (`Menu -> Preferences -> Control Center -> General -> Global Shortcut`)

## v0.7.3

Chore:

- Optimize slash command style
- Optimize tray menu icon and button icons
- Global shortcuts to the chatgpt app (mac: `Command + Shift + O`, windows: `Ctrl + Shift + O`)

## v0.7.2

Fix: Some windows systems cannot start the application

## v0.7.1

Fix:

- Some windows systems cannot start the application
- Windows and linux add about menu (show version information)
- The tray icon is indistinguishable from the background in dark mode on window and linux

## v0.7.0

Fix:

- Mac m1 copy/paste does not work on some system versions
- Optimize the save chat log button to a small icon, the tray window no longer provides a save chat log button (the buttons causes the input area to become larger and the content area to become smaller)

Feat:

- Use the keyboard `⇧` (arrow up) and `⇩` (arrow down) keys to select the slash command
<!-- - global shortcuts to the chatgpt app (mac: command+shift+o, windows: ctrl+shift+o) -->

## v0.6.10

Fix: Sync failure on windows

## v0.6.4

Fix: Path not allowed on the configured scope

Feat:

- Optimize the generated pdf file size
- Menu added `Sync Prompts`
- `Control Center` added `Sync Custom`
- The slash command is triggered by the enter key
- Under the slash command, use the tab key to modify the contents of the `{q}` tag (only single changes are supported (https://github.com/lencx/ChatGPT/issues/54)

## v0.6.0

Fix:

- Windows show Chinese when upgrading

## v0.5.1

Some optimization

## v0.5.0

Feat: `Control Center` added `chatgpt-prompts` synchronization

## v0.4.2

Add chatgpt log (path: `~/.chatgpt/chatgpt.log`)

## v0.4.1

Fix:

- Tray window style optimization

## v0.4.0

Feat:

- Customize the ChatGPT prompts command (https://github.com/lencx/ChatGPT#-announcement)
- Menu enhancement: hide application icons from the Dock (support macOS only)

## v0.3.0

Fix: Can't open ChatGPT

Feat: Menu enhancement

- The control center of ChatGPT application
- Open the configuration file directory

## v0.2.2

Feat:

- Menu: go to config

## v0.2.1

Feat: Menu optimization

## v0.2.0

Feat: Menu enhancement

- Customize user-agent to prevent security detection interception
- Clear all chatgpt configuration files

## v0.1.8

Feat:

- Menu enhancement: theme, titlebar
- Modify website address

## v0.1.7

Feat: Tray window

## v0.1.6

Feat:

- Stay on top
- Export ChatGPT history

## v0.1.5

Fix: Mac can't use shortcut keys

## v0.1.4

Feat:

- Beautify icons
- Add system tray menu

## v0.1.3

Fix: Only mac supports `TitleBarStyle`

## v0.1.2

Initialization

## v0.1.1

Initialization

## v0.1.0

Initialization
