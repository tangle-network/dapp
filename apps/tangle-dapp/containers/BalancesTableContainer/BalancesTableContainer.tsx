'use client';

import {
  ChevronDown,
  ChevronUp,
  CoinsStackedLineIcon,
  SendPlanLineIcon,
  TangleIcon,
} from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC, useEffect, useState } from 'react';

import { InfoIconWithTooltip } from '../../components';
import GlassCard from '../../components/GlassCard/GlassCard';
import { TANGLE_TOKEN_UNIT } from '../../constants';
import useBalances from '../../data/balances/useBalances';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import { StaticSearchQueryPath } from '../../types';
import TransferTxContainer from '../TransferTxContainer/TransferTxContainer';
import BalanceAction from './BalanceAction';
import BalanceCell from './BalanceCell';
import HeaderCell from './HeaderCell';
import LockedBalanceDetails from './LockedBalanceDetails';

const BalancesTableContainer: FC = () => {
  const { transferrable, locked } = useBalances();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const { value: isDetailsCollapsedCached, set: setIsDetailsCollapsedCached } =
    useLocalStorage(LocalStorageKey.IS_BALANCES_TABLE_DETAILS_COLLAPSED, false);

  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(
    isDetailsCollapsedCached ?? false
  );

  // Cache the collapsed state to local storage when it changes.
  useEffect(() => {
    setIsDetailsCollapsedCached(isDetailsCollapsed);
  }, [isDetailsCollapsed, setIsDetailsCollapsedCached]);

  const { data: locks } = usePolkadotApiRx((api, activeSubstrateAddress) =>
    api.query.balances.locks(activeSubstrateAddress)
  );

  const hasLocks = locks !== null && locks.length > 0;

  return (
    <>
      <GlassCard className="overflow-x-auto">
        <div className="flex flex-row min-w-[630px]">
          {/* Asset column */}
          <div className="flex flex-col w-full justify-between">
            <HeaderCell title="Asset" />

            <AssetCell
              title="Transferrable Balance"
              tooltip="The amount of tokens you can freely transfer right now. These tokens are not subject to any limitations."
            />

            <AssetCell
              title="Locked Balance"
              tooltip="The total tokens subject to limitations, such as those locked in staking, democracy participation, or undergoing vesting. You might not have full access to these tokens at the moment."
            />
          </div>

          {/* Balance column */}
          <div className="flex flex-col w-full">
            <HeaderCell title="Balance" />

            {/* Transferrable balance */}
            <div className="flex flex-row justify-between">
              <BalanceCell amount={transferrable} />

              <div className="flex flex-row gap-1 items-center p-3">
                <BalanceAction
                  Icon={SendPlanLineIcon}
                  tooltip="Send"
                  isDisabled={transferrable === null || transferrable.eqn(0)}
                  onClick={() => setIsTransferModalOpen(true)}
                />

                <BalanceAction
                  Icon={CoinsStackedLineIcon}
                  tooltip="Nominate"
                  isDisabled={transferrable === null || transferrable.eqn(0)}
                  internalHref={StaticSearchQueryPath.NominationsTable}
                />
              </div>
            </div>

            {/* Locked balance */}
            <div className="flex flex-row justify-between items-center">
              <BalanceCell amount={locked} />

              {hasLocks && (
                <div className="p-3">
                  <BalanceAction
                    Icon={isDetailsCollapsed ? ChevronDown : ChevronUp}
                    onClick={() =>
                      setIsDetailsCollapsed((previous) => !previous)
                    }
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
  return (
    <div className="flex px-3 py-3 gap-6">
      <div className="flex flex-row items-center gap-1">
        <div className="bg-mono-40 dark:bg-mono-0 p-1 rounded-full">
          <TangleIcon />
        </div>

        <Typography variant="body1" fw="semibold" className="dark:text-mono-0">
          {TANGLE_TOKEN_UNIT}
        </Typography>
      </div>

      <div className="flex gap-1">
        <Typography variant="body1" fw="semibold" className="whitespace-nowrap">
          {title}
        </Typography>

        {tooltip !== undefined && (
          <InfoIconWithTooltip content={<>{tooltip}</>} />
        )}
      </div>
    </div>
  );
};

export default BalancesTableContainer;
