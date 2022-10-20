import { Chip } from '@webb-dapp/webb-ui-components';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { FC, forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { BridgeLabel, NativeLabel, TransactionCardItemProps } from './types';
type Variant = 'bridge' | 'native';
/**
 *
 * TransactionProgressCard
 * */
export const TransactionProgressCard = forwardRef<HTMLDivElement, TransactionCardItemProps>(
  ({ className, label, method, ...props }, ref) => {
    const labelVariant = useMemo<Variant>(() => ((label as BridgeLabel).tokenURI ? 'bridge' : 'native'), [label]);
    return (
      <div
        className={twMerge(
          `
      px-2 py-4
      flex flex-col space-y-4 max-w-[318px] bg-red-10`,
          className
        )}
        {...props}
        ref={ref}
      >
        {/*Card Header*/}
        <div className={'flex items-center'}>
          <div className={'basis-full'}>
            <Chip>{method}</Chip>
          </div>
          <Typography variant={'body3'} className={'whitespace-nowrap'}>
            JUST NOW
          </Typography>
        </div>
        {/*Card label*/}
        <div></div>
      </div>
    );
  }
);

const NativeLabel: FC<{ label: NativeLabel }> = ({ label }) => {
  const amount = label.amount;
};
