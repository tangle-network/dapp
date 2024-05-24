/**
 * Type for the restaking earnings record,
 * key is the era number and value is the restaking earnings for that era
 */
export type EarningRecord = Record<number, bigint>;

/**
 * Type for the restaking rewards record entries,
 * first element is the era number and the second element is the restaking rewards for that era
 */
export type ErasRestakeRewardPointsEntry = [
  number,
  {
    total: number;
    individual: {
      [accountId: string]: number;
    };
  },
];
