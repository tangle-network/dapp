import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import { ExternalLinkLine, ShieldedAssetIcon } from '@webb-tools/icons';

import { PoolTypeChip, PoolOverviewItem } from '../../components';
import { getPoolOverviewData } from '../../data';

export default async function PoolOverviewContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const {
    name,
    url,
    type,
    deposits24h,
    depositsChangeRate,
    tvl,
    tvlChangeRate,
    fees24h,
  } = await getPoolOverviewData(poolAddress);

  return (
    <div
      className={cx(
        'w-full space-y-4 p-6 rounded-lg',
        'bg-glass dark:bg-glass_dark',
        'border-2 border-mono-0 dark:border-mono-160'
      )}
    >
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

          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLinkLine className="fill-mono-140 dark:fill-mono-40" />
          </a>
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
          title="24h deposits"
          value={deposits24h}
          changeRate={depositsChangeRate}
          className="flex-[1]"
        />
        <PoolOverviewItem
          title="tvl"
          value={tvl}
          changeRate={tvlChangeRate}
          prefix="$"
          className="flex-[1] border-x border-mono-40 dark:border-mono-140"
        />
        <PoolOverviewItem
          title="24h fees"
          value={fees24h}
          prefix="$"
          className="flex-[1]"
        />
      </div>
    </div>
  );
}
