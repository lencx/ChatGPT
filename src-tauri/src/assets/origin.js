function init() {
  document.body.innerHTML = `<style>
  body {
    height: 100vh;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: Söhne,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif,Helvetica Neue,Arial,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
  }
  input {
    all: unset;
    width: 280px;
    height: 30px;
    margin-bottom: 10px;
    padding: 0 5px;
    border: solid 2px #d8d8d8;
  }
  button {
    all: unset;
    height: 30px;
    font-size: 16px;
    padding: 0 10px;
    line-height: 30px;
    margin: 0 5px;
    color: #fff;
    border-radius: 5px;
    cursor: pointer;
  }
  #cancel {
    background-color: #999;
  }
  #confirm {
    background-color: #10a37f;
  }
  </style>
  <h3>Switch Origin</h3>
  <input id="input" type="text" />
  <div class="btns">
    <button id="cancel">Cancel</button>
    <button id="confirm">Confirm</button>
  </div>`;

  const srcipt = document.createElement('script');
  srcipt.innerHTML = `const input = document.getElementById('input');
  const cancelBtn = document.getElementById('cancel');
  const confirmBtn = document.getElementById('confirm');
  cancelBtn.addEventListener('click', () => {
    window.invoke('form_cancel', { label: 'origin', title: 'Switch Origin', msg: 'Sure you want to give up the switch?' });
  })
  confirmBtn.addEventListener('click', () => {
    if (/^https?:\\/\\//.test(input.value)) {
      window.invoke('form_confirm', { data: { origin: input.value } });
    } else {
      window.invoke('form_msg', { label: 'origin', title: 'Switch Origin', msg: 'Invalid URL!' });
    }
  })`;
  document.head.appendChild(srcipt);
}

// run init
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}