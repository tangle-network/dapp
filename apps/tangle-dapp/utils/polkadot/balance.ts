import { PalletBalancesAccountData } from '@polkadot/types/lookup';
import { BN, BN_ZERO, bnMax } from '@polkadot/util';

export function getTransferable(accInfo: PalletBalancesAccountData) {
  const maxFrozen = bnMax(
    accInfo.frozen ?? BN_ZERO,
    accInfo.miscFrozen ?? BN_ZERO,
    accInfo.feeFrozen ?? BN_ZERO,
  );

  const transferable = BN.max(
    accInfo.free.sub(maxFrozen).sub(accInfo.reserved ?? BN_ZERO),
    BN_ZERO,
  );

  return transferable;
}
