/** @type {import('tailwindcss').Config} */

const config = require('../../tailwind.config');
const merge = require('lodash.merge');

module.exports = merge(config, {
  content: [
    './src/**/*.{js,jsx,ts,tsx,css}',
    './.storybook/**/*.{js,jsx,ts,tsx}',
  ],
});
