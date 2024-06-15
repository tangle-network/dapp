import { LockUnlockLineIcon, TimeLineIcon } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import formatTangleAmount from '../../utils/formatTangleAmount';
import { BondedTokensBalanceInfoProps } from './types';

export const BondedTokensBalanceInfo: FC<BondedTokensBalanceInfoProps> = ({
  type,
  value,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-1 items-center">
        {type === 'unbonded' ? <LockUnlockLineIcon /> : <TimeLineIcon />}

        <Typography variant="body1" fw="normal">
          {type === 'unbonded' ? 'Unbonded:' : 'Unbonding:'}
        </Typography>
      </div>

      <Typography variant="body1" fw="normal">
        {formatTangleAmount(value, nativeTokenSymbol)}
      </Typography>
    </div>
  );
};
