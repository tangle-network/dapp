import { PrimitiveField } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { TANGLE_DAPP_URL } from '@tangle-network/ui-components/constants';
import type { Address } from 'viem';

export enum PagePath {
  HOME = '/',
  INSTANCES = '/instances',
  SERVICE_DETAILS = '/services/:id',
  BLUEPRINTS = '/blueprints',
  BLUEPRINTS_DETAILS = '/blueprints/:id',
  BLUEPRINTS_DEPLOY = '/blueprints/:id/deploy',
  BLUEPRINTS_CREATE = '/blueprints/create',
  BLUEPRINTS_MANAGE = '/blueprints/manage',
  BLUEPRINTS_REGISTRATION_REVIEW = '/registration-review',
  OPERATORS = '/operators',
  OPERATORS_MANAGE = '/operators/manage',
  REWARDS = '/rewards',
  EARNINGS = '/earnings',
  NOT_FOUND = '/404',
}

export enum TangleDAppPagePath {
  RESTAKE = `${TANGLE_DAPP_URL}restake`,
  RESTAKE_DEPOSIT = `${TANGLE_DAPP_URL}restake?vault={{vault}}`,
  RESTAKE_DELEGATE = `${TANGLE_DAPP_URL}restake/delegate`,
  RESTAKE_OPERATOR = `${TANGLE_DAPP_URL}restake/operators`,
}

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
 * 1. Simple approval: Only restakingPercent is provided
 * 2. Approval with commitments: securityCommitments array is provided
 */
export type ApprovalConfirmationFormFields = {
  requestId: number;
  /** Simple approval mode: single percentage (0-100) for default TNT requirement */
  restakingPercent?: number;
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
