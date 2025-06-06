import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { InfoIconWithTooltip, Typography } from '@tangle-network/ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { FC, useMemo, useState } from 'react';

import { LockFillIcon } from '@tangle-network/icons';
import useBalances from '@tangle-network/tangle-shared-ui/hooks/useBalances';
import LockedBalanceDetailsModal from '../../containers/LockedBalanceDetailsModal';
import useBalanceLocks from '../../data/balances/useBalanceLocks';
import formatTangleBalance from '../../utils/formatTangleBalance';

const Balance: FC = () => {
  const { transferable, locked } = useBalances();
  const { nativeTokenSymbol } = useNetworkStore();
  const { locks } = useBalanceLocks();

  const [isLockedBalanceDetailsModalOpen, setIsLockedBalanceDetailsModalOpen] =
    useState(false);

  const formattedTransferableBalance =
    transferable === null
      ? null
      : formatTangleBalance(transferable, nativeTokenSymbol);

  const parts = formattedTransferableBalance?.split(' ');
  const left = parts?.[0] ?? EMPTY_VALUE_PLACEHOLDER;
  const right = parts?.[1] ?? nativeTokenSymbol;
  const hasLocks = locks !== null && locks.length > 0;

  const formattedLockedBalance = useMemo(() => {
    if (locked === null) {
      return null;
    }

    return formatTangleBalance(locked, nativeTokenSymbol);
  }, [locked, nativeTokenSymbol]);

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

      {hasLocks && formattedLockedBalance !== null && (
        <Typography
          onClick={() => setIsLockedBalanceDetailsModalOpen(true)}
          variant="body1"
          className="!leading-none pb-1 flex items-center gap-1 cursor-pointer dark:hover:text-mono-40 dark:text-mono-100 mt-3"
        >
          <LockFillIcon className="fill-current dark:fill-current" />
          {formattedLockedBalance} locked
        </Typography>
      )}

      <LockedBalanceDetailsModal
        isOpen={isLockedBalanceDetailsModalOpen}
        setIsOpen={setIsLockedBalanceDetailsModalOpen}
      />
    </div>
  );
};

export default Balance;
