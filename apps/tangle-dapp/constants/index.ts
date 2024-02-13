export * from './swr';

export const PAYMENT_DESTINATION_OPTIONS = [
  'Staked (increase the amount at stake)',
  'Stash (do not increase the amount at stake)',
];

export const TANGLE_TOKEN_UNIT = 'tTNT';

// Note that the chain decimal count is usually constant, and set when
// the blockchain is deployed. It could be technically changed due to
// governance decisions and subsequent runtime upgrades, but that would
// be exceptionally rare, so it is best to assume that it remains constant
// here. Regardless, it can easily be changed here in the future if need be.
export const TANGLE_TOKEN_DECIMALS = 18;

/**
 * The lock ids are always 8 characters long, due to their representation
 * as a `U8aFixed` in the Substrate runtime. That is why the enum values
 * are all 8 characters long, and may look a bit odd (e.g. `phrelect`, and
 * `vesting ` with a trailing space).
 */
export enum SubstrateLockId {
  Vesting = 'vesting ',
  Staking = 'staking ',
  ElectionsPhragmen = 'phrelect',
  Democracy = 'democrac',

  // TODO: Need to account for the other lock types.
  Other = '?other',
}
