import { DerivedUserLoan } from '@acala-network/api-derive';

/**
 * @name filterEmptyLoan
 * @description filter empty loan
 * @param loans
 */
export const filterEmptyLoan = (loans: DerivedUserLoan[] | null): DerivedUserLoan[] => {
  if (!loans) {
    return [];
  }

  return loans.filter((item) => {
    return !(item.collateral.isEmpty && item.debit.isEmpty);
  });
};
