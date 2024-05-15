import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import preset from '@webb-tools/tailwind-preset';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    join(__dirname, 'src/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      screens: {
        mob: '481px',
      },
    },
  },
  plugins: [],
};
