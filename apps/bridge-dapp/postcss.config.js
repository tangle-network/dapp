import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname_ = dirname(fileURLToPath(import.meta.url));

// Note: If you use library-specific PostCSS/Tailwind configuration then you should remove the `postcssConfig` build
// option from your application's configuration (i.e. project.json).
//
// See: https://nx.dev/guides/using-tailwind-css-in-react#step-4:-applying-configuration-to-libraries
export default {
  plugins: {
    'postcss-import': {},
    'postcss-nested': {},
    'tailwindcss/nesting': {},
    tailwindcss: {
      config: join(dirname_, 'tailwind.config.js'),
    },
    autoprefixer: {},
  },
};
