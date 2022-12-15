const fs = require('fs');

const argv = process.argv.slice(2);

async function rewrite(filename) {
  const content = fs.readFileSync(filename, 'utf8').split('\n');
  const startRe = /<!-- download start -->/;
  const endRe = /<!-- download end -->/;

  let flag = false;
  for (let i = 0; i < content.length; i++) {
    if (startRe.test(content[i])) {
      flag = true;
    }
    if (flag) {
      content[i] = content[i].replace(/(\d+).(\d+).(\d+)/g, argv[0]);
    }
    if (endRe.test(content[i])) {
      break;
    }
  }

  fs.writeFileSync(filename, content.join('\n'), 'utf8');
}

async function init() {
  rewrite('README.md');
  rewrite('README-ZH.md');
}

init().catch(console.error);