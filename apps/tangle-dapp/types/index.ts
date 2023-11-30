export type Validator = {
  address: string;
  identity: string;
  selfStaked: string;
  effectiveAmountStaked: string;
  delegations: string;
};

export type Delegator = {
  address: string;
  identity: string;
  totalStaked: string;
  isActive: boolean;
};
