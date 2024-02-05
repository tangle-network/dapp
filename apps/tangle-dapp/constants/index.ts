export * from './swr';

export const PAYMENT_DESTINATION_OPTIONS = [
  'Staked (increase the amount at stake)',
  'Stash (do not increase the amount at stake)',
];

export const TANGLE_TOKEN_UNIT = 'tTNT';

export enum LockId {
  Vesting = 'vesting',
  Staking = 'staking',
}
