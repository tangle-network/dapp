import { PalletRewardsRewardConfigForAssetVault } from '@polkadot/types/lookup';
import { RestakeAssetMetadata } from '@webb-tools/tangle-shared-ui/types/restake';

export type VaultType = {
  id: number;
  name: string;
  apyPercentage: number | null;
  tokenCount: number;
  tvlInUsd: number | null;
  representToken: string;
};

type CalculateVaultsParams = {
  assets: RestakeAssetMetadata[];
  rewardConfig?: Map<number, PalletRewardsRewardConfigForAssetVault> | null;
  vaultTVL?: Record<string, number>;
};

const calculateVaults = ({
  assets,
  rewardConfig,
  vaultTVL = {},
}: CalculateVaultsParams): Map<number, VaultType> => {
  const vaults = new Map<number, VaultType>();

  for (const { vaultId, name, symbol } of assets) {
    if (vaultId === null) {
      continue;
    } else if (!vaults.has(vaultId)) {
      const apyPercentage = rewardConfig?.get(vaultId)?.apy.toNumber() ?? null;
      const tvlInUsd = vaultTVL[vaultId] ?? null;

      vaults.set(vaultId, {
        id: vaultId,
        apyPercentage,
        name: `${name} vault #${vaultId}`,
        representToken: symbol,
        tokenCount: 1,
        tvlInUsd,
      });
    } else {
      const vault = vaults.get(vaultId);
      if (vault) {
        vault.tokenCount += 1;
      }
    }
  }

  return vaults;
};

export default calculateVaults;
