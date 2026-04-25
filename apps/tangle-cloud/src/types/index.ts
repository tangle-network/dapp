import { PrimitiveField } from '@tangle-network/tangle-shared-ui/types/blueprint';
import type { Address } from 'viem';

const TANGLE_DAPP_URL = 'https://app.tangle.tools';

const ensureTrailingSlash = (url: string): string =>
  url.endsWith('/') ? url : `${url}/`;

export const TANGLE_DAPP_BASE_URL = ensureTrailingSlash(
  import.meta.env.VITE_TANGLE_DAPP_URL || TANGLE_DAPP_URL,
);

export enum PagePath {
  HOME = '/',
  INSTANCES = '/instances',
  SERVICE_DETAILS = '/services/:id',
  BLUEPRINTS = '/blueprints',
  BLUEPRINTS_DETAILS = '/blueprints/:id',
  BLUEPRINTS_DEPLOY = '/blueprints/:id/deploy',
  BLUEPRINTS_APP_SERVICE = '/blueprints/:slug/:serviceId',
  BLUEPRINTS_APP_SCOPED = '/blueprints/:publisher/:slug',
  BLUEPRINTS_APP_SCOPED_SERVICE = '/blueprints/:publisher/:slug/:serviceId',
  BLUEPRINTS_PROTOCOL_SERVICE = '/blueprints/:id/services/:serviceId',
  BLUEPRINTS_CREATE = '/blueprints/create',
  BLUEPRINTS_MANAGE = '/blueprints/manage',
  BLUEPRINTS_REGISTRATION_REVIEW = '/registration-review',
  OPERATORS = '/operators',
  OPERATORS_MANAGE = '/operators/manage',
  REWARDS = '/rewards',
  EARNINGS = '/earnings',
  PAYMENTS_POOL = '/payments/pool',
  PAYMENTS_CREDITS = '/payments/credits',
  NOT_FOUND = '/404',
}

export const TangleDAppPagePath = {
  STAKING: `${TANGLE_DAPP_BASE_URL}staking`,
  STAKING_DEPOSIT: `${TANGLE_DAPP_BASE_URL}staking/deposit?vault={{vault}}`,
  STAKING_DELEGATE: `${TANGLE_DAPP_BASE_URL}staking/delegate`,
  STAKING_OPERATOR: `${TANGLE_DAPP_BASE_URL}staking/operators`,
} as const;

/**
 * Asset structure matching the contract's Asset struct.
 * - kind: 0 = Native token, 1 = ERC20 token
 * - token: The token address (zero address for native)
 */
export type ContractAsset = {
  kind: number;
  token: Address;
};

/**
 * Security commitment structure matching the contract's AssetSecurityCommitment struct.
 * Used when calling approveServiceWithCommitments.
 */
export type ContractSecurityCommitment = {
  asset: ContractAsset;
  exposureBps: number; // 0-10000 basis points
};

/**
 * Form fields for the approval confirmation modal.
 * Supports two approval modes:
 * 1. Simple approval: Only stakingPercent is provided
 * 2. Approval with commitments: securityCommitments array is provided
 */
export type ApprovalConfirmationFormFields = {
  requestId: number;
  /** Simple approval mode: single percentage (0-100) for default TNT requirement */
  stakingPercent?: number;
  /** TNT exposure in basis points (0-10000), when set calls 3-arg approveService overload */
  tntExposureBps?: number;
  /** Commitments mode: per-asset exposure commitments matching contract format */
  securityCommitments?: ContractSecurityCommitment[];
};

export type RegisterServiceFormFields = {
  blueprintIds: Array<number | string>;
  preferences: {
    key: Uint8Array; // 65 bytes
    priceTargets: {
      cpu: number;
      mem: number;
      storageHdd: number;
      storageSsd: number;
      storageNvme: number;
    };
    rpcUrl?: string; // Optional RPC URL for the service
  }[];
  registrationArgs: Array<PrimitiveField[]>;
  amounts: number[];
};
