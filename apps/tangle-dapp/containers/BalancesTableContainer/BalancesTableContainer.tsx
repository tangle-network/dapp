'use client';

import {
  ChevronDown,
  ChevronUp,
  CoinIcon,
  SendPlanLineIcon,
  TangleIcon,
} from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC, useEffect, useState } from 'react';

import { InfoIconWithTooltip } from '../../components';
import GlassCard from '../../components/GlassCard/GlassCard';
import { TANGLE_TOKEN_UNIT } from '../../constants';
import useAccountBalances from '../../hooks/useAccountBalances';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import BalanceAction from './BalanceAction';
import BalanceCell from './BalanceCell';
import LockedBalanceDetails from './LockedBalanceDetails';

const BalancesTableContainer: FC = () => {
  const { transferrable, locked } = useAccountBalances();

  const { value: isDetailsCollapsedCached, set: setIsDetailsCollapsedCached } =
    useLocalStorage(LocalStorageKey.IsBalancesTableDetailsCollapsed, false);

  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(
    isDetailsCollapsedCached ?? false
  );

  // Cache the collapsed state to local storage when it changes.
  useEffect(() => {
    setIsDetailsCollapsedCached(isDetailsCollapsed);
  }, [isDetailsCollapsed, setIsDetailsCollapsedCached]);

  return (
    <GlassCard className="overflow-x-auto">
      <div className="flex flex-row">
        {/* Asset column */}
        <div className="flex flex-col w-full">
          <HeaderCell title="Asset" />

          <AssetCell
            title="Transferrable Balance"
            tooltip="The amount of tokens you can freely transfer right now."
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

            <div className="flex flex-row gap-1">
              <BalanceAction
                Icon={SendPlanLineIcon}
                tooltip="Send"
                onClick={() => void 0}
              />

              <BalanceAction
                Icon={CoinIcon}
                tooltip="Nominate"
                onClick={() => void 0}
              />
            </div>
          </div>

          {/* Locked balance */}
          <div className="flex flex-row justify-between">
            <BalanceCell amount={locked} />

            {/* TODO: Do not show this action if there are no locks whatsoever. */}
            <BalanceAction
              Icon={isDetailsCollapsed ? ChevronDown : ChevronUp}
              tooltip={`${isDetailsCollapsed ? 'Show' : 'Collapse'} Details`}
              onClick={() => setIsDetailsCollapsed((previous) => !previous)}
            />
          </div>
        </div>
      </div>

      {!isDetailsCollapsed && <LockedBalanceDetails />}
    </GlassCard>
  );
};

/** @internal */
const HeaderCell: FC<{ title: string }> = ({ title }) => {
  return (
    <Typography
      variant="body1"
      fw="semibold"
      className="block border-b dark:border-mono-140 px-3 pb-3 capitalize whitespace-nowrap"
    >
      {title}
    </Typography>
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
          <InfoIconWithTooltip
            content={<span className="block text-center">{tooltip}</span>}
          />
        )}
      </div>
    </div>
  );
};

export default BalancesTableContainer;
