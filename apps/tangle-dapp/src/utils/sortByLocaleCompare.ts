import { SortingFn } from '@tanstack/react-table';

const sortByLocaleCompare = <T>(selector: (row: T) => string): SortingFn<T> => {
  return (rowA, rowB) => {
    const valueA = selector(rowA.original);
    const valueB = selector(rowB.original);

    // Sorting is reversed by default.
    return valueA.localeCompare(valueB);
  };
};

export default sortByLocaleCompare;
