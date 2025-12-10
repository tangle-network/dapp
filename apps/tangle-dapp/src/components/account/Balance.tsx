import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { InfoIconWithTooltip, Typography } from '@tangle-network/ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { FC } from 'react';

import useBalances from '@tangle-network/tangle-shared-ui/hooks/useBalances';
import formatTangleBalance from '../../utils/formatTangleBalance';

const Balance: FC = () => {
  const { transferable } = useBalances();
  const { nativeTokenSymbol } = useNetworkStore();

  const formattedTransferableBalance =
    transferable === null
      ? null
      : formatTangleBalance(transferable, nativeTokenSymbol);

  const parts = formattedTransferableBalance?.split(' ');
  const left = parts?.[0] ?? EMPTY_VALUE_PLACEHOLDER;
  const right = parts?.[1] ?? nativeTokenSymbol;

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-1 sm:mr-auto">
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Transferable Balance
        </Typography>

        <InfoIconWithTooltip content="The amount that can be freely transferred to other accounts and that isn't subject to any locks." />
      </div>

      <div className="flex items-end gap-2 py-2">
        <Typography variant="h2" fw="bold" className="!leading-none">
          {left}
        </Typography>

        <Typography variant="h4" className="!leading-none pb-1 flex gap-2">
          {right}
        </Typography>
      </div>
    </div>
  );
};

export default Balance;
