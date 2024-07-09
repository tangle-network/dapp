import { BN } from '@polkadot/util';
import { SortingFn } from '@tanstack/react-table';

/**
 * Sort function for Tanstack tables for columns that use BN values
 */
const sortBnFn: SortingFn<any> = (rowA, rowB, columnId) => {
  const amountA = rowA.original[columnId as keyof typeof rowA];
  const amountB = rowB.original[columnId as keyof typeof rowB];

  if (!BN.isBN(amountA) || !BN.isBN(amountB)) {
    throw new Error('Expected BN value');
  }

  return amountA.cmp(amountB);
};

export default sortBnFn;
