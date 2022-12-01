import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { BreadcrumbsPropsType } from './types';
import { BreadcrumbsSeparator } from './BreadcrumbsSeparator';

export const Breadcrumbs = React.forwardRef<
  HTMLDivElement,
  BreadcrumbsPropsType
>((props, ref) => {
  const { separator, children, className: classNameProp } = props;

  const childrenArray = React.Children.toArray(children);

  const childrenWithSeparators = childrenArray.map((child, index) => {
    if (index === 0) return child;

    return (
      <React.Fragment key={index}>
        <BreadcrumbsSeparator>{separator}</BreadcrumbsSeparator>
        {child}
      </React.Fragment>
    );
  });

  const baseClsx = useMemo(() => 'flex items-center', []);

  const className = useMemo(
    () => twMerge(baseClsx, classNameProp),
    [baseClsx, classNameProp]
  );

  return (
    <div className={className} ref={ref}>
      {childrenWithSeparators}
    </div>
  );
});

const BreadcrumbsDefaultProps = {
  separator: '/',
};

Breadcrumbs.defaultProps = BreadcrumbsDefaultProps;
