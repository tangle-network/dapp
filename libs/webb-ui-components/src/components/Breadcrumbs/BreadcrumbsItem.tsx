import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { NavLink } from 'react-router-dom';
import { Chip } from '@webb-tools/webb-ui-components';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import { WebbComponentBase } from '../../types';

interface BreadcrumbsItemPropsType extends WebbComponentBase {
  path?: string;
  icon?: React.ReactNode;
}

export const BreadcrumbsItem = React.forwardRef<
  HTMLDivElement,
  BreadcrumbsItemPropsType
>((props, ref) => {
  const { path, icon, children, className: classNameProp } = props;

  const baseClsx = useMemo(() => 'flex items-center gap-2', []);

  const className = useMemo(
    () => twMerge(baseClsx, classNameProp),
    [baseClsx, classNameProp]
  );

  if (path) {
    return (
      <NavLink to={path} className="cursor-pointer">
        <Chip color="grey" isDisabled={true}>
          <div className="flex items-center justify-between gap-x-2">
            {icon}
            <Typography variant="label" fw="normal" className="capitalize">
              {children}
            </Typography>
          </div>
        </Chip>
        {/* <span className={className} ref={ref}>
          {icon}
          {children}
        </span> */}
      </NavLink>
    );
  }

  return (
    <div className={className} ref={ref}>
      {icon}
      {children}
    </div>
  );
});
