const fs = require('fs');
const loadsh = require('lodash');
const path = require('path');

const walkDir = (p, matcher, callback) => {
  if (fs.statSync(p).isDirectory()) {
    const dir = fs.readdirSync(p);

    for (let i in dir) {
      walkDir(path.join(p, dir[i]), matcher, callback);
    }
  } else {
    if  (matcher(p)) {
      callback(p);
    }
  }
}

const prettySVGTitle = (p) => {
  const content = fs.readFileSync(p, { encoding: 'utf-8' });

  const name  = path.parse(p).name

  const newContent = content
    .replace(/<title>.*?<\/title>/, `<title>${loadsh.upperFirst(name)}</title>`)
    .replace(/<!--*.?-->/, '')
    .replace(/<desc>.*?<\/desc>/, '');

  fs.writeFileSync(p, newContent, { encoding: 'utf-8' });
}

const run = () => {
  const packagesPath = path.resolve(__dirname, '../packages');

  walkDir(
    packagesPath,
    (path) => /svg$/.test(path) && !/build/.test(path),
    prettySVGTitle
  );
}

run();