import { InformationLine } from '@webb-tools/icons';
import { FC, forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography';
import { DisclaimerProps, DisclaimerVariant } from './types';

function getColors(variant: DisclaimerVariant) {
  switch (variant) {
    case 'info':
      return {
        main: `border border-blue-70 bg-blue-10 text-blue-70 dark:bg-blue-120 dark:border-blue-120`,
        text: `text-blue-70 dark:text-blue-50`,
      };
    case 'error':
      return {
        main: `border border-red-70 bg-red-10 text-red-70 dark:bg-red-120 dark:border-red-120`,
        text: `text-red-70 dark:text-red-50`,
      };
    case 'warning':
      return {
        main: `border border-yellow-70 bg-yellow-10 text-yellow-70 dark:bg-yellow-120 dark:border-yellow-120`,
        text: `text-yellow-70 dark:text-yellow-50`,
      };
    case 'success':
      return {
        main: `border border-green-70 bg-green-10 text-green-70 dark:bg-green-120 dark:border-green-120`,
        text: `text-green-70 dark:text-green-50`,
      };
  }
}
export const Disclaimer: FC<DisclaimerProps> = forwardRef<
  HTMLDivElement,
  DisclaimerProps
>(({ message, variant, className, ...props }, ref) => {
  const { main, text } = useMemo(() => {
    return getColors(variant);
  }, [variant]);

  const disclaimerWrapperClasses = useMemo(() => {
    return twMerge(main, 'rounded-xl px-3 py-2  flex items-stretch');
  }, [main]);

  return (
    <div
      className={twMerge(disclaimerWrapperClasses, className)}
      {...props}
      ref={ref}
    >
      <div className={text}>
        <InformationLine className="!fill-current pointer-events-none" />
      </div>
      <div className={'px-2'}>
        <Typography variant={'body4'} fw={'semibold'} className={text}>
          {message}
        </Typography>
      </div>
    </div>
  );
});
