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
    return darkMode ? ('stroke-mono-40' as const) : ('stroke-mono-200' as const);
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

/**
 * Get the icon size in pixel based on text
 * @param size Represent the icon size in text
 * @returns The icon in pixel
 */
export function getIconSizeInPixel(size: IconSize) {
  switch (size) {
    case 'xl': {
      return '48px' as const;
    }

    case 'lg': {
      return '24px' as const;
    }

    case 'md': {
      return '16px' as const;
    }

    default: {
      throw new Error('Unknown icon size');
    }
  }
}
