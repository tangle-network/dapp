import type { SkeletonSize } from './types';

/**
 * Get the icon size in pixel based on text
 * @param size Represent the skeleton size
 * @returns The height of the skeleton
 */
export function getSkeletonClassNamesBySize(size: SkeletonSize) {
  switch (size) {
    case 'xl': {
      return 'h-12' as const;
    }

    case 'lg': {
      return 'h-6' as const;
    }

    case 'md': {
      return 'h-4' as const;
    }

    default: {
      throw new Error('Unknown skeleton size');
    }
  }
}
