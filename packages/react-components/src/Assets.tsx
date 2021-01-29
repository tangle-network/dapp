import React, { FC, useMemo } from 'react';

import { AccountId } from '@polkadot/types/interfaces';
import { CurrencyId } from '@webb-tools/types/interfaces';

import { useBalance, useValue, useTotalValue, usePrice } from '@webb-dapp/react-hooks';

import { FormatBalance, FormatBalanceProps, FormatValue, FormatNumberProps } from './format';
import { AccountLike } from '@webb-dapp/react-hooks/types';
import { BareProps } from '@webb-dapp/ui-components/types';
import { FixedPointNumber } from '@webb-tools/sdk-core';

interface UserAssetBalanceProps extends FormatBalanceProps {
  account?: AccountLike;
  currency: CurrencyId;
  showCurrency?: boolean;
}

/**
 * @name UserAssetBalance
 * @description display user asset balance
 */
export const UserAssetBalance: FC<UserAssetBalanceProps> = ({ account, currency, showCurrency, ...other }) => {
  const balance = useBalance(currency, account);

  if (!balance) {
    return null;
  }

  return <FormatBalance balance={balance} currency={showCurrency ? currency : undefined} {...other} />;
};

interface UserAssetValueProps extends BareProps {
  account?: AccountId | string;
  currency: CurrencyId;
}

/**
 * @name UserAssetValue
 * @description display user asset amount in USD
 */
export const UserAssetValue: FC<UserAssetValueProps> = ({ account, className, currency }) => {
  const amount = useValue(currency, account);

  return <FormatValue className={className} data={amount || FixedPointNumber.ZERO} />;
};

export interface TotalUserAssetValueProps extends BareProps {
  account?: AccountId | string;
}

/**
 * @name TotalUserAssetValue
 * @description display the total asset amount in USD
 */
export const TotalUserAssetValue: FC<TotalUserAssetValueProps> = ({ account, className }) => {
  const amount = useTotalValue(account);

  return <FormatValue className={className} data={amount} />;
};

export interface AssetValueProps extends FormatNumberProps {
  quantity: FixedPointNumber;
  currency: CurrencyId;
}

export const AssetValue: FC<AssetValueProps> = ({ currency, quantity, ...other }) => {
  const price = usePrice(currency);
  const result = useMemo(() => {
    if (!price || !quantity) return FixedPointNumber.ZERO;

    return quantity.times(price);
  }, [price, quantity]);

  return <FormatValue data={result} {...other} />;
};
