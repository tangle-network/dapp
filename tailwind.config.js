/** @type {import('tailwindcss').Config} */

const preset = require('@nepoche/tailwind-preset');

module.exports = {
  presets: [preset],
  mode: 'jit',
  content: [
    './libs/**/src/**/*.{js,jsx,ts,tsx}',
    './apps/**/src/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-radix')(),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
