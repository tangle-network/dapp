import { BN } from '@polkadot/util';
import { SortingFn } from '@tanstack/react-table';

const sortByBn = <T>(
  selector: (row: T) => BN | null | undefined,
): SortingFn<T> => {
  return (rowA, rowB) => {
    const bnA = selector(rowA.original);
    const bnB = selector(rowB.original);

    if (bnA === undefined || bnA === null) {
      return 1;
    } else if (bnB === undefined || bnB === null) {
      return -1;
    }

    return bnB.cmp(bnA);
  };
};

export default sortByBn;
