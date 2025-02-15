import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

export type ValidatorReward = {
  validatorAddress: SubstrateAddress;
  era: number;
  eraTotalRewardPoints: number;
  validatorRewardPoints: number;
};

export enum PayoutsEraRange {
  TWO = 2,
  SIX = 6,
  EIGHTEEN = 18,
  FIFTY_FOUR = 54,
  MAX_EIGHTY = 80,
}
