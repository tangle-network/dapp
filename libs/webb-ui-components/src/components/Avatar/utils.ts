import { AvatarProps } from './types.js';

/**
 * Get the avatar size in pixel for other avatar components to consistent with WebbUI Avatar component
 * @param size The `Avatar` size component
 * @returns the size in pixel for other avatar components
 */
export function getAvatarSizeInPx(size: AvatarProps['size'] = 'md') {
  switch (size) {
    case 'sm': {
      return 16;
    }

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

export const getAvatarClassNames = (darkMode: boolean | undefined) => {
  const borderColor =
    typeof darkMode === 'boolean'
      ? darkMode
        ? ('border-mono-180' as const)
        : ('border-mono-0' as const)
      : ('border-mono-0 dark:border-mono-180' as const);

  const bg =
    typeof darkMode === 'boolean'
      ? darkMode
        ? ('bg-mono-180' as const)
        : ('bg-mono-0' as const)
      : ('bg-mono-0 dark:bg-mono-180' as const);

  const text =
    typeof darkMode === 'boolean'
      ? darkMode
        ? ('text-mono-0' as const)
        : ('text-mono-180' as const)
      : ('text-mono-180 dark:text-mono-0' as const);

  return {
    borderColor,
    bg,
    text,
  };
};
