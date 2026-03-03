import { Decimal } from 'decimal.js';
import type { StakingAssetId, VaultToken } from '../../types';
import type { OperatorDelegatorBond } from '../../types/staking';
import type { StakingAssetMap } from '../../types/staking';
import safeFormatUnits from '../../utils/safeFormatUnits';

const mapDelegationsToVaultTokens = (
  delegations: OperatorDelegatorBond[],
  assetMap: StakingAssetMap,
): VaultToken[] => {
  const result = new Map<StakingAssetId, VaultToken>();

  for (const { assetId, amount } of delegations) {
    const asset = assetMap.get(assetId);

    if (asset === undefined) {
      continue;
    }

    const parsed = safeFormatUnits(amount, asset.metadata.decimals);

    if (parsed.success === false) {
      continue;
    }

    const vaultToken = result.get(assetId);

    if (vaultToken === undefined) {
      result.set(assetId, {
        name: asset.metadata.name,
        symbol: asset.metadata.symbol,
        amount: new Decimal(parsed.value),
      });
    } else {
      vaultToken.amount = vaultToken.amount.plus(parsed.value);
    }
  }

  return Array.from(result.values());
};

export default mapDelegationsToVaultTokens;
