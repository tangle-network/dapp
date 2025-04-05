import { join } from 'path';
import type { Config } from 'tailwindcss/types/config';
import preset from './libs/ui-components/src/tailwind.preset';

/**
 * Config for apps and libs that don't have their own tailwind.config.ts
 * This is for the tailwind intellisense to work
 */
export default {
  presets: [preset],
  content: [
    join(__dirname, '{apps,libs}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
  ],
} as const satisfies Config;
