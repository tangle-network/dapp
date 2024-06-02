import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import preset from '../../tailwind.preset.cjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname_ = __dirname || dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    join(dirname_, 'src/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(dirname_),
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
