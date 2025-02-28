import { PalletRewardsRewardConfigForAssetVault } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import {
  DelegatorInfo,
  RestakeAsset,
} from '@tangle-network/tangle-shared-ui/types/restake';

export type RestakeVault = {
  id: number;
  name: string;
  representAssetSymbol: string;
  decimals: number;
  capacity?: BN;
  reward?: BN;
  tokenCount: number;
  available?: BN;
  totalDeposits?: BN;
  tvl?: BN;
};

type Options = {
  assets: RestakeAsset[];
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

    const available = asset.balance;

    const totalDeposits =
      typeof delegatorInfo?.deposits[asset.id]?.amount === 'bigint'
        ? new BN(delegatorInfo.deposits[asset.id].amount.toString())
        : undefined;

    const tvl = assetTvl?.get(asset.id);
    const existingVault = vaults.get(asset.metadata.vaultId);

    if (existingVault === undefined) {
      const capacity = rewardConfig
        ?.get(asset.metadata.vaultId)
        ?.depositCap.toBn();

      const reward = vaultsRewards?.get(asset.metadata.vaultId);

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

const tryAddBNs = (a: BN | undefined, b: BN | undefined): BN | undefined => {
  if (a === undefined) {
    return b;
  } else if (b === undefined) {
    return a;
  }

  return a.add(b);
};

export default createVaultMap;
