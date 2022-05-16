// Script which which changes dependencies in all package.json for webb.js
// If argv of '--local' is provided, assume local webb.js (assumed webb.js is cloned in the same root directory as webb-dapp)
// If argv of '--version <packaged_version>' is provided, update all instances of `"@webb-tools/<webb.js>": "<packaged_version>"`

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

yargs(process.argv.slice(2)).check((argv, options) => {
  if (!argv.local && !argv.version) {
    throw new Error("please pass the appropriate '--local' or '--version <x>' parameter")
  } else {
    return true;
  }
})

const webbJsPackageNames = ['api', 'api-derive', 'api-providers', 'app-util', 'sdk-core', 'types', 'test-utils', 'wasm-utils'];

const executeSync = (cmd) => {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    process.exit(-1);
  }
}

// First, update the root package.json
const baseDirectory = process.cwd();



