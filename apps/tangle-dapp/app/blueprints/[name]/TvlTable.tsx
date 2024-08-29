'use client';

import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import VaultsTable from '../../../components/tables/Vaults';
import useVaults from './useVaults';
import VaultAssetsTable from './VaultAssetsTable';

const TvlTable: FC = () => {
  const vaults = useVaults();

  return (
    <div className="space-y-5">
      <Typography variant="h4" fw="bold">
        Total Value Locked
      </Typography>

      <VaultsTable
        data={vaults.map((v) => ({
          id: v.name,
          apyPercentage: v.apy,
          name: v.name,
          representToken: v.lstToken,
          tokensCount: v.tokensCount,
          tvlInUsd: v.liquidity.usdValue,
        }))}
        tableProps={{
          onRowClick(row) {
            if (!row.getCanExpand()) return;
            return row.toggleExpanded();
          },
          getExpandedRowContent(row) {
            return (
              <div className="px-3 pt-4 pb-3 -mx-px bg-mono-0 dark:bg-mono-190 -mt-7 rounded-b-xl">
                <VaultAssetsTable
                  LSTTokenIcon={row.original.representToken}
                  isShown={row.getIsExpanded()}
                />
              </div>
            );
          },
        }}
      />
    </div>
  );
};

export default TvlTable;
