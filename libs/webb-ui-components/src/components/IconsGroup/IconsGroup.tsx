import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChainIcon, TokenIcon } from '@webb-tools/icons';

import { IconsGroupProps } from './types';
import { getIconsSpacingClassName } from './utils';

export const IconsGroup = forwardRef<HTMLDivElement, IconsGroupProps>(
  ({ type, icons, iconSize = 'lg', className }) => {
    const Icon = useMemo(
      () => (type === 'chain' ? ChainIcon : TokenIcon),
      [type]
    );

    return (
      <div
        className={twMerge(
          'flex items-center -space-x-2',
          getIconsSpacingClassName(iconSize),
          className
        )}
      >
        {icons.map((icon, idx) => (
          <Icon key={idx} name={icon} size={iconSize} />
        ))}
      </div>
    );
  }
);
