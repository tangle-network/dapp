import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { BreadcrumbsSeparatorPropsType } from './types';

export const BreadcrumbsSeparator = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbsSeparatorPropsType
>((props, ref) => {
  const { children, className: classNameProp } = props;

  const baseClsx = useMemo(() => 'inline-flex pointer-events-none', []);

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
