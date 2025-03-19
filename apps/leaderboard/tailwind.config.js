import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { join } from 'path';

// eslint-disable-next-line @nx/enforce-module-boundaries
import preset from '../../tailwind.preset.cjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    join(__dirname, '{src,public}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
};
