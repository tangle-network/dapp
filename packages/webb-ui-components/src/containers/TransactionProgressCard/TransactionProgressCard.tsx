import OptimismLogo from '@webb-dapp/apps/configs/logos/chains/OptimismLogo';
import PolygonLogo from '@webb-dapp/apps/configs/logos/chains/PolygonLogo';
import { Avatar, Chip } from '@webb-dapp/webb-ui-components';
import { ArrowLeft, ArrowRight, TokenIcon } from '@webb-dapp/webb-ui-components/icons';
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
          `rounded-b-lg shadow-xl py-4  px-4
border-t-4 border-indigo-500
       flex flex-col space-y-4 max-w-[318px] dark:bg-mono-160`,
          className
        )}
        {...props}
        ref={ref}
      >
        {/*Card Header*/}
        <div className={'my-0 flex items-center'}>
          <div className={'basis-full'}>
            <Chip>{method}</Chip>
          </div>
          <Typography fw={'bold'} variant={'body3'} className={'whitespace-nowrap'}>
            JUST NOW
          </Typography>
        </div>
        {/*Card Content*/}
        <div className={'my-0 flex items-center'}>
          <div className={'h-full self-start py-2'}>
            <TokenIcon size={'lg'} name={'ETH'} />
          </div>
          <div className={'px-2'}>
            <Typography
              variant={'h4'}
              fw={'bold'}
              className={'py-0'}
              style={{
                color: '#000000',
              }}
            >
              0.990
            </Typography>
            <Typography
              style={{
                color: '#000000',
              }}
              fw={'bold'}
              className={'py-0'}
              variant={'body2'}
            >
              1789.12 USD
            </Typography>
          </div>
          <div className={'h-full self-start py-2 flex items-center'}>
            <div className={`w-6  h-6 rounded-full flex items-center justify-center`} children={<PolygonLogo />} />
            <ArrowRight />
            <div className={`w-6  h-6 rounded-full flex items-center justify-center`} children={<OptimismLogo />} />
          </div>
        </div>
        <div></div>
        {/*Card Info*/}
        {/*Card Footer*/}
      </div>
    );
  }
);

const NativeTokenLabel: FC<{ label: NativeLabel }> = ({ label }) => {
  const amount = label.amount;
};
