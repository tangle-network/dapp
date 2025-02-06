import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@webb-tools/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTVL from '@webb-tools/tangle-shared-ui/data/restake/useRestakeTVL';
import { ComponentProps, useMemo } from 'react';
import { VaultAssetData } from '../../components/tables/VaultAssets/types';
import VaultsTable from '../../components/tables/Vaults';
import VaultAssetsTable from '../../components/tables/VaultAssets';
import { randNumber } from '@ngneat/falso';
import { VaultType } from '../../utils/calculateVaults';

export default function VaultsOverview() {
  const { assets: assetsMetadataMap } = useRestakeContext();

  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorMap } = useRestakeOperatorMap();
  // const vaults = useRestakeVaults(true);

  const { delegatorTVL } = useRestakeTVL(operatorMap, delegatorInfo);

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
          <VaultAssetsTable isShown={row.getIsExpanded()} data={vaultAssets} />
        );
      },
    }),
    [assetsMetadataMap, delegatorTVL, delegatorTotalRestakedAssets],
  );

  return <VaultsTable data={getVaults()} tableProps={tableProps} />;
}

function getVaults() {
  return Array.from({ length: randNumber({ min: 1, max: 10 }) }).map(
    (_, idx) =>
      ({
        id: idx + 1,
        name: `Vault #${idx + 1}`,
        apyPercentage: randNumber({ min: 0, max: 100 }),
        tokenCount: randNumber({ min: 1, max: 10 }),
        tvlInUsd: null,
        representToken: 'ETH',
      }) satisfies VaultType,
  );
}
