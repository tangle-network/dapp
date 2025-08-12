import { PalletRewardsRewardConfigForAssetVault } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { NetworkId } from '@tangle-network/ui-components/constants/networks';
import { useMemo } from 'react';
import useNetworkStore from '../../context/useNetworkStore';
import useRestakeRewardConfig from '../../hooks/useRestakeRewardConfig';
import { RestakeAssetId } from '../../types';
import {
  DelegatorInfo,
  OperatorMetadata,
  RestakeAsset,
  RestakeAssetMetadata,
} from '../../types/restake';

export type RestakeVault = {
  id: number;
  name: string;
  representAssetSymbol: string;
  logo?: string;
  decimals: number;
  capacity?: BN;
  assetMetadata: RestakeAssetMetadata[];
  totalDeposits?: BN;
  totalDelegated?: BN;
  tvl?: BN;
  isNativeToken?: boolean;
};

type UseRestakeVaultsOptions = {
  assets: Map<RestakeAssetId, RestakeAsset> | null;
  delegatorInfo: DelegatorInfo | null;
  assetsTvl: Map<RestakeAssetId, BN> | null;
  operatorData?: OperatorMetadata;
};

export const useRestakeVaults = ({
  assets,
  operatorData,
  delegatorInfo,
  assetsTvl,
}: UseRestakeVaultsOptions) => {
  const rewardConfig = useRestakeRewardConfig();
  const networkId = useNetworkStore((store) => store.network2?.id);

  return useMemo(() => {
    if (assets === null) {
      return null;
    }

    const tntVault = createTntVault({
      assets,
      delegatorInfo,
      assetsTvl,
      networkId,
    });

    if (operatorData === undefined) {
      const regularVaults = createVaultMap({
        assets: Array.from(assets.values()),
        rewardConfig,
        delegatorInfo,
        assetTvl: assetsTvl,
        networkId,
      })
        .values()
        .toArray();

      return [tntVault, ...regularVaults];
    }

    // Handle operator-specific vaults.
    const uniqueAssetIds = operatorData.delegations.reduce(
      (acc, { assetId }) => {
        acc.add(assetId);

        return acc;
      },
      new Set<RestakeAssetId>(),
    );

    const operatorAssets = Array.from(uniqueAssetIds)
      .map((assetId) => assets.get(assetId))
      .filter((asset) => asset !== undefined);

    const regularVaults = createVaultMap({
      assets: operatorAssets,
      rewardConfig,
      delegatorInfo,
      assetTvl: assetsTvl,
      networkId,
    })
      .values()
      .toArray();

    return [tntVault, ...regularVaults];
  }, [assetsTvl, assets, delegatorInfo, networkId, operatorData, rewardConfig]);
};

type Options = {
  assets: RestakeAsset[];
  networkId?: NetworkId;
  delegatorInfo?: DelegatorInfo | null;
  assetTvl?: Map<RestakeAssetId, BN> | null;
  rewardConfig?: Map<number, PalletRewardsRewardConfigForAssetVault> | null;
};

export const createVaultMap = ({
  assets,
  delegatorInfo,
  assetTvl,
  rewardConfig,
  networkId,
}: Options): Map<number, RestakeVault> => {
  const vaults = new Map<number, RestakeVault>();

  for (const asset of assets) {
    if (asset.metadata.vaultId === null) {
      continue;
    }

    const totalDeposits =
      typeof delegatorInfo?.deposits[asset.id]?.amount === 'bigint'
        ? new BN(delegatorInfo.deposits[asset.id].amount.toString())
        : undefined;

    const totalDelegated =
      typeof delegatorInfo?.deposits[asset.id]?.delegatedAmount === 'bigint'
        ? new BN(delegatorInfo.deposits[asset.id].delegatedAmount.toString())
        : undefined;

    const tvl = assetTvl?.get(asset.id);
    const existingVault = vaults.get(asset.metadata.vaultId);

    if (existingVault === undefined) {
      const capacity = rewardConfig
        ?.get(asset.metadata.vaultId)
        ?.depositCap.toBn();

      const vaultMetadata =
        networkId === NetworkId.TANGLE_MAINNET
          ? MAINNET_VAULT_METADATA.get(asset.metadata.vaultId)
          : null;

      vaults.set(asset.metadata.vaultId, {
        id: asset.metadata.vaultId,
        name:
          vaultMetadata?.name ?? asset.metadata.name ?? asset.metadata.symbol,
        logo: vaultMetadata?.logo,
        representAssetSymbol: asset.metadata.symbol,
        decimals: asset.metadata.decimals,
        capacity,
        assetMetadata: [asset.metadata],
        totalDeposits,
        totalDelegated,
        tvl,
      });
    }
    // Update existing vault values.
    else {
      existingVault.totalDeposits = tryAddBNs(
        existingVault.totalDeposits,
        totalDeposits,
      );

      existingVault.totalDelegated = tryAddBNs(
        existingVault.totalDelegated,
        totalDelegated,
      );

      existingVault.tvl = tryAddBNs(existingVault.tvl, tvl);
      existingVault.assetMetadata.push(asset.metadata);
    }
  }

  return vaults;
};

const tryAddBNs = (a: BN | undefined, b: BN | undefined): BN | undefined => {
  if (a === undefined) {
    return b;
  } else if (b === undefined) {
    return a;
  }

  return a.add(b);
};

type CreateTntVaultOptions = {
  assets: Map<RestakeAssetId, RestakeAsset> | null;
  delegatorInfo: DelegatorInfo | null;
  assetsTvl: Map<RestakeAssetId, BN> | null;
  networkId?: NetworkId;
};

const createTntVault = ({
  assets,
  delegatorInfo,
  assetsTvl,
  networkId: _networkId,
}: CreateTntVaultOptions): RestakeVault => {
  const NATIVE_ASSET_ID = '0' as RestakeAssetId;

  const tntAsset = assets?.get(NATIVE_ASSET_ID);
  const decimals = tntAsset?.metadata?.decimals ?? 18;
  const symbol = tntAsset?.metadata?.symbol ?? 'TNT';

  const userTntDeposit = delegatorInfo?.deposits[NATIVE_ASSET_ID];
  const totalDeposits = userTntDeposit
    ? new BN(userTntDeposit.amount.toString())
    : undefined;

  let totalDelegated: BN | undefined;
  if (delegatorInfo) {
    let delegatedSum = new BN(0);
    const tntDelegations = delegatorInfo.delegations.filter(
      (d) => d.assetId === NATIVE_ASSET_ID,
    );
    for (const delegation of tntDelegations) {
      delegatedSum = delegatedSum.add(
        new BN(delegation.amountBonded.toString()),
      );
    }

    totalDelegated = delegatedSum.gt(new BN(0)) ? delegatedSum : undefined;
  }

  const tvl = assetsTvl?.get(NATIVE_ASSET_ID);

  const tntMetadata: RestakeAssetMetadata = {
    assetId: NATIVE_ASSET_ID,
    name: 'Tangle Network Token',
    symbol: symbol,
    decimals: decimals,
    vaultId: null,
    priceInUsd: null,
    status: 'Live' as const,
  };

  return {
    id: 0,
    name: 'Tangle Network Token',
    representAssetSymbol: symbol,
    decimals: decimals,
    assetMetadata: [tntMetadata],
    totalDeposits,
    totalDelegated,
    tvl,
    isNativeToken: true,
  };
};

const MAINNET_VAULT_METADATA = new Map<
  number,
  {
    name: string;
    logo: string;
  }
>([
  [
    0,
    {
      name: 'USD Coin',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIj48Y2lyY2xlIGZpbGw9IiMzRTczQzQiIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIvPjxnIGZpbGw9IiNGRkYiPjxwYXRoIGQ9Ik0yMC4wMjIgMTguMTI0YzAtMi4xMjQtMS4yOC0yLjg1Mi0zLjg0LTMuMTU2LTEuODI4LS4yNDMtMi4xOTMtLjcyOC0yLjE5My0xLjU3OCAwLS44NS42MS0xLjM5NiAxLjgyOC0xLjM5NiAxLjA5NyAwIDEuNzA3LjM2NCAyLjAxMSAxLjI3NWEuNDU4LjQ1OCAwIDAwLjQyNy4zMDNoLjk3NWEuNDE2LjQxNiAwIDAwLjQyNy0uNDI1di0uMDZhMy4wNCAzLjA0IDAgMDAtMi43NDMtMi40ODlWOS4xNDJjMC0uMjQzLS4xODMtLjQyNS0uNDg3LS40ODZoLS45MTVjLS4yNDMgMC0uNDI2LjE4Mi0uNDg3LjQ4NnYxLjM5NmMtMS44MjkuMjQyLTIuOTg2IDEuNDU2LTIuOTg2IDIuOTc0IDAgMi4wMDIgMS4yMTggMi43OTEgMy43NzggMy4wOTUgMS43MDcuMzAzIDIuMjU1LjY2OCAyLjI1NSAxLjYzOSAwIC45Ny0uODUzIDEuNjM4LTIuMDExIDEuNjM4LTEuNTg1IDAtMi4xMzMtLjY2Ny0yLjMxNi0xLjU3OC0uMDYtLjI0Mi0uMjQ0LS4zNjQtLjQyNy0uMzY0aC0xLjAzNmEuNDE2LjQxNiAwIDAwLS40MjYuNDI1di4wNmMuMjQzIDEuNTE4IDEuMjE5IDIuNjEgMy4yMyAyLjkxNHYxLjQ1N2MwIC4yNDIuMTgzLjQyNS40ODcuNDg1aC45MTVjLjI0MyAwIC40MjYtLjE4Mi40ODctLjQ4NVYyMS4zNGMxLjgyOS0uMzAzIDMuMDQ3LTEuNTc4IDMuMDQ3LTMuMjE3eiIvPjxwYXRoIGQ9Ik0xMi44OTIgMjQuNDk3Yy00Ljc1NC0xLjctNy4xOTItNi45OC01LjQyNC0xMS42NTMuOTE0LTIuNTUgMi45MjUtNC40OTEgNS40MjQtNS40MDIuMjQ0LS4xMjEuMzY1LS4zMDMuMzY1LS42MDd2LS44NWMwLS4yNDItLjEyMS0uNDI0LS4zNjUtLjQ4NS0uMDYxIDAtLjE4MyAwLS4yNDQuMDZhMTAuODk1IDEwLjg5NSAwIDAwLTcuMTMgMTMuNzE3YzEuMDk2IDMuNCAzLjcxNyA2LjAxIDcuMTMgNy4xMDIuMjQ0LjEyMS40ODggMCAuNTQ4LS4yNDMuMDYxLS4wNi4wNjEtLjEyMi4wNjEtLjI0M3YtLjg1YzAtLjE4Mi0uMTgyLS40MjQtLjM2NS0uNTQ2em02LjQ2LTE4LjkzNmMtLjI0NC0uMTIyLS40ODggMC0uNTQ4LjI0Mi0uMDYxLjA2MS0uMDYxLjEyMi0uMDYxLjI0M3YuODVjMCAuMjQzLjE4Mi40ODUuMzY1LjYwNyA0Ljc1NCAxLjcgNy4xOTIgNi45OCA1LjQyNCAxMS42NTMtLjkxNCAyLjU1LTIuOTI1IDQuNDkxLTUuNDI0IDUuNDAyLS4yNDQuMTIxLS4zNjUuMzAzLS4zNjUuNjA3di44NWMwIC4yNDIuMTIxLjQyNC4zNjUuNDg1LjA2MSAwIC4xODMgMCAuMjQ0LS4wNmExMC44OTUgMTAuODk1IDAgMDA3LjEzLTEzLjcxN2MtMS4wOTYtMy40Ni0zLjc3OC02LjA3LTcuMTMtNy4xNjJ6Ii8+PC9nPjwvZz48L3N2Zz4=',
    },
  ],
  [
    1,
    {
      name: 'Tether USD',
      logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzI2QTE3QiIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xNy45MjIgMTcuMzgzdi0uMDAyYy0uMTEuMDA4LS42NzcuMDQyLTEuOTQyLjA0Mi0xLjAxIDAtMS43MjEtLjAzLTEuOTcxLS4wNDJ2LjAwM2MtMy44ODgtLjE3MS02Ljc5LS44NDgtNi43OS0xLjY1OCAwLS44MDkgMi45MDItMS40ODYgNi43OS0xLjY2djIuNjQ0Yy4yNTQuMDE4Ljk4Mi4wNjEgMS45ODguMDYxIDEuMjA3IDAgMS44MTItLjA1IDEuOTI1LS4wNnYtMi42NDNjMy44OC4xNzMgNi43NzUuODUgNi43NzUgMS42NTggMCAuODEtMi44OTUgMS40ODUtNi43NzUgMS42NTdtMC0zLjU5di0yLjM2Nmg1LjQxNFY3LjgxOUg4LjU5NXYzLjYwOGg1LjQxNHYyLjM2NWMtNC40LjIwMi03LjcwOSAxLjA3NC03LjcwOSAyLjExOCAwIDEuMDQ0IDMuMzA5IDEuOTE1IDcuNzA5IDIuMTE4djcuNTgyaDMuOTEzdi03LjU4NGM0LjM5My0uMjAyIDcuNjk0LTEuMDczIDcuNjk0LTIuMTE2IDAtMS4wNDMtMy4zMDEtMS45MTQtNy42OTQtMi4xMTciLz48L2c+PC9zdmc+',
    },
  ],
  [
    2,
    {
      name: 'ETH',
      logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzYyN0VFQSIvPjxnIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+PHBhdGggZmlsbC1vcGFjaXR5PSIuNjAyIiBkPSJNMTYuNDk4IDR2OC44N2w3LjQ5NyAzLjM1eiIvPjxwYXRoIGQ9Ik0xNi40OTggNEw5IDE2LjIybDcuNDk4LTMuMzV6Ii8+PHBhdGggZmlsbC1vcGFjaXR5PSIuNjAyIiBkPSJNMTYuNDk4IDIxLjk2OHY2LjAyN0wyNCAxNy42MTZ6Ii8+PHBhdGggZD0iTTE2LjQ5OCAyNy45OTV2LTYuMDI4TDkgMTcuNjE2eiIvPjxwYXRoIGZpbGwtb3BhY2l0eT0iLjIiIGQ9Ik0xNi40OTggMjAuNTczbDcuNDk3LTQuMzUzLTcuNDk3LTMuMzQ4eiIvPjxwYXRoIGZpbGwtb3BhY2l0eT0iLjYwMiIgZD0iTTkgMTYuMjJsNy40OTggNC4zNTN2LTcuNzAxeiIvPjwvZz48L2c+PC9zdmc+',
    },
  ],
  [
    3,
    {
      name: 'BTC',
      logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI0Y3OTMxQSIvPjxwYXRoIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTIzLjE4OSAxNC4wMmMuMzE0LTIuMDk2LTEuMjgzLTMuMjIzLTMuNDY1LTMuOTc1bC43MDgtMi44NC0xLjcyOC0uNDMtLjY5IDIuNzY1Yy0uNDU0LS4xMTQtLjkyLS4yMi0xLjM4NS0uMzI2bC42OTUtMi43ODNMMTUuNTk2IDZsLS43MDggMi44MzljLS4zNzYtLjA4Ni0uNzQ2LS4xNy0xLjEwNC0uMjZsLjAwMi0uMDA5LTIuMzg0LS41OTUtLjQ2IDEuODQ2czEuMjgzLjI5NCAxLjI1Ni4zMTJjLjcuMTc1LjgyNi42MzguODA1IDEuMDA2bC0uODA2IDMuMjM1Yy4wNDguMDEyLjExLjAzLjE4LjA1N2wtLjE4My0uMDQ1LTEuMTMgNC41MzJjLS4wODYuMjEyLS4zMDMuNTMxLS43OTMuNDEuMDE4LjAyNS0xLjI1Ni0uMzEzLTEuMjU2LS4zMTNsLS44NTggMS45NzggMi4yNS41NjFjLjQxOC4xMDUuODI4LjIxNSAxLjIzMS4zMThsLS43MTUgMi44NzIgMS43MjcuNDMuNzA4LTIuODRjLjQ3Mi4xMjcuOTMuMjQ1IDEuMzc4LjM1N2wtLjcwNiAyLjgyOCAxLjcyOC40My43MTUtMi44NjZjMi45NDguNTU4IDUuMTY0LjMzMyA2LjA5Ny0yLjMzMy43NTItMi4xNDYtLjAzNy0zLjM4NS0xLjU4OC00LjE5MiAxLjEzLS4yNiAxLjk4LTEuMDAzIDIuMjA3LTIuNTM4em0tMy45NSA1LjUzOGMtLjUzMyAyLjE0Ny00LjE0OC45ODYtNS4zMi42OTVsLjk1LTMuODA1YzEuMTcyLjI5MyA0LjkyOS44NzIgNC4zNyAzLjExem0uNTM1LTUuNTY5Yy0uNDg3IDEuOTUzLTMuNDk1Ljk2LTQuNDcuNzE3bC44Ni0zLjQ1Yy45NzUuMjQzIDQuMTE4LjY5NiAzLjYxIDIuNzMzeiIvPjwvZz48L3N2Zz4=',
    },
  ],
]);
