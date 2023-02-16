import { Close, UsageGuideIcon } from '@webb-tools/icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { EducationCardProps } from './types';

const links = [
  {
    label: 'Usage Guide',
    href: 'https://docs.webb.tools/docs/dapps/hubble-bridge/overview/',
    Icon: UsageGuideIcon,
  },
  {
    label: 'Get Started',
    getLink: (tab: EducationCardProps['currentTab']) => {
      return `https://docs.webb.tools/docs/dapps/hubble-bridge/usage-guide/${tab.toLowerCase()}/`;
    },
    Icon: UsageGuideIcon,
  },
];

const howItWorksContent: {
  [key in EducationCardProps['currentTab']]: Array<{
    title: string;
    description: string;
  }>;
} = {
  Deposit: [
    {
      title: 'Deposit',
      description: 'Make a deposit and choose a destination chain',
    },
    {
      title: 'Switch Networks',
      description: 'Hop over to the destination chain',
    },
    {
      title: 'Withdraw',
      description: 'Withdraw using fixed amounts for max privacy',
    },
  ],
  Transfer: [
    {
      title: 'Deposit',
      description: 'Make a deposit and choose a destination chain',
    },
    {
      title: 'Switch Networks',
      description: 'Hop over to the destination chain',
    },
    {
      title: 'Withdraw',
      description: 'Withdraw using fixed amounts for max privacy',
    },
  ],
  Withdraw: [
    {
      title: 'Deposit',
      description: 'Make a deposit and choose a destination chain',
    },
    {
      title: 'Switch Networks',
      description: 'Hop over to the destination chain',
    },
    {
      title: 'Withdraw',
      description: 'Withdraw using fixed amounts for max privacy',
    },
  ],
};

export const EducationCard = forwardRef<HTMLDivElement, EducationCardProps>(
  ({ currentTab, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'flex flex-row-reverse items-start',
          props.className
        )}
        ref={ref}
      >
        <button>
          <Close size="lg" />
        </button>

        <div className="space-y-4 grow">
          <Typography variant="h3" fw="bold">
            Privacy for everyone, everything, everywhere.
          </Typography>

          <div className="flex space-x-9">
            {links.map(({ label, href, getLink, Icon }) => (
              <Button
                leftIcon={<Icon className="!fill-current" size="lg" />}
                href={href ?? getLink?.(currentTab)}
                rel="noopener noreferrer"
                target="_blank"
                variant="link"
              >
                {label}
              </Button>
            ))}
          </div>

          <Typography
            variant="body1"
            fw="semibold"
            component="p"
            className="text-mono-120 dark:text-mono-100"
          >
            How it works?
          </Typography>

          <div className="space-y-2">
            {howItWorksContent[currentTab].map((content, index) => {
              return (
                <div className="relative flex items-start space-x-2">
                  {/** Vertical line */}
                  <span
                    className={cx(
                      {
                        'content-[""] absolute w-0.5 h-[calc(100%-16px)]':
                          index !== howItWorksContent[currentTab].length - 1,
                      },
                      {
                        'translate-y-6 translate-x-[18px] bg-mono-120 dark:bg-mono-100':
                          index !== howItWorksContent[currentTab].length - 1,
                      }
                    )}
                  />

                  <Typography
                    component="p"
                    className={cx(
                      'flex items-center justify-center w-6 h-6 border-2 rounded-full',
                      { 'border-mono-200 dark:border-mono-0': !index },
                      {
                        'border-mono-120 dark:border-mono-100 text-mono-120 dark:text-mono-100':
                          index,
                      }
                    )}
                    variant="mono2"
                    fw="bold"
                  >
                    {index + 1}
                  </Typography>

                  <div className="space-y-1">
                    <Typography
                      variant="body1"
                      fw="bold"
                      className={cx({
                        'text-mono-120 dark:text-mono-100': index,
                      })}
                    >
                      {content.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      className="text-mono-120 dark:text-mono-100"
                    >
                      {content.description}
                    </Typography>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);
