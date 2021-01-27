import React, { FC } from 'react';

import { FixedPointNumber } from '@webb-tools/sdk-core';
import { Balance, CurrencyId } from '@webb-tools/types/interfaces';
import { AccountId } from '@polkadot/types/interfaces';

import { useCall, useAccounts, usePrice } from '@webb-dapp/react-hooks';
import { BareProps } from '@webb-dapp/ui-components/types';
import { FormatValue, FormatBalance } from './format';

interface Props extends BareProps {
  account?: AccountId | string;
  currency?: CurrencyId;
  showValue?: boolean;
  showCurrencyName?: boolean;
}

export const UserBalance: FC<Props> = ({
  account,
  className,
  currency,
  showCurrencyName = true,
  showValue = false,
}) => {
  const { active } = useAccounts();
  const _account = account !== undefined ? account : active ? active.address : '';
  // FIXME: need fix api-derive type
  const result = useCall<Balance>('derive.currencies.balance', [_account, currency]);
  const price = usePrice(currency);

  if (!result) return null;

  if (showValue && price) {
    const _value = price.times(new FixedPointNumber(result.toString()));

    return <FormatValue className={className} data={_value} />;
  }

  return (
    <FormatBalance
      balance={FixedPointNumber.fromInner(result.toString())}
      className={className}
      currency={showCurrencyName ? currency : undefined}
    />
  );
};
