import { BN } from '@polkadot/util';
import { SortingFn } from '@tanstack/react-table';

import { BasicAccountInfo, Nominee, Payout } from '../types';

// Utility type to extract keys of type T that have value type U
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

const nomineeBnFieldsArray: KeysOfType<Nominee, BN>[] = [
  'commission',
  'selfStakeAmount',
  'totalStakeAmount',
];

const payoutBnFieldsArray: KeysOfType<Payout, BN>[] = [
  'validatorTotalStake',
  'validatorTotalReward',
  'nominatorTotalReward',
  'nominatorTotalRewardRaw',
];

/**
 * Generic sort function for Tanstack tables for columns that use BN values
 */
const sortBnValue =
  <T>(bnFieldsArray: KeysOfType<T, BN>[]): SortingFn<T> =>
  (rowA, rowB, columnId) => {
    if (!bnFieldsArray.includes(columnId as KeysOfType<T, BN>)) {
      throw new Error(`Invalid column ID: ${columnId}`);
    }

    const amountA = rowA.original[columnId as keyof T];
    const amountB = rowB.original[columnId as keyof T];

    if (!BN.isBN(amountA) || !BN.isBN(amountB)) {
      throw new Error(`Expected BN values for column: ${columnId}`);
    }

    return amountA.cmp(amountB);
  };

export const sortBnValueForNomineeOrValidator =
  sortBnValue<Nominee>(nomineeBnFieldsArray);
export const sortBnValueForPayout = sortBnValue<Payout>(payoutBnFieldsArray);

export const getSortAddressOrIdentityFnc = <
  T extends BasicAccountInfo,
>(): SortingFn<T> => {
  return (rowA, rowB) => {
    const { address: addressA, identityName: identityNameA } = rowA.original;
    const { address: addressB, identityName: identityNameB } = rowB.original;
    const sortingValueA = identityNameA === addressA ? addressA : identityNameA;
    const sortingValueB = identityNameB === addressB ? addressB : identityNameB;
    return sortingValueB.localeCompare(sortingValueA);
  };
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
