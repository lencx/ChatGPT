// *** Core Script ***
document.addEventListener('DOMContentLoaded', async () => {
  const topStyleDom = document.createElement("style");
  topStyleDom.innerHTML = `#chatgpt-app-window-top{position:fixed;top:0;z-index:999999999;width:100%;height:24px;background:transparent;cursor:grab;cursor:-webkit-grab;user-select:none;-webkit-user-select:none;}#chatgpt-app-window-top:active {cursor:grabbing;cursor:-webkit-grabbing;}`;
  document.head.appendChild(topStyleDom);
  const topDom = document.createElement("div");
  topDom.id = "chatgpt-app-window-top";
  document.body.appendChild(topDom);

  topDom.addEventListener("mousedown", () => __TAURI_INVOKE__("drag_window"));
  topDom.addEventListener("touchstart", () => __TAURI_INVOKE__("drag_window"));
  topDom.addEventListener("dblclick", () => __TAURI_INVOKE__("fullscreen"));

  document.addEventListener("click", (e) => {
    const origin = e.target.closest("a");
    if (origin && origin.href && origin.target !== '_self') {
      origin.target = "_self";
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
})
