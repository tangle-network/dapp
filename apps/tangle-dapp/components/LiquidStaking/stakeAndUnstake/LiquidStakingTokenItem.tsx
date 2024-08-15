'use client';

import { BN } from '@polkadot/util';
import { ArrowRight } from '@webb-tools/icons';
import { Button, Chip, Typography } from '@webb-tools/webb-ui-components';
import Image from 'next/image';
import { FC, useMemo } from 'react';

import LSTTokenIcon from '../../../components/LSTTokenIcon';
import { StaticAssetPath } from '../../../constants';
import { LST_PREFIX, TVS_TOOLTIP } from '../../../constants/liquidStaking';
import { PagePath } from '../../../types';
import { LiquidStakingToken } from '../../../types/liquidStaking';
import formatTangleBalance from '../../../utils/formatTangleBalance';
import StatItem from '../StatItem';

export type LiquidStakingTokenItemProps = {
  title: string;
  tokenSymbol: LiquidStakingToken;
  totalValueStaked: number;
  totalStaked: string;
};

const LiquidStakingTokenItem: FC<LiquidStakingTokenItemProps> = ({
  title,
  tokenSymbol,
  totalValueStaked,
  totalStaked,
}) => {
  const formattedTotalValueStaked = totalValueStaked.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const formattedTotalStaked = useMemo(
    () => formatTangleBalance(new BN(totalStaked)),
    [totalStaked],
  );

  return (
    <div className="flex gap-2 justify-between rounded-xl bg-mono-20 dark:bg-mono-160 w-full px-3 py-6 border border-mono-40 dark:border-none">
      <div className="flex gap-2 items-center">
        <div className="relative">
          <LSTTokenIcon size="lg" name={tokenSymbol} />

          <Image
            className="absolute bottom-0 right-0 z-20"
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
          {LST_PREFIX}
          {tokenSymbol.toUpperCase()}
        </Chip>
      </div>

      <div className="flex items-center gap-6">
        <StatItem title={formattedTotalStaked} subtitle="Staked" />

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
