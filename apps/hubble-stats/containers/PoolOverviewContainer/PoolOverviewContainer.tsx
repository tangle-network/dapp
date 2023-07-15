'use client';

import { useState } from 'react';
import cx from 'classnames';
import { Typography, useDarkMode } from '@webb-tools/webb-ui-components';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import {
  ShieldedAssetLight,
  ShieldedAssetDark,
  ExternalLinkLine,
} from '@webb-tools/icons';

import { PoolTypeChip, PoolOverviewItem } from '../../components';

const PoolOverviewContainer = () => {
  const [isDarkMode] = useDarkMode('light');

  return (
    <div
      className={cx(
        'w-full space-y-4 p-6 rounded-lg',
        'border-2 border-mono-0 dark:border-mono-160',
        'bg-glass dark:bg-glass_dark'
      )}
    >
      <div className="flex flex-col items-center gap-1">
        {isDarkMode ? (
          <ShieldedAssetDark width={40} height={48} />
        ) : (
          <ShieldedAssetLight width={40} height={48} />
        )}
        <Typography variant="h5" fw="bold">
          webbParachain
        </Typography>

        <div className="flex items-center gap-1">
          <Typography
            variant="body1"
            className="text-mono-140 dark:text-mono-40"
          >
            {shortenHex('0x17488912174388', 4)}
          </Typography>

          <a href="#" target="_blank" rel="noreferrer">
            <ExternalLinkLine className="fill-mono-140 dark:fill-mono-40" />
          </a>
        </div>

        <PoolTypeChip type="single" name="Single Asset" />
      </div>
      <div className="flex">
        <PoolOverviewItem title="24h deposits" className="flex-[1]" />
        <PoolOverviewItem
          title="tvl"
          prefix="$"
          className="flex-[1] border-x border-mono-40 dark:border-mono-140"
        />
        <PoolOverviewItem title="24h fees" prefix="$" className="flex-[1]" />
      </div>
    </div>
  );
};

export default PoolOverviewContainer;
