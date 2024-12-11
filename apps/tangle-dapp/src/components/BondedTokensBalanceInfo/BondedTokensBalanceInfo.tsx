import { LockUnlockLineIcon, TimeLineIcon } from '@webb-tools/icons';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { Typography } from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import formatTangleBalance from '../../utils/formatTangleBalance';
import { BondedTokensBalanceInfoProps } from './types';

export const BondedTokensBalanceInfo: FC<BondedTokensBalanceInfoProps> = ({
  type,
  value,
}) => {
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
