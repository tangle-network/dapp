import preset from '../../tailwind.preset';

import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';
import { Config } from 'tailwindcss/types/config';

export default {
  presets: [preset],
  content: [
    join(__dirname, '{src,public}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: [
          'var(--font-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      backgroundImage: {
        glass:
          'linear-gradient(180deg,rgba(255,255,255,0.94) 0%,rgba(255,255,255,0.74) 100%)',
        glass_dark:
          'linear-gradient(180deg,rgba(43,47,64,0.94) 0%,rgba(43,47,64,0.78) 100%)',
      },
    },
  },
  plugins: [],
} as const satisfies Config;
