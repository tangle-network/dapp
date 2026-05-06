/**
 * This file serves as a centralized import point for the Tailwind preset from ui-components.
 * It re-exports the preset as a default export to avoid violating @nx/enforce-module-boundaries.
 * This approach prevents the need for complex relative import paths in tailwind.config.ts files
 * across different applications and libraries in the monorepo.
 * And tailwindcss not work well with relative import paths.
 * @see https://github.com/tailwindlabs/tailwindcss/issues/11097
 */

import preset from './libs/ui-components/src/tailwind.preset';

export default preset;
