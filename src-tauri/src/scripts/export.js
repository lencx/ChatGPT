// *** Core Script - Export ***

async function init() {
  if (window.location.pathname === '/auth/login') return;
  const buttonOuterHTMLFallback = `<button class="btn flex justify-center gap-2 btn-neutral" id="download-png-button">Try Again</button>`;
  removeButtons();
  if (window.buttonsInterval) {
    clearInterval(window.buttonsInterval);
  }
  if (window.innerWidth < 767) return;

  const chatConf = await invoke('get_app_conf') || {};
  window.buttonsInterval = setInterval(() => {
    const actionsArea = document.querySelector("form>div>div");
    if (!actionsArea) {
      return;
    }
    if (shouldAddButtons(actionsArea)) {
      let TryAgainButton = actionsArea.querySelector("button");
      if (!TryAgainButton) {
        const parentNode = document.createElement("div");
        parentNode.innerHTML = buttonOuterHTMLFallback;
        TryAgainButton = parentNode.querySelector("button");
      }
      addActionsButtons(actionsArea, TryAgainButton, chatConf);
      copyBtns();
    } else if (shouldRemoveButtons()) {
      removeButtons();
    }
  }, 1000);
}

window.addEventListener('resize', init);

const Format = {
  PNG: "png",
  PDF: "pdf",
};

function shouldRemoveButtons() {
  const isOpenScreen = document.querySelector("h1.text-4xl");
  if(isOpenScreen){
    return true;
  }
  const inConversation = document.querySelector("form button>div");
  if(inConversation){
    return true;
  }
  return false;
}

function shouldAddButtons(actionsArea) {
  // first, check if there's a "Try Again" button and no other buttons
  const buttons = actionsArea.querySelectorAll("button");

  const hasTryAgainButton = Array.from(buttons).some((button) => {
    return !/download-/.test(button.id);
  });

  const stopBtn = buttons?.[0]?.innerText;

  if (/Stop generating/ig.test(stopBtn)) {
    return false;
  }

  if (buttons.length === 2 && (/Regenerate response/ig.test(stopBtn) || buttons[1].innerText === '')) {
    return true;
  }

  if (hasTryAgainButton && buttons.length === 1) {
    return true;
  }

  // otherwise, check if open screen is not visible
  const isOpenScreen = document.querySelector("h1.text-4xl");
  if (isOpenScreen) {
    return false;
  }

  // check if the conversation is finished and there are no share buttons
  const finishedConversation = document.querySelector("form button>svg");
  const hasShareButtons = actionsArea.querySelectorAll("button[share-ext]");
  if (finishedConversation && !hasShareButtons.length) {
    return true;
  }

  return false;
}

function removeButtons() {
  const downloadButton = document.getElementById("download-png-button");
  const downloadPdfButton = document.getElementById("download-pdf-button");
  const downloadMdButton = document.getElementById("download-markdown-button");
  if (downloadButton) {
    downloadButton.remove();
  }
  if (downloadPdfButton) {
    downloadPdfButton.remove();
  }
  if (downloadPdfButton) {
    downloadMdButton.remove();
  }
}

function addActionsButtons(actionsArea, TryAgainButton) {
  const downloadButton = TryAgainButton.cloneNode(true);
  // Export markdown
  const exportMd = TryAgainButton.cloneNode(true);
  exportMd.id = "download-markdown-button";
  downloadButton.setAttribute("share-ext", "true");
  exportMd.title = "Export Markdown";
  exportMd.innerHTML = setIcon('md');
  exportMd.onclick = () => {
    exportMarkdown();
  };
  actionsArea.appendChild(exportMd);

  // Generate PNG
  downloadButton.id = "download-png-button";
  downloadButton.setAttribute("share-ext", "true");
  downloadButton.title = "Generate PNG";
  downloadButton.innerHTML = setIcon('png');
  downloadButton.onclick = () => {
    downloadThread();
  };
  actionsArea.appendChild(downloadButton);

  // Generate PDF
  const downloadPdfButton = TryAgainButton.cloneNode(true);
  downloadPdfButton.id = "download-pdf-button";
  downloadButton.setAttribute("share-ext", "true");
  downloadPdfButton.title = "Download PDF";
  downloadPdfButton.innerHTML = setIcon('pdf');
  downloadPdfButton.onclick = () => {
    downloadThread({ as: Format.PDF });
  };
  actionsArea.appendChild(downloadPdfButton);
}

async function exportMarkdown() {
  const content = Array.from(document.querySelectorAll('main .items-center>div')).map(i => {
    let j = i.cloneNode(true);
    if (/dark\:bg-gray-800/.test(i.getAttribute('class'))) {
      j.innerHTML = `<blockquote>${i.innerHTML}</blockquote>`;
    }
    return j.innerHTML;
  }).join('<hr />');
  const data = ExportMD.turndown(content);
  const { id, filename } = getName();
  await invoke('save_file', { name: `notes/${id}.md`, content: data });
  await invoke('download_list', { pathname: 'chat.notes.json', filename, id, dir: 'notes' });
}

function downloadThread({ as = Format.PNG } = {}) {
  const elements = new Elements();
  elements.fixLocation();
  const pixelRatio = window.devicePixelRatio;
  const minRatio = as === Format.PDF ? 2 : 2.5;
  window.devicePixelRatio = Math.max(pixelRatio, minRatio);

  html2canvas(elements.thread, {
    letterRendering: true,
  }).then(async function (canvas) {
    elements.restoreLocation();
    window.devicePixelRatio = pixelRatio;
    const imgData = canvas.toDataURL("image/png");
    requestAnimationFrame(() => {
      if (as === Format.PDF) {
        return handlePdf(imgData, canvas, pixelRatio);
      } else {
        handleImg(imgData);
      }
    });
  });
}

async function handleImg(imgData) {
  const binaryData = atob(imgData.split("base64,")[1]);
  const data = [];
  for (let i = 0; i < binaryData.length; i++) {
    data.push(binaryData.charCodeAt(i));
  }
  const { pathname, id, filename } = getName();
  await invoke('download', { name: `download/img/${id}.png`, blob: data });
  await invoke('download_list', { pathname, filename, id, dir: 'download' });
}

async function handlePdf(imgData, canvas, pixelRatio) {
  const { jsPDF } = window.jspdf;
  const orientation = canvas.width > canvas.height ? "l" : "p";
  var pdf = new jsPDF(orientation, "pt", [
    canvas.width / pixelRatio,
    canvas.height / pixelRatio,
  ]);
  var pdfWidth = pdf.internal.pageSize.getWidth();
  var pdfHeight = pdf.internal.pageSize.getHeight();
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, '', 'FAST');
  const { pathname, id, filename } = getName();
  const data = pdf.__private__.getArrayBuffer(pdf.__private__.buildDocument());
  await invoke('download', { name: `download/pdf/${id}.pdf`, blob: Array.from(new Uint8Array(data)) });
  await invoke('download_list', { pathname, filename, id, dir: 'download' });
}

function getName() {
  const id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  const name = document.querySelector('nav .overflow-y-auto a.hover\\:bg-gray-800')?.innerText?.trim() || '';
  return { filename: name ? name : id, id, pathname: 'chat.download.json' };
}

class Elements {
  constructor() {
    this.init();
  }
  init() {
    // this.threadWrapper = document.querySelector(".cdfdFe");
    this.spacer = document.querySelector("[class*='h-48'].w-full.flex-shrink-0");
    this.thread = document.querySelector(
      "[class*='react-scroll-to-bottom']>[class*='react-scroll-to-bottom']>div"
    );

    // fix: old chat https://github.com/lencx/ChatGPT/issues/185
    if (!this.thread) {
      this.thread = document.querySelector("main .overflow-y-auto");
    }

    // h-full overflow-y-auto
    this.positionForm = document.querySelector("form").parentNode;
    // this.styledThread = document.querySelector("main");
    // this.threadContent = document.querySelector(".gAnhyd");
    this.scroller = Array.from(
      document.querySelectorAll('[class*="react-scroll-to"]')
    ).filter((el) => el.classList.contains("h-full"))[0];

    // fix: old chat
    if (!this.scroller) {
      this.scroller = document.querySelector('main .overflow-y-auto');
    }

    this.hiddens = Array.from(document.querySelectorAll(".overflow-hidden"));
    this.images = Array.from(document.querySelectorAll("img[srcset]"));
  }
  fixLocation() {
    this.hiddens.forEach((el) => {
      el.classList.remove("overflow-hidden");
    });
    this.spacer.style.display = "none";
    this.thread.style.maxWidth = "960px";
    this.thread.style.marginInline = "auto";
    this.positionForm.style.display = "none";
    this.scroller.classList.remove("h-full");
    this.scroller.style.minHeight = "100vh";
    this.images.forEach((img) => {
      const srcset = img.getAttribute("srcset");
      img.setAttribute("srcset_old", srcset);
      img.setAttribute("srcset", "");
    });
    //Fix to the text shifting down when generating the canvas
    document.body.style.lineHeight = "0.5";
  }
  restoreLocation() {
    this.hiddens.forEach((el) => {
      el.classList.add("overflow-hidden");
    });
    this.spacer.style.display = null;
    this.thread.style.maxWidth = null;
    this.thread.style.marginInline = null;
    this.positionForm.style.display = null;
    this.scroller.classList.add("h-full");
    this.scroller.style.minHeight = null;
    this.images.forEach((img) => {
      const srcset = img.getAttribute("srcset_old");
      img.setAttribute("srcset", srcset);
      img.setAttribute("srcset_old", "");
    });
    document.body.style.lineHeight = null;
  }
}

function setIcon(type) {
  return {
    // link: `<svg class="chatappico" viewBox="0 0 1024 1024"><path d="M1007.382 379.672L655.374 75.702C624.562 49.092 576 70.694 576 112.03v160.106C254.742 275.814 0 340.2 0 644.652c0 122.882 79.162 244.618 166.666 308.264 27.306 19.862 66.222-5.066 56.154-37.262C132.132 625.628 265.834 548.632 576 544.17V720c0 41.4 48.6 62.906 79.374 36.328l352.008-304c22.142-19.124 22.172-53.506 0-72.656z" p-id="8506" fill="currentColor"></path></svg>`,
    png: `<svg class="chatappico" viewBox="0 0 1070 1024"><path d="M981.783273 0H85.224727C38.353455 0 0 35.374545 0 83.083636v844.893091c0 47.616 38.353455 86.574545 85.178182 86.574546h903.633454c46.917818 0 81.733818-38.958545 81.733819-86.574546V83.083636C1070.592 35.374545 1028.701091 0 981.783273 0zM335.825455 135.912727c74.193455 0 134.330182 60.974545 134.330181 136.285091 0 75.170909-60.136727 136.192-134.330181 136.192-74.286545 0-134.516364-61.021091-134.516364-136.192 0-75.264 60.229818-136.285091 134.516364-136.285091z m-161.512728 745.937455a41.890909 41.890909 0 0 1-27.648-10.379637 43.752727 43.752727 0 0 1-4.654545-61.067636l198.097454-255.162182a42.123636 42.123636 0 0 1 57.716364-6.702545l116.549818 128.139636 286.906182-352.814545c14.615273-18.711273 90.251636-106.775273 135.866182-6.935273 0.093091-0.093091 0.093091 112.965818 0.232727 247.761455 0.093091 140.8 0.093091 317.067636 0.093091 317.067636-1.024-0.093091-762.740364 0.093091-763.112727 0.093091z" fill="currentColor"></path></svg>`,
    pdf: `<svg class="chatappico pdf" viewBox="0 0 1024 1024"><path d="M821.457602 118.382249H205.725895c-48.378584 0-87.959995 39.583368-87.959996 87.963909v615.731707c0 48.378584 39.581411 87.959995 87.959996 87.959996h615.733664c48.380541 0 87.961952-39.581411 87.961952-87.959996V206.346158c-0.001957-48.378584-39.583368-87.963909-87.963909-87.963909zM493.962468 457.544987c-10.112054 32.545237-21.72487 82.872662-38.806571 124.248336-8.806957 22.378397-8.380404 18.480717-15.001764 32.609808l5.71738-1.851007c58.760658-16.443827 99.901532-20.519564 138.162194-27.561607-7.67796-6.06371-14.350194-10.751884-19.631237-15.586807-26.287817-29.101504-35.464584-34.570387-70.440002-111.862636v0.003913z m288.36767 186.413594c-7.476424 8.356924-20.670227 13.191847-40.019704 13.191847-33.427694 0-63.808858-9.229597-107.79277-31.660824-75.648648 8.356924-156.097 17.214754-201.399704 31.729308-2.199293 0.876587-4.832967 1.759043-7.916674 3.077836-54.536215 93.237125-95.031389 132.767663-130.621199 131.19646-11.286054-0.49895-27.694661-7.044-32.973748-10.11988l-6.52157-6.196764-2.29517-4.353583c-3.07588-7.91863-3.954423-15.395054-2.197337-23.751977 4.838837-23.309771 29.907651-60.251638 82.686779-93.237126 8.356924-6.159587 27.430511-15.897917 45.020944-24.25484 13.311204-21.177004 19.45905-34.744531 36.341171-72.259702 19.102937-45.324228 36.505531-99.492589 47.500041-138.191543v-0.44025c-16.267727-53.219378-25.945401-89.310095-9.67376-147.80856 3.958337-16.71189 18.46702-33.864031 34.748444-33.864031h10.552304c10.115967 0 19.791684 3.520043 26.829814 10.552304 29.029107 29.031064 15.39114 103.824649 0.8805 162.323113-0.8805 2.63563-1.322707 4.832967-1.761 6.153717 17.59239 49.697378 45.400538 98.774492 73.108895 121.647926 11.436717 8.791304 22.638634 18.899444 36.71098 26.814161 19.791684-2.20125 37.517128-4.11487 55.547812-4.11487 54.540128 0 87.525615 9.67963 100.279169 30.351814 4.400543 7.034217 6.595923 15.389184 5.281043 24.1844-0.44025 10.996467-4.39663 21.112434-12.31526 29.031064z m-27.796407-36.748157c-4.394673-4.398587-17.024957-16.936907-78.601259-16.936907-3.073923 0-10.622744-0.784623-14.57521 3.612007 32.104987 14.072347 62.830525 24.757704 83.058545 24.757703 3.083707 0 5.72325-0.442207 8.356923-0.876586h1.759044c2.20125-0.8805 3.520043-1.324663 3.960293-5.71738-0.87463-1.324663-1.757087-3.083707-3.958336-4.838837z m-387.124553 63.041845c-9.237424 5.27713-16.71189 10.112054-21.112433 13.634053-31.226444 28.586901-51.018128 57.616008-53.217422 74.331812 19.789727-6.59788 45.737084-35.626987 74.329855-87.961952v-0.003913z m125.574957-297.822284l2.197336-1.761c3.079793-14.072347 5.232127-29.189554 7.87167-38.869184l1.318794-7.036174c4.39663-25.070771 2.71781-39.720334-4.76057-50.272637l-6.59788-2.20125a57.381208 57.381208 0 0 0-3.079794 5.27713c-7.474467 18.47289-7.063567 55.283661 3.0524 94.865072l-0.001956-0.001957z" fill="currentColor"></path></svg>`,
    md: `<svg class="chatappico md" viewBox="0 0 1024 1024" width="200" height="200"><path d="M128 128h768a42.666667 42.666667 0 0 1 42.666667 42.666667v682.666666a42.666667 42.666667 0 0 1-42.666667 42.666667H128a42.666667 42.666667 0 0 1-42.666667-42.666667V170.666667a42.666667 42.666667 0 0 1 42.666667-42.666667z m170.666667 533.333333v-170.666666l85.333333 85.333333 85.333333-85.333333v170.666666h85.333334v-298.666666h-85.333334l-85.333333 85.333333-85.333333-85.333333H213.333333v298.666666h85.333334z m469.333333-128v-170.666666h-85.333333v170.666666h-85.333334l128 128 128-128h-85.333333z" p-id="1381" fill="currentColor"></path></svg>`,
    copy: `<svg class="chatappico copy" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
    cpok: `<svg class="chatappico cpok" viewBox="0 0 24 24"><g fill="none" stroke="#10a37f" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M16 4h2a2 2 0 0 1 2 2v4m1 4H11"/><path d="m15 10l-4 4l4 4"/></g></svg>`
  }[type];
}

function copyBtns() {
  Array.from(document.querySelectorAll("main >div>div>div>div>div"))
    .forEach(i => {
      if (i.querySelector('.chat-item-copy')) return;
      if (!i.querySelector('button.rounded-md')) return;
      const btn = i.querySelector('button.rounded-md').cloneNode(true);
      btn.classList.add('chat-item-copy');
      btn.title = 'Copy to clipboard';
      btn.innerHTML = setIcon('copy');
      i.querySelector('.self-end').appendChild(btn);
      btn.onclick = () => {
        copyToClipboard(i?.innerText?.trim() || '', btn);
      }
    })
}

function copyToClipboard(text, btn) {
  window.clearTimeout(window.__cpTimeout);
  btn.innerHTML = setIcon('cpok');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    var textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.style.position = 'fixed';
    textarea.style.clip = 'rect(0 0 0 0)';
    textarea.style.top = '10px';
    textarea.value = text;
    textarea.select();
    document.execCommand('copy', true);
    document.body.removeChild(textarea);
  }
  window.__cpTimeout = setTimeout(() => {
    btn.innerHTML = setIcon('copy');
  }, 1000);
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
