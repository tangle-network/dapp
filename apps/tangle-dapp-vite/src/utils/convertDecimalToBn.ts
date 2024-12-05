import { BN } from '@polkadot/util';
import Decimal from 'decimal.js';

export default function convertDecimalToBN(
  decimal: Decimal,
  decimals: number,
): BN {
  const scaleFactor = new Decimal(10).pow(decimals);
  const scaledValue = decimal.mul(scaleFactor);
  const decimalStr = scaledValue.toFixed(0); // Convert to a string without decimal places
  const decimalBN = new BN(decimalStr);
  return decimalBN;
}
