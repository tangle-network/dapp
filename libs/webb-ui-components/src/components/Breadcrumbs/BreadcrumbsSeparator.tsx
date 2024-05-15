import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import type { BreadcrumbsSeparatorPropsType } from './types.js';

export const BreadcrumbsSeparator = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbsSeparatorPropsType
>((props, ref) => {
  const { children, className: classNameProp } = props;

  const baseClsx = useMemo(
    () =>
      'inline-flex pointer-events-none !text-mono-120 dark:!text-mono-80 font-bold mx-2',
    []
  );

  const className = useMemo(
    () => twMerge(baseClsx, classNameProp),
    [baseClsx, classNameProp]
  );

  return (
    <span className={className} ref={ref}>
      {children}
    </span>
  );
});
