import React, { Children, ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { IconBase } from './types';
import {
  getFillColor,
  getIconSizeInPixel,
  getMinSizeClassName,
  getStrokeColor,
} from './utils';

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
  defaultProps?: ComponentProps<'svg'>;
}

/**
 * Create icon from `d` or `path` attribute
 * @param {CreateIconOptions} options create icon options
 * @returns the icon component
 */
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
    ...restOptions
  } = options;

  const path_ = Children.toArray(path);
  const size_ = getIconSizeInPixel(size);

  const className_ = colorUsingStroke
    ? getStrokeColor(darkMode)
    : getFillColor(darkMode);

  // Prevent the icon from being squished when the parent
  // container or the window is small. Width & height attributes
  // are not enough to prevent squishing, so this must be set.
  const minSizeClassName = getMinSizeClassName(size);

  const Comp = (props: ComponentProps<'svg'>) => (
    <svg
      viewBox={viewBox}
      width={size_}
      height={size_}
      style={{ minWidth: size_, minHeight: size_ }}
      className={twMerge(
        className_,
        colorUsingStroke ? 'fill-transparent' : 'stroke-transparent',
        minSizeClassName,
        className,
      )}
      {...restOptions}
      {...defaultProps}
      {...props}
    >
      {path_.length ? path_ : <path fill="inherit" d={pathDefinition} />}
    </svg>
  );

  Comp.displayName = displayName;

  return <Comp />;
}
