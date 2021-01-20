import React, { FC } from 'react';

import { AccountId } from '@polkadot/types/interfaces';
import { useAccounts, useCall } from '@webb-dapp/react-hooks';
import { Balance } from '@acala-network/types/interfaces';

import { FormatBalance } from './format';

interface Props {
  currency: string;
  account?: AccountId | string;
}

export const AirDropAmount: FC<Props> = ({ account, currency }) => {
  const { active } = useAccounts();
  const _account = account || (active ? active.address : '');
  const result = useCall('query.airDrop.airDrops', [_account, currency]);

  if (!result) {
    return null;
  }

  return <FormatBalance balance={result as Balance} />;
};
