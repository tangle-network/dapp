import { BN } from '@polkadot/util';
import { SortingFn } from '@tanstack/react-table';

import { Nominee } from '../types';

// Utility type to extract keys of type T that have value type U
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Type that represents the keys of Nominee that have type BN
// Note: Validator extends Nominee, so this type will also work for Validator
type BNFields = KeysOfType<Nominee, BN>;

const bnFieldsArray: BNFields[] = [
  'commission',
  'selfStakeAmount',
  'totalStakeAmount',
];

/**
 * Sort function for Tanstack tables for columns that use BN values
 */
export const sortBnValueForNomineeOrValidator: SortingFn<Nominee> = (
  rowA,
  rowB,
  columnId,
) => {
  if (!bnFieldsArray.includes(columnId as BNFields)) {
    throw new Error('Wrong column ID');
  }

  const amountA = rowA.original[columnId as keyof Nominee];
  const amountB = rowB.original[columnId as keyof Nominee];

  if (!BN.isBN(amountA) || !BN.isBN(amountB)) {
    throw new Error('Expected BN value');
  }

  return amountA.cmp(amountB);
};

export const sortAddressOrIdentityForNomineeOrValidator: SortingFn<Nominee> = (
  rowA,
  rowB,
) => {
  const { address: addressA, identityName: identityNameA } = rowA.original;
  const { address: addressB, identityName: identityNameB } = rowB.original;
  const sortingValueA = identityNameA === addressA ? addressA : identityNameA;
  const sortingValueB = identityNameB === addressB ? addressB : identityNameB;
  return sortingValueB.localeCompare(sortingValueA);
};
