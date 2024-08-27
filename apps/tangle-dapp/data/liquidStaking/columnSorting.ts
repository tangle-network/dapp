/**
 * Function to sort rows based on their selected status.
 * Selected rows are sorted to appear before non-selected rows.
 */

import { BN } from '@polkadot/util';
import { Row } from '@tanstack/react-table';

export const sortSelected = <T extends { getIsSelected: () => boolean }>(
  rowA: Row<T>,
  rowB: Row<T>,
) => {
  const rowASelected = rowA.getIsSelected();
  const rowBSelected = rowB.getIsSelected();
  return rowASelected === rowBSelected ? 0 : rowASelected ? -1 : 1;
};

/**
 * Function to sort rows based on the total value staked.
 * Rows with higher staked values are sorted before those with lower values.
 */
export const sortValueStaked = <T extends { totalValueStaked: BN }>(
  rowA: Row<T>,
  rowB: Row<T>,
) => {
  const rowAValue = rowA.original.totalValueStaked;
  const rowBValue = rowB.original.totalValueStaked;
  return Number(rowAValue.sub(rowBValue).toString());
};

/**
 * Function to sort rows based on commission values.
 * Rows with lower commission values are sorted before those with higher values.
 */
export const sortCommission = <
  T extends { validatorCommission?: BN; commission?: BN },
>(
  rowA: Row<T>,
  rowB: Row<T>,
) => {
  const rowAValue =
    Number(rowA.original.validatorCommission) ||
    Number(rowA.original.commission);
  const rowBValue =
    Number(rowB.original.validatorCommission) ||
    Number(rowB.original.commission);
  return rowAValue - rowBValue;
};

/**
 * Function to sort rows based on the number of delegations for collators.
 * Rows with fewer delegations are sorted before those with more delegations.
 */
export const sortDelegationCount = <
  T extends { collatorDelegationCount: number },
>(
  rowA: Row<T>,
  rowB: Row<T>,
) => {
  const rowAValue = rowA.original.collatorDelegationCount;
  const rowBValue = rowB.original.collatorDelegationCount;
  return rowAValue - rowBValue;
};

/**
 * Function to sort rows based on type.
 * Uses localeCompare for string comparison to ensure proper alphabetical order.
 */
export const sortType = <T extends { type: string }>(
  rowA: Row<T>,
  rowB: Row<T>,
) => {
  const rowAType = rowA.original.type;
  const rowBType = rowB.original.type;
  return rowAType.localeCompare(rowBType);
};
