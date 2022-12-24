// *** Core Script - CMD ***

function init() {
  const styleDom = document.createElement('style');
  styleDom.innerHTML = `form {
    position: relative;
  }
  .chat-model-cmd-list {
    position: absolute;
    bottom: 60px;
    max-height: 100px;
    overflow: auto;
    z-index: 9999;
  }
  .chat-model-cmd-list>div {
    border: solid 2px #d8d8d8;
    border-radius: 5px;
    background-color: #fff;
  }
  .chat-model-cmd-list .cmd-item {
    font-size: 12px;
    border-bottom: solid 1px #888;
    padding: 2px 4px;
    display: flex;
    user-select: none;
    cursor: pointer;
  }
  .chat-model-cmd-list .cmd-item:last-child {
    border-bottom: none;
  }
  .chat-model-cmd-list .cmd-item b {
    display: inline-block;
    width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 4px;
    margin-right: 10px;
    color: #2a2a2a;
  }
  .chat-model-cmd-list .cmd-item i {
    width: 100%;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
    color: #888;
  }`;
  document.head.append(styleDom);

  if (window.formInterval) {
    clearInterval(window.formInterval);
  }
  window.formInterval = setInterval(() => {
    const form = document.querySelector("form");
    if (!form) return;
    clearInterval(window.formInterval);
    cmdTip();
  }, 200);
}

async function cmdTip() {
  const chatModelJson = await invoke('get_chat_model_cmd') || {};
  const data = chatModelJson.data;
  if (data.length <= 0) return;

  const modelDom = document.createElement('div');
  modelDom.classList.add('chat-model-cmd-list');

  // fix: tray window
  if (__TAURI_METADATA__.__currentWindow.label === 'tray') {
    modelDom.style.bottom = '40px';
  }

  document.querySelector('form').appendChild(modelDom);
  const itemDom = (v) => `<div class="cmd-item" title="${v.prompt}" data-prompt="${encodeURIComponent(v.prompt)}"><b title="${v.cmd}">/${v.cmd}</b><i>${v.act}</i></div>`;
  const searchInput = document.querySelector('form textarea');

  // Enter a command starting with `/` and press a space to automatically fill `chatgpt prompt`.
  // If more than one command appears in the search results, the first one will be used by default.
  searchInput.addEventListener('keydown', (event) => {
    if (!window.__CHAT_MODEL_CMD_PROMPT__) {
      return;
    }

    // feat: https://github.com/lencx/ChatGPT/issues/54
    if (event.keyCode === 9 && !window.__CHAT_MODEL_STATUS__) {
      const strGroup = window.__CHAT_MODEL_CMD_PROMPT__.match(/\{([^{}]*)\}/) || [];

      if (strGroup[1]) {
        searchInput.value = `/${window.__CHAT_MODEL_CMD__}` + ` {${strGroup[1]}}` + ' |-> ';
        window.__CHAT_MODEL_STATUS__ = 1;
      }
      event.preventDefault();
    }

    if (window.__CHAT_MODEL_STATUS__ === 1 && event.keyCode === 9) {
      const data = searchInput.value.split('|->');
      if (data[1]?.trim()) {
        window.__CHAT_MODEL_CMD_PROMPT__ = window.__CHAT_MODEL_CMD_PROMPT__?.replace(/\{([^{}]*)\}/, `{${data[1]?.trim()}}`);
        window.__CHAT_MODEL_STATUS__ = 2;
      }
      event.preventDefault();
    }

    // input text
    if (window.__CHAT_MODEL_STATUS__ === 2 && event.keyCode === 9) {
      searchInput.value = window.__CHAT_MODEL_CMD_PROMPT__;
      modelDom.innerHTML = '';
      delete window.__CHAT_MODEL_STATUS__;
      event.preventDefault();
    }

    // type in a space to complete the fill
    if (event.keyCode === 32) {
      searchInput.value = window.__CHAT_MODEL_CMD_PROMPT__;
      modelDom.innerHTML = '';
      delete window.__CHAT_MODEL_CMD_PROMPT__;
    }

    // send
    if (event.keyCode === 13 && window.__CHAT_MODEL_CMD_PROMPT__) {
      const data = searchInput.value.split('|->');
      if (data[1]?.trim()) {
        window.__CHAT_MODEL_CMD_PROMPT__ = window.__CHAT_MODEL_CMD_PROMPT__?.replace(/\{([^{}]*)\}/, `{${data[1]?.trim()}}`);
      }

      searchInput.value = window.__CHAT_MODEL_CMD_PROMPT__;
      modelDom.innerHTML = '';
      delete window.__CHAT_MODEL_CMD_PROMPT__;
      delete window.__CHAT_MODEL_CMD__;
      delete window.__CHAT_MODEL_STATUS__;
      event.preventDefault();
    }
  });

  searchInput.addEventListener('input', (event) => {
    if (searchInput.value === '') {
      delete window.__CHAT_MODEL_CMD_PROMPT__;
      delete window.__CHAT_MODEL_CMD__;
      delete window.__CHAT_MODEL_STATUS__;
    }

    if (window.__CHAT_MODEL_STATUS__) return;

    const query = searchInput.value;
    if (!query || !/^\//.test(query)) {
      modelDom.innerHTML = '';
      return;
    }

    // all cmd result
    if (query === '/') {
      modelDom.innerHTML = `<div>${data.map(itemDom).join('')}</div>`;
      window.__CHAT_MODEL_CMD_PROMPT__ = data[0]?.prompt.trim();
      window.__CHAT_MODEL_CMD__ = data[0]?.cmd.trim();
      return;
    }

    const result = data.filter(i => new RegExp(query.substring(1)).test(i.cmd));
    if (result.length > 0) {
      modelDom.innerHTML = `<div>${result.map(itemDom).join('')}</div>`;
      window.__CHAT_MODEL_CMD_PROMPT__ = result[0]?.prompt.trim();
      window.__CHAT_MODEL_CMD__ = result[0]?.cmd.trim();
    } else {
      modelDom.innerHTML = '';
      delete window.__CHAT_MODEL_CMD_PROMPT__;
      delete window.__CHAT_MODEL_CMD__;
      delete window.__CHAT_MODEL_STATUS__;
    }
  }, {
    capture: false,
    passive: true,
    once: false
  });

  if (window.searchInterval) {
    clearInterval(window.searchInterval);
  }
  window.searchInterval = setInterval(() => {
    // The `chatgpt prompt` fill can be done by clicking on the event.
    const searchDom = document.querySelector("form .chat-model-cmd-list>div");
    if (!searchDom) return;
    searchDom.addEventListener('click', (event) => {
      // .cmd-item
      const item = event.target.closest("div");
      if (item) {
        const val = decodeURIComponent(item.getAttribute('data-prompt'));
        searchInput.value = val;
        document.querySelector('form textarea').focus();
        window.__CHAT_MODEL_CMD_PROMPT__ = val;
        modelDom.innerHTML = '';
      }
    }, {
      capture: false,
      passive: true,
      once: false
    });
  }, 200);
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}