import { U8aFixed } from '@polkadot/types';
import { u8aToString } from '@polkadot/util';

import { SubstrateLockId } from '../constants';

/**
 * Substrate lock ids are in the form of a `U8aFixed`, which is a 32-byte
 * fixed-length array.
 *
 * This function converts the lock id to a more
 * human-readable format, which is also typed under a TypeScript enum
 * to improve type safety.
 */
function getSubstrateLockId(rawLockId: U8aFixed): SubstrateLockId {
  // For some reason, the lock id has an extra space at the end when
  // converted to a string, so trim it.
  const lockIdString = u8aToString(rawLockId).trim();

  switch (lockIdString) {
    case 'vesting':
      return SubstrateLockId.Vesting;
    case 'staking':
      return SubstrateLockId.Staking;
    default:
      return SubstrateLockId.Other;
  }
}

export default getSubstrateLockId;
