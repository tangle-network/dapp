import { BN } from '@polkadot/util';
import { SortingFn } from '@tanstack/react-table';

const sortByBn = <T>(
  selector: (row: T) => BN | null | undefined,
): SortingFn<T> => {
  return (rowA, rowB) => {
    const bnA = selector(rowA.original);
    const bnB = selector(rowB.original);

    // Prioritize B if A is undefined or null.
    if (bnA === undefined || bnA === null) {
      return 1;
    }
    // Prioritize A if B is undefined or null.
    else if (bnB === undefined || bnB === null) {
      return -1;
    }

    return bnA.cmp(bnB);
  };
};

export default sortByBn;
