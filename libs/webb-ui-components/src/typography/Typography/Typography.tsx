import React, { createElement, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { WebbTypographyProps } from '../types';
import {
  getDefaultTextColor,
  getFontWeightClassName,
  getTextAlignClassName,
} from '../utils';

const defaultComponent = {
  h1: 'h1' as const,
  h2: 'h2' as const,
  h3: 'h3' as const,
  h4: 'h4' as const,
  h5: 'h5' as const,
  body1: 'p' as const,
  body2: 'p' as const,
  body3: 'p' as const,
  body4: 'p' as const,
  mono1: 'span' as const,
  mono2: 'span' as const,
  para1: 'p' as const,
  para2: 'p' as const,
  label: 'span' as const,
  utility: 'span' as const,
};

/**
 * The Webb Typography component
 *
 * Props:
 * - `variant`: Represent different variants of the component
 * - `component`: The html tag (default: same as `variant` prop)
 * - `fw`: Represent the **font weight** of the component (default: `normal`)
 * - `ta`: Text align (default: `left`)
 * - `darkMode`: Control component dark mode display in `js`, leave it's empty if you want to control dark mode in `css`
 *
 * @example
 *
 * ```jsx
 * <Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>
 * <Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>
 * ```
 */
export const Typography: React.FC<WebbTypographyProps> = (props) => {
  const {
    children,
    className,
    component,
    fw = 'normal',
    ta = 'left',
    variant,
    ...restProps
  } = props;

  const _component = useMemo(
    () => component ?? defaultComponent[variant],
    [component, variant]
  );

  const _className = useMemo(
    () =>
      twMerge(
        `${variant}` as const,
        getTextAlignClassName(ta),
        getFontWeightClassName(variant, fw),
        getDefaultTextColor(variant),
        className
      ),
    [className, fw, ta, variant]
  );

  return createElement(
    _component,
    { ...restProps, className: _className },
    children
  );
};
