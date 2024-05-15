import Decimal from 'decimal';

// Approximate the fraction p/q into a fraction.
export default function fraction(
  p: number | string | bigint,
  q: number | string | bigint
): number {
  if (new Decimal(q.toString()).isZero()) {
    return Number.NaN;
  }

  return new Decimal(p.toString()).div(q.toString()).toNumber();
}
