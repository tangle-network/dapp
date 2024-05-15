import preset from '@webb-tools/tailwind-preset';
import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname_ = __dirname || dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  darkMode: 'class',
  content: [
    join(dirname_, 'src/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(dirname_),
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
