'use client';

import { useState } from 'react';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import {
  ShieldedAssetLight,
  ShieldedAssetDark,
  ExternalLinkLine,
} from '@webb-tools/icons';

import { PoolTypeChip, PoolOverviewItem } from '../../components';
import { PoolType } from '../../components/PoolTypeChip/types';

type PoolOverviewType = {
  name: string;
  address: string;
  type: PoolType;
  deposits24h: number;
  depositsChangeRate: number;
  tvl: number;
  tvlChangeRate: number;
  fees24h: number;
};

const PoolOverviewContainer = () => {
  const [poolOverviewData, setPoolOverviewData] = useState<PoolOverviewType>();

  return (
    <div
      className={cx(
        'w-full space-y-4 p-6 rounded-lg',
        'border-2 border-mono-0 dark:border-mono-160',
        'bg-glass dark:bg-glass_dark'
      )}
    >
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
          {poolOverviewData?.name ?? '-'}
        </Typography>

        {/* Address */}
        <div className="flex items-center gap-1">
          <Typography
            variant="body1"
            className="text-mono-140 dark:text-mono-40"
          >
            {poolOverviewData?.address
              ? shortenHex(poolOverviewData.address, 4)
              : '-'}
          </Typography>

          {poolOverviewData?.address && (
            <a href="#" target="_blank" rel="noreferrer">
              <ExternalLinkLine className="fill-mono-140 dark:fill-mono-40" />
            </a>
          )}
        </div>

        {/* Type */}
        <PoolTypeChip
          type={poolOverviewData?.type}
          name={
            !poolOverviewData?.type || poolOverviewData.type === 'single'
              ? 'Single Asset'
              : 'Multi Asset'
          }
        />
      </div>

      {/* 24h deposits + TVL + 24h fees */}
      <div className="flex">
        <PoolOverviewItem
          title="24h deposits"
          value={poolOverviewData?.deposits24h}
          changeRate={poolOverviewData?.depositsChangeRate}
          className="flex-[1]"
        />
        <PoolOverviewItem
          title="tvl"
          value={poolOverviewData?.tvl}
          changeRate={poolOverviewData?.tvlChangeRate}
          prefix="$"
          className="flex-[1] border-x border-mono-40 dark:border-mono-140"
        />
        <PoolOverviewItem
          title="24h fees"
          value={poolOverviewData?.fees24h}
          prefix="$"
          className="flex-[1]"
        />
      </div>
    </div>
  );
};

export default PoolOverviewContainer;
