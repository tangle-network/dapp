import type { SortingFn } from '@tanstack/react-table';

// Generic sort function for any type with a cmp method
const sortByComparable = <TRow, C extends { cmp: (other: C) => number }>(
  selector: (row: TRow) => C | null | undefined,
): SortingFn<TRow> => {
  return (rowA, rowB) => {
    const valueA = selector(rowA.original);
    const valueB = selector(rowB.original);

    // If both values are null/undefined, treat them as equal
    if (
      (valueA === undefined || valueA === null) &&
      (valueB === undefined || valueB === null)
    ) {
      return 0;
    }

    // If only A is null/undefined, it should come last
    if (valueA === undefined || valueA === null) {
      return 1;
    }
    // If only B is null/undefined, it should come last
    else if (valueB === undefined || valueB === null) {
      return -1;
    }

    return valueA.cmp(valueB);
  };
};

export default sortByComparable;
