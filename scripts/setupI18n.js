const fs = require('fs');
const path = require('path');
const findPackages = require('./findPackages');

function createI18nFiles (package, languages) {
  const folderPath = path.join(package, 'src/i18n');

  // create i18n folder
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  for (let l of languages) {
    if (!fs.existsSync(path.join(folderPath, `${l}.json`))) {
      fs.writeFileSync(path.join(folderPath, `${l}.json`), '{}', { encoding: 'utf-8' });
    }
  }
}

const packages = findPackages();

for (let package of packages) {
  createI18nFiles(path.resolve(__dirname, '../', 'packages', package.dir), ['en', 'zh']);
}
