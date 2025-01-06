import { IconSize } from './types';

/**
 * Get the tailwind className for stroke color
 * @param darkMode Get the className in dark mode or not,
 * use this variable to control dark mode in `js`,
 * leave it's empty if want to control dark mode in `css`
 * @returns the tailwind class for stroke color
 */
export function getStrokeColor(darkMode?: boolean) {
  if (darkMode === undefined) {
    return 'stroke-mono-200 dark:stroke-mono-40' as const;
  } else {
    return darkMode
      ? ('stroke-mono-40' as const)
      : ('stroke-mono-200' as const);
  }
}

/**
 * Get the tailwind className for fill color
 * @param darkMode Get the className in dark mode or not
 * use this variable to control dark mode in `js`
 * leave it's empty if want to control dark mode in `css`
 * @returns the tailwind class for fill color
 */
export function getFillColor(darkMode?: boolean) {
  if (darkMode === undefined) {
    return 'fill-mono-200 dark:fill-mono-40' as const;
  } else {
    return darkMode ? ('fill-mono-40' as const) : ('fill-mono-200' as const);
  }
}

export function getIconSizeInPixel(size: IconSize) {
  switch (size) {
    case '2xl':
      return '48px' as const;
    case 'xl':
      return '40px' as const;
    case 'lg':
      return '24px' as const;
    case 'md':
      return '16px' as const;
    default: {
      throw new Error('Unknown icon size');
    }
  }
}

export function getFlexBasic(size: IconSize = 'md') {
  switch (size) {
    case '2xl': {
      return 'basis-12' as const;
    }

    case 'xl': {
      return 'basis-10' as const;
    }

    case 'lg': {
      return 'basis-8' as const;
    }

    case 'md': {
      return 'basis-6' as const;
    }

    default: {
      throw new Error('Unknown icon size');
    }
  }
}

export function getMinSizeClassName(size: IconSize) {
  switch (size) {
    case 'md': {
      return 'min-w-4 min-h-4' as const;
    }

    case 'lg': {
      return 'min-w-8 min-h-8' as const;
    }

    case 'xl': {
      return 'min-w-12 min-h-12' as const;
    }

    case '2xl': {
      return 'min-w-24 min-h-24' as const;
    }

    default: {
      throw new Error('Unknown icon size');
    }
  }
}
