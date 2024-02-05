import '@webb-tools/tangle-substrate-types';

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

export type NodeSpecification = {
  os: string;
  version: string;
  cpuCores: number;
  memory: number;
  isVirtualMachine: boolean;
  linuxDistribution: string;
  linuxKernel: string;
};

export enum PaymentDestination {
  Staked = 'Staked (increase the amount at stake)',
  Stash = 'Stash (do not increase the amount at stake)',
  Controller = 'Controller Account',
}

export enum InternalPath {
  EvmStaking = '/',
  ClaimAirdrop = '/claim',
  Account = '/account',
}

export type InternalPathString = InternalPath | `${InternalPath}/${string}`;

export enum AnchorLinkId {
  NominationAndPayouts = 'nomination-and-payouts',
}

export type RoleType = 'Tss' | 'ZkSaaS' | 'TxRelay';

export type Service = {
  serviceType: string;
  roleType: RoleType;
  initialJobId: number;
  participants: string[];
  thresholds?: number;
  phase2Executions?: number;
  earnings?: number;
  expirationBlock: number;
};
