import { useAccounts, useCall } from '@webb-dapp/react-hooks';
import { BareProps } from '@webb-dapp/ui-components/types';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { Balance, CurrencyId } from '@webb-tools/types/interfaces';
import React, { FC } from 'react';

import { AccountId } from '@polkadot/types/interfaces';

import { FormatBalance, FormatValue } from './format';

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
  console.log('Account', _account);
  const result = useCall<Balance>('derive.balances.all', [_account]);

  if (!result) return null;
  return (
    <FormatBalance
      balance={FixedPointNumber.fromInner(result.freeBalance)}
      className={className}
      currency={showCurrencyName ? currency : undefined}
    />
  );
};
