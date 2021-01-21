const fs = require('fs');
const path = require('path');
const findPackages = require('./findPackages.js');

function readLanguages(module) {
  const i18nPath = path.join(__dirname, '../', 'packages', module, 'src/i18n');

  // ensure that i18n folder exists
  if (!fs.existsSync(i18nPath)) return null;

  const result = { module };

  const files = fs.readdirSync(i18nPath);

  for (let i of files) {
    const temp = require(path.join(i18nPath, i));

    result[path.parse(i).name] = temp;
  }

  return result;
}

function mergeLanguages(languages) {
  const result = {};

  languages
    .filter((m) => !!m)
    .forEach((m) => {
      const temp = { ...m };

      const module = m['module'];

      delete temp.module;

      Object.keys(temp).forEach((l) => {
        if (l === 'index') return;

        if (!result[l]) result[l] = {};

        result[l][module] = temp[l];
      });
    });

  return result;
}

function buildI18n(modules, to) {
  const languages = mergeLanguages(modules.map(readLanguages));

  fs.writeFileSync(path.resolve(__dirname, '../packages', to), JSON.stringify(languages, undefined, 2), {
    encoding: 'utf-8'
  });
}

function writeInitI18n(modules, to) {
  const temp = `
// @ts-nocheck
// auto generate by buildI18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from '../src/i18n/index.json';

// for debug
if (process.env.NODE_ENV === 'development') {
  window.i18n = i18n;
}

i18n.use(initReactI18next).init({
  defaultNS: 'translations',
  fallbackLng: 'en',
  ns: [${modules.map((i) => `'${i}'`).join(', ')}],
  resources
});
`;

  fs.writeFileSync(path.resolve(__dirname, '../packages', to), temp, { encoding: 'utf-8' });
}

const dappModules = [
  'apps',
  'page-wallet',
  'page-loan',
  'page-mixer',
  'page-homa',
  'page-oracle-price',
  'page-governance',
  'react-components'
];

const APP_NAME = process.env.APP_NAME;

if (APP_NAME === 'dapp') {
  buildI18n(dappModules, 'apps/src/i18n/index.json');
  writeInitI18n(dappModules, 'apps/src/initI18n.ts');
}
