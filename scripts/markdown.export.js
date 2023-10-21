/**
 * @name markdown.export.js
 * @version 0.1.0
 * @url https://github.com/lencx/ChatGPT/tree/main/scripts/markdown.export.js
 */

var ExportMD = (function () {
  if (!TurndownService || !turndownPluginGfm) return;
  const hljsREG = /^.*(hljs).*(language-[a-z0-9]+).*$/i;
  const gfm = turndownPluginGfm.gfm;
  const turndownService = new TurndownService({
    hr: '---',
  })
    .keep([`\\`])
    .use(gfm)
    .addRule('code', {
      filter(node) {
        if (node.nodeName === 'CODE' && hljsREG.test(node.classList.value)) {
          return 'code';
        }
      },
      replacement(content, node) {
        const classStr = node.getAttribute('class');
        if (hljsREG.test(classStr)) {
          const lang = classStr.match(/.*language-(\w+)/)[1];
          if (lang) {
            return `\`\`\`${lang}\n${content}\n\`\`\``;
          }
          return `\`\`\`\n${content}\n\`\`\``;
        }
      },
    })
    .addRule('ignore-text', {
      filter: (node) => {
        if (node.nodeName === 'DIV' && node.classList.contains('!invisible')) {
          return 'ignore-text';
        }
      },
      replacement: () => '',
    })
    .addRule('ignore', {
      filter: ['button', 'img', 'svg'],
      replacement: () => '',
    })
    .addRule('table', {
      filter: 'table',
      replacement(content, node) {
        return `\`\`\`${content}\n\`\`\``;
      },
    });

  return turndownService;
})({});
