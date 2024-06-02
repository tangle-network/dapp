const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const preset = require('../../tailwind.preset.cjs');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
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
