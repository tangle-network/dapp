import {
  AmountInput,
  BridgeInputGroup,
  Button,
  FixedAmount,
  InfoItem,
  RecipientInput,
  RelayerInput,
  ShieldedAssetInput,
  Switcher,
  TokenInput,
} from '@webb-dapp/webb-ui-components/components';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { AmountMenu } from './AmountMenu';
import { WithdrawCardProps } from './types';

export const WithdrawCard = forwardRef<HTMLDivElement, WithdrawCardProps>(({ className, ...props }, ref) => {
  return (
    <div {...props} className={twMerge('flex flex-col space-y-4 max-w-[518px]', className)} ref={ref}>
      <BridgeInputGroup className='flex flex-col space-y-2'>
        <div className='flex space-x-2'>
          <ShieldedAssetInput title='Bridging Asset' info='Bridging Asset' className='grow shrink-0 basis-1' />

          <TokenInput className='grow shrink-0 basis-1' title='Unwrapping Asset' info='Unwrapping Asset' />
        </div>

        <div className='self-end py-1 space-x-2'>
          <Typography component='span' variant='body3' fw='bold' className='text-mono-100 dark:text-mono-80'>
            Unwrap
          </Typography>

          <Switcher />
        </div>

        <FixedAmount values={[0.1, 0.25, 0.5, 1]} info={<AmountMenu selected='fixed' />} />

        <AmountInput info={<AmountMenu selected='custom' />} />
      </BridgeInputGroup>

      <BridgeInputGroup className='flex flex-col space-y-2'>
        <RelayerInput />

        <RecipientInput />
      </BridgeInputGroup>

      {/** Info */}
      <div className='flex flex-col space-y-1'>
        <InfoItem
          leftTextProps={{
            title: 'Receiving',
            variant: 'utility',
            info: 'Receiving',
          }}
        />

        <InfoItem
          leftTextProps={{
            title: 'Remainder',
            variant: 'utility',
            info: 'Remainder',
          }}
        />

        <InfoItem
          leftTextProps={{
            title: `Fees`,
            variant: 'utility',
            info: 'Fees',
          }}
        />
      </div>

      <Button isFullWidth className={twMerge('justify-center')}>
        Withdraw
      </Button>
    </div>
  );
});
