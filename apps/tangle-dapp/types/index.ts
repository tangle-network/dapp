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

export enum PaymentDestination {
  AUTO_COMPOUND = 'Current account (increase the amount at stake)',
  NO_AUTO_COMPOUND = 'Current account (do not increase the amount at stake)',
}

export type ValidatorType = {
  address: string;
  identity: string;
};
