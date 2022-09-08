const fs = require('fs');
const path = require('path');
const webbJsPackages = [
  '@webb-tools/api',
  '@webb-tools/api-derive',
  '@webb-tools/types',
  '@webb-tools/app-util',
  '@webb-tools/sdk-core',
  '@webb-tools/wasm-utils',
  '@webb-tools/test-utils',
];

const proposalSolidityPackages = [
  '@webb-tools/protocol-solidity',

  '@webb-tools/anchors',
  '@webb-tools/bridges',
  '@webb-tools/contracts',
  '@webb-tools/interfaces',
  '@webb-tools/tokens',
  '@webb-tools/utils',
  '@webb-tools/vbridge',
];
function updateWebbToolsPackages(filter, next) {
  const root = process.cwd();
  // Loading the root package.json
  const rootJsonPath = path.join(root, 'package.json');
  const rootsJSON = fs.readFileSync(rootJsonPath, 'utf8');
  const rootsPackage = JSON.parse(rootsJSON);
  // update resolutions
  Object.keys(rootsPackage.resolutions).forEach((key) => {
    if (filter.includes(key)) {
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
        if (filter.includes(key)) {
          pkg.dependencies[key] = next;
        }
      });
    }

    if (pkg.devDependencies) {
      Object.keys(pkg.devDependencies).forEach((key) => {
        if (filter.includes(key)) {
          pkg.devDependencies[key] = next;
        }
      });
    }
    if (pkg.devDependencies || pkg.dependencies) {
      fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
    }
  });
}
const verison = process.argv[3];
const target = process.argv[2];
const filter = target === 'webb.js' ? webbJsPackages : target === 'sol' ? proposalSolidityPackages : [target];

if (!verison) {
  throw new Error('Please provide a version');
}
updateWebbToolsPackages(filter, verison);
