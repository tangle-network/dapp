export type Validator = {
  address: string;
  identity: string;
  selfStaked: string;
  effectiveAmountStaked: string;
  effectiveAmountStakedRaw: string;
  delegations: string;
  commission: string;
  status: string;
};

export type Delegator = {
  address: string;
  identity: string;
  selfStaked: string;
  isActive: boolean;
  commission: string;
  delegations: string;
  effectiveAmountStaked: string;
};

export enum PaymentDestination {
  Staked = 'Staked (increase the amount at stake)',
  Stash = 'Stash (do not increase the amount at stake)',
  Controller = 'Controller Account',
}

type AddressWithIdentity = {
  address: string;
  identity: string;
};

export type Payout = {
  era: string;
  validator: AddressWithIdentity;
  validatorTotalStake: string;
  nominators: AddressWithIdentity[];
  validatorTotalReward: string;
  nominatorTotalReward: string;
  status: 'claimed' | 'unclaimed';
};
