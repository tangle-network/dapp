import { ChevronRight, TokenIcon } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { getRoundedAmountString } from '@webb-dapp/webb-ui-components/utils';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Label } from '../Label';
import { TitleWithInfo } from '../TitleWithInfo';
import { InputWrapper } from './InputWrapper';
import { ShieldedAssetInputProps } from './types';

export const ShieldedAssetInput = forwardRef<HTMLDivElement, ShieldedAssetInputProps>(
  ({ asset, className, id, info, ...props }, ref) => {
    const [balance, balanceInUsd] = useMemo(() => {
      let balance: string | undefined;
      let balanceInUsd: string | undefined;

      if (asset?.balance) {
        balance = getRoundedAmountString(parseFloat(asset.balance.toString()));
      }

      if (asset?.balanceInUsd) {
        balanceInUsd = getRoundedAmountString(parseFloat(asset.balanceInUsd.toString()));
      }

      return [balance, balanceInUsd];
    }, [asset]);

    return (
      <InputWrapper {...props} className={twMerge(cx({ 'items-start': balance }), className)} ref={ref}>
        <div className='flex flex-col space-y-1'>
          <Label htmlFor={id}>
            <TitleWithInfo
              title='Shielded Asset'
              variant='body4'
              info={info}
              titleComponent='span'
              className='text-mono-100 dark:text-mono-80'
              titleClassName='uppercase !text-inherit'
            />
          </Label>

          {asset ? (
            <div className='flex items-center space-x-1'>
              <div className='flex items-center -space-x-2'>
                <TokenIcon size='lg' name={asset.token1Symbol.toLowerCase()} />
                <TokenIcon size='lg' name={asset.token2Symbol.toLowerCase()} />
              </div>

              <Typography component='span' variant='body1' fw='bold'>
                {asset.token1Symbol.toUpperCase()}/{asset.token2Symbol.toUpperCase()}
              </Typography>
            </div>
          ) : (
            <Typography variant='body1' fw='bold'>
              Select Shielded Asset
            </Typography>
          )}
        </div>

        {balance ? (
          <div className='flex flex-col items-end space-y-1'>
            <Typography
              variant='body4'
              fw='bold'
              component='span'
              className='uppercase text-mono-100 dark:text-mono-80'
            >
              Balance: {balance} {balanceInUsd ? `≈ $${balanceInUsd}` : ''}
            </Typography>

            <ChevronRight className='inline-block grow' />
          </div>
        ) : (
          <ChevronRight className='inline-block' />
        )}
      </InputWrapper>
    );
  }
);
