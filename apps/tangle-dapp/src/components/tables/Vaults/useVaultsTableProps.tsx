import { BN } from '@polkadot/util';
import VaultAssetsTable from '@tangle-network/tangle-shared-ui/components/tables/VaultAssets';
import { VaultAssetData } from '@tangle-network/tangle-shared-ui/components/tables/VaultAssets/types';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import {
  DelegatorInfo,
  RestakeAsset,
} from '@tangle-network/tangle-shared-ui/types/restake';
import { useMemo } from 'react';
import { VaultsTableProps } from './types';

type Options = {
  delegatorDeposits: DelegatorInfo['deposits'] | null | undefined;
  assets: Map<RestakeAssetId, RestakeAsset> | null;
  assetsTvl: Map<RestakeAssetId, BN> | null;
};

export const useVaultsTableProps = ({
  delegatorDeposits,
  assets,
  assetsTvl,
}: Options) => {
  return useMemo<VaultsTableProps['tableProps']>(
    () => ({
      onRowClick(row, table) {
        if (!row.getCanExpand()) {
          return;
        }

        // Close all other rows.
        table.getRowModel().rows.forEach((row_) => {
          if (row_.id !== row.id && row_.getIsExpanded()) {
            row_.toggleExpanded(false);
          }
        });

        return row.toggleExpanded();
      },
      getExpandedRowContent(row) {
        if (assets === null) {
          return;
        }

        const vaultId = row.original.id;

        const vaultAssets = Array.from(assets.values())
          .filter((asset) => asset.metadata.vaultId === vaultId)
          .map(
            ({
              id: assetId,
              metadata: { decimals, symbol, name },
              balance,
            }) => {
              const tvl = assetsTvl?.get(assetId) ?? null;
              const available = balance ?? null;

              const totalDeposits =
                typeof delegatorDeposits?.[assetId]?.amount === 'bigint'
                  ? new BN(delegatorDeposits[assetId].amount.toString())
                  : null;

              return {
                id: assetId,
                name,
                symbol,
                decimals,
                tvl,
                available,
                totalDeposits,
              } satisfies VaultAssetData;
            },
          );

        return (
          <VaultAssetsTable
            isShown={row.getIsExpanded()}
            data={vaultAssets}
            depositCapacity={row.original.capacity}
            tvl={row.original.tvl}
            decimals={row.original.decimals}
          />
        );
      },
    }),
    [assets, assetsTvl, delegatorDeposits],
  );
};
