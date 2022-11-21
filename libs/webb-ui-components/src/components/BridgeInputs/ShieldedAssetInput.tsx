import { getRoundedAmountString } from '../../utils';
import { ChevronRight, TokenIcon } from '@webb-tools/icons';
import { Typography } from '../../typography';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Label } from '../Label';
import { TitleWithInfo } from '../TitleWithInfo';
import { InputWrapper } from './InputWrapper';
import { TokenPair } from '../TokenPair';
import { ShieldedAssetInputComponentProps } from './types';

/**
 * The `ShieldedAssetInput` component
 *
 * Props:
 *
 * - `asset`: The asset type
 *
 * @example
 *
 * ```jsx
 *  <ShieldedAssetInput />
 *  <ShieldedAssetInput asset={{ token1Symbol: 'webb', token2Symbol: 'eth', balance: 2.1, balanceInUsd: 1000 }} />
 * ```
 */

export const ShieldedAssetInput = forwardRef<
  HTMLDivElement,
  ShieldedAssetInputComponentProps
>(({ asset, className, id, info, title = 'Shielded Asset', ...props }, ref) => {
  const [balance, balanceInUsd] = useMemo(() => {
    let balance: string | undefined;
    let balanceInUsd: string | undefined;

    if (asset?.balance) {
      balance = getRoundedAmountString(parseFloat(asset.balance.toString()));
    }

    if (asset?.balanceInUsd) {
      balanceInUsd = getRoundedAmountString(
        parseFloat(asset.balanceInUsd.toString())
      );
    }

    return [balance, balanceInUsd];
  }, [asset]);

  return (
    <InputWrapper
      {...props}
      className={twMerge(cx({ 'items-start': balance }), className)}
      ref={ref}
    >
      <div className="flex flex-col space-y-1">
        <Label htmlFor={id}>
          <TitleWithInfo
            title={title}
            variant="body4"
            info={info}
            titleComponent="span"
            className="text-mono-100 dark:text-mono-80"
            titleClassName="uppercase !text-inherit"
          />
        </Label>

        {asset ? (
          <TokenPair
            token1Symbol={asset.symbol}
            token2Symbol={asset.symbol}
          />
        ) : (
          <Typography variant="body1" fw="bold">
            Select {title}
          </Typography>
        )}
      </div>

      {balance ? (
        <div className="flex flex-col items-end space-y-1">
          <Typography
            variant="body4"
            fw="bold"
            component="span"
            className="uppercase text-mono-100 dark:text-mono-80"
          >
            Balance: {balance} {balanceInUsd ? `≈ $${balanceInUsd}` : ''}
          </Typography>

          <ChevronRight className="inline-block grow" />
        </div>
      ) : (
        <ChevronRight className="inline-block" />
      )}
    </InputWrapper>
  );
});
