import { Decimal } from 'decimal.js';
import { RestakeAssetId, VaultToken } from '../../types';
import { OperatorDelegatorBond, RestakeAssetMap } from '../../types/restake';
import safeFormatUnits from '../safeFormatUnits';

export default function delegationsToVaultTokens(
  delegations: OperatorDelegatorBond[],
  assetMap: RestakeAssetMap,
): VaultToken[] {
  const vaultTokenMap = new Map<RestakeAssetId, VaultToken>();

  delegations.forEach(({ assetId, amount }) => {
    const asset = assetMap.get(assetId);

    if (asset === undefined) {
      return;
    }

    const parsed = safeFormatUnits(amount, asset.decimals);

    if (parsed.success === false) {
      return;
    }

    const vaultToken = vaultTokenMap.get(assetId);

    if (vaultToken === undefined) {
      vaultTokenMap.set(assetId, {
        name: asset.name,
        symbol: asset.symbol,
        amount: new Decimal(parsed.value),
      });
    } else {
      vaultToken.amount = vaultToken.amount.plus(parsed.value);
    }
  });

  return Array.from(vaultTokenMap.values());
}
