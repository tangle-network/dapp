import { IconSize } from '@webb-tools/icons/types.js';

/**
 * Get the className to handle horizontal spaces between the icons in pixel
 * @param size Represent the icon size in text
 * @returns The string className representing the horizontal space
 */
export function getIconsSpacingClassName(size: IconSize) {
  switch (size) {
    case 'xl': {
      return '-space-x-3' as const;
    }

    case 'lg': {
      return '-space-x-1.5' as const;
    }

    case 'md': {
      return '-space-x-1' as const;
    }

    default: {
      throw new Error('Unknown icon size');
    }
  }
}
