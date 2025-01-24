import { VaultToken } from '../../types';
import { RestakeVaultMap, OperatorDelegatorBond } from '../../types/restake';
import safeFormatUnits from '../safeFormatUnits';

export default function delegationsToVaultTokens(
  delegations: OperatorDelegatorBond[],
  assetMap: RestakeVaultMap,
) {
  return delegations.reduce<VaultToken[]>(
    (vaultTokenArr, { assetId, amount }) => {
      const asset = assetMap[assetId];

      if (asset === undefined) return vaultTokenArr;

      const parsed = safeFormatUnits(amount, asset.decimals);

      if (parsed.success === false) return vaultTokenArr;

      return vaultTokenArr.concat({
        name: asset.name,
        symbol: asset.symbol,
        amount: parsed.value,
      });
    },
    [],
  );
}
