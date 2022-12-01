import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { NavLink } from 'react-router-dom';
import { Chip } from '@webb-tools/webb-ui-components';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import { BreadcrumbsItemPropsType } from './types';

export const BreadcrumbsItem = React.forwardRef<
  HTMLDivElement,
  BreadcrumbsItemPropsType
>((props, ref) => {
  const { path, icon, children, className: classNameProp } = props;

  const baseClsx = useMemo(
    () => 'flex items-center justify-between gap-x-2',
    []
  );

  const className = useMemo(
    () => twMerge(baseClsx, classNameProp),
    [baseClsx, classNameProp]
  );

  if (path) {
    return (
      <NavLink to={path} className="cursor-pointer">
        <Chip color="grey" isDisabled={false} className={className} ref={ref}>
          {icon}
          <Typography variant="label" fw="normal" className="capitalize">
            {children}
          </Typography>
        </Chip>
      </NavLink>
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
