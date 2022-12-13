// *** Core Script - IPC ***

const uid = () => window.crypto.getRandomValues(new Uint32Array(1))[0];
function transformCallback(callback = () => {}, once = false) {
  const identifier = uid();
  const prop = `_${identifier}`;
  Object.defineProperty(window, prop, {
    value: (result) => {
      if (once) {
        Reflect.deleteProperty(window, prop);
      }
      return callback(result)
    },
    writable: false,
    configurable: true,
  })
  return identifier;
}
async function invoke(cmd, args) {
  return new Promise((resolve, reject) => {
    if (!window.__TAURI_POST_MESSAGE__) reject('__TAURI_POST_MESSAGE__ does not exist!');
    const callback = transformCallback((e) => {
      resolve(e);
      Reflect.deleteProperty(window, `_${error}`);
    }, true)
    const error = transformCallback((e) => {
      reject(e);
      Reflect.deleteProperty(window, `_${callback}`);
    }, true)
    window.__TAURI_POST_MESSAGE__({
      cmd,
      callback,
      error,
      ...args
    });
  });
}

window.uid = uid;
window.invoke = invoke;
window.transformCallback = transformCallback;

async function init() {
  if (__TAURI_METADATA__.__currentWindow.label === 'mini') {
    document.getElementsByTagName('html')[0].style['font-size'] = '70%';
  }

  if (__TAURI_METADATA__.__currentWindow.label !== 'core') return;

  async function platform() {
    return invoke('platform', {
      __tauriModule: 'Os',
      message: { cmd: 'platform' }
    });
  }

  const _platform = await platform();
  const chatConf = await invoke('get_chat_conf') || {};
  if (/darwin/.test(_platform) && !chatConf.titlebar) {
    const topStyleDom = document.createElement("style");
    topStyleDom.innerHTML = `#chatgpt-app-window-top{position:fixed;top:0;z-index:999999999;width:100%;height:24px;background:transparent;cursor:grab;cursor:-webkit-grab;user-select:none;-webkit-user-select:none;}#chatgpt-app-window-top:active {cursor:grabbing;cursor:-webkit-grabbing;}`;
    document.head.appendChild(topStyleDom);
    const topDom = document.createElement("div");
    topDom.id = "chatgpt-app-window-top";
    document.body.appendChild(topDom);

    topDom.addEventListener("mousedown", () => invoke("drag_window"));
    topDom.addEventListener("touchstart", () => invoke("drag_window"));
    topDom.addEventListener("dblclick", () => invoke("fullscreen"));
  }

  document.addEventListener("click", (e) => {
    const origin = e.target.closest("a");
    if (origin && origin.href && origin.target !== '_self') {
      invoke('open_link', { url: origin.href });
    }
  });

  document.addEventListener('wheel', function(event) {
    const deltaX = event.wheelDeltaX;
    if (Math.abs(deltaX) >= 50) {
      if (deltaX > 0) {
        window.history.go(-1);
      } else {
        window.history.go(1);
      }
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