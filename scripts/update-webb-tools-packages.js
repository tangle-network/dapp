const fs = require('fs');
const path = require('path');
const webJsPackages = [
  '@webb-tools/api',
  '@webb-tools/api-derive',
  '@webb-tools/types',
  '@webb-tools/app-util',
  '@webb-tools/sdk-core',
  '@webb-tools/wasm-utils',
];

function updateWebbToolsPackages(next) {
  const root = process.cwd();
  // Loading the root package.json
  const rootJsonPath = path.join(root, 'package.json');
  const rootsJSON = fs.readFileSync(rootJsonPath, 'utf8');
  const rootsPackage = JSON.parse(rootsJSON);
  // update resolutions
  Object.keys(rootsPackage.resolutions).forEach((key) => {
    if (webJsPackages.includes(key)) {
      rootsPackage.resolutions[key] = next;
    }
  });
  fs.writeFileSync(rootJsonPath, JSON.stringify(rootsPackage, null, 2));
  const packagesJSONNs = [rootJsonPath];
  fs.readdirSync(path.join(root, 'packages')).forEach((dir) => {
    const packageJsonPath = path.join(root, 'packages', dir, 'package.json');
    packagesJSONNs.push(packageJsonPath);
  });
  packagesJSONNs.forEach((path) => {
    const json = fs.readFileSync(path, 'utf8');
    const pkg = JSON.parse(json);
    if (pkg.dependencies) {
      Object.keys(pkg.dependencies).forEach((key) => {
        if (webJsPackages.includes(key)) {
          pkg.dependencies[key] = next;
        }
      });
    }

    if (pkg.devDependencies) {
      Object.keys(pkg.devDependencies).forEach((key) => {
        if (webJsPackages.includes(key)) {
          pkg.devDependencies[key] = next;
        }
      });
    }
    if (pkg.devDependencies || pkg.dependencies) {
      fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
    }
  });
}
const verison = process.argv[2];
if (!verison) {
  throw new Error('Please provide a version');
}
updateWebbToolsPackages(verison);
