import { Children, forwardRef, Fragment, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import type { BreadcrumbsPropsType } from './types';
import { BreadcrumbsSeparator } from './BreadcrumbsSeparator';

/**
 * The `Breadcrumbs` component
 *
 * - `separator`: `Optional`. The separator between the breadcrumbs. Default is `/`
 *
 * ```jsx
 *  // Example
 *  <Breadcrumbs>
 *    <BreadcrumbsItem icon={<GridFillIcon />}>Tangle Explorer</BreadcrumbsItem>
 *    <BreadcrumbsItem icon={<KeyIcon />}>Keys Overview</BreadcrumbsItem>
 *    <BreadcrumbsItem icon={<ShieldKeyholeLineIcon />} isLast>Keygen details</BreadcrumbsItem>
 *  <Breadcrumbs />
 * ```
 */
export const Breadcrumbs = forwardRef<HTMLDivElement, BreadcrumbsPropsType>(
  (props, ref) => {
    const { separator, children, className: classNameProp } = props;

    const childrenArray = Children.toArray(children);

    const childrenWithSeparators = childrenArray.map((child, index) => {
      if (index === 0) return child;

      return (
        <Fragment key={index}>
          <BreadcrumbsSeparator>{separator}</BreadcrumbsSeparator>
          {child}
        </Fragment>
      );
    });

    const baseClsx = useMemo(() => 'flex items-center', []);

    const className = useMemo(
      () => twMerge(baseClsx, classNameProp),
      [baseClsx, classNameProp],
    );

    return (
      <div className={className} ref={ref}>
        {childrenWithSeparators}
      </div>
    );
  },
);

const BreadcrumbsDefaultProps = {
  separator: '/',
};

Breadcrumbs.defaultProps = BreadcrumbsDefaultProps;
