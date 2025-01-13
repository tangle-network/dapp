'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { ComponentProps, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export const TabsListWithAnimation = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof Tabs.List>
>(({ className, ...props }, ref) => {
  return (
    <Tabs.List
      {...props}
      className={twMerge(
        'flex items-center flex-wrap bg-mono-20 dark:bg-mono-180 rounded-xl p-1',
        className,
      )}
      ref={ref}
    />
  );
});

type TabsTriggerWithAnimationProps = ComponentProps<typeof Tabs.Trigger> & {
  isActive: boolean;
  hideSeparator?: boolean;
};

export const TabsTriggerWithAnimation = forwardRef<
  HTMLButtonElement,
  TabsTriggerWithAnimationProps
>(({ className, hideSeparator, children, isActive, ...props }, ref) => {
  return (
    <Tabs.Trigger
      {...props}
      className={twMerge(
        'relative flex-1 min-h-[45px] border-x border-transparent',
        "after:content-[''] after:w-[1px] after:h-7",
        'after:absolute after:-right-[1.5px] after:top-1/2 after:-translate-y-1/2',
        'after:bg-mono-60 dark:after:bg-mono-170',
        'last:after:hidden',
        (isActive || hideSeparator) && 'after:hidden',
        className,
      )}
      ref={ref}
    >
      {isActive && (
        <motion.span
          layoutId="bubble"
          className="absolute inset-0 rounded-lg bg-mono-0 dark:bg-blue-120"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}

      <span
        className={twMerge(
          'absolute inset-0 body1 p-2 text-center',
          isActive && 'font-bold',
          isActive
            ? 'text-mono-200 dark:text-blue-50'
            : 'text-mono-120 dark:text-mono-80',
        )}
      >
        {children}
      </span>
    </Tabs.Trigger>
  );
});
