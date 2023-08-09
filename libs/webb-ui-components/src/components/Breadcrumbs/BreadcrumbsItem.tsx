import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { BreadcrumbsItemPropsType } from './types';
import { Typography } from '../../typography';
import { Chip } from '../Chip';

/**
 * The `BreadcrumbsItem` component
 *
 * - `icon`: `Optional`. The icon to appear before the component's children
 * - `isLast`: `Optional`. If `true` the breadcrumb item will be highlighted indicating it's the last item
 *
 * ```jsx
 *  // Example (not a last item)
 *  <BreadcrumbsItem icon={<GridFillIcon />}>Tangle Explorer</BreadcrumbsItem>
 *
 *  // Example (is a last item)
 *  <BreadcrumbsItem icon={<GridFillIcon />} isLast>Tangle Explorer</BreadcrumbsItem>
 * ```
 */
export const BreadcrumbsItem = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbsItemPropsType
>((props, ref) => {
  const {
    isLast = false,
    icon,
    children,
    className: classNameProp,
    textClassName,
  } = props;

  const baseClsx = useMemo(() => 'flex items-center gap-x-2 w-fit', []);

  const className = useMemo(
    () => twMerge(baseClsx, classNameProp),
    [baseClsx, classNameProp]
  );

  if (!isLast) {
    return (
      <Chip
        color="grey"
        className={twMerge(
          className,
          'cursor-pointer dark:bg-[rgba(255,255,255,0.05)]'
        )}
        ref={ref}
      >
        {icon}
        <Typography
          variant="label"
          className={twMerge(
            'capitalize !font-semibold text-mono-120 dark:text-mono-60',
            textClassName
          )}
        >
          {children}
        </Typography>
      </Chip>
    );
  }

  return (
    <Chip
      color="grey"
      className={twMerge(
        'mb-[0.4px] bg-[#9CA0B01A] dark:bg-[rgba(255,255,255,0.1)]',
        className
      )}
      ref={ref}
    >
      {icon}
      <Typography
        variant="label"
        className={twMerge(
          'capitalize !font-semibold dark:text-mono-0',
          textClassName
        )}
      >
        {children}
      </Typography>
    </Chip>
  );
});
