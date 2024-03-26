import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { defaultSocialConfigs } from '../../constants';
import { SocialsProps } from './types';

const iconPlacements = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

export const Socials = forwardRef<HTMLDivElement, SocialsProps>(
  (
    {
      className,
      iconClassName = 'text-mono-180 dark:text-mono-0 hover:text-mono-140 dark:hover:text-mono-100',
      iconPlacement = 'start',
      socialConfigs = defaultSocialConfigs,
      linkOverrides,
      ...props
    },
    ref
  ) => {
    const resolvedSocialConfigs = useMemo(() => {
      if (linkOverrides === undefined) {
        return socialConfigs;
      }

      return socialConfigs.map((config) => {
        const hrefOverride = linkOverrides[config.name];

        if (hrefOverride !== undefined) {
          return {
            ...config,
            href: hrefOverride,
          };
        }

        return config;
      });
    }, [linkOverrides, socialConfigs]);

    return (
      <div
        {...props}
        ref={ref}
        className={twMerge(
          'flex items-center space-x-4',
          iconPlacements[iconPlacement],
          className
        )}
      >
        {resolvedSocialConfigs.map(({ Icon, name, ...linkProps }) => (
          <a key={name} {...linkProps} className={iconClassName}>
            <Icon className="w-8 h-8 !fill-current" />
          </a>
        ))}
      </div>
    );
  }
);
