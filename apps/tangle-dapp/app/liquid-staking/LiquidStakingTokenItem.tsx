'use client';

import { BN } from '@polkadot/util';
import { ArrowRight } from '@webb-tools/icons';
import { Button, Chip, Typography } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import Image from 'next/image';
import { FC, useMemo } from 'react';

import { StaticAssetPath } from '../../constants';
import {
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingChain,
  LiquidStakingToken,
  TVS_TOOLTIP,
} from '../../constants/liquidStaking';
import { PagePath } from '../../types';
import { formatTangleAmount } from '../../utils/polkadot';
import ChainLogo from './ChainLogo';
import StatItem from './StatItem';

export type LiquidStakingTokenItemProps = {
  chain: LiquidStakingChain;
  title: string;
  tokenSymbol: LiquidStakingToken;
  totalValueStaked: number;
  totalStaked: string;

  /**
   * Annual Percentage Yield (APY). Should a decimal value
   * between 0 and 1.
   */
  annualPercentageYield: number;
};

const LiquidStakingTokenItem: FC<LiquidStakingTokenItemProps> = ({
  title,
  chain,
  tokenSymbol,
  totalValueStaked,
  annualPercentageYield,
  totalStaked,
}) => {
  assert(
    annualPercentageYield >= 0 && annualPercentageYield <= 1,
    'APY should be between 0 and 1',
  );

  const formattedTotalValueStaked = totalValueStaked.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const formattedAnnualPercentageYield = (annualPercentageYield * 100).toFixed(
    2,
  );

  const formattedTotalStaked = useMemo(
    () => formatTangleAmount(new BN(totalStaked)),
    [totalStaked],
  );

  return (
    <div className="flex gap-2 justify-between rounded-xl bg-mono-20 dark:bg-mono-160 w-full px-3 py-6 border border-mono-40 dark:border-none">
      <div className="flex gap-2 items-center">
        <div className="relative rounded-full dark:bg-mono-180 border-2 dark:border-purple-80 p-1">
          <ChainLogo size="md" chain={chain} />

          <Image
            className="absolute bottom-0 right-0"
            src={StaticAssetPath.LIQUID_STAKING_TANGLE_LOGO}
            alt="Tangle logo"
            width={14}
            height={14}
          />
        </div>

        <Typography variant="body1" fw="normal" className="dark:text-mono-0">
          {title}
        </Typography>

        <Chip className="normal-case" color="dark-grey">
          {LIQUID_STAKING_TOKEN_PREFIX}
          {tokenSymbol.toUpperCase()}
        </Chip>
      </div>

      <div className="flex items-center gap-6">
        <StatItem title={formattedTotalStaked} subtitle="Staked" />

        <StatItem title={`${formattedAnnualPercentageYield}%`} subtitle="APY" />

        <StatItem
          title={formattedTotalValueStaked}
          subtitle="TVS"
          tooltip={TVS_TOOLTIP}
        />

        <Button
          size="sm"
          variant="utility"
          className="uppercase"
          rightIcon={<ArrowRight className="dark:fill-blue-50" />}
          href={`${PagePath.LIQUID_STAKING}/${tokenSymbol}`}
        >
          Stake
        </Button>
      </div>
    </div>
  );
};

export default LiquidStakingTokenItem;
