'use client';

import { BN } from '@polkadot/util';
import {
  ChevronDown,
  ChevronUp,
  CoinIcon,
  SendPlanLineIcon,
  TangleIcon,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import {
  Chip,
  IconButton,
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, JSX, useState } from 'react';

import GlassCard from '../../components/GlassCard/GlassCard';
import useAccountBalances from '../../hooks/useAccountBalances';
import useFormattedBalance from '../../hooks/useFormattedBalance';

const BalancesTableContainer: FC = () => {
  const balances = useAccountBalances();
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);

  return (
    <GlassCard className="overflow-x-auto">
      <div className="flex flex-row">
        {/* Asset column */}
        <div className="flex flex-col w-full">
          <HeaderRow title="Asset" />

          <AssetRow title="Free Balance" />

          <AssetRow title="Locked Balance" />
        </div>

        {/* Balance column */}
        <div className="flex flex-col w-full">
          <HeaderRow title="Balance" />

          {/* Free balance */}
          <div className="flex flex-row justify-between">
            <BalanceRow amount={balances?.free ?? null} />

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
            <BalanceRow amount={balances?.locked ?? null} />

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
const HeaderRow: FC<{ title: string }> = ({ title }) => {
  return (
    <Typography
      variant="body1"
      fw="semibold"
      className="border-b dark:border-mono-140 px-3 pb-3 capitalize whitespace-nowrap"
    >
      {title}
    </Typography>
  );
};

/** @internal */
const AssetRow: FC<{
  title: string;
}> = ({ title }) => {
  return (
    <div className="flex px-3 py-3 gap-6">
      <div className="flex flex-row items-center gap-1">
        <div className="bg-mono-40 dark:bg-mono-0 p-1 rounded-full">
          <TangleIcon />
        </div>

        <Typography variant="body1" fw="semibold" className="dark:text-mono-0">
          TNT
        </Typography>
      </div>

      <Typography variant="body1" fw="semibold" className="whitespace-nowrap">
        {title}
      </Typography>
    </div>
  );
};

/** @internal */
const BalanceRow: FC<{
  amount: BN | null;
}> = ({ amount }) => {
  const formattedBalance = useFormattedBalance(amount, true);

  return (
    <div className="flex flex-col justify-between px-3 py-3 gap-6">
      {amount !== null ? (
        <Typography variant="body1" fw="semibold">
          {formattedBalance}
        </Typography>
      ) : (
        <SkeletonLoader size="md" />
      )}
    </div>
  );
};

/** @internal */
const LockedBalanceDetails: FC = () => {
  return (
    <div className="flex flex-row dark:bg-mono-180 px-3 py-2 rounded-lg">
      <div className="flex flex-row w-full">
        {/* Type column */}
        <div className="flex flex-col gap-6 w-full">
          <HeaderRow title="Type" />

          <SmallChip title="Vesting" />

          <SmallChip title="Democracy" />

          <SmallChip title="Nomination" />
        </div>

        {/* Unlock details column */}
        <div className="flex flex-col gap-6 w-full">
          <HeaderRow title="Unlocks At" />

          <BalanceRow amount={null} />

          <BalanceRow amount={null} />

          <BalanceRow amount={null} />
        </div>
      </div>

      {/* Balance column */}
      <div className="flex flex-col gap-6 w-full">
        <HeaderRow title="Balance" />

        <div className="flex flex-row justify-between">
          <BalanceRow amount={null} />

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

        <BalanceRow amount={null} />

        <BalanceRow amount={null} />
      </div>
    </div>
  );
};

/** @internal */
const SmallChip: FC<{ title: string }> = ({ title }) => {
  return (
    <Chip className="!inline rounded-[50px]" color="purple">
      <Typography
        variant="body2"
        fw="semibold"
        className="uppercase text-purple-50 dark:text-purple-50"
      >
        {title}
      </Typography>
    </Chip>
  );
};

/** @internal */
const BalanceAction: FC<{
  tooltip: string;
  onClick: () => void;
  Icon: (props: IconBase) => JSX.Element;
}> = ({ tooltip, Icon, onClick }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <IconButton onClick={onClick}>
          <Icon size="md" />
        </IconButton>
      </TooltipTrigger>

      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  );
};

export default BalancesTableContainer;
