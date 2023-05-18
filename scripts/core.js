/**
 * @name core.js
 * @version 0.1.0
 * @url https://github.com/lencx/ChatGPT/tree/main/scripts/core.js
 */

const uid = () => window.crypto.getRandomValues(new Uint32Array(1))[0];
function transformCallback(callback = () => {}, once = false) {
  const identifier = uid();
  const prop = `_${identifier}`;
  Object.defineProperty(window, prop, {
    value: (result) => {
      if (once) {
        Reflect.deleteProperty(window, prop);
      }
      return callback(result);
    },
    writable: false,
    configurable: true,
  });
  return identifier;
}
async function invoke(cmd, args) {
  return new Promise((resolve, reject) => {
    if (!window.__TAURI_POST_MESSAGE__) reject('__TAURI_POST_MESSAGE__ does not exist!');
    const callback = transformCallback((e) => {
      resolve(e);
      Reflect.deleteProperty(window, `_${error}`);
    }, true);
    const error = transformCallback((e) => {
      reject(e);
      Reflect.deleteProperty(window, `_${callback}`);
    }, true);
    window.__TAURI_POST_MESSAGE__({
      cmd,
      callback,
      error,
      ...args,
    });
  });
}

async function message(message) {
  invoke('messageDialog', {
    __tauriModule: 'Dialog',
    message: {
      cmd: 'messageDialog',
      message: message.toString(),
      title: null,
      type: null,
      buttonLabel: null,
    },
  });
}

window.uid = uid;
window.invoke = invoke;
window.message = message;
window.transformCallback = transformCallback;

async function init() {
  if (__TAURI_METADATA__.__currentWindow.label === 'tray') {
    document.getElementsByTagName('html')[0].style['font-size'] = '70%';
  }

  async function platform() {
    return invoke('platform', {
      __tauriModule: 'Os',
      message: { cmd: 'platform' },
    });
  }

  if (__TAURI_METADATA__.__currentWindow.label !== 'tray') {
    const _platform = await platform();
    const chatConf = (await invoke('get_app_conf')) || {};
    if (/darwin/.test(_platform) && !chatConf.titlebar) {
      const topStyleDom = document.createElement('style');
      topStyleDom.innerHTML = `#chatgpt-app-window-top{position:fixed;top:0;z-index:999999999;width:100%;height:24px;background:transparent;cursor:grab;cursor:-webkit-grab;user-select:none;-webkit-user-select:none;}#chatgpt-app-window-top:active {cursor:grabbing;cursor:-webkit-grabbing;}`;
      document.head.appendChild(topStyleDom);
      const topDom = document.createElement('div');
      topDom.id = 'chatgpt-app-window-top';
      document.body.appendChild(topDom);

      if (window.location.host === 'chat.openai.com') {
        const nav = document.body.querySelector('nav');
        if (nav) {
          const currentPaddingTop = parseInt(
            window
              .getComputedStyle(document.querySelector('nav'), null)
              .getPropertyValue('padding-top')
              .replace('px', ''),
            10,
          );
          const navStyleDom = document.createElement('style');
          navStyleDom.innerHTML = `nav{padding-top:${
            currentPaddingTop + topDom.clientHeight
          }px !important}`;
          document.head.appendChild(navStyleDom);
        }
      }

      topDom.addEventListener('mousedown', () => invoke('drag_window'));
      topDom.addEventListener('touchstart', () => invoke('drag_window'));
      topDom.addEventListener('dblclick', () => invoke('fullscreen'));
    }
  }

  document.addEventListener('click', (e) => {
    const origin = e.target.closest('a');
    if (!origin || !origin.target) return;
    if (origin && origin.href && origin.target !== '_self') {
      invoke('open_link', { url: origin.href });
    }
  });

  // Fix Chinese input method "Enter" on Safari
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.keyCode == 229) e.stopPropagation();
    },
    true,
  );

  if (window.location.host === 'chat.openai.com') {
    window.__sync_prompts = async function () {
      await invoke('sync_prompts', { time: Date.now() });
    };
  }

  coreZoom();
}

function coreZoom() {
  const styleDom = document.createElement('style');
  styleDom.innerHTML = `
  #ZoomTopTip {
    display: none;
    position: fixed;
    top: 0;
    right: 20px;
    background: #2a2a2a;
    color: #fafafa;
    padding: 20px 15px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    z-index: 999999;
    box-shadow: 0 2px 2px 2px #d8d8d8;
  }
  .ZoomTopTipAni {
    transition: opacity 200ms, display 200ms;
    display: none;
    opacity: 0;
  }
  `;
  document.head.append(styleDom);
  const zoomTipDom = document.createElement('div');
  zoomTipDom.id = 'ZoomTopTip';
  document.body.appendChild(zoomTipDom);
  function zoom(callback) {
    if (window.zoomSetTimeout) clearTimeout(window.zoomSetTimeout);
    const htmlZoom = window.localStorage.getItem('htmlZoom') || '100%';
    const html = document.getElementsByTagName('html')[0];
    const zoom = callback(htmlZoom);
    html.style.zoom = zoom;
    window.localStorage.setItem('htmlZoom', zoom);
    zoomTipDom.innerHTML = zoom;
    zoomTipDom.style.display = 'block';
    zoomTipDom.classList.remove('ZoomTopTipAni');
    window.zoomSetTimeout = setTimeout(() => {
      zoomTipDom.classList.add('ZoomTopTipAni');
    }, 2500);
  }
  function zoomDefault() {
    const htmlZoom = window.localStorage.getItem('htmlZoom');
    if (htmlZoom) {
      document.getElementsByTagName('html')[0].style.zoom = htmlZoom;
    }
  }
  function zoomIn() {
    zoom((htmlZoom) => `${Math.min(parseInt(htmlZoom) + 10, 200)}%`);
  }
  function zoomOut() {
    zoom((htmlZoom) => `${Math.max(parseInt(htmlZoom) - 10, 30)}%`);
  }
  function zoom0() {
    zoom(() => `100%`);
  }
  zoomDefault();
  window.__zoomIn = zoomIn;
  window.__zoomOut = zoomOut;
  window.__zoom0 = zoom0;
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
