// *** Core Script - DALL·E 2 ***

async function init() {
  if (window.searchInterval) {
    clearInterval(window.searchInterval);
  }

  window.searchInterval = setInterval(() => {
    // const searchForm = document.querySelector('.image-prompt-form-wrapper form');
    // const searchBtn = document.querySelector('.image-prompt-form-wrapper form .image-prompt-btn');
    const searchInput = document.querySelector('.image-prompt-form-wrapper form>.text-input');
    if (searchInput) {
      document.addEventListener("click", (e) => {
        const origin = e.target.closest("a");
        if (origin && origin.href && origin.target !== '_self') {
          invoke('open_link', { url: origin.href });
        }
      });

      clearInterval(window.searchInterval);

      if (!window.__CHATGPT_QUERY__) return;
      const query = decodeURIComponent(window.__CHATGPT_QUERY__);
      searchInput.focus();
      searchInput.value = query;
      searchInput.setAttribute('value', query);
      // searchInput.dispatchEvent(new CustomEvent('change'));
      // searchForm.classList.add('focused');
      // searchBtn.classList.add('active-style');
      // searchBtn.removeAttribute('disabled');
      // searchBtn.classList.remove('btn-disabled', 'btn-disabled-style');
    }
  }, 200)
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
