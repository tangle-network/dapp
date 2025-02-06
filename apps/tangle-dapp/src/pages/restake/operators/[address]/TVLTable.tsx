import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import type {
  DelegatorInfo,
  OperatorMetadata,
} from '@webb-tools/tangle-shared-ui/types/restake';
import { ComponentProps, type FC, useMemo } from 'react';
import VaultAssetsTable from '../../../../components/tables/VaultAssets';
import { VaultAssetData } from '../../../../components/tables/VaultAssets/types';
import VaultsTable from '../../../../components/tables/Vaults';
import useRestakeRewardConfig from '../../../../data/restake/useRestakeRewardConfig';
import calculateVaults from '../../../../utils/calculateVaults';

type Props = {
  operatorData: OperatorMetadata | undefined;
  delegatorInfo: DelegatorInfo | null;
  delegatorTVL: Record<string, number>;
  vaultTVL: Record<string, number>;
};

const TVLTable: FC<Props> = ({
  operatorData,
  vaultTVL,
  delegatorInfo,
  delegatorTVL,
}) => {
  const { assets: assetsMetadataMap } = useRestakeContext();
  const rewardConfig = useRestakeRewardConfig();

  const vaults = useMemo(() => {
    if (operatorData === undefined) {
      return [];
    }

    const uniqueAssetIds = operatorData.delegations.reduce(
      (acc, { assetId }) => {
        acc.add(assetId);
        return acc;
      },
      new Set<RestakeAssetId>(),
    );

    const assets = uniqueAssetIds
      .values()
      .toArray()
      .map((assetId) => assetsMetadataMap[assetId])
      .filter((asset) => asset !== undefined);

    const vaultsMap = calculateVaults({
      assets,
      rewardConfig,
      vaultTVL,
    });

    return vaultsMap.values().toArray();
  }, [assetsMetadataMap, operatorData, rewardConfig, vaultTVL]);

  const delegatorTotalRestakedAssets = useMemo(() => {
    if (!delegatorInfo?.delegations) {
      return {};
    }

    return delegatorInfo.delegations.reduce<Record<string, bigint>>(
      (acc, { amountBonded, assetId }) => {
        if (acc[assetId] === undefined) {
          acc[assetId] = amountBonded;
        } else {
          acc[assetId] += amountBonded;
        }
        return acc;
      },
      {},
    );
  }, [delegatorInfo?.delegations]);

  const tableProps = useMemo<ComponentProps<typeof VaultsTable>['tableProps']>(
    () => ({
      onRowClick(row) {
        if (!row.getCanExpand()) return;
        return row.toggleExpanded();
      },
      getExpandedRowContent(row) {
        const vaultId = row.original.id;
        const vaultAssets = Object.values(assetsMetadataMap)
          .filter((asset) => asset.vaultId === vaultId)
          .map((asset) => {
            const selfStake =
              delegatorTotalRestakedAssets[asset.assetId] ?? ZERO_BIG_INT;

            const tvl = delegatorTVL?.[asset.assetId] ?? null;

            return {
              id: asset.assetId,
              symbol: asset.symbol,
              decimals: asset.decimals,
              tvl,
              selfStake,
            } satisfies VaultAssetData;
          });

        return (
          <div className="px-3 pt-4 pb-3 -mx-px bg-mono-0 dark:bg-mono-190 -mt-7 rounded-b-xl">
            <VaultAssetsTable
              isShown={row.getIsExpanded()}
              data={vaultAssets}
            />
          </div>
        );
      },
    }),
    [assetsMetadataMap, delegatorTVL, delegatorTotalRestakedAssets],
  );

  return (
    <VaultsTable
      emptyTableProps={{
        title: 'No TVL data available',
        description:
          'This operator currently has no Total Value Locked (TVL). You can delegate to this operator to contribute to their TVL and see it reflected here.',
      }}
      data={vaults}
      tableProps={tableProps}
    />
  );
};

export default TVLTable;
