import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import preset from '@webb-tools/tailwind-preset';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname_ = __dirname || dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    join(
      dirname_,
      '{src,pages,components,containers,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    join(
      dirname_,
      '../../libs/webb-ui-components',
      'src/{pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(dirname_),
  ],
  theme: {
    extend: {
      backgroundImage: {
        glass:
          'linear-gradient(180deg,rgba(255,255,255,0.80) 0%,rgba(255,255,255,0.00) 100%)',
        'glass-dark':
          'linear-gradient(180deg, rgb(43, 47, 64) 0%, rgba(43, 47, 64, 0.60) 100%)',
      },
    },
  },
  plugins: [],
};
