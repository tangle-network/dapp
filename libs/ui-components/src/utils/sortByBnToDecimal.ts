import { BN } from '@polkadot/util';
import { SortingFn } from '@tanstack/react-table';
import convertBNToDecimal from './convertBnToDecimal';

const sortByBnToDecimal = <T>(
  selector: (row: T) => BN | null | undefined,
  decimalsSelector: (row: T) => number | null | undefined,
): SortingFn<T> => {
  return (rowA, rowB) => {
    const bnA = selector(rowA.original);
    const bnB = selector(rowB.original);

    const decimalsA = decimalsSelector(rowA.original);
    const decimalsB = decimalsSelector(rowB.original);

    // If both values are null/undefined, treat them as equal
    if (
      (bnA === undefined || bnA === null) &&
      (bnB === undefined || bnB === null) &&
      (decimalsA === undefined || decimalsA === null) &&
      (decimalsB === undefined || decimalsB === null)
    ) {
      return 0;
    }

    // Prioritize B if A is undefined or null
    if (
      bnA === undefined ||
      bnA === null ||
      decimalsA === undefined ||
      decimalsA === null
    ) {
      return 1;
    }

    // Prioritize B if B is undefined or null
    if (
      bnB === undefined ||
      bnB === null ||
      decimalsB === undefined ||
      decimalsB === null
    ) {
      return -1;
    }

    const fmtA = convertBNToDecimal(bnA, decimalsA);
    const fmtB = convertBNToDecimal(bnB, decimalsB);

    return fmtA.cmp(fmtB);
  };
};

export default sortByBnToDecimal;
