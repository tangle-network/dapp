import cx from 'classnames';
import React, { Children } from 'react';

import { IconBase } from './types';

interface CreateIconOptions extends IconBase {
  /**
   * The icon `svg` viewBox
   * @default "0 0 24 24"
   */
  viewBox?: string;
  /**
   * The `svg` path or group element
   */
  path?: React.ReactElement | React.ReactElement[];
  /**
   * If the `svg` has a single path, simply copy the path's `d` attribute
   */
  d?: string;
  /**
   * The display name useful in the dev tools
   */
  displayName?: string;
  /**
   * Color using `stroke` instead of `fill`
   * @default false
   */
  colorUsingStroke?: boolean;
  /**
   * Default props automatically passed to the component; overwriteable
   */
  defaultProps?: React.SVGProps<SVGSVGElement>;
}

export function createIcon(options: CreateIconOptions) {
  const {
    className,
    d: pathDefinition,
    defaultProps = {},
    displayName,
    path,
    viewBox = '0 0 24 24',
    size = 'md',
    darkMode,
    colorUsingStroke = false,
  } = options;
  const _path = Children.toArray(path);
  const _size = `${size === 'md' ? 16 : size === 'lg' ? 24 : 48}px` as const;

  const _className = colorUsingStroke ? getStrokeColor(darkMode) : getFillColor(darkMode);

  const Comp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
      viewBox={viewBox}
      width={_size}
      height={_size}
      className={cx(_className, colorUsingStroke ? 'fill-transparent' : 'stroke-transparent', className)}
      {...defaultProps}
      {...props}
    >
      {_path.length ? _path : <path fill='inherit' d={pathDefinition} />}
    </svg>
  );

  Comp.displayName = displayName;

  return <Comp />;
}

/**
 * Get the tailwind className for stroke color
 * @param darkMode Get the className in dark mode or not,
 * use this variable to control dark mode in `js`,
 * leave it's empty if want to control dark mode in `css`
 * @returns the tailwind class for stroke color
 */
function getStrokeColor(darkMode?: boolean) {
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
function getFillColor(darkMode?: boolean) {
  if (darkMode === undefined) {
    return 'fill-mono-200 dark:fill-mono-40' as const;
  } else {
    return darkMode ? ('fill-mono-40' as const) : ('fill-mono-200' as const);
  }
}
