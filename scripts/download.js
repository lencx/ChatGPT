const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);

console.log('«6» /ChatGPT/scripts/download.js ~> ', argv[0]);


function init() {
  const content = fs.readFileSync('README.md', 'utf8').split('\n');
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

  fs.writeFileSync('README.md', content.join('\n'), 'utf8');
}

init();