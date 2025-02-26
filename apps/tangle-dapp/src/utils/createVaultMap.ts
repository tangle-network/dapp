import { PalletRewardsRewardConfigForAssetVault } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import {
  DelegatorInfo,
  RestakeAsset2,
} from '@tangle-network/tangle-shared-ui/types/restake';

export type RestakeVault = {
  id: number;
  name: string;
  representAssetSymbol: string;
  decimals: number;
  tokenCount: number;
  available: BN | null;
  totalDeposits: BN | null;
  tvl: BN | null;
  capacity: BN | null;
  reward: BN | null;
};

type Options = {
  assets: RestakeAsset2[];
  delegatorInfo?: DelegatorInfo | null;
  vaultsRewards?: Map<number, BN> | null;
  assetTvl?: Map<RestakeAssetId, BN> | null;
  rewardConfig?: Map<number, PalletRewardsRewardConfigForAssetVault> | null;
};

const createVaultMap = ({
  assets,
  delegatorInfo,
  vaultsRewards,
  assetTvl,
  rewardConfig,
}: Options): Map<number, RestakeVault> => {
  const vaults = new Map<number, RestakeVault>();

  for (const asset of assets) {
    if (asset.metadata.vaultId === null) {
      continue;
    }

    const available = asset.balance ?? null;

    const totalDeposits =
      typeof delegatorInfo?.deposits[asset.assetId]?.amount === 'bigint'
        ? new BN(delegatorInfo.deposits[asset.assetId].amount.toString())
        : null;

    const tvl = assetTvl?.get(asset.assetId) ?? null;
    const existingVault = vaults.get(asset.metadata.vaultId);

    if (existingVault === undefined) {
      const capacity =
        rewardConfig?.get(asset.metadata.vaultId)?.depositCap.toBn() ?? null;

      const reward = vaultsRewards?.get(asset.metadata.vaultId) ?? null;

      vaults.set(asset.metadata.vaultId, {
        id: asset.metadata.vaultId,
        name: asset.metadata.name ?? asset.metadata.symbol,
        representAssetSymbol: asset.metadata.symbol,
        decimals: asset.metadata.decimals,
        capacity,
        reward,
        tokenCount: 1,
        available,
        totalDeposits,
        tvl,
      });
    }
    // Update existing vault values.
    else {
      existingVault.available = tryAddBNs(existingVault.available, available);

      existingVault.totalDeposits = tryAddBNs(
        existingVault.totalDeposits,
        totalDeposits,
      );

      existingVault.tvl = tryAddBNs(existingVault.tvl, tvl);
      existingVault.tokenCount = existingVault.tokenCount + 1;
    }
  }

  return vaults;
};

const tryAddBNs = (a: BN | null, b: BN | null): BN | null => {
  if (a === null) {
    return b;
  } else if (b === null) {
    return a;
  }

  return a.add(b);
};

export default createVaultMap;
