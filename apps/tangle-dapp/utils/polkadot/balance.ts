import { PalletBalancesAccountData } from '@polkadot/types/lookup';
import { BN, BN_ZERO, bnMax } from '@polkadot/util';

// TODO: Update calculation with provided definition from Polkadot docs: https://wiki.polkadot.network/docs/learn-account-balances
export function calculateTransferrableBalance(
  accInfo: PalletBalancesAccountData,
) {
  const maxFrozen = bnMax(
    accInfo.frozen ?? BN_ZERO,
    'miscFrozen' in accInfo && BN.isBN(accInfo.miscFrozen)
      ? accInfo.miscFrozen
      : BN_ZERO,
    'feeFrozen' in accInfo && BN.isBN(accInfo.feeFrozen)
      ? accInfo.feeFrozen
      : BN_ZERO,
  );

  const transferable = BN.max(
    accInfo.free.sub(maxFrozen).sub(accInfo.reserved ?? BN_ZERO),
    BN_ZERO,
  );

  return transferable;
}
