import { PalletRewardsRewardConfigForAssetVault } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import {
  AssetBalanceMap,
  DelegatorInfo,
  RestakeAssetMetadata,
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
  assets: RestakeAssetMetadata[];
  balances: AssetBalanceMap;
  delegatorInfo?: DelegatorInfo | null;
  vaultsRewards?: Map<number, BN> | null;
  assetTvl?: Map<RestakeAssetId, BN> | null;
  rewardConfig?: Map<number, PalletRewardsRewardConfigForAssetVault> | null;
};

const createVaultMap = ({
  assets,
  balances,
  delegatorInfo,
  vaultsRewards,
  assetTvl,
  rewardConfig,
}: Options): Map<number, RestakeVault> => {
  const vaults = new Map<number, RestakeVault>();

  for (const { assetId, vaultId, name, symbol, decimals } of assets) {
    if (vaultId === null) {
      continue;
    }

    const available =
      typeof balances[assetId]?.balance === 'bigint'
        ? new BN(balances[assetId].balance.toString())
        : null;

    const totalDeposits =
      typeof delegatorInfo?.deposits[assetId]?.amount === 'bigint'
        ? new BN(delegatorInfo.deposits[assetId].amount.toString())
        : null;

    const tvl = assetTvl?.get(assetId) ?? null;
    const existingVault = vaults.get(vaultId);

    if (existingVault === undefined) {
      const capacity = rewardConfig?.get(vaultId)?.depositCap.toBn() ?? null;
      const reward = vaultsRewards?.get(vaultId) ?? null;

      vaults.set(vaultId, {
        id: vaultId,
        name: name ?? symbol,
        representAssetSymbol: symbol,
        decimals,
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
      existingVault.available = tryAddBNs(
        existingVault.available,
        available,
      );

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
