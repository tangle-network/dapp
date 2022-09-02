import React, { Children } from 'react';
import { twMerge } from 'tailwind-merge';

import { IconBase } from './types';
import { getFillColor, getIconSizeInPixel, getStrokeColor } from './utils';

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
    ...restOptions
  } = options;
  const _path = Children.toArray(path);
  const _size = getIconSizeInPixel(size);

  const _className = colorUsingStroke ? getStrokeColor(darkMode) : getFillColor(darkMode);

  const Comp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
      viewBox={viewBox}
      width={_size}
      height={_size}
      className={twMerge(_className, colorUsingStroke ? 'fill-transparent' : 'stroke-transparent', className)}
      {...restOptions}
      {...defaultProps}
      {...props}
    >
      {_path.length ? _path : <path fill='inherit' d={pathDefinition} />}
    </svg>
  );

  Comp.displayName = displayName;

  return <Comp />;
}
