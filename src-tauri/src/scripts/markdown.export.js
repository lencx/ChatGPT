var ExportMD = (function () {
  if (!TurndownService || !turndownPluginGfm) return;
  const hljsREG = /^.*(hljs).*(language-[a-z0-9]+).*$/i;
  const gfm = turndownPluginGfm.gfm
  const turndownService = new TurndownService({
    hr: '---'
  })
    .use(gfm)
    .addRule('code', {
      filter: (node) => {
        if (node.nodeName === 'CODE' && hljsREG.test(node.classList.value)) {
          return 'code';
        }
      },
      replacement: (content, node) => {
        const classStr = node.getAttribute('class');
        if (hljsREG.test(classStr)) {
          const lang = classStr.match(/.*language-(\w+)/)[1];
          if (lang) {
            return `\`\`\`${lang}\n${content}\n\`\`\``;
          }
          return `\`\`\`\n${content}\n\`\`\``;
        }
      }
    })
    .addRule('ignore', {
      filter: ['button', 'img'],
      replacement: () => '',
    })
    .addRule('table', {
      filter: 'table',
      replacement: function(content, node) {
        return `\`\`\`${content}\n\`\`\``;
      },
    });

  return turndownService;
}({}));
