// *** Core Script - DALL·E 2 Core ***

async function init() {
  const chatConf = await invoke('get_chat_conf') || {};
  if (!chatConf.popup_search) return;
  if (!window.FloatingUIDOM) return;

  const styleDom = document.createElement('style');
  styleDom.innerHTML = `
  #chagpt-selection-menu {
    display: none;
    width: max-content;
    position: absolute;
    top: 0;
    left: 0;
    background: #4a4a4a;
    color: white;
    font-weight: bold;
    padding: 3px 5px;
    border-radius: 2px;
    font-size: 10px;
    cursor: pointer;
  }
  `;
  document.head.append(styleDom);

  const selectionMenu = document.createElement('div');
  selectionMenu.id = 'chagpt-selection-menu';
  selectionMenu.innerHTML = 'DALL·E 2';
  document.body.appendChild(selectionMenu);
  const { computePosition, flip, offset, shift } = window.FloatingUIDOM;

  document.body.addEventListener('mousedown', async (e) => {
    selectionMenu.style.display = 'none';
    if (e.target.id === 'chagpt-selection-menu') {
      await invoke('dalle2_search_window', { query: encodeURIComponent(window.__DALLE2_CONTENT__) });
    } else {
      delete window.__DALLE2_CONTENT__;
    }
  });

  document.body.addEventListener("mouseup", async (e) => {
    selectionMenu.style.display = 'none';
    const selection = window.getSelection();
    window.__DALLE2_CONTENT__ = selection.toString().trim();

    if (!window.__DALLE2_CONTENT__) return;

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getClientRects()[0];

      const rootEl = document.createElement('div');
      rootEl.style.top = `${rect.top}px`;
      rootEl.style.position = 'fixed';
      rootEl.style.left = `${rect.left}px`;
      document.body.appendChild(rootEl);

      selectionMenu.style.display = 'block';
      computePosition(rootEl, selectionMenu, {
        placement: 'top',
        middleware: [
          flip(),
          offset(5),
          shift({ padding: 5 })
        ]
      }).then(({x, y}) => {
        Object.assign(selectionMenu.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    }
  });
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
