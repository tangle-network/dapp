import { AlertVariant } from '@webb-dapp/ui-components/AlertCard/types';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import React, { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { InformationLine } from '@webb-dapp/webb-ui-components/icons';

type DisclaimerVariant = AlertVariant;
type DisclaimerWrapperProps = {
  bgColor: string;
  textColor: string;
  borderColor: string;
};

export const Disclaimer: FC<{
  message: string;
  variant: DisclaimerVariant;
}> = ({ message, variant }) => {
  const colorName = useMemo(() => {
    switch (variant) {
      case 'info':
        return 'blue';
      case 'error':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'success':
        return 'green';
    }
  }, [variant]);

  const disclaimerWrapperClasses = useMemo(() => {
    const color = `border border-${colorName}-70 bg-${colorName}-10 text-${colorName}-70 dark:bg-${colorName}-120 dark:border-${colorName}-120`;
    return twMerge(color, 'rounded-xl px-3 py-2  flex items-stretch');
  }, [colorName]);

  return (
    <div className={disclaimerWrapperClasses}>
      <div className={`text-${colorName}-70 dark:text-${colorName}-50`}>
        <InformationLine className='!fill-current pointer-events-none' />
      </div>
      <div className={'px-2'}>
        <Typography variant={'body4'} fw={'semibold'} className={`text-${colorName}-100 dark:text-${colorName}-50`}>
          {message}
        </Typography>
      </div>
    </div>
  );
};
