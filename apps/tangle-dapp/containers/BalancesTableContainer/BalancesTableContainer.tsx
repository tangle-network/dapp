'use client';

import {
  ChevronDown,
  ChevronUp,
  CoinsStackedLineIcon,
  SendPlanLineIcon,
} from '@webb-tools/icons';
import {
  InfoIconWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useState } from 'react';

import GlassCard from '../../components/GlassCard/GlassCard';
import TangleTokenIcon from '../../components/TangleTokenIcon';
import useNetworkStore from '../../context/useNetworkStore';
import useBalances from '../../data/balances/useBalances';
import useVestingInfo from '../../data/vesting/useVestingInfo';
import useApiRx from '../../hooks/useApiRx';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { StaticSearchQueryPath } from '../../types';
import TransferTxContainer from '../TransferTxContainer/TransferTxContainer';
import BalanceAction from './BalanceAction';
import BalanceCell from './BalanceCell';
import HeaderCell from './HeaderCell';
import LockedBalanceDetails from './LockedBalanceDetails/LockedBalanceDetails';
import useLongestVestingScheduleTime from './useLongestVestingScheduleTime';
import VestBalanceAction from './VestBalanceAction';

const BalancesTableContainer: FC = () => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);

  const { locked, transferable } = useBalances();
  const activeSubstrateAddress = useSubstrateAddress();
  const longestVestingScheduleTime = useLongestVestingScheduleTime();

  const { hasClaimableTokens: hasVestedAmount, claimableAmount: vestedAmount } =
    useVestingInfo();

  const {
    set: setCachedIsDetailsCollapsed,
    valueOpt: cachedIsDetailsCollapsedOpt,
  } = useLocalStorage(
    LocalStorageKey.IS_BALANCES_TABLE_DETAILS_COLLAPSED,
    false,
  );

  const { result: locks } = useApiRx(
    useCallback(
      (api) => {
        if (!activeSubstrateAddress) return null;
        return api.query.balances.locks(activeSubstrateAddress);
      },
      [activeSubstrateAddress],
    ),
  );

  // Load the cached collapsed state from local storage on mount.
  useEffect(() => {
    if (
      cachedIsDetailsCollapsedOpt !== null &&
      cachedIsDetailsCollapsedOpt.value !== null
    ) {
      setIsDetailsCollapsed(cachedIsDetailsCollapsedOpt.value);
    }
  }, [cachedIsDetailsCollapsedOpt]);

  const handleToggleDetails = useCallback(() => {
    setIsDetailsCollapsed((prev) => {
      const newValue = !prev;

      setCachedIsDetailsCollapsed(newValue);

      return newValue;
    });
  }, [setCachedIsDetailsCollapsed]);

  const hasLocks = locks !== null && locks.length > 0;

  return (
    <>
      <GlassCard className="overflow-x-auto">
        <div className="flex flex-row min-w-[630px]">
          {/* Asset column */}
          <div className="flex flex-col justify-between w-full">
            <HeaderCell title="Asset" />

            <AssetCell
              title="Transferable Balance"
              tooltip="The amount of tokens you can freely transfer right now. These tokens are not subject to any limitations."
            />

            {hasVestedAmount && (
              <AssetCell
                title="Claimable Vested Balance"
                tooltip="The amount of tokens that has vested from vesting schedules and is now available to be claimed. This is only a portion of the total vested balance, which can be released, but the rest may still be locked and subject to vesting schedules."
              />
            )}

            <AssetCell
              title="Locked Balance"
              tooltip="The total tokens subject to limitations, such as those locked in staking, democracy participation, or undergoing vesting."
            />
          </div>

          {/* Balance column */}
          <div className="flex flex-col w-full">
            <HeaderCell title="Balance" />

            {/* Transferable balance */}
            <div className="flex flex-row justify-between">
              <BalanceCell amount={transferable} />

              <div className="flex flex-row items-center gap-1 p-3">
                <BalanceAction
                  Icon={SendPlanLineIcon}
                  tooltip="Send"
                  isDisabled={transferable === null || transferable.eqn(0)}
                  onClick={() => setIsTransferModalOpen(true)}
                />

                <BalanceAction
                  Icon={CoinsStackedLineIcon}
                  tooltip="Nominate"
                  isDisabled={transferable === null || transferable.eqn(0)}
                  internalHref={StaticSearchQueryPath.NominationsTable}
                />
              </div>
            </div>

            {/* Vested balance */}
            {hasVestedAmount && (
              <div className="flex flex-row items-center justify-between">
                <BalanceCell
                  status={longestVestingScheduleTime ?? undefined}
                  amount={vestedAmount}
                />

                <div className="p-3">
                  <VestBalanceAction />
                </div>
              </div>
            )}

            {/* Locked balance */}
            <div className="flex flex-row items-center justify-between">
              <BalanceCell amount={locked} />

              {hasLocks && (
                <div className="p-3">
                  <BalanceAction
                    Icon={isDetailsCollapsed ? ChevronDown : ChevronUp}
                    onClick={handleToggleDetails}
                    tooltip={`${
                      isDetailsCollapsed ? 'Show' : 'Collapse'
                    } Details`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {hasLocks && !isDetailsCollapsed && <LockedBalanceDetails />}
      </GlassCard>

      <TransferTxContainer
        isModalOpen={isTransferModalOpen}
        setIsModalOpen={setIsTransferModalOpen}
      />
    </>
  );
};

/** @internal */
const AssetCell: FC<{
  title: string;
  tooltip?: string;
}> = ({ title, tooltip }) => {
  const { nativeTokenSymbol } = useNetworkStore();

  return (
    <div className="flex gap-6 px-3 py-3">
      <div className="flex flex-row items-center gap-1">
        <TangleTokenIcon size="lg" />

        <Typography variant="body1" fw="semibold" className="dark:text-mono-0">
          {nativeTokenSymbol}
        </Typography>
      </div>

      <div className="flex gap-1">
        <Typography variant="body1" fw="semibold" className="whitespace-nowrap">
          {title}
        </Typography>

        {tooltip !== undefined && <InfoIconWithTooltip content={tooltip} />}
      </div>
    </div>
  );
};

export default BalancesTableContainer;
