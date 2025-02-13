import { rankItem } from '@tanstack/match-sorter-utils';
import { FilterFn } from '@tanstack/react-table';

// TODO: Find a way to avoid using `any` here, since `any` will propagate and possibly lead to logic bugs.
export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};
