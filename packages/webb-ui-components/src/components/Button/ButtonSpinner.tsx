import { Spinner } from '@webb-dapp/webb-ui-components/icons';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { ButtonSpinnerProps } from './types';

export const ButtonSpinner: React.FC<ButtonSpinnerProps> = (props) => {
  const {
    children = <Spinner darkMode={props.darkMode} size='lg' />,
    className,
    label,
    placement = 'start',
    spacing = 2,
  } = props;

  const mergedClassName = twMerge(
    'flex items-center',
    label ? 'relative' : 'absolute',
    label ? (placement === 'start' ? `mr-${spacing}` : `ml-${spacing}`) : undefined,
    className
  );

  return <div className={mergedClassName}>{children}</div>;
};
