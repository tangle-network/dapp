import { BN } from '@polkadot/util';
import { Decimal } from 'decimal.js';

const PERBILL_FACTOR = 1_000_000_000;

/**
 * @returns Commission in fractional form (0-1 decimal
 * representing a percentage).
 */
const calculateCommission = (commissionPerbill: BN): number => {
  if (commissionPerbill.isZero()) {
    return 0;
  }

  return new Decimal(commissionPerbill.toString())
    .div(PERBILL_FACTOR)
    .toNumber();
};

export default calculateCommission;
