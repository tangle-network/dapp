import cx from 'classnames';
import { ShieldedAssetIcon } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';

import {
  CopyIconWithTooltip,
  PoolOverviewCardItem,
  PoolTypeChip,
} from '../../components';
import { VANCHORS_MAP } from '../../constants';
import { getPoolInfoCardTvlData, getPoolInfoCardDepositData } from '../../data';

export default async function PoolInfoCardContainer({
  poolAddress,
  epochStart,
  epochNow,
}: {
  poolAddress: string;
  epochStart: number;
  epochNow: number;
}) {
  const { fungibleTokenName: name, fungibleTokenSymbol: symbol } =
    VANCHORS_MAP[poolAddress];

  return (
    <div
      className={cx(
        'w-full lg:min-h-[284px] p-6 rounded-lg',
        'bg-glass dark:bg-glass_dark',
        'border-2 border-mono-0 dark:border-mono-160',
        'lg:flex lg:items-center'
      )}
    >
      <div className="w-full space-y-4">
        <div className="flex flex-col items-center gap-1">
          {/* Icon */}
          <ShieldedAssetIcon size="xl" />

          {/* Name */}
          <Typography variant="h5" fw="bold">
            {name}
          </Typography>

          {/* Address */}
          <div className="flex items-center gap-1">
            <Typography
              variant="body1"
              className="text-mono-140 dark:text-mono-40"
            >
              {shortenHex(poolAddress)}
            </Typography>

            <CopyIconWithTooltip textToCopy={poolAddress} />
          </div>

          {/* Type (only single for now) */}
          <PoolTypeChip type="single" name="Single Asset" />
        </div>

        {/* 24h deposits + TVL + 24h fees */}
        <div className="grid grid-cols-2">
          <PoolOverviewCardItem
            title="tvl"
            suffix={` ${symbol}`}
            dataFetcher={() =>
              getPoolInfoCardTvlData(poolAddress, epochStart, epochNow)
            }
          />
          <PoolOverviewCardItem
            title="Deposits 24H"
            suffix={` ${symbol}`}
            className="border-l border-mono-40 dark:border-mono-140"
            dataFetcher={() =>
              getPoolInfoCardDepositData(poolAddress, epochNow)
            }
          />
        </div>
      </div>
    </div>
  );
}
