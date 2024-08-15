'use client';

import { ChevronDown, ChevronUp } from '@webb-tools/icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import Image from 'next/image';
import { FC, useState } from 'react';

import { StaticAssetPath } from '../../../constants';
import {
  LiquidStakingToken,
  ParachainChainId,
} from '../../../constants/liquidStaking';
import { PagePath } from '../../../types';
import AssetTable from '../AssetTable';
import StatItem from '../StatItem';
import ChainLogo from './ChainLogo';

export type LiquidStakingTokenItemProps = {
  chainId: ParachainChainId;
  title: string;
  tokenSymbol: LiquidStakingToken;
  apy: number;
  derivativeTokens: string;
  myStake: {
    value: number;
    valueInUSD: number;
  };
};

const LiquidStakingTokenItem: FC<LiquidStakingTokenItemProps> = ({
  title,
  chainId,
  tokenSymbol,
  apy,
  derivativeTokens,
  myStake,
}) => {
  const [showAssetTable, setShowAssetTable] = useState(false);

  const formattedMyStakedInUSD = myStake.valueInUSD.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="bg-mono-0 dark:bg-mono-190 w-full p-3 rounded-xl space-y-3">
      <div className="grid grid-cols-5">
        <div className="flex gap-2 items-center col-span-2">
          <div className="relative rounded-full dark:bg-mono-180 border-2 dark:border-purple-80 p-1">
            <ChainLogo size="md" chainId={chainId} isRounded />

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
        </div>

        <div className="grid grid-cols-3 gap-6 col-span-2">
          <StatItem title={apy + ' %'} subtitle="APY" tooltip="APY" />

          <StatItem
            title={derivativeTokens}
            subtitle="Tokens"
            tooltip="Total no. of derivative tokens"
          />

          <StatItem
            title={myStake.value.toLocaleString()}
            subtitle={formattedMyStakedInUSD}
            tooltip="My staked amount in USD"
          />
        </div>

        <div className="flex items-center gap-1 justify-end col-span-1">
          <Button
            size="sm"
            variant="utility"
            className="uppercase"
            href={`${PagePath.LIQUID_STAKING}/${tokenSymbol}`}
          >
            Stake
          </Button>

          <Button
            size="sm"
            variant="utility"
            onClick={() => setShowAssetTable(!showAssetTable)}
          >
            {showAssetTable ? (
              <ChevronUp className="fill-blue-60 dark:fill-blue-40" size="md" />
            ) : (
              <ChevronDown
                className="fill-blue-60 dark:fill-blue-40"
                size="md"
              />
            )}
          </Button>
        </div>
      </div>

      {showAssetTable && <AssetTable />}
    </div>
  );
};

export default LiquidStakingTokenItem;
