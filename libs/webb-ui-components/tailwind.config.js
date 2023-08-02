const preset = require('@webb-tools/tailwind-preset');
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  darkMode: 'class',
  content: [
    join(__dirname, 'src/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      keyframes: {
        'accordion-slide-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-slide-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-slide-down': 'accordion-slide-down 300ms ease-out',
        'accordion-slide-up': 'accordion-slide-up 300ms ease-out',
      },
    },
  },
};
