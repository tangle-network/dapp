import { LockUnlockLineIcon, TimeLineIcon } from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { Typography } from '@tangle-network/ui-components';
import { type FC } from 'react';

import formatTangleBalance from '../utils/formatTangleBalance';
import { BN } from '@polkadot/util';

type Props = {
  type: 'unbonded' | 'unbonding';
  value: BN;
};

export const BondedTokensBalanceInfo: FC<Props> = ({ type, value }) => {
  const { nativeTokenSymbol } = useNetworkStore();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {type === 'unbonded' ? <LockUnlockLineIcon /> : <TimeLineIcon />}

        <Typography variant="body1" fw="normal">
          {type === 'unbonded' ? 'Unbonded:' : 'Unbonding:'}
        </Typography>
      </div>

      <Typography variant="body1" fw="normal">
        {formatTangleBalance(value, nativeTokenSymbol)}
      </Typography>
    </div>
  );
};
