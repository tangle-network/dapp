import type { ChipColors } from '@webb-tools/webb-ui-components/components/Chip';

import { ServiceType } from '../types';

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

/**
 * Stale-while-revalidate (SWR) is a strategy for caching fetch requests.
 *
 * It helps automatically avoid redundant requests if made again before
 * a specified period has elapsed. This can be particularly useful for
 * Polkadot API requests that return Promise objects.
 *
 * Since these requests don't always require real-time data and their
 * responses might not change frequently, caching them for a particular
 * duration can be efficient.
 *
 * [Learn more about SWR](https://swr.vercel.app/)
 */
export enum SwrBaseKey {
  ActiveValidators = 'active-validators',
  WaitingValidators = 'waiting-validators',
  ActiveValidatorsPaginated = 'active-validator-paginated',
}

export const serviceTypeToChipColor = {
  [ServiceType.DKG_TSS_CGGMP]: 'purple',
  [ServiceType.TX_RELAY]: 'green',
  [ServiceType.ZK_SAAS_GROTH16]: 'blue',
  [ServiceType.ZK_SAAS_MARLIN]: 'yellow',
} as const satisfies Record<ServiceType, ChipColors>;

export enum StaticAssetPath {
  RestakingMethodIndependentDark = '/static/assets/restaking/method-independent-dark.svg',
  RestakingMethodSharedDark = '/static/assets/restaking/method-shared-dark.svg',
  RestakingMethodIndependentLight = '/static/assets/restaking/method-independent-light.svg',
  RestakingMethodSharedLight = '/static/assets/restaking/method-shared-light.svg',
}

export const SUBSTRATE_ROLE_TYPE_MAPPING = {
  [ServiceType.ZK_SAAS_GROTH16]: { ZkSaaS: 'ZkSaaSGroth16' },
  [ServiceType.ZK_SAAS_MARLIN]: { ZkSaaS: 'ZkSaaSMarlin' },
  [ServiceType.TX_RELAY]: 'LightClientRelaying',
  // TODO: The current implementation of the `ServiceType` enum is a dummy only used to test UI. Awaiting the actual implementation of the `ServiceType` enum before properly implementing this case. For now, default to `ZkSaaSMarlin`.
  [ServiceType.DKG_TSS_CGGMP]: { ZkSaaS: 'ZkSaaSGroth16' },
} as const satisfies { [key in ServiceType]: string | Record<string, string> };

export enum ChartColor {
  Blue = '#B8D6FF',
  Green = '#85DC8E',
  Gray = '#D3D8E2',
  DarkGray = '#3A3E53',
  Yellow = '#FFEAA6',
  Lavender = '#E7E2FF',
}
