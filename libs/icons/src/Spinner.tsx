import { memo } from 'react';
import { twMerge } from 'tailwind-merge';

import { createIcon } from './create-icon';
import { IconBase } from './types';

const Spinner = memo<IconBase>((props) => {
  return createIcon({
    ...props,
    className: twMerge(
      props.className,
      'animate-spin !fill-transparent !stroke-none',
    ),
    style: { animationDuration: '0.8s' },
    path: (
      <path
        d="M10 2C14.4183 2 18 5.58172 18 10"
        stroke="#5953F9"
        strokeWidth="4"
        strokeLinecap="round"
      />
    ),
    displayName: 'Spinner',
    viewBox: '0 0 20 20',
  });
});

Spinner.displayName = 'Spinner';

export default Spinner;
