import { BN } from '@polkadot/util';
import StatusIndicator from '@webb-tools/icons/StatusIndicator';
import {
  HiddenValue,
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, ReactNode } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { formatTokenBalance } from '../../utils/polkadot/tokens';

const BalanceCell: FC<{
  amount: BN | null;
  status?: ReactNode;
}> = ({ amount, status }) => {
  const activeAccountAddress = useActiveAccountAddress();
  const isAccountActive = activeAccountAddress !== null;
  const { nativeTokenSymbol } = useNetworkStore();

  const formattedBalance =
    amount !== null ? formatTokenBalance(amount, nativeTokenSymbol) : null;

  return (
    <div className="flex flex-row p-3 gap-2">
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

      {status !== undefined && (
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <StatusIndicator size={12} variant="info" />
          </TooltipTrigger>

          <TooltipBody className="break-normal max-w-[250px] text-center">
            {status}
          </TooltipBody>
        </Tooltip>
      )}
    </div>
  );
};

export default BalanceCell;
