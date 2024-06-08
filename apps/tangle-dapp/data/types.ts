export type ValidatorReward = {
  validatorAddress: string;
  era: number;
  eraTotalRewardPoints: number;
  validatorRewardPoints: number;
};

export enum PayoutFilterableEra {
  TWO = 2,
  SIX = 6,
  EIGHTEEN = 18,
  FIFTYFOUR = 54,
  MAX = 80,
}
