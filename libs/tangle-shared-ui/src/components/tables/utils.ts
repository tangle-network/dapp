import type { SortingFn } from '@tanstack/react-table';
import type { BasicAccountInfo } from '../../types';

export const sortByAddressOrIdentity = <
  T extends BasicAccountInfo,
>(): SortingFn<T> => {
  return (rowA, rowB) => {
    const { address: addressA, identityName: identityNameA } = rowA.original;
    const { address: addressB, identityName: identityNameB } = rowB.original;

    // Both accounts have identities, sort by identity name (a-z).
    if (identityNameA && identityNameB) {
      return identityNameA.localeCompare(identityNameB);
    }
    // Only the first account has an identity, it should come first.
    else if (identityNameA) {
      return -1;
    }
    // Only the second account has an identity, it should come first.
    else if (identityNameB) {
      return 1;
    }
    // Neither account has an identity, sort by address (a-z).
    else {
      return addressA.localeCompare(addressB);
    }
  };
};
