import { BN } from '@polkadot/util';
import StatusIndicator from '@tangle-network/icons/StatusIndicator';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  HiddenValue,
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@tangle-network/ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { FC, ReactNode } from 'react';

import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import formatTangleBalance from '../../utils/formatTangleBalance';

const BalanceCell: FC<{
  amount: BN | null;
  status?: ReactNode;
}> = ({ amount, status }) => {
  const activeAccountAddress = useActiveAccountAddress();
  const isAccountActive = activeAccountAddress !== null;
  const { nativeTokenSymbol } = useNetworkStore();

  const formattedBalance =
    amount !== null ? formatTangleBalance(amount, nativeTokenSymbol) : null;

  return (
    <div className="flex flex-row gap-2 p-3">
      {formattedBalance !== null ? (
        // If the balance is not null, display it.
        <Typography variant="h5" className="text-mono-160 dark:text-mono-80">
          <HiddenValue numberOfStars={4}>{formattedBalance}</HiddenValue>
        </Typography>
      ) : isAccountActive ? (
        // If there is an active account, but the balance is null,
        // it means that the balance is still loading.
        <SkeletonLoader className="max-w-[128px]" size="md" />
      ) : (
        // If there is no active account, show a placeholder value.
        <Typography variant="h5" className="text-mono-160 dark:text-mono-80">
          {EMPTY_VALUE_PLACEHOLDER}
        </Typography>
      )}

      {status !== undefined && (
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <StatusIndicator size={12} variant="info" />
          </TooltipTrigger>

          <TooltipBody>{status}</TooltipBody>
        </Tooltip>
      )}
    </div>
  );
};

export default BalanceCell;
