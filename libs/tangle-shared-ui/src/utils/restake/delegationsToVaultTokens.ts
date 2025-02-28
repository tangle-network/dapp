import { Decimal } from 'decimal.js';
import { RestakeAssetId, VaultToken } from '../../types';
import { OperatorDelegatorBond, RestakeAssetMap } from '../../types/restake';
import safeFormatUnits from '../safeFormatUnits';

const delegationsToVaultTokens = (
  delegations: OperatorDelegatorBond[],
  assetMap: RestakeAssetMap,
): VaultToken[] => {
  const result = new Map<RestakeAssetId, VaultToken>();

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

export default delegationsToVaultTokens;
