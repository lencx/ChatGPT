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
    border: solid 2px rgba(80,80,80,.3);
    border-radius: 5px;
    background-color: #fff;
  }

  html.dark .chat-model-cmd-list>div {
    background-color: #4a4a4a;
  }
  html.dark .chat-model-cmd-list .cmd-item {
    border-color: #666;
  }
  html.dark .chat-model-cmd-list .cmd-item b {
    color: #e8e8e8;
  }
  html.dark .chat-model-cmd-list .cmd-item i {
    color: #999;
  }
  html.dark .chat-model-cmd-list .cmd-item.selected {
    background: rgba(59,130,246,.5);
  }

  .chat-model-cmd-list .cmd-item {
    font-size: 12px;
    border-bottom: solid 1px rgba(80,80,80,.2);
    padding: 2px 4px;
    display: flex;
    user-select: none;
    cursor: pointer;
  }
  .chat-model-cmd-list .cmd-item:last-child {
    border-bottom: none;
  }
  .chat-model-cmd-list .cmd-item.selected {
    background: rgba(59,130,246,.3);
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
  }
  .chatappico {
    width: 20px;
    height: 20px;
  }
  .chatappico.pdf, .chatappico.md {
    width: 22px;
    height: 22px;
  }
  @media screen and (max-width: 767px) {
    #download-png-button, #download-pdf-button, #download-html-button {
      display: none;
    }
  }
  `;
  document.head.append(styleDom);

  if (window.formInterval) {
    clearInterval(window.formInterval);
  }
  window.formInterval = setInterval(() => {
    const form = document.querySelector("form textarea");
    if (!form) return;
    clearInterval(window.formInterval);
    cmdTip();
    new MutationObserver(function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.target.getAttribute('id') === '__next') {
          initDom();
          cmdTip();
        }
        if (mutation.target.getAttribute('class') === 'chat-model-cmd-list') {
          // The `chatgpt prompt` fill can be done by clicking on the event.
          const searchDom = document.querySelector("form .chat-model-cmd-list>div");
          const searchInput = document.querySelector('form textarea');
          if (!searchDom) return;
          searchDom.addEventListener('click', (event) => {
            const item = event.target.closest("div");
            if (item) {
              const val = decodeURIComponent(item.getAttribute('data-prompt'));
              searchInput.value = val;
              document.querySelector('form textarea').focus();
              initDom();
            }
          });
        }
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }, 300);
}

async function cmdTip() {
  initDom();
  const chatModelJson = await invoke('get_chat_model_cmd') || {};
  const data = chatModelJson.data;
  if (data.length <= 0) return;

  let modelDom = document.querySelector('.chat-model-cmd-list');
  if (!modelDom) {
    const dom = document.createElement('div');
    dom.classList.add('chat-model-cmd-list');
    document.querySelector('form').appendChild(dom);
    modelDom = document.querySelector('.chat-model-cmd-list');

    // fix: tray window
    if (__TAURI_METADATA__.__currentWindow.label === 'tray') {
      modelDom.style.bottom = '54px';
    }

    const itemDom = (v) => `<div class="cmd-item" title="${v.prompt}" data-cmd="${v.cmd}" data-prompt="${encodeURIComponent(v.prompt)}"><b title="${v.cmd}">/${v.cmd}</b><i>${v.act}</i></div>`;
    const renderList = (v) => {
      initDom();
      modelDom.innerHTML = `<div>${v.map(itemDom).join('')}</div>`;
      window.__CHAT_MODEL_CMD_PROMPT__ = v[0]?.prompt.trim();
      window.__CHAT_MODEL_CMD__ = v[0]?.cmd.trim();
      window.__cmd_list = modelDom.querySelectorAll('.cmd-item');
      window.__cmd_index = 0;
      window.__cmd_list[window.__cmd_index].classList.add('selected');
    };
    const setPrompt = (v = '') => {
      if (v.trim()) {
        window.__CHAT_MODEL_CMD_PROMPT__ = window.__CHAT_MODEL_CMD_PROMPT__?.replace(/\{([^{}]*)\}/, `{${v.trim()}}`);
      }
    }
    const searchInput = document.querySelector('form textarea');

    // Enter a command starting with `/` and press a space to automatically fill `chatgpt prompt`.
    // If more than one command appears in the search results, the first one will be used by default.
    function cmdKeydown(event) {
      if (!window.__CHAT_MODEL_CMD_PROMPT__) {
        return;
      }

      // ------------------ Keyboard scrolling (ArrowUp | ArrowDown) --------------------------
      if (event.keyCode === 38 &&  window.__cmd_index > 0) { // ArrowUp
        window.__cmd_list[window.__cmd_index].classList.remove('selected');
        window.__cmd_index = window.__cmd_index - 1;
        window.__cmd_list[window.__cmd_index].classList.add('selected');
        window.__CHAT_MODEL_CMD_PROMPT__ = decodeURIComponent(window.__cmd_list[window.__cmd_index].getAttribute('data-prompt'));
        searchInput.value = `/${window.__cmd_list[window.__cmd_index].getAttribute('data-cmd')}`;
        event.preventDefault();
      }

      if (event.keyCode === 40 && window.__cmd_index < window.__cmd_list.length - 1) { // ArrowDown
        window.__cmd_list[window.__cmd_index].classList.remove('selected');
        window.__cmd_index = window.__cmd_index + 1;
        window.__cmd_list[window.__cmd_index].classList.add('selected');
        window.__CHAT_MODEL_CMD_PROMPT__ = decodeURIComponent(window.__cmd_list[window.__cmd_index].getAttribute('data-prompt'));
        searchInput.value = `/${window.__cmd_list[window.__cmd_index].getAttribute('data-cmd')}`;
        event.preventDefault();
      }

      const containerHeight = modelDom.offsetHeight;
      const itemHeight = window.__cmd_list[0].offsetHeight + 1;

      const itemTop = window.__cmd_list[window.__cmd_index].offsetTop;
      const itemBottom = itemTop + itemHeight;
      if (itemTop < modelDom.scrollTop || itemBottom > modelDom.scrollTop + containerHeight) {
        modelDom.scrollTop = itemTop;
      }

      // ------------------ TAB key replaces `{q}` tag content -------------------------------
      // feat: https://github.com/lencx/ChatGPT/issues/54
      if (event.keyCode === 9 && !window.__CHAT_MODEL_STATUS__) {
        const strGroup = window.__CHAT_MODEL_CMD_PROMPT__.match(/\{([^{}]*)\}/) || [];

        if (strGroup[1]) {
          searchInput.value = `/${window.__CHAT_MODEL_CMD__}` + ` {${strGroup[1]}}` + ' |-> ';
          window.__CHAT_MODEL_STATUS__ = 1;
        } else {
          searchInput.value = window.__CHAT_MODEL_CMD_PROMPT__;
          initDom();
        }
        event.preventDefault();
      }

      if (window.__CHAT_MODEL_STATUS__ === 1 && event.keyCode === 9) { // TAB
        const data = searchInput.value.split('|->');
        if (data[1]?.trim()) {
          setPrompt(data[1]);
          window.__CHAT_MODEL_STATUS__ = 2;
        }
        event.preventDefault();
      }

      // input text
      if (window.__CHAT_MODEL_STATUS__ === 2 && event.keyCode === 9) { // TAB
        searchInput.value = window.__CHAT_MODEL_CMD_PROMPT__;
        modelDom.innerHTML = '';
        delete window.__CHAT_MODEL_STATUS__;
        event.preventDefault();
      }

      // ------------------ type in a space to complete the fill ------------------------------------
      if (event.keyCode === 32) {
        searchInput.value = window.__CHAT_MODEL_CMD_PROMPT__;
        modelDom.innerHTML = '';
        delete window.__CHAT_MODEL_CMD_PROMPT__;
      }

      // ------------------ send --------------------------------------------------------------------
      if (event.keyCode === 13 && window.__CHAT_MODEL_CMD_PROMPT__) { // Enter
        const data = searchInput.value.split('|->');
        setPrompt(data[1]);

        searchInput.value = window.__CHAT_MODEL_CMD_PROMPT__;

        initDom();
        event.preventDefault();
      }
    }
    searchInput.removeEventListener('keydown', cmdKeydown, { capture: true });
    searchInput.addEventListener('keydown', cmdKeydown, { capture: true });

    function cmdInput() {
      if (searchInput.value === '') {
        initDom();
      }

      if (window.__CHAT_MODEL_STATUS__) return;

      const query = searchInput.value;
      if (!query || !/^\//.test(query)) {
        initDom();
        return;
      }

      // all cmd result
      if (query === '/') {
        renderList(data);
        return;
      }

      const result = data.filter(i => new RegExp(query.substring(1)).test(i.cmd));
      if (result.length > 0) {
        renderList(result);
      } else {
        initDom();
      }
    }
    searchInput.removeEventListener('input', cmdInput);
    searchInput.addEventListener('input', cmdInput);
  }
}

function initDom() {
  const modelDom = document.querySelector('.chat-model-cmd-list');
  if (modelDom) {
    modelDom.innerHTML = '';
  }
  delete window.__CHAT_MODEL_CMD_PROMPT__;
  delete window.__CHAT_MODEL_CMD__;
  delete window.__CHAT_MODEL_STATUS__;
  delete window.__cmd_list;
  delete window.__cmd_index;
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}