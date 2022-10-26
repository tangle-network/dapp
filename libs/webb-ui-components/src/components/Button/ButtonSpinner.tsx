import { Spinner } from '../../icons';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { ButtonSpinnerProps } from './types';

export const ButtonSpinner: React.FC<ButtonSpinnerProps> = (props) => {
  const { children = <Spinner darkMode={props.darkMode} size='lg' />, className, label, placement = 'start' } = props;

  const mergedClassName = twMerge(
    'flex items-center',
    label ? 'relative' : 'absolute',
    label ? (placement === 'start' ? `mr-2` : `ml-2`) : undefined,
    className
  );

  return <div className={mergedClassName}>{children}</div>;
};
