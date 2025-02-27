import { PalletRewardsRewardConfigForAssetVault } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import {
  AssetBalanceMap,
  DelegatorInfo,
  RestakeAssetMetadata,
} from '@tangle-network/tangle-shared-ui/types/restake';

// Use undefined for values that are not available
// as React Table does not support sorting by null values
export type VaultType = {
  id: number;
  name: string;
  representAssetSymbol: string;
  decimals: number;
  capacity: BN | undefined;
  reward: BN | undefined;
  tokenCount: number;
  available: BN | undefined;
  totalDeposits: BN | undefined;
  tvl: BN | undefined;
};

type CalculateVaultsParams = {
  assets: RestakeAssetMetadata[];
  balances: AssetBalanceMap;
  delegatorInfo?: DelegatorInfo | null;
  vaultsRewards?: Map<number, BN> | null;
  assetTvl?: Map<RestakeAssetId, BN> | null;
  rewardConfig?: Map<number, PalletRewardsRewardConfigForAssetVault> | null;
};

const calculateVaults = ({
  assets,
  balances,
  delegatorInfo,
  vaultsRewards,
  assetTvl,
  rewardConfig,
}: CalculateVaultsParams): Map<number, VaultType> => {
  const vaults = new Map<number, VaultType>();

  for (const { assetId, vaultId, name, symbol, decimals } of assets) {
    if (vaultId === null) {
      continue;
    }

    const available =
      typeof balances[assetId]?.balance === 'bigint'
        ? new BN(balances[assetId].balance.toString())
        : undefined;

    const totalDeposits =
      typeof delegatorInfo?.deposits[assetId]?.amount === 'bigint'
        ? new BN(delegatorInfo.deposits[assetId].amount.toString())
        : undefined;

    const tvl = assetTvl?.get(assetId);

    const existingVault = vaults.get(vaultId);

    if (existingVault === undefined) {
      const capacity = rewardConfig?.get(vaultId)?.depositCap.toBn();
      const reward = vaultsRewards?.get(vaultId);

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
    } else {
      // Update existing vault values
      existingVault.available = addBNsIfValid(
        existingVault.available,
        available,
      );
      existingVault.totalDeposits = addBNsIfValid(
        existingVault.totalDeposits,
        totalDeposits,
      );
      existingVault.tvl = addBNsIfValid(existingVault.tvl, tvl);
      existingVault.tokenCount = existingVault.tokenCount + 1;
    }
  }

  return vaults;
};

// Helper function to add BN values if they're valid
const addBNsIfValid = (
  existing: BN | undefined,
  newValue: BN | undefined,
): BN | undefined => {
  if (existing === undefined) return newValue;
  if (newValue === undefined) return existing;
  return existing.add(newValue);
};

export default calculateVaults;
