import { Close, HelpLineIcon, UsageGuideIcon } from '@webb-tools/icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { forwardRef, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { EducationCardProps } from './types';
import { Transition } from '@headlessui/react';

const links = [
  {
    label: 'Usage Guide',
    getLink: (tab: EducationCardProps['currentTab']) => {
      return `https://docs.webb.tools/docs/dapps/hubble-bridge/usage-guide/${tab.toLowerCase()}/`;
    },
    Icon: UsageGuideIcon,
  },
  {
    label: 'Getting Started',
    href: 'https://docs.webb.tools/docs/dapps/hubble-bridge/overview/',
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
      title: 'Create Note Account',
      description:
        'Create a Note account and connect it to your MetaMask address to start depositing tokens.',
    },
    {
      title: 'Select Token and Amount',
      description:
        'Choose the token you want to deposit and specify the deposit amount.',
    },
    {
      title: 'Select Desired Chains',
      description: 'Select the source and destination chains for your deposit.',
    },
    {
      title: 'Confirm Deposit',
      description:
        'Review and confirm the details of your deposit before submitting it.',
    },
  ],
  Transfer: [
    {
      title: 'Connect to Destination chain',
      description:
        'Connect to the destination chain with a balance of the shielded token you want to transfer.',
    },
    {
      title: 'Select Token and Amount',
      description:
        'Choose the shielded token you want to transfer and specify the deposit amount.',
    },
    {
      title: 'Enter Public Note Account Key',
      description:
        'Provide the public key for the note account you want to transfer to.',
    },
    {
      title: 'Confirm Transfer',
      description:
        'Review and confirm the details of your transfer before submitting it.',
    },
  ],
  Withdraw: [
    {
      title: 'Connect to Destination chain',
      description:
        'Connect to the destination chain with a balance of the token you want to withdraw.',
    },
    {
      title: 'Specify the Withdrawal Amount',
      description:
        'Choose the amount you want to withdraw. For maximum privacy, we recommend using fixed withdrawal amounts.',
    },
    {
      title: 'Choose a Relayer',
      description:
        'Select a relayer to maximize your privacy and facilitate your transaction.',
    },
    {
      title: 'Confirm Withdraw',
      description:
        'Review and confirm the details of your withdraw before submitting it.',
    },
  ],
};

const commonTransitionClass = cx('transition-all !duration-150');

export const EducationCard = forwardRef<HTMLDivElement, EducationCardProps>(
  ({ currentTab, defaultOpen = true, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    useEffect(() => {
      // Reset the state when the defaultOpen prop changes
      setIsOpen(defaultOpen);
    }, [defaultOpen]);

    return (
      <div className="">
        <div
          {...props}
          className={twMerge(
            'flex flex-row-reverse items-start',
            props.className
          )}
          ref={ref}
        >
          <button
            className="py-2 px-2.5 space-x-1 flex items-center ml-auto"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? (
              <Close size="lg" />
            ) : (
              <>
                <HelpLineIcon size="lg" />

                <Typography component="span" variant="body1" fw="bold">
                  Guide
                </Typography>
              </>
            )}
          </button>

          <Transition
            className={cx(commonTransitionClass, 'origin-top-right')}
            enter={cx('!delay-150')}
            enterFrom={cx('opacity-0 scale-0')}
            enterTo={cx('opacity-100 scale-100')}
            leaveFrom={cx('opacity-100 scale-100')}
            leaveTo={cx('opacity-0 scale-0')}
            show={isOpen}
          >
            <div className="space-y-4">
              <Typography variant="h3" fw="bold">
                Privacy for everyone, everything, everywhere.
              </Typography>

              <div className="flex space-x-9">
                {links.map(({ label, href, getLink, Icon }, idx) => (
                  <Button
                    key={`${label}-${idx}`}
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
                    <div
                      key={`${content.title}-${index}`}
                      className="relative flex items-start"
                    >
                      {/** Vertical line */}
                      <span
                        className={cx(
                          {
                            'absolute w-0.5 h-[calc(100%-16px)]':
                              index !==
                              howItWorksContent[currentTab].length - 1,
                          },
                          {
                            'translate-y-6 translate-x-3 bg-mono-120 dark:bg-mono-100':
                              index !==
                              howItWorksContent[currentTab].length - 1,
                          }
                        )}
                      />

                      <div
                        className={cx(
                          'flex items-center justify-center grow-0 shrink-0 basis-6 h-6 border-2 rounded-full',
                          { 'border-mono-200 dark:border-mono-0': !index },
                          { 'border-mono-120 dark:border-mono-100': index }
                        )}
                      >
                        <Typography
                          component="p"
                          className={cx({
                            'text-mono-120 dark:text-mono-100': index,
                          })}
                          variant="mono2"
                          fw="bold"
                        >
                          {index + 1}
                        </Typography>
                      </div>

                      <div className="max-w-sm ml-2 space-y-1">
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
          </Transition>
        </div>
      </div>
    );
  }
);
