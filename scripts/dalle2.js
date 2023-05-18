/**
 * @name dalle2.js
 * @version 0.1.0
 * @url https://github.com/lencx/ChatGPT/tree/main/scripts/dalle2.js
 */

function init() {
  document.addEventListener('click', (e) => {
    const origin = e.target.closest('a');
    if (!origin || !origin.target) return;
    if (origin && origin.href && origin.target !== '_self') {
      if (/\/(login|signup)$/.test(window.location.href)) {
        origin.target = '_self';
      } else {
        invoke('open_link', { url: origin.href });
      }
    }
  });

  if (window.searchInterval) {
    clearInterval(window.searchInterval);
  }

  window.searchInterval = setInterval(() => {
    const searchInput = document.querySelector('.image-prompt-form-wrapper form>.text-input');
    if (searchInput) {
      clearInterval(window.searchInterval);

      if (!window.__CHATGPT_QUERY__) return;
      const query = decodeURIComponent(window.__CHATGPT_QUERY__);
      searchInput.focus();
      searchInput.value = query;
    }
  }, 200);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
