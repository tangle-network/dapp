import { FilterFnOption } from '@tanstack/react-table';

const filterTableRowBy = <T extends object>(
  selector: (row: T) => Array<string | number | undefined | null>,
): FilterFnOption<T> => {
  return (row, _id, filterValue: unknown): boolean => {
    // Unsupported or unexpected filter value type.
    if (typeof filterValue !== 'string') {
      console.warn(
        `Got unexpected filter value type (${typeof filterValue}):`,
        filterValue,
      );

      return true;
    }

    const normalizedQuery = filterValue.trim().toLowerCase();

    // No filter query is currently applied; return all rows.
    if (normalizedQuery === '') {
      return true;
    }

    const properties = selector(row.original);

    // If at least one of the values in the data array includes the query,
    // return true.
    return properties.some((value) => {
      if (value === undefined || value === null) {
        return false;
      }

      const normalizedValue = value.toString().toLowerCase();

      return normalizedValue.includes(normalizedQuery);
    });
  };
};

export default filterTableRowBy;
