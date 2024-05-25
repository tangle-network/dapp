import { InformationLine } from '@webb-tools/icons';
import {
  Button,
  IconWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { LiquidStakingToken } from '../../../constants/liquidStaking';
import LiquidStakingInput from './LiquidStakingInput';

const LiquidStakingCard: FC = () => {
  return (
    <div className="w-full max-w-[650px] space-y-4 dark:bg-mono-190 rounded-lg p-9">
      <div className="flex gap-3">
        <Typography className="dark:text-mono-0" variant="h4" fw="bold">
          Stake
        </Typography>

        <Typography className="dark:text-mono-100" variant="h4" fw="bold">
          Unstake
        </Typography>
      </div>

      <LiquidStakingInput
        id="liquid-staking-from"
        selectedToken={LiquidStakingToken.Polkadot}
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3 dark:bg-mono-180 rounded-lg">
        <DetailItem
          title="Rate"
          tooltip="This is a test."
          value="1 DOT = 0.982007 tgDOT"
        />

        <DetailItem
          title="Cross-chain fee"
          tooltip="This is a test."
          value="0.19842 TNT"
        />

        <DetailItem
          title="Unstake period"
          tooltip="This is a test."
          value="7 days"
        />
      </div>

      <Button isFullWidth>Stake</Button>
    </div>
  );
};

type DetailItemProps = {
  title: string;
  tooltip?: string;
  value: string;
};

/** @internal */
const DetailItem: FC<DetailItemProps> = ({ title, tooltip, value }) => {
  return (
    <div className="flex gap-2 justify-between w-full">
      <div className="flex items-center gap-1">
        <Typography variant="body1" fw="bold">
          {title}
        </Typography>

        {tooltip !== undefined && (
          <IconWithTooltip
            icon={
              <InformationLine className="fill-mono-140 dark:fill-mono-100" />
            }
            content={tooltip}
            overrideTooltipBodyProps={{
              className: 'max-w-[350px]',
            }}
          />
        )}
      </div>

      <Typography className="dark:text-mono-0" variant="body1" fw="bold">
        {value}
      </Typography>
    </div>
  );
};

export default LiquidStakingCard;
