import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChainIcon, TokenIcon } from '@webb-tools/icons';

import { IconWithTooltip } from '../IconWithTooltip';
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
          <IconWithTooltip
            icon={<Icon key={idx} name={icon} size={iconSize} />}
            content={icon}
          />
        ))}
      </div>
    );
  }
);
