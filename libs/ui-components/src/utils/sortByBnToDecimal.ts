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

    if (bnA === undefined || bnA === null) {
      return 1;
    }

    if (bnB === undefined || bnB === null) {
      return -1;
    }

    const decimalsA = decimalsSelector(rowA.original);
    const decimalsB = decimalsSelector(rowB.original);

    if (decimalsA === undefined || decimalsA === null) {
      return 1;
    }

    if (decimalsB === undefined || decimalsB === null) {
      return -1;
    }

    const fmtA = convertBNToDecimal(bnA, decimalsA);
    const fmtB = convertBNToDecimal(bnB, decimalsB);

    return fmtA.cmp(fmtB);
  };
};

export default sortByBnToDecimal;
