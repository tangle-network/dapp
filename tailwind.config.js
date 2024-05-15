import preset from '@webb-tools/tailwind-preset';

/** @type {import('tailwindcss').Config} */
export default {
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
