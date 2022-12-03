import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Chip } from '@webb-tools/webb-ui-components';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import { BreadcrumbsItemPropsType } from './types';

export const BreadcrumbsItem = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbsItemPropsType
>((props, ref) => {
  const { isLast, icon, children, className: classNameProp } = props;

  const baseClsx = useMemo(
    () => 'flex items-center gap-x-2 w-fit',
    []
  );

  const className = useMemo(
    () => twMerge(baseClsx, classNameProp),
    [baseClsx, classNameProp]
  );

  if (!isLast) {
    return (
      <Chip
        color="grey"
        isDisabled={false}
        className={twMerge(className, 'cursor-pointer')}
        ref={ref}
      >
        {icon}
        <Typography variant="label" fw="normal" className="capitalize">
          {children}
        </Typography>
      </Chip>
    );
  }

  return (
    <Chip
      color="grey"
      isDisabled={true}
      className={twMerge(className, 'ml-3 mb-[0.4px]')}
      ref={ref}
    >
      {icon}
      <Typography variant="label" fw="normal" className="capitalize">
        {children}
      </Typography>
    </Chip>
  );
});

const BreadcrumbsItemsDefaultProps = {
  isLast: false,
};

BreadcrumbsItem.defaultProps = BreadcrumbsItemsDefaultProps;
