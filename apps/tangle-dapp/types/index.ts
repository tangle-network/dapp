export type Validator = {
  address: string;
  identity: string;
  selfStaked: string;
  effectiveAmountStaked: string;
  effectiveAmountStakedRaw: string;
  delegations: string;
};

export type Delegator = {
  address: string;
  identity: string;
  totalStaked: string;
  isActive: boolean;
};

export enum PaymentDestination {
  Staked = 'Staked (increase the amount at stake)',
  Stash = 'Stash (do not increase the amount at stake)',
  Controller = 'Controller Account',
}
