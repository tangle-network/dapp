import { BN } from '@polkadot/util';
import { TangleIcon } from '@webb-tools/icons';
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
import { FC, JSX } from 'react';

import GlassCard from '../../components/GlassCard/GlassCard';

const BalancesTableContainer: FC = () => {
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

          <BalanceRow amount={new BN(250)} />

          <BalanceRow amount={new BN(5)} />

          <BalanceRow amount={null} />
        </div>
      </div>

      <LockedBalanceDetails />
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
        <div className="dark:bg-mono-0 p-1 rounded-full">
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
  // TODO: Use chain token constant or fetch it.

  return (
    <div className="flex px-3 py-3 gap-6">
      {amount !== null ? (
        <Typography variant="body1" fw="semibold">
          {amount.toString()} TNT
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

      {/* Balance column */}
      <div className="flex flex-col gap-6 w-full">
        <HeaderRow title="Balance" />

        <BalanceRow amount={null} />

        <BalanceRow amount={null} />

        <BalanceRow amount={null} />
      </div>
    </div>
  );
};

/** @internal */
const SmallChip: FC<{ title: string }> = ({ title }) => {
  return (
    <Chip className="!inline" color="purple">
      <Typography variant="body2" fw="semibold" className="uppercase">
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
          <Icon size="lg" />
        </IconButton>
      </TooltipTrigger>

      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  );
};

export default BalancesTableContainer;
