/** @type {import('tailwindcss').Config} */

const preset = require('@nepoche/tailwind-preset');

module.exports = {
  presets: [preset],
  mode: 'jit',
  content: [
    './src/**/*.{js,jsx,ts,tsx,css}',
    './.storybook/**/*.{js,jsx,ts,tsx}',
  ],
};
