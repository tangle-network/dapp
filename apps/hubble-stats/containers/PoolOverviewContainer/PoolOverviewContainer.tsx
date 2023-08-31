import cx from 'classnames';
import { Typography, CopyWithTooltip } from '@webb-tools/webb-ui-components';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import { ShieldedAssetLight, ShieldedAssetDark } from '@webb-tools/icons';

import { PoolTypeChip, PoolOverviewItem } from '../../components';
import { getPoolOverviewData } from '../../data';

export default async function PoolOverviewContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const { name, url, type, deposit24h, depositChangeRate, tvl, tvlChangeRate } =
    await getPoolOverviewData(poolAddress);

  return (
    <div
      className={cx(
        'w-full lg:min-h-[278px] p-6 rounded-lg',
        'bg-glass dark:bg-glass_dark',
        'border-2 border-mono-0 dark:border-mono-160',
        'lg:flex lg:items-center'
      )}
    >
      <div className="w-full space-y-4">
        <div className="flex flex-col items-center gap-1">
          {/* Icon */}
          <ShieldedAssetLight
            width={40}
            height={48}
            className="block dark:hidden"
          />

          <ShieldedAssetDark
            width={40}
            height={48}
            className="hidden dark:block"
          />

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

            <CopyWithTooltip
              textToCopy={poolAddress}
              isButton={false}
              className="text-mono-140 dark:text-mono-40"
            />
          </div>

          {/* Type */}
          <PoolTypeChip
            type={type}
            name={type === 'single' ? 'Single Asset' : 'Multi Asset'}
          />
        </div>

        {/* 24h deposits + TVL + 24h fees */}
        <div className="flex">
          <PoolOverviewItem
            title="tvl"
            value={tvl}
            changeRate={tvlChangeRate}
            suffix=" tTNT"
            className="flex-[1]"
          />
          <PoolOverviewItem
            title="Deposits 24H"
            suffix=" tTNT"
            value={deposit24h}
            changeRate={depositChangeRate}
            className="flex-[1] border-l border-mono-40 dark:border-mono-140"
          />
        </div>
      </div>
    </div>
  );
}
