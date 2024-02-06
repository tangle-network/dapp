import { BN } from '@polkadot/util';
import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { formatTokenBalance } from '../../constants';

const BalanceCell: FC<{
  amount: BN | null;
}> = ({ amount }) => {
  const formattedBalance =
    amount !== null ? formatTokenBalance(amount, true) : null;

  return (
    <div className="flex flex-col justify-between p-3 gap-6 flex-grow">
      {amount !== null ? (
        <Typography variant="body1" fw="semibold">
          {formattedBalance}
        </Typography>
      ) : (
        <SkeletonLoader className="max-w-[128px]" size="md" />
      )}
    </div>
  );
};

export default BalanceCell;
