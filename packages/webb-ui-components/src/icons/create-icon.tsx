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
   * @type React.ReactElement | React.ReactElement[]
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
   * Default props automatically passed to the component; overwriteable
   */
  defaultProps?: React.SVGProps<SVGSVGElement>;
}

export function createIcon(options: CreateIconOptions) {
  const {
    d: pathDefinition,
    defaultProps = {},
    displayName,
    path,
    viewBox = '0 0 24 24',
    size = 'md',
    darkMode,
  } = options;
  const _path = Children.toArray(path);
  const _size = `${size === 'md' ? 16 : 24}px` as const;
  const _fill =
    darkMode === undefined
      ? ('fill-mono-40 dark:fill-mono-200' as const)
      : (`${darkMode ? 'fill-mono-40' : 'fill-mono-200'}` as const);

  const Comp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox={viewBox} width={_size} height={_size} className={_fill} {...defaultProps} {...props}>
      {_path.length ? _path : <path fill='inherit' d={pathDefinition} />}
    </svg>
  );

  Comp.displayName = displayName;

  return <Comp />;
}
