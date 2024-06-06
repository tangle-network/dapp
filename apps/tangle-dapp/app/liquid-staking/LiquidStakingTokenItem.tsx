'use client';

import { ArrowRight } from '@webb-tools/icons';
import { Button, Chip, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import Image from 'next/image';

import { PagePath } from '../../types';
import StatItem from './StatItem';
import { LiquidStakingToken, TVS_TOOLTIP } from '../../constants/liquidStaking';
import { StaticAssetPath } from '../../constants';
import assert from 'assert';
import { BN } from '@polkadot/util';
import { formatTokenBalance } from '../../utils/polkadot';

export type LiquidStakingTokenItemProps = {
  logoPath: StaticAssetPath;
  title: string;
  tokenSymbol: LiquidStakingToken;
  totalValueStaked: number;
  totalStaked: BN;

  /**
   * Annual Percentage Yield (APY). Should a decimal value
   * between 0 and 1.
   */
  annualPercentageYield: number;
};

const LOGO_SIZE = 40;

const LiquidStakingTokenItem: FC<LiquidStakingTokenItemProps> = ({
  logoPath,
  title,
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

  const formattedTotalStaked = formatTokenBalance(totalStaked);

  return (
    <div className="flex justify-between rounded-xl dark:bg-mono-160 w-full px-3 py-6">
      <div className="flex gap-2 items-center">
        <div className="rounded-full dark:bg-mono-180 border-2 dark:border-purple-80 p-1">
          <Image
            src={logoPath}
            alt="Logo of the liquid staking token"
            width={LOGO_SIZE}
            height={LOGO_SIZE}
          />
        </div>

        <Typography variant="body1" fw="normal" className="dark:text-mono-0">
          {title}
        </Typography>

        <Chip className="normal-case" color="dark-grey">
          tg{tokenSymbol.toUpperCase()}
        </Chip>
      </div>

      <div className="flex items-center gap-6">
        <StatItem title={formattedTotalStaked} subtitle="Staked" />

        <StatItem title={`${formattedAnnualPercentageYield}%`} subtitle="APY" />

        <StatItem
          title={`$${formattedTotalValueStaked}`}
          subtitle="TVS"
          tooltip={TVS_TOOLTIP}
        />

        <Button
          size="sm"
          variant="utility"
          className="uppercase"
          rightIcon={<ArrowRight className="dark:fill-blue-50" />}
          href={`${PagePath.LIQUID_RESTAKING}/${tokenSymbol}`}
        >
          Stake
        </Button>
      </div>
    </div>
  );
};

export default LiquidStakingTokenItem;
