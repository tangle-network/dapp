import { PalletRewardsRewardConfigForAssetVault } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import {
  AssetBalanceMap,
  DelegatorInfo,
  RestakeAssetMetadata,
} from '@webb-tools/tangle-shared-ui/types/restake';

export type VaultType = {
  id: number;
  name: string;
  representAssetSymbol: string;
  decimals: number;
  capacity: BN | null;
  reward: BN | null;
  tokenCount: number;
  available: BN | null;
  totalDeposits: BN | null;
  tvl: BN | null;
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
const addBNsIfValid = (existing: BN | null, newValue: BN | null): BN | null => {
  if (existing === null) return newValue;
  if (newValue === null) return existing;
  return existing.add(newValue);
};

export default calculateVaults;
