import { Fixed18 } from '@webb-tools/app-util';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

export * from './account';
export * from './formatter';

dayjs.extend(duration);

export const numToFixed18Inner = (num: number | string): string => {
  return Fixed18.fromNatural(num).innerToString();
};

export const eliminateGap = (
  target: FixedPointNumber,
  max: FixedPointNumber,
  gap: FixedPointNumber = new FixedPointNumber('0.000001')
): FixedPointNumber => {
  const _gap = target.minus(max);

  // target is larger than max, but not large enough
  if (_gap.isGreaterThan(FixedPointNumber.ZERO) && _gap.isLessThan(gap)) {
    return max;
  }

  // target is smaller than max, but not small enough.
  if (_gap.isLessThan(FixedPointNumber.ZERO) && _gap.abs().isLessThan(gap)) {
    return max;
  }

  return target;
};

export const focusToFixed18 = (origin: Fixed18 | FixedPointNumber): Fixed18 => {
  if (origin instanceof FixedPointNumber) {
    return Fixed18.fromParts(origin.toChainData());
  }

  return origin;
};

export const focusToFixedPointNumber = (origin: Fixed18 | FixedPointNumber): FixedPointNumber => {
  if (origin instanceof Fixed18) {
    return FixedPointNumber._fromBN(origin.getInner());
  }

  return origin;
};

export const MIN_NON_NEGATIVE = new FixedPointNumber('0.000001');

export const isSimilarZero = (target: FixedPointNumber, minimum: FixedPointNumber = MIN_NON_NEGATIVE): boolean => {
  if (target.isNegative()) {
    target = FixedPointNumber.ZERO.minus(target);
  }

  if (target.isLessOrEqualTo(minimum)) return true;

  return false;
};

export const isCodec = (target: any): boolean => {
  if (typeof target !== 'object') return false;

  return Reflect.has(target, 'toHuman');
};
