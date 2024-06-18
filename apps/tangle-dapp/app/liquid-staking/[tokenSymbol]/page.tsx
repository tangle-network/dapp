import {
  ArrowRightUp,
  ExternalLinkLine,
  InformationLine,
} from '@webb-tools/icons';
import {
  Button,
  IconWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import { GlassCard } from '../../../components';
import { LiquidStakingToken } from '../../../constants/liquidStaking';
import LiquidStakingCard from './LiquidStakingCard';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  const possibleTokens = Object.values(LiquidStakingToken).map((value) =>
    value.toString(),
  );

  // Invalid token provided on the URL parameters.
  if (!possibleTokens.includes(tokenSymbol)) {
    return notFound();
  }

  return (
    <div className="flex flex-wrap gap-12 items-start">
      <GlassCard className="space-y-6 w-auto">
        <div className="grid grid-cols-2 grid-rows-2 gap-6">
          <GridItem title="Staking" value={tokenSymbol} />

          <GridItem title="Available" value={tokenSymbol} />

          <GridItem
            title="Unstaking"
            value={tokenSymbol}
            tooltip="This is a test."
          />

          <GridItem title="APY" value={tokenSymbol} />
        </div>

        <div className="flex gap-2 items-center">
          <Button
            rightIcon={
              <ArrowRightUp className="dark:fill-mono-180" size="lg" />
            }
          >
            Restake
          </Button>

          <Button
            variant="secondary"
            rightIcon={
              <ExternalLinkLine className="dark:fill-mono-0" size="lg" />
            }
          >
            View Token
          </Button>
        </div>
      </GlassCard>

      <LiquidStakingCard />
    </div>
  );
};

type GridItemProps = {
  title: string;
  tooltip?: string;
  value: string;
};

/** @internal */
const GridItem: FC<GridItemProps> = ({ title, tooltip, value }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <Typography className="dark:text-mono-100" variant="h5" fw="bold">
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

      <Typography variant="h4" fw="normal">
        {value}
      </Typography>
    </div>
  );
};

export default LiquidStakingTokenPage;
