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
  h3 {
    margin-bottom: 20px;
  }
  textarea {
    all: unset;
    width: 300px;
    height: 60px;
    margin-bottom: 10px;
    padding: 10px;
    border: solid 2px #d8d8d8;
    background-color: #fff;
    border-radius: 5px !important;
    color: #4a4a4a;
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
  .item {
    display: flex;
    align-items: center;
  }
  label {
    width: 120px;
    margin-right: 10px;
  }
  </style>
  <h3>User Agent</h3>
  <div class="item">
    <label>Main Window (PC)</label>
    <textarea id="ua_pc" type="text" autocapitalize="off" autocomplete="off" spellcheck="false" autofocus placeholder="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ..."></textarea>
  </div>
  <div class="item">
    <label>Tray Window (Phone)</label>
    <textarea id="ua_phone" type="text" autocapitalize="off" autocomplete="off" spellcheck="false" autofocus placeholder="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS ..."></textarea>
  </div>
  <div class="btns">
    <button id="cancel">Cancel</button>
    <button id="confirm">Confirm</button>
  </div>`;

  const srcipt = document.createElement('script');
  srcipt.innerHTML = `const ua_pc = document.getElementById('ua_pc');
  const ua_phone = document.getElementById('ua_phone');
  const cancelBtn = document.getElementById('cancel');
  const confirmBtn = document.getElementById('confirm');
  cancelBtn.addEventListener('click', () => {
    window.invoke('form_cancel', { label: 'ua', title: 'User Agent', msg: 'Are you sure you want to cancel editing?' });
  })
  confirmBtn.addEventListener('click', () => {
    window.invoke('form_confirm', { data: { ua_pc: ua_pc.value, ua_phone: ua_phone.value } });
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