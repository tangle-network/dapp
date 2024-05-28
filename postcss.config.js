import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname_ = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    'postcss-preset-env': {},
    'postcss-import': {},
    'postcss-nested': {},
    'tailwindcss/nesting': {},
    tailwindcss: {
      config: join(dirname_, 'tailwind.config.js'),
    },
    autoprefixer: {},
  },
};
