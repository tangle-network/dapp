import { PalletBalancesAccountData } from '@polkadot/types/lookup';
import { BN, BN_ZERO } from '@polkadot/util';

export function getTransferable(accInfo: PalletBalancesAccountData) {
  const maxFrozen = accInfo.frozen ?? BN_ZERO;

  const transferable = BN.max(
    accInfo.free.sub(maxFrozen).sub(accInfo.reserved ?? BN_ZERO),
    BN_ZERO,
  );

  return transferable;
}
