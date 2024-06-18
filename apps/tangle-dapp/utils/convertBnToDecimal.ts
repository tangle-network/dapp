import { BN } from '@polkadot/util';
import Decimal from 'decimal.js';

export default function convertBNToDecimal(bn: BN, decimals: number): Decimal {
  const decimalValue = new Decimal(bn.toString());

  // Scale the decimal value appropriately
  const scaleFactor = new Decimal(10).pow(decimals);
  const scaledDecimalValue = decimalValue.div(scaleFactor);

  return scaledDecimalValue;
}
