import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import type {
  DelegatorInfo,
  OperatorMetadata,
} from '@webb-tools/tangle-shared-ui/types/restake';
import { ComponentProps, type FC, useMemo } from 'react';
import VaultAssetsTable from '../../../../components/tables/VaultAssets';
import { VaultAssetData } from '../../../../components/tables/VaultAssets/types';
import VaultsTable from '../../../../components/tables/Vaults';
import type { VaultData } from '../../../../components/tables/Vaults/types';
import useRestakeRewardConfig from '../../../../data/restake/useRestakeRewardConfig';

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
  const { assetMetadataMap } = useRestakeContext();
  const rewardConfig = useRestakeRewardConfig();

  const vaults = useMemo(() => {
    const vaults: Record<string, VaultData> = {};

    const delegations = operatorData?.delegations ?? [];

    delegations.forEach(({ assetId }) => {
      if (assetMetadataMap[assetId] === undefined) return;

      if (assetMetadataMap[assetId].vaultId === null) return;

      const vaultId = assetMetadataMap[assetId].vaultId;
      if (vaults[vaultId] === undefined) {
        // TODO: Find out a proper way to get the vault name, now it's the first token name
        const name = assetMetadataMap[assetId].name;
        // TODO: Find out a proper way to get the vault symbol, now it's the first token symbol
        const representToken = assetMetadataMap[assetId].symbol;

        const apyPercentage =
          rewardConfig?.get(vaultId)?.apy.toNumber() ?? null;

        const tvlInUsd = vaultTVL?.[vaultId] ?? null;

        vaults[vaultId] = {
          id: vaultId,
          apyPercentage,
          name,
          representToken,
          tokenCount: 1,
          tvlInUsd,
        };
      } else {
        vaults[vaultId].tokenCount += 1;
      }
    });

    return vaults;
  }, [assetMetadataMap, operatorData?.delegations, rewardConfig, vaultTVL]);

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
        const vaultAssets = Object.values(assetMetadataMap)
          .filter((asset) => asset.vaultId === vaultId)
          .map((asset) => {
            const selfStake =
              delegatorTotalRestakedAssets[asset.id] ?? ZERO_BIG_INT;

            const tvl = delegatorTVL?.[asset.id] ?? null;

            return {
              id: asset.id,
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
    [assetMetadataMap, delegatorTVL, delegatorTotalRestakedAssets],
  );

  return (
    <VaultsTable
      emptyTableProps={{
        title: 'No TVL data available',
        description:
          'This operator currently has no Total Value Locked (TVL). You can delegate to this operator to contribute to their TVL and see it reflected here.',
      }}
      data={Object.values(vaults)}
      tableProps={tableProps}
    />
  );
};

export default TVLTable;
