import { BN } from '@polkadot/util';
import {
  HiddenValue,
  SkeletonLoader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { formatTokenBalance } from '../../utils/polkadot/tokens';

const BalanceCell: FC<{
  amount: BN | null;
}> = ({ amount }) => {
  const activeAccountAddress = useActiveAccountAddress();
  const isAccountActive = activeAccountAddress !== null;

  const formattedBalance =
    amount !== null ? formatTokenBalance(amount, true) : null;

  return (
    <div className="flex flex-col justify-center p-3 gap-6 flex-grow">
      {formattedBalance !== null ? (
        // If the balance is not null, display it.
        <Typography variant="body1" fw="semibold">
          <HiddenValue>{formattedBalance}</HiddenValue>
        </Typography>
      ) : isAccountActive ? (
        // If there is an active account, but the balance is null,
        // it means that the balance is still loading.
        <SkeletonLoader className="max-w-[128px]" size="md" />
      ) : (
        // If there is no active account, show a placeholder value.
        <Typography variant="body1" fw="semibold">
          --
        </Typography>
      )}
    </div>
  );
};

export default BalanceCell;
