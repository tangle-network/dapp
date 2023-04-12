import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { SocialsProps } from './types';
import { defaultSocialConfigs } from '../../constants';

const iconPlacements = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

export const Socials = forwardRef<HTMLElement, SocialsProps>(
  ({ className, ...props }) => {
    const { iconPlacement = 'start', socialConfigs = defaultSocialConfigs } =
      props;

    return (
      <div
        className={twMerge(
          'flex items-center space-x-4',
          iconPlacements[iconPlacement]
        )}
      >
        {socialConfigs.map(({ Icon, name, ...linkProps }) => (
          <a
            key={name}
            {...linkProps}
            className="text-mono-180 dark:text-mono-0 hover:text-mono-140 dark:hover:text-mono-100"
          >
            <Icon className="w-8 h-8 !fill-current" />
          </a>
        ))}
      </div>
    );
  }
);
