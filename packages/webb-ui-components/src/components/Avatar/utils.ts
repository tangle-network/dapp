import { AvatarProps } from './types';

/**
 * Get the avatar size in pixel for other avatar components to consistent with WebbUI Avatar component
 * @param size The `Avatar` size component
 * @returns the size in pixel for other avatar components
 */
export function getAvatarSizeInPx(size: AvatarProps['size'] = 'md') {
  switch (size) {
    case 'md': {
      return 24;
    }

    case 'lg': {
      return 48;
    }

    default: {
      throw new Error('Unknown avatar size in [getAvatarSizeInPx] function');
    }
  }
}
