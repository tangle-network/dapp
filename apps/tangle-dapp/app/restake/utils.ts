import type { VaultToken } from '../../components/tables/Operators/types';
import type { AssetMap, OperatorDelegatorBond } from '../../types/restake';
import safeFormatUnits from '../../utils/safeFormatUnits';

export function calculateTimeRemaining(
  currentRound: number,
  requestedRound: number,
  delay: number | null,
) {
  if (typeof delay !== 'number') return -1;

  const roundPassed = currentRound - requestedRound;
  if (roundPassed >= delay) return 0;

  return delay - roundPassed;
}

export function isScheduledRequestReady(timeRemaining: number) {
  return timeRemaining === 0;
}

export function delegationsToVaultTokens(
  delegations: OperatorDelegatorBond[],
  assetMap: AssetMap,
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
