<p align="center">
  <img width="180" src="./public/logo.png" alt="ChatGPT">
  <h1 align="center">ChatGPT</h1>
  <p align="center">ChatGPT Desktop Application (Mac, Windows and Linux)</p>
</p>

![visitor](https://visitor-badge.glitch.me/badge?page_id=lencx.chatgpt)
[![ChatGPT downloads](https://img.shields.io/github/downloads/lencx/ChatGPT/total.svg?style=flat-square)](https://github.com/lencx/ChatGPT/releases)
[![chat](https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord)](https://discord.gg/aPhCRf4zZr)
[![lencx](https://img.shields.io/badge/follow-lencx__-blue?style=flat&logo=Twitter)](https://twitter.com/lencx_)

# Readme translations:
<kbd>[<img title="English" alt="English" src="https://cdn.staticaly.com/gh/hjnilsson/country-flags/master/svg/gb.svg" width="22">](./README.md)</kbd>
<kbd>[<img title="Russian" alt="Russian" src="https://cdn.staticaly.com/gh/hjnilsson/country-flags/master/svg/ru.svg" width="22">](docs/README-RU.md)</kbd>
<kbd>[<img title="Simplified Chinese" alt="Simplified Chinese" src="https://cdn.staticaly.com/gh/hjnilsson/country-flags/master/svg/cn.svg" width="22">](docs/README-ZH_CN.md)</kbd>

<!-- [![lencx](https://img.shields.io/twitter/follow/lencx_.svg?style=social)](https://twitter.com/lencx_) -->

<!-- [![中文版 badge](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-Traditional%20Chinese-blue)](./README-ZH.md) -->

<a href="https://www.buymeacoffee.com/lencx" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 145px !important;" ></a>

**🛑 СРОЧНОЕ СООБЩЕНИЕ: обнаружено, что хакер использует проект `lencx/ChatGPT` для установки троянской программы после форка проекта и пересборки установщика. Если у вас есть друзья, использующие это приложение, напомните им не скачивать с неизвестных ссылок. Теперь проект удалит другие способы установки и будет предоставлять только эту ссылку для загрузки https://github.com/lencx/ChatGPT/releases**

---

**Это неофициальный проект, предназначенный только для личного обучения и исследовательских целей. За то время, пока настольное приложение ChatGPT находилось в открытом доступе, оно получило много внимания, и я хотел бы поблагодарить всех за поддержку. Однако, по мере развития событий, возникли две проблемы, которые серьезно влияют на дальнейший план развития проекта:**.

- **Некоторые люди использовали его для репака и продажи с целью получения прибыли**
- **Название и иконка ChatGPT могут быть вовлечены в вопросы нарушения авторских прав.**

**Новый репозиторий: https://github.com/lencx/nofwl**

---

## 📦 Установка

- [📝 Update Log](./UPDATE_LOG.md)
- [🕒 History versions...](https://github.com/lencx/ChatGPT/releases)

<!-- tr-download-start -->

### Windows

- [ChatGPT_0.12.0_windows_x86_64.msi](https://github.com/lencx/ChatGPT/releases/download/v0.12.0/ChatGPT_0.12.0_windows_x86_64.msi): Прямая загрузка установщика
- Используйте [winget](https://winstall.app/apps/lencx.ChatGPT):

  ```bash
  # install the latest version
  winget install --id=lencx.ChatGPT -e

  # install the specified version
  winget install --id=lencx.ChatGPT -e --version 0.10.0
  ```

**Примечание: Если путь установки и имя приложения совпадают, это приведет к конфликту ([#142](https://github.com/lencx/ChatGPT/issues/142#issuecomment-0.12.0))**

### Mac

- [ChatGPT_0.12.0_macos_aarch64.dmg](https://github.com/lencx/ChatGPT/releases/download/v0.12.0/ChatGPT_0.12.0_macos_aarch64.dmg): Прямая загрузка установщика
- [ChatGPT_0.12.0_macos_x86_64.dmg](https://github.com/lencx/ChatGPT/releases/download/v0.12.0/ChatGPT_0.12.0_macos_x86_64.dmg): Прямая загрузка установщика
- Homebrew \
  Или вы можете установить _[Homebrew](https://brew.sh) ([Cask](https://docs.brew.sh/Cask-Cookbook)):_
  ```sh
  brew tap lencx/chatgpt https://github.com/lencx/ChatGPT.git
  brew install --cask chatgpt --no-quarantine
  ```
Также, если вы сохраните _[Brewfile](https://github.com/Homebrew/homebrew-bundle#usage)_, вы можете добавить что-то вроде этого:
```rb
  repo = "lencx/chatgpt"
  tap repo, "https://github.com/#{repo}.git"
  cask "chatgpt", args: { "no-quarantine": true }
  ```

**Если вы столкнулись с сообщением об ошибке `"ChatGPT" поврежден и не может быть открыт. Вам следует переместить его в корзину` при установке программного обеспечения на macOS, это может быть связано с ограничениями настроек безопасности в macOS. Чтобы решить эту проблему, попробуйте выполнить следующую команду в Терминале:**

```bash
sudo xattr -r -d com.apple.quarantine /YOUR_PATH/ChatGPT.app
```

### Linux

- [ChatGPT_0.12.0_linux_x86_64.deb](https://github.com/lencx/ChatGPT/releases/download/v0.12.0/ChatGPT_0.12.0_linux_x86_64.deb): Скачать `.deb` установщик, преимущество - маленький размер, недостаток - плохая совместимость
- [ChatGPT_0.12.0_linux_x86_64.AppImage.tar.gz](https://github.com/lencx/ChatGPT/releases/download/v0.12.0/ChatGPT_0.12.0_linux_x86_64.AppImage.tar.gz): Работает надежно, вы можете попробовать его, если `.deb` не запускается

<!-- tr-download-end -->

## ChatGPT Prompts!

Вы можете взглянуть на **[awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)**, чтобы найти интересные функции для импорта в приложение. Вы также можете использовать `Sync Prompts`, чтобы синхронизировать все в один клик, а если вы не хотите, чтобы определенные подсказки появлялись в ваших слэш-командах, вы можете отключить их.

![chatgpt cmd](./assets/chatgpt-cmd.png)

## ✨ Особенности

- Мультиплатформа: `macOS` `Linux` `Windows`
- преобразование текста в речь
- Экспорт истории ChatGPT (PNG, PDF и Markdown)
- Главное окно и системный трей поддерживают пользовательские URL-адреса для превращения любого веб-сайта в настольное приложение
- Автоматическое уведомление об обновлении приложения
- Общие клавиши быстрого доступа
- Наведенное окно в системном трее
- Мощные пункты меню
- Поддержка слэш-команд и их конфигурация (можно настроить вручную или синхронизировать из файла [#55](https://github.com/lencx/ChatGPT/issues/55))
- Настройка глобальных ярлыков ([#108](https://github.com/lencx/ChatGPT/issues/108))
- Всплывающий поиск ([#122](https://github.com/lencx/ChatGPT/issues/122) выделенное мышкой содержимое, не более 400 символов): Приложение построено с использованием Tauri, и из-за его ограничений безопасности некоторые кнопки действий не будут работать, поэтому мы рекомендуем обратиться к вашему браузеру.

## ❤️ Спонсоры

### **ChatGPT-Powered Email Finding & Outreach at Scale**

[FinalScout](https://finalscout.com/?utm_source=github&utm_medium=lencx&utm_campaign=chatgpt): Извлекайте действительные адреса электронной почты из LinkedIn и составляйте индивидуальные электронные письма на основе профиля LinkedIn с помощью ChatGPT, гарантирующего до 98% доставляемости писем. Масштабируйте свои информационные усилия и общайтесь с потенциальными клиентами и заказчиками как никогда раньше. [Начните автоматизировать процесс поиска и составления писем](https://finalscout.com/?utm_source=github&utm_medium=lencx&utm_campaign=chatgpt)

## Благодарность

- Основная реализация кода кнопки поделиться была скопирована из расширения [@liady](https://github.com/liady) с некоторыми изменениями.
- Спасибо репозиторию [Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts) за вдохновение для создания пользовательской командной функции для этого приложения.

---

[![Star History Chart](https://api.star-history.com/svg?repos=lencx/chatgpt&type=Timeline)](https://star-history.com/#lencx/chatgpt&Timeline)
## Лицензия

[AGPL-3.0 License](./LICENSE)
