import { AvatarProps } from './types';

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
        ? ('border-mono-140' as const)
        : ('border-mono-60' as const)
      : ('border-mono-60 dark:border-mono-140' as const);

  const bg =
    typeof darkMode === 'boolean'
      ? darkMode
        ? ('bg-mono-140' as const)
        : ('bg-mono-60' as const)
      : ('bg-mono-60 dark:bg-mono-140' as const);

  const text =
    typeof darkMode === 'boolean'
      ? darkMode
        ? ('text-mono-60' as const)
        : ('text-mono-140' as const)
      : ('text-mono-140 dark:text-mono-60' as const);

  return {
    borderColor,
    bg,
    text,
  };
};
