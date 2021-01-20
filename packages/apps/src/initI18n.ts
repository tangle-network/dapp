
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
  ns: ['apps', 'page-wallet', 'page-loan', 'page-mixer', 'page-homa', 'page-oracle-price', 'page-governance', 'react-components'],
  resources
});
