import React from 'react';
import { twMerge } from 'tailwind-merge';

import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Spinner: React.FC<IconBase> = (props) => {
  // Spin animation attach to className
  props.className = twMerge(props.className, 'animate-spin fill-none stroke-none');

  return createIcon({
    ...props,
    path: [
      <path
        d='M10 1C14.9706 1 19 5.02944 19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1Z'
        stroke='#D5E6FF'
        stroke-width='2'
        stroke-linecap='round'
      />,
      <path d='M10 1C14.9706 1 19 5.02944 19 10' stroke='#4E8CDF' stroke-width='2' stroke-linecap='round' />,
    ],
    displayName: 'Spinner',
    viewBox: '0 0 20 20',
  });
};
